// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { generateProjectPDF, sendProjectEmail } from "./utils.ts";

// --- Helper function for delay ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Define interfaces ---

// Represents a single detailed work entry
interface DetailedEntry {
  task_name: string;
  work_hours: number;
  rate: number;
  entry_pay: number;
}

// Represents one person's summary for a specific project
interface PersonProjectSummary {
  cf_name: string;
  cf_email: string;
  cf_tier: string;
  totalPayForProject: number; // This person's total pay for this project
  detailedEntries: DetailedEntry[]; // This person's entries for this project
}

// Represents all data for a single project, grouped by person
interface ProjectGroupedData {
  projectName: string;
  peopleSummaries: PersonProjectSummary[]; // Array of summaries, one per person
}

// Initialize Supabase client
const supabaseUrl = "http://host.docker.internal:54321"; // Using 127.0.0.1 instead of localhost
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

console.log("Initializing Supabase client...");
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Supabase Key exists: ${!!supabaseKey}`);

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log("Supabase client initialized successfully");

  serve(async (req) => {
    try {
      // Only allow POST requests
      if (req.method !== "POST") {
        console.log("Invalid request method");
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          { status: 405, headers: { "Content-Type": "application/json" } }
        );
      }

      // Get current month
      const currentDate = new Date();
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const currentMonthISO = currentMonth.toISOString();
      const nextMonthISO = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).toISOString();
      console.log(`Processing submissions for month starting: ${currentMonthISO}`);

      // Get all submissions for the current month
      console.log("Fetching submissions from database...");
      const { data: submissions, error: submissionsError } = await supabase
        .from("vendor_payment_submissions")
        .select(`
          id,
          cf_email,
          cf_name,
          cf_tier,
          total_pay,
          created_at,
          entries:vendor_payment_entries(
            task_name,
            project_name,
            work_hours,
            rate,
            entry_pay
          )
        `)
        .gte("created_at", currentMonthISO)
        .lt("created_at", nextMonthISO);

      if (submissionsError) {
        console.error(`Error fetching submissions: ${JSON.stringify(submissionsError)}`);
        throw submissionsError;
      }

      console.log(`Found ${submissions?.length || 0} submissions`);
      if (!submissions || submissions.length === 0) {
        return new Response(
          JSON.stringify({ message: "No submissions found for the current month."+`${submissionsError}` }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // Group entries by project and then by person
      console.log("Grouping entries by project and person...");
      // Use: Map<string, ProjectGroupedData>
      const projectsMap = new Map<string, ProjectGroupedData>();

      for (const submission of submissions) {
        // Ensure submission.entries is an array before iterating
        const entries = Array.isArray(submission.entries) ? submission.entries : [];

        for (const entry of entries) {
          const projectName = entry.project_name || "Unassigned";
          const personEmail = submission.cf_email; // Key for the person

          // Ensure entry_pay is a valid number, default to 0 if not
          const entryPay = typeof entry.entry_pay === 'number' && !isNaN(entry.entry_pay) ? entry.entry_pay : 0;

          // Get or create project data
          let projectData = projectsMap.get(projectName);
          if (!projectData) {
            projectData = {
              projectName: projectName,
              peopleSummaries: [], // Initialize as empty array
            };
            projectsMap.set(projectName, projectData);
          }

          // Find or create person's summary within the project
          let personSummary = projectData.peopleSummaries.find(p => p.cf_email === personEmail);
          if (!personSummary) {
            personSummary = {
              cf_name: submission.cf_name,
              cf_email: submission.cf_email,
              cf_tier: submission.cf_tier,
              totalPayForProject: 0,
              detailedEntries: [],
            };
            projectData.peopleSummaries.push(personSummary);
          }

          // Add the detailed entry to the person's summary
          personSummary.detailedEntries.push({
            task_name: entry.task_name,
            work_hours: entry.work_hours, // Assuming these are valid numbers
            rate: entry.rate,
            entry_pay: entryPay,
          });

          // Update totals
          personSummary.totalPayForProject += entryPay;
        }
      }
      console.log(`Grouped entries into ${projectsMap.size} projects.`);


      // Fetch projects/emails already processed this month
      // Assumes vendor_payment_email_logs has cf_email column
      console.log("Fetching existing email logs...");
      const { data: sentLogs, error: logCheckError } = await supabase
        .from("vendor_payment_email_logs")
        .select("project_name, cf_email") // Select both fields
        .eq("month", currentMonthISO)
        .eq("status", "sent");


      if (logCheckError) {
        console.error(`Error checking existing email logs: ${JSON.stringify(logCheckError)}`);
        throw logCheckError;
      }

      // Create a set of unique keys for sent emails: "projectName|cf_email"
      const sentEmails = new Set(sentLogs?.map(log => `${log.project_name}|${log.cf_email}`) || []);
      console.log(`Found ${sentEmails.size} individual emails already sent this month.`);


      // Process each person within each project
      let processedEmailCount = 0;
      let failedEmailCount = 0;
      let totalEmailsAttempted = 0;

      for (const [projectName, projectData] of projectsMap.entries()) {
        console.log(`Processing project: ${projectName}`);
        for (const personSummary of projectData.peopleSummaries) {
          totalEmailsAttempted++;
          const personEmail = personSummary.cf_email;
          const uniqueEmailKey = `${projectName}|${personEmail}`;
          console.log(`-- Processing person: ${personEmail} for project: ${projectName}`);

          // Check if email has already been sent
          if (sentEmails.has(uniqueEmailKey)) {
            console.log(`-- Email already sent for ${personEmail} on project ${projectName} this month. Skipping.`);
            continue;
          }

          let logId: number | null = null;

          try {
            // Create 'pending' email log entry for the person/project
            console.log(`-- Creating 'pending' email log for ${personEmail} on project ${projectName}`);
            const { data: newLogData, error: logInsertError } = await supabase
              .from("vendor_payment_email_logs")
              .insert({
                project_name: projectName,
                cf_email: personEmail, // Add cf_email
                month: currentMonthISO,
                status: "pending",
              })
              .select('id')
              .single();

            if (logInsertError) {
               console.error(`-- Error creating 'pending' log for ${personEmail}/${projectName}: ${JSON.stringify(logInsertError)}`);
               failedEmailCount++;
               continue; // Skip this person/project combination
            }
            logId = newLogData?.id;
            console.log(`-- Pending log created with ID: ${logId} for ${personEmail}/${projectName}`);


            // Generate PDF for this person's entries in this project
            // Note: generateProjectPDF needs to accept PersonProjectSummary
            console.log(`-- Generating PDF for ${personEmail} on project ${projectName}`);
            const pdf = await generateProjectPDF(projectName, personSummary); // Pass person-specific summary
            console.log(`-- PDF generated successfully for ${personEmail}/${projectName}`);

            // Send email to this person for this project
            // Note: sendProjectEmail needs adaptation (e.g., accept PersonProjectSummary)
            console.log(`-- Sending email to ${personEmail} for project ${projectName}`);
            await sendProjectEmail(
                projectName,
                personSummary, // Pass the necessary summary details
                pdf,
                personEmail // Send to the person directly
            );
            console.log(`-- Email sent successfully to ${personEmail} for project ${projectName}`);

            // Update email log to 'sent' status
            console.log(`-- Updating log to 'sent' for ${personEmail}/${projectName} (Log ID: ${logId})`);
            const { error: updateSentError } = await supabase
              .from("vendor_payment_email_logs")
              .update({
                status: "sent",
                sent_at: new Date().toISOString(),
              })
              .eq("id", logId); // Update using the specific log ID

            if (updateSentError) {
              console.error(`-- Error updating log to 'sent' for ${personEmail}/${projectName}: ${JSON.stringify(updateSentError)}`);
              // Log the error, but count as processed as email was sent
            } else {
               console.log(`-- Log status updated to 'sent' for ${personEmail}/${projectName}`);
            }
            processedEmailCount++;

          } catch (error) {
            failedEmailCount++;
            console.error(`-- Error processing email for ${personEmail} on project ${projectName}: ${JSON.stringify(error)}`);
            // If an error occurred (PDF gen or email send), update log to 'failed' if logId exists
            if (logId) {
                console.log(`-- Updating log status to 'failed' for ${personEmail}/${projectName} (Log ID: ${logId})`);
                const { error: updateFailedError } = await supabase
                  .from("vendor_payment_email_logs")
                  .update({
                    status: "failed",
                    error_message: error.message, // Store error message
                  })
                  .eq("id", logId); // Update using the specific log ID

                if (updateFailedError) {
                  console.error(`-- CRITICAL: Error updating email log to 'failed' for ${personEmail}/${projectName} after processing failure: ${JSON.stringify(updateFailedError)}`);
                } else {
                   console.log(`-- Log status updated to 'failed' for ${personEmail}/${projectName}`);
                }
            } else {
                console.error(`-- Could not update log status to 'failed' for ${personEmail}/${projectName} because log ID was not obtained.`);
                // Consider inserting a 'failed' log here if possible/desired, including cf_email
                try {
                    await supabase.from("vendor_payment_email_logs").insert({
                        project_name: projectName,
                        cf_email: personEmail,
                        month: currentMonthISO,
                        status: "failed",
                        error_message: `Processing failed before log ID obtained: ${error.message}`,
                    });
                    console.log(`-- Inserted substitute 'failed' log for ${personEmail}/${projectName}`);
                } catch (insertFailError) {
                     console.error(`-- CRITICAL: Failed to insert substitute 'failed' log for ${personEmail}/${projectName}: ${JSON.stringify(insertFailError)}`);
                }
            }
          }
        
          // --- Add delay between sending emails to avoid rate limiting ---
          console.log(`-- Adding delay before next email...`);
          await sleep(800); // Wait before processing the next person/project email
        } // End loop through people
      } // End loop through projects

      // Final Response
      const responseMessage = `Email processing completed. Attempted: ${totalEmailsAttempted}, Successful: ${processedEmailCount}, Failed: ${failedEmailCount}.`;
      console.log(responseMessage);
      return new Response(
        JSON.stringify({
          message: responseMessage,
          processedEmailCount: processedEmailCount,
          failedEmailCount: failedEmailCount,
          totalEmailsAttempted: totalEmailsAttempted
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    } catch (error) {
      console.error(`Global error: ${JSON.stringify(error)}`);
      return new Response(
        JSON.stringify({ 
          error: error.message,
          stack: error.stack,
          name: error.name
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  });
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
  throw error;
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-vendor-payment-summaries' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

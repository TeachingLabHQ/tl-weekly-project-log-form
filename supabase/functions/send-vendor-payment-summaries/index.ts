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

// Define interfaces for project-based grouping
interface DetailedEntry {
  cf_name: string;
  cf_email: string;
  cf_tier: string;
  task_name: string;
  work_hours: number;
  rate: number;
  entry_pay: number;
}

interface ProjectSummaryData {
  projectName: string;
  totalPay: number;
  detailedEntries: DetailedEntry[];
}

// Initialize Supabase client
const supabaseUrl = "http://host.docker.internal:54321"; // Using 127.0.0.1 instead of localhost
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

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
          JSON.stringify({ message: "No submissions found for the current month." }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // Group entries by project
      console.log("Grouping entries by project...");
      const projectsMap = new Map<string, ProjectSummaryData>();

      for (const submission of submissions) {
        for (const entry of submission.entries) {
          const projectName = entry.project_name || "Unassigned"; // Handle null/empty project names
          let projectData = projectsMap.get(projectName);

          if (!projectData) {
            projectData = {
              projectName: projectName,
              totalPay: 0,
              detailedEntries: [],
            };
            projectsMap.set(projectName, projectData);
          }

          projectData.detailedEntries.push({
            cf_name: submission.cf_name,
            cf_email: submission.cf_email,
            cf_tier: submission.cf_tier,
            task_name: entry.task_name,
            work_hours: entry.work_hours,
            rate: entry.rate,
            entry_pay: entry.entry_pay,
          });
          projectData.totalPay += entry.entry_pay;
        }
      }
      console.log(`Grouped entries into ${projectsMap.size} projects.`);

      // Fetch projects already processed this month
      console.log("Fetching existing project email logs...");
      const { data: sentLogs, error: logCheckError } = await supabase
        .from("vendor_payment_email_logs")
        .select("project_name") // Select only the project name
        .eq("month", currentMonthISO)
        .eq("status", "sent");

      if (logCheckError) {
        console.error(`Error checking existing project logs: ${JSON.stringify(logCheckError)}`);
        // Decide if this is fatal, maybe continue but log the error
        throw logCheckError; // For now, treat as fatal
      }

      const sentProjects = new Set(sentLogs?.map(log => log.project_name) || []);
      console.log(`Found ${sentProjects.size} projects already processed this month.`);


      // Process each project
      let processedProjectCount = 0;
      let failedProjectCount = 0;
      const projectNames = Array.from(projectsMap.keys());

      for (const projectName of projectNames) {
        const projectData = projectsMap.get(projectName)!;
        console.log(`Processing project: ${projectName}`);

        // Check if email has already been sent for this project this month
        if (sentProjects.has(projectName)) {
          console.log(`Email already sent for project ${projectName} this month. Skipping.`);
          continue;
        }

        let logId: number | null = null; // To store the ID of the log entry for potential updates

        try {
          // Create initial 'pending' email log for the project
          console.log("Creating 'pending' email log entry for project:", projectName);
          const { data: newLogData, error: logInsertError } = await supabase
            .from("vendor_payment_email_logs")
            .insert({
              project_name: projectName,
              month: currentMonthISO,
              status: "pending",
            })
            .select('id') // Select the ID of the newly created log
            .single(); // Expecting a single row back


          if (logInsertError) {
            console.error(`Error creating 'pending' email log for project ${projectName}: ${JSON.stringify(logInsertError)}`);
            // If we can't even log pending, skip this project and count as failed
            failedProjectCount++;
            continue; // Move to the next project
          }
          logId = newLogData?.id; // Store the log ID
          console.log(`Pending log created with ID: ${logId} for project: ${projectName}`);


          console.log(`Generating PDF for project ${projectName}`);
          // Generate PDF for the entire project
          // Note: generateProjectPDF needs to be implemented in utils.ts
          const pdf = await generateProjectPDF(projectData);
          console.log(`PDF generated successfully for project ${projectName}`);

          console.log(`Sending email for project ${projectName}`);
          // Send email for the project
          // Note: sendProjectEmail needs to be implemented in utils.ts
          // Determine recipient: For now, using SUPPORT_EMAIL or a placeholder
          const recipientEmail = "yancheng.pan@teachinglab.org";
          await sendProjectEmail(projectName, projectData.totalPay, pdf, recipientEmail);
          console.log(`Email sent successfully for project ${projectName}`);

          // Update email log to 'sent' status
          console.log(`Updating email log status to 'sent' for project: ${projectName} (Log ID: ${logId})`);
          const { error: updateSentError } = await supabase
            .from("vendor_payment_email_logs")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("id", logId); // Update using the specific log ID

          if (updateSentError) {
            console.error(`Error updating email log to 'sent' for project ${projectName}: ${JSON.stringify(updateSentError)}`);
            // Log the error, but consider the email sent for counting purposes
            // We might want a different status like 'sent_log_failed'
          } else {
             console.log(`Log status updated to 'sent' for project: ${projectName}`);
          }
          processedProjectCount++;

        } catch (error) {
          failedProjectCount++;
          console.error(`Error processing project ${projectName}: ${JSON.stringify(error)}`);
          // If an error occurred (PDF gen or email send), update log to 'failed' if logId exists
          if (logId) {
              console.log(`Updating email log status to 'failed' for project: ${projectName} (Log ID: ${logId})`);
              const { error: updateFailedError } = await supabase
                .from("vendor_payment_email_logs")
                .update({
                  status: "failed",
                  error_message: error.message, // Store error message
                })
                .eq("id", logId); // Update using the specific log ID

              if (updateFailedError) {
                console.error(`CRITICAL: Error updating email log to 'failed' for project ${projectName} after processing failure: ${JSON.stringify(updateFailedError)}`);
              } else {
                 console.log(`Log status updated to 'failed' for project: ${projectName}`);
              }
          } else {
              console.error(`Could not update log status to 'failed' for project ${projectName} because log ID was not obtained.`);
              // Consider inserting a 'failed' log here if possible/desired
          }
        }
        
        // --- Add delay before processing the next project to avoid rate limiting ---
        console.log(`Adding delay before next project...`);
        await sleep(800); // Wait 600ms (slightly more than 1/2 second)
      }

      // Final Response
      const responseMessage = `Project processing completed. Attempted: ${projectNames.length}, Successful: ${processedProjectCount}, Failed: ${failedProjectCount}.`;
      console.log(responseMessage);
      return new Response(
        JSON.stringify({
          message: responseMessage,
          processedCount: processedProjectCount,
          failedCount: failedProjectCount,
          totalProjects: projectNames.length
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

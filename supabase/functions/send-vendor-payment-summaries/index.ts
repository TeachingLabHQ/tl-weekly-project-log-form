// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { generatePDF, sendEmail, VendorPaymentSubmission } from "./utils.ts";

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
      console.log(`Processing submissions for month: ${currentMonth.toISOString()}`);

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
        .gte("created_at", currentMonth.toISOString())
        .lt("created_at", new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).toISOString());

      if (submissionsError) {
        console.error(`Error fetching submissions: ${JSON.stringify(submissionsError)}`);
        throw submissionsError;
      }

      console.log(`Found ${submissions?.length || 0} submissions to process`);

      // Process each submission
      for (const submission of submissions || []) {
        console.log(`Processing submission ${submission.id} for ${submission.cf_name}`);

        // Check if email has already been sent
        const { data: existingLog, error: logCheckError } = await supabase
          .from("vendor_payment_email_logs")
          .select("*")
          .eq("submission_id", submission.id)
          .eq("month", currentMonth.toISOString())
          .eq("status", "sent")
          .single();

        if (logCheckError && logCheckError.code !== 'PGRST116') {
          console.error(`Error checking existing log: ${JSON.stringify(logCheckError)}`);
          throw logCheckError;
        }

        if (existingLog) {
          console.log(`Email already sent for submission ${submission.id}`);
          continue;
        }

        try {
          // Create email log
          console.log("Creating email log entry...");
          const { error: logError } = await supabase
            .from("vendor_payment_email_logs")
            .insert({
              submission_id: submission.id,
              month: currentMonth.toISOString(),
              status: "pending",
            });

          if (logError) {
            console.error(`Error creating email log: ${JSON.stringify(logError)}`);
            throw logError;
          }

          console.log(`Generating PDF for submission ${submission.id}`);
          // Generate PDF
          const pdf = await generatePDF(submission);
          console.log(`PDF generated successfully for submission ${submission.id}`);

          console.log(`Sending email to ${submission.cf_email}`);
          // Send email
          await sendEmail(submission, pdf);
          console.log(`Email sent successfully to ${submission.cf_email}`);

          // Update email log
          console.log("Updating email log status to sent...");
          const { error: updateError } = await supabase
            .from("vendor_payment_email_logs")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("submission_id", submission.id)
            .eq("month", currentMonth.toISOString());

          if (updateError) {
            console.error(`Error updating email log: ${JSON.stringify(updateError)}`);
            throw updateError;
          }

        } catch (error) {
          console.error(`Error processing submission ${submission.id}: ${JSON.stringify(error)}`);
          // Log error
          const { error: logUpdateError } = await supabase
            .from("vendor_payment_email_logs")
            .update({
              status: "failed",
              error_message: error.message,
            })
            .eq("submission_id", submission.id)
            .eq("month", currentMonth.toISOString());

          if (logUpdateError) {
            console.error(`Error updating error log: ${JSON.stringify(logUpdateError)}`);
          }
        }
      }

      return new Response(
        JSON.stringify({ 
          message: "Processing completed",
          processedCount: submissions?.length || 0 
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

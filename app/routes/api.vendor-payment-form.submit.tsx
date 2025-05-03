import { ActionFunctionArgs, json } from "@remix-run/node";
import { vendorPaymentService } from "~/domains/vendor-payment/service";
import { vendorPaymentRepository } from "~/domains/vendor-payment/repository";
import { createSupabaseServerClient } from "../../supabase/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Get form data
    const formData = await request.formData();
    const entries = JSON.parse(formData.get("entries") as string);
    const cfDetails = JSON.parse(formData.get("cfDetails") as string);
    const totalPay = parseFloat(formData.get("totalPay") as string);
    const workDateIso = formData.get("workDate") as string;

    // Validate form data
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return json({ error: "Invalid entries data" }, { status: 400 });
    }

    if (!cfDetails || !cfDetails.email || !cfDetails.name || !cfDetails.tier) {
      return json(
        { error: "Invalid coach/facilitator details" },
        { status: 400 }
      );
    }

    if (!workDateIso) {
      return json({ error: "Work date is required" }, { status: 400 });
    }
    
    // Extract just the YYYY-MM-DD portion to avoid timezone issues
    const workDate = workDateIso.split('T')[0];

    // Transform entries into submission format
    const transformedEntries = entries.map((entry) => {
      const taskData = JSON.parse(entry.task);
      const hours = parseFloat(entry.workHours);
      let rate = 0;

      switch (cfDetails.tier) {
        case "Tier 1":
          rate = taskData["Tier 1"];
          break;
        case "Tier 2":
          rate = taskData["Tier 2"];
          break;
        case "Tier 3":
          rate = taskData["Tier 3"];
          break;
      }

      return {
        task_name: taskData.taskName,
        project_name: entry.project,
        work_hours: hours,
        rate: rate,
        entry_pay: rate * hours,
        submission_date: workDate,
      };
    });

    // Create submission
    const submission = {
      cf_email: cfDetails.email,
      cf_name: cfDetails.name,
      cf_tier: cfDetails.tier,
      total_pay: totalPay,
      submission_date: workDate,
      entries: transformedEntries,
    };

    // Initialize service and repository
    const { supabaseClient } = createSupabaseServerClient(request);
    const repository = vendorPaymentRepository(supabaseClient);
    const service = vendorPaymentService(repository);

    // Submit the form
    const { data, error } = await service.createSubmission(submission);

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error submitting form:", error);
    return json({ error: "Failed to submit form" }, { status: 500 });
  }
}

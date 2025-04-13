import type { ActionFunctionArgs } from "@vercel/remix";
import { json } from "@remix-run/node";
import { vendorPaymentRepository } from "~/domains/vendor-payment/repository";
import { vendorPaymentService } from "~/domains/vendor-payment/service";
import { createSupabaseServerClient } from "../../supabase/supabase.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "DELETE") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await request.json();
  const { submissionId } = body;

  if (!submissionId) {
    return json({ error: "Submission ID is required" }, { status: 400 });
  }

  try {
    const { supabaseClient } = createSupabaseServerClient(request);
    const repository = vendorPaymentRepository(supabaseClient);
    const service = vendorPaymentService(repository);

    const { error } = await service.deleteSubmission(submissionId);

    if (error) {
      throw error;
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error deleting submission:", error);
    return json({ error: "Failed to delete submission" }, { status: 500 });
  }
};

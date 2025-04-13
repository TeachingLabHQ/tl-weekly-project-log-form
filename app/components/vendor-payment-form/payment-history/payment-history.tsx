import { useLoaderData, useRevalidator } from "@remix-run/react";
import { Accordion } from "@mantine/core";
import { PaymentHistoryItem } from "./payment-history-item";
import { VendorPaymentSubmissionWithEntries } from "~/domains/vendor-payment/model";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { vendorPaymentRepository } from "~/domains/vendor-payment/repository";
import { vendorPaymentService } from "~/domains/vendor-payment/service";
import { createSupabaseServerClient } from "../../../../supabase/supabase.server";
import { loader } from "~/routes/vendor-payment-form";

type CfDetails = {
  email: string;
  name: string;
  tier: string;
} | null;

type PaymentHistoryProps = {
  cfDetails: CfDetails;
};

export const PaymentHistory = ({ cfDetails }: PaymentHistoryProps) => {
  const { submissions } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  if (!submissions?.length) {
    return (
      <div className="text-white text-center py-8">
        No payment history found
      </div>
    );
  }

  return (
    <Accordion>
      {submissions.map((submission) => (
        <PaymentHistoryItem key={submission.id} submission={submission} />
      ))}
    </Accordion>
  );
};

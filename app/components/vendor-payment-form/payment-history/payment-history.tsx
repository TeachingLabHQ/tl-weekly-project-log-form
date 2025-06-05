import { Accordion } from "@mantine/core";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { CoachFacilitatorDetails } from "~/domains/coachFacilitator/repository";
import { loader } from "~/routes/vendor-payment-form";
import { PaymentHistoryItem } from "./payment-history-item";



type PaymentHistoryProps = {
  cfDetails: CoachFacilitatorDetails | null;
};

export const PaymentHistory = ({ cfDetails }: PaymentHistoryProps) => {
  const { paymentRequestHistory } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  if (!paymentRequestHistory?.length) {
    return (
      <div className="text-white text-center py-8">
        No payment history found
      </div>
    );
  }

  return (
    <Accordion>
      {paymentRequestHistory.map((paymentRequest) => (
        <PaymentHistoryItem key={paymentRequest.id} paymentRequest={paymentRequest} />
      ))}
    </Accordion>
  );
};

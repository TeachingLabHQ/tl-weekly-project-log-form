import { useState } from "react";
import { Button, Text, Title } from "@mantine/core";
import React from "react";
import BackgroundImg from "~/assets/background.png";
import { VendorPaymentWidget } from "./vendor-payment-widget";
import { taskOptions, Tier } from "./utils";

type CfDetails = {
  email: string;
  name: string;
  tier: string;
} | null;

export const VendorPaymentForm = ({ cfDetails }: { cfDetails: CfDetails }) => {
  console.log(cfDetails);
  const [isValidated, setIsValidated] = useState<boolean | null>(null);
  const [vendorPaymentEntries, setVendorPaymentEntries] = useState([
    {
      task: "",
      project: "",
      workHours: "",
    },
  ]);
  const [totalWorkHours, setTotalWorkHours] = useState(0);

  const calculateTotalPay = (entries: typeof vendorPaymentEntries): number => {
    return entries.reduce((total, entry) => {
      try {
        const taskData = JSON.parse(entry.task);
        const hours = parseFloat(entry.workHours) || 0;

        // Get rate based on tier
        let rate = 0;
        switch (cfDetails?.tier) {
          case Tier.TIER_1:
            rate = taskData["Tier 1"];
            break;
          case Tier.TIER_2:
            rate = taskData["Tier 2"];
            break;
          case Tier.TIER_3:
            rate = taskData["Tier 3"];
            break;
          default:
            rate = 0;
        }

        return total + rate * hours;
      } catch (error) {
        console.error("Error calculating total pay:", error);
        return total;
      }
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidated(true);

    // Check if all required fields are filled
    const hasEmptyFields = vendorPaymentEntries.some(
      (entry) => !entry.task || !entry.project || !entry.workHours
    );

    if (hasEmptyFields) {
      return;
    }

    // TODO: Handle form submission
    console.log("Form submitted:", {
      entries: vendorPaymentEntries,
      totalWorkHours,
      totalPay: calculateTotalPay(vendorPaymentEntries),
      cfDetails,
    });
  };

  return (
    <div
      className="w-screen h-screen grid grid-cols-12 grid-rows-[auto_auto] gap-8 py-14 px-2"
      style={{
        backgroundImage: `url(${BackgroundImg})`,
      }}
    >
      <div className="row-start-1 col-start-2 col-span-8 h-fit p-8 rounded-[25px] bg-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] text-white">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h1 className="font-bold text-3xl">Vendor Payment Form</h1>

          <VendorPaymentWidget
            isValidated={isValidated}
            vendorPaymentEntries={vendorPaymentEntries}
            setVendorPaymentEntries={setVendorPaymentEntries}
            setTotalWorkHours={setTotalWorkHours}
            cfTier={cfDetails?.tier || ""}
          />

          <div className="flex justify-between items-center mt-4">
            <Button type="submit" size="md" color="#0053B3">
              Submit
            </Button>
          </div>
        </form>
      </div>
      <div className="row-start-1 col-start-10 col-span-2 flex flex-col items-center">
        <div className="w-fit py-5 px-10 rounded-[25px] bg-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] text-white flex flex-col items-center gap-3">
          <h3 className="text-xl font-bold">Total Pay</h3>
          <h1 className="text-xl font-bold">
            ${calculateTotalPay(vendorPaymentEntries).toFixed(2)}
          </h1>
        </div>
      </div>
    </div>
  );
};

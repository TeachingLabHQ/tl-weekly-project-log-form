import { Button, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useState } from "react";
import BackgroundImg from "~/assets/background.png";

export type FormValues = {
  vendorName: string;
  amount: string;
  description: string;
  paymentMethod: string;
};

export const VendorPaymentForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      vendorName: "",
      amount: "",
      description: "",
      paymentMethod: "",
    },
    validate: {
      vendorName: (value) => (!value ? "Vendor name is required" : null),
      amount: (value) => (!value ? "Amount is required" : null),
      description: (value) => (!value ? "Description is required" : null),
      paymentMethod: (value) => (!value ? "Payment method is required" : null),
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitted(true);
      setIsSuccessful(null);

      // TODO: Add submission logic here

      setIsSuccessful(true);
      setIsSubmitted(false);
    } catch (e) {
      console.error(e);
      setIsSuccessful(false);
      setIsSubmitted(false);
    }
  };

  return (
    <div
      className="w-screen h-screen grid grid-cols-12 grid-rows-[auto_auto] gap-8 py-8"
      style={{
        backgroundImage: `url(${BackgroundImg})`,
      }}
    >
      <div className="row-start-2 col-start-2 col-span-8 h-fit p-8 rounded-[25px] bg-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] text-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(form.values);
          }}
          className="flex flex-col gap-4"
        >
          <h1 className="font-bold text-3xl">Vendor Payment Form</h1>

          {/* Form fields will go here */}

          <Button
            type="submit"
            loading={isSubmitted}
            className="mt-4"
            color="#0053B3"
          >
            Submit Payment Request
          </Button>
        </form>
      </div>
    </div>
  );
};

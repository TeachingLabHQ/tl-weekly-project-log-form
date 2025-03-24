import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useSession } from "~/components/hooks/useSession";
import { VendorPaymentForm } from "~/components/vendor-payment-form/vendor-payment-form";
import { LoadingSpinner } from "~/utils/LoadingSpinner";
import { Suspense } from "react";

export const loader = async (args: LoaderFunctionArgs) => {
  // TODO: Add any necessary data fetching here
  return {};
};

// Loading component for the form
const VendorPaymentFormLoader = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <LoadingSpinner className="bg-white/50" />
  </div>
);

export default function VendorPaymentFormRoute() {
  const { isAuthenticated, errorMessage } = useSession();

  return (
    <div className="min-h-screen w-full overflow-auto">
      {isAuthenticated ? (
        <Suspense fallback={<VendorPaymentFormLoader />}>
          <VendorPaymentForm />
        </Suspense>
      ) : (
        <></>
      )}
    </div>
  );
}

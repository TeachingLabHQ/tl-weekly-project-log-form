import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useSession } from "~/components/hooks/useSession";
import { VendorPaymentForm } from "~/components/vendor-payment-form/vendor-payment-form";
import { Suspense, useEffect, useState } from "react";
import { coachFacilitatorService } from "~/domains/coachFacilitator/service";
import { coachFacilitatorRepository } from "~/domains/coachFacilitator/repository";
import { LoginPage } from "~/components/ui/login-page";
import { LoadingSpinner } from "~/utils/LoadingSpinner";
import BackgroundImg from "~/assets/background.png";

export const loader = async (args: LoaderFunctionArgs) => {
  // TODO: Add any necessary data fetching here
  return {};
};

export default function VendorPaymentFormRoute() {
  const { isAuthenticated, errorMessage, session } = useSession();
  const [isCoachOrFacilitator, setIsCoachOrFacilitator] = useState<
    boolean | null
  >(null);
  const [cfDetails, setCfDetails] = useState<{
    email: string;
    name: string;
    tier: string;
  } | null>(null);

  useEffect(() => {
    const checkCoachOrFacilitator = async () => {
      if (session?.email) {
        const newCoachFacilitatorService = coachFacilitatorService(
          coachFacilitatorRepository()
        );
        const { data, error } =
          await newCoachFacilitatorService.fetchCoachFacilitatorDetails(
            "Liliana.Vazquez@teachinglab.org"
          );
        setIsCoachOrFacilitator(!!data);
        setCfDetails(data || null);
      }
    };

    checkCoachOrFacilitator();
  }, [session?.email]);

  if (!isAuthenticated) {
    return <LoginPage errorMessage={errorMessage || ""} />;
  }

  if (isCoachOrFacilitator === null) {
    return <LoadingSpinner />;
  }

  if (!isCoachOrFacilitator) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-700">
            This form is only accessible to coaches and facilitators. If you
            believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full overflow-auto flex items-center justify-center"
      style={{
        backgroundImage: `url(${BackgroundImg})`,
      }}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <VendorPaymentForm cfDetails={cfDetails} />
      </Suspense>
    </div>
  );
}

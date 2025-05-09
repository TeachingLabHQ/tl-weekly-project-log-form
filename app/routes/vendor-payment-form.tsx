import { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { useSession } from "~/components/auth/hooks/useSession";
import { VendorPaymentForm } from "~/components/vendor-payment-form/vendor-payment-form";
import { Suspense, useEffect, useState } from "react";
import { coachFacilitatorService } from "~/domains/coachFacilitator/service";
import { coachFacilitatorRepository } from "~/domains/coachFacilitator/repository";
import { LoginPage } from "~/components/auth/login-page";
import { LoadingSpinner } from "~/utils/LoadingSpinner";
import BackgroundImg from "~/assets/background.png";
import { vendorPaymentService } from "~/domains/vendor-payment/service";
import { vendorPaymentRepository } from "~/domains/vendor-payment/repository";
import { createSupabaseServerClient } from "../../supabase/supabase.server";
import { projectRepository } from "~/domains/project/repository";
import { projectService } from "~/domains/project/service";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabaseClient } = createSupabaseServerClient(request);

  // Get cfDetails from session or wherever it's stored
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  const cfDetails = session?.user?.email
    ? {
        email: session.user.email,
        name: session.user.user_metadata?.full_name || "",
        tier: session.user.user_metadata?.tier || "",
      }
    : null;

  if (!cfDetails?.email) {
    return json({ submissions: [] });
  }

  const newVendorPaymentService = vendorPaymentService(vendorPaymentRepository(supabaseClient));
  const { data: paymentRequestHistory, error: paymentRequestHistoryError } = await newVendorPaymentService.getSubmissionsByEmail(
    cfDetails.email
  );
  if (paymentRequestHistoryError) {
    throw new Error("Failed to fetch payment history");
  }

  const newProjectService = projectService(projectRepository());

  const { data: projects, error: projectsError } = await newProjectService.fetchAllProjects();
  if (projectsError) {
    throw new Error("Failed to fetch projects");
  }

  return json({ paymentRequestHistory, projects });
};

export default function VendorPaymentFormRoute() {
  const { isAuthenticated, errorMessage, session, mondayProfile } =
    useSession();
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
      if (mondayProfile?.email) {
        const newCoachFacilitatorService = coachFacilitatorService(
          coachFacilitatorRepository()
        );
        const { data, error } =
          await newCoachFacilitatorService.fetchCoachFacilitatorDetails(
            mondayProfile?.email
          );
        setIsCoachOrFacilitator(!!data);
        setCfDetails(data || null);
        // For testing purposes, allow YC and Finance to access the form
        if(mondayProfile?.email === "yancheng.pan@teachinglab.org"){
          setIsCoachOrFacilitator(true);
          setCfDetails({
            email: "yancheng.pan@teachinglab.org",
            name: "Yancheng Pan",
            tier: "Tier 2",
          });
        }
        else if(mondayProfile?.email === "daissan.colbert@teachinglab.org"){
          setIsCoachOrFacilitator(true);
          setCfDetails({
            email: "daissan.colbert@teachinglab.org",
            name: "Daisann Colbert",
            tier: "Tier 1",
          });
        }
        else if(mondayProfile?.email === "samantha.wilner@teachinglab.org"){
          setIsCoachOrFacilitator(true);
          setCfDetails({
            email: "samantha.wilner@teachinglab.org",
            name: "Samantha Wilner",
            tier: "Tier 1",
          });
        }
       else if(mondayProfile?.email === "tonia.lonie@teachinglab.org"){
          setIsCoachOrFacilitator(true);
          setCfDetails({
            email: "tonia.lonie@teachinglab.org",
            name: "Tonia Lonie",
            tier: "Tier 1",
          });
        }
        else if(mondayProfile?.email === "ellen.greig@teachinglab.org"){
          setIsCoachOrFacilitator(true);
          setCfDetails({
            email: "ellen.greig@teachinglab.org",
            name: "Ellen Greig",
            tier: "Tier 1",
          });
        }
       
      }
    };

    checkCoachOrFacilitator();
  }, [mondayProfile?.email]);
  if (isCoachOrFacilitator === null) {
    return <LoadingSpinner />;
  }

  if (isCoachOrFacilitator === false) {
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
    <div className="min-h-screen w-full overflow-auto flex items-center justify-center">

        <VendorPaymentForm cfDetails={cfDetails} />

    </div>
  );
}

import { FormHubLanding } from "~/components/form-hub-landing";
import { useSession } from "../components/auth/hooks/useSession";
import { useNavigate } from "@remix-run/react";

export default function Dashboard() {
  const { mondayProfile, isAuthenticated } = useSession();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <FormHubLanding userName={mondayProfile?.name || ""} />
    </div>
  );
}

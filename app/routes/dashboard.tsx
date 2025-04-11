import { FormHubLanding } from "~/components/form-hub-landing";
import { useSession } from "../components/auth/hooks/useSession";
import { useNavigate } from "@remix-run/react";
import BackgroundImg from "../assets/background.png";
export default function Dashboard() {
  const { session, isAuthenticated } = useSession();
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-no-repeat bg-cover w-full flex items-center justify-center"
      style={{
        backgroundImage: `url(${BackgroundImg})`,
      }}
    >
      <FormHubLanding userName={session?.user?.user_metadata?.name || ""} />
    </div>
  );
}

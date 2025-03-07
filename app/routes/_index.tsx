import { useSession } from "~/components/hooks/useSession";
import { FormHubLanding } from "~/components/ui/form-hub-landing";
import { LoginPage } from "~/components/ui/login-page";
import BackgroundImg from "../assets/background.png";

export const headers = () => {
  return {
    "Cross-Origin-Opener-Policy": "unsafe-none",
    "Cross-Origin-Resource-Policy": "cross-origin",
  };
};

export default function Index() {
  const { session, isAuthenticated, errorMessage } = useSession();

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen bg-no-repeat bg-cover"
        style={{
          backgroundImage: `url(${BackgroundImg})`,
        }}
      >
        <LoginPage errorMessage={errorMessage} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-no-repeat bg-cover"
      style={{
        backgroundImage: `url(${BackgroundImg})`,
      }}
    >
      <FormHubLanding userName={session?.name || ""} />
    </div>
  );
}

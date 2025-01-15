import { useContext } from "react";
import { SessionContext } from "../context/sessionContext";

export const useSession = () => {
  const { session, setSession } = useContext(SessionContext);
  let errorMessage = "";
  const isAuthenticated =
    session?.email != null &&
    session?.email != "" &&
    session?.email.includes("@teachinglab.org");
  if (!session?.email.includes("@teachinglab.org")) {
    errorMessage =
      "Please ensure to log in with a teaching lab email. If the email is not set up yet, please contact the technology team.";
  }
  if (!session?.email) {
    errorMessage = "";
  }

  return { session, setSession, isAuthenticated, errorMessage };
};

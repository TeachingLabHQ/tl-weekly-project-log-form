import { useContext } from "react";
import { SessionContext } from "../context/sessionContext";

export const useSession = () => {
  const { session, setSession } = useContext(SessionContext);
  let errorMessage = "";
  const isAuthenticated =
    session?.email != null &&
    session?.email != "" &&
    session?.email.includes("@teachinglab.org") &&
    session?.name != null &&
    session?.name != "";
  if (!session?.email.includes("@teachinglab.org")) {
    errorMessage =
      "Please ensure to log in with a teaching lab email. If the email is not set up yet, please contact the operations team.";
  }
  //If there is no name, the users are not registered on Monday
  else if (!session?.name) {
    errorMessage =
      "You are not authorized to access this page. Please contact the operations team.";
  }

  return { session, setSession, isAuthenticated, errorMessage };
};

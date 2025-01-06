import { useContext } from "react";
import { SessionContext } from "../context/sessionContext";

export const useSession = () => {
  const { session, setSession } = useContext(SessionContext);
  const isAuthenticated = session?.email != null;
  return { session, setSession, isAuthenticated };
};

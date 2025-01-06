import { createContext } from "react";

export type Session = {
  email: string;
  name: string;
  buesinessFunction: string | null;
};

export const SessionContext = createContext<{
  session: Session | null;
  setSession: (session: Session | null) => void;
}>({ session: null, setSession: () => {} });

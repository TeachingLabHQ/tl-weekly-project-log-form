import { createContext, useState } from "react";
import { Session } from "@supabase/supabase-js";

export const SessionContext = createContext<{
  session: Session | null;
  setSession: (session: Session | null) => void;
}>({ session: null, setSession: () => {} });

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};

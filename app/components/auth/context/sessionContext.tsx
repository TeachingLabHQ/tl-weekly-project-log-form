import { createContext, useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { createClient } from "../../../../supabase/client";
export const SessionContext = createContext<{
  session: Session | null;
  setSession: (session: Session | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  session: null,
  setSession: () => {},
  isLoading: true,
  isAuthenticated: false,
  setIsAuthenticated: () => {},
});

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();
  useEffect(() => {
    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        setSession(session);
        setIsAuthenticated(!!session);
        setIsLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
        setIsAuthenticated(!!session);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
        isLoading,
        isAuthenticated,
        setIsAuthenticated,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

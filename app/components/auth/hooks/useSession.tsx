import { useContext, useState, useEffect } from "react";
import { SessionContext } from "../context/sessionContext";
import { employeeRepository } from "~/domains/employee/repository";
import { employeeService } from "~/domains/employee/service";
import { useNavigate } from "@remix-run/react";
import { EmployeeProfile } from "~/domains/employee/model";
import { createClient } from "../../../../supabase/client";
export const useSession = () => {
  const { session, setSession, isAuthenticated, setIsAuthenticated } =
    useContext(SessionContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mondayProfile, setMondayProfile] = useState<EmployeeProfile | null>(
    null
  );
  const navigate = useNavigate();
  const supabase = createClient();
  // Initialize Monday profile from localStorage on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProfile = localStorage.getItem("mondayProfile");
      if (storedProfile) {
        setMondayProfile(JSON.parse(storedProfile));
      }
    }
  }, []);

  useEffect(() => {
    const checkAuthorization = async () => {
      // Reset error message on each check
      setErrorMessage("");

      // If no session or no email, or we're explicitly logged out, don't proceed
      if (!session?.user?.email) {
        console.log("No session or no email");
        setIsAuthenticated(false);
        return;
      }

      // Check for Teaching Lab email
      if (!session.user.email.includes("@teachinglab.org")) {
        setErrorMessage(
          "Please ensure to log in with a teaching lab email. If the email is not set up yet, please contact the operations team."
        );
        setIsAuthenticated(false);
        return;
      }

      try {
        setIsLoading(true);
        const newEmployeeService = employeeService(employeeRepository());
        const employee = await newEmployeeService.fetchMondayEmployee(
          session.user.email
        );
        console.log("employee", employee);

        if (employee.error) {
          setErrorMessage(
            "You are not authorized to access this page. Please contact the operations team."
          );
          supabase.auth.signOut();
          setIsAuthenticated(false);
          return;
        }

        const newProfile = {
          name: employee.data.name,
          email: employee.data.email,
          businessFunction: employee.data.businessFunction,
        };

        setMondayProfile(newProfile);
        // Store the profile in localStorage only on client-side
        if (typeof window !== "undefined") {
          localStorage.setItem("mondayProfile", JSON.stringify(newProfile));
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setErrorMessage(
          "An error occurred while checking authorization. Please try again later."
        );
        setIsAuthenticated(false);
        supabase.auth.signOut();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [session?.user?.email]); // Only depend on email changes

  return {
    session,
    setSession,
    isAuthenticated,
    setIsAuthenticated,
    errorMessage,
    isLoading,
    mondayProfile,
    setMondayProfile,
  };
};

import { useContext, useState, useEffect } from "react";
import { SessionContext } from "../context/sessionContext";
import { employeeRepository } from "~/domains/employee/repository";
import { employeeService } from "~/domains/employee/service";
import { useNavigate } from "@remix-run/react";

export const useSession = () => {
  const { session, setSession } = useContext(SessionContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

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
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);
        navigate("/dashboard");
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setErrorMessage(
          "An error occurred while checking authorization. Please try again later."
        );
        setIsAuthenticated(false);
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
  };
};

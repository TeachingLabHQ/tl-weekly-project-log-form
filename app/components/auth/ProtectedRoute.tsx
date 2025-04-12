import { useContext } from "react";
import { Navigate, useLocation } from "@remix-run/react";
import { SessionContext } from "./context/sessionContext";
import { Loader } from "@mantine/core";

// List of public routes that don't require authentication
const publicRoutes = ["/"];

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useContext(SessionContext);
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="xl" />
      </div>
    );
  }

  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (!session && !isPublicRoute) {
    console.log("Redirecting to login page");
    // Redirect to login page but save the attempted URL
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

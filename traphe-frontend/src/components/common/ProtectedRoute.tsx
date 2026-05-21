import { Navigate, useLocation } from "react-router";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/enums/roles.enum";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * ProtectedRoute component that checks if the user has permission to access a route
 *
 * @param children - The component to render if the user has permission
 * @param allowedRoles - Array of roles that are allowed to access this route
 * @param redirectTo - Where to redirect if not allowed (default: /sign-in or /dashboard)
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo,
}: ProtectedRouteProps) {
  const location = useLocation();
  const user = authService.getCurrentUser();

  // Not logged in - redirect to sign in
  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // No role restriction - allow all authenticated users
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has any of the allowed roles
  const userRoles = user.roles || [];
  const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasPermission) {
    // Redirect to specified page or dashboard with error message
    const redirect = redirectTo || "/admin";
    return (
      <Navigate
        to={redirect}
        state={{
          error: "You don't have permission to access this page",
          from: location,
        }}
        replace
      />
    );
  }

  return <>{children}</>;
}

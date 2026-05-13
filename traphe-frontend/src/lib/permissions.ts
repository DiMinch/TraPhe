import { UserRole } from "@/enums/roles.enum";

/**
 * Route permission configuration
 * Define which roles can access which routes
 */
export const routePermissions: Record<string, UserRole[]> = {
  // Dashboard - All admin roles
  "/dashboard": [
    UserRole.ADMIN,
    UserRole.EMPLOYEE,
    UserRole.CASHIER,
    UserRole.ACCOUNTANT,
  ],

  // Customer Management - Admin, Employee
  "/customer": [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CASHIER],
  "/customer/tiers": [UserRole.ADMIN],

  // Product Management - Admin, Employee
  "/product": [UserRole.ADMIN, UserRole.EMPLOYEE],
  "/category": [UserRole.ADMIN, UserRole.EMPLOYEE],

  // Inventory - Admin, Employee
  "/inventory": [UserRole.ADMIN, UserRole.EMPLOYEE],

  // Procurement - Admin, Employee
  "/procurement": [UserRole.ADMIN, UserRole.EMPLOYEE],
  "/procurement/suppliers": [UserRole.ADMIN, UserRole.EMPLOYEE],
  "/procurement/purchase-orders": [UserRole.ADMIN, UserRole.EMPLOYEE],

  // Sales - Admin, Employee, Cashier
  "/sales": [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CASHIER],
  "/sales/pos": [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CASHIER],
  "/sales/orders": [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CASHIER],

  // Warranty - Admin, Employee
  "/warranty": [UserRole.ADMIN, UserRole.EMPLOYEE],

  // Promotions - Admin only
  "/promotions": [UserRole.ADMIN],

  // Reports - Admin, Accountant
  "/reports": [UserRole.ADMIN, UserRole.ACCOUNTANT],

  // System & Users - Admin only
  "/system": [UserRole.ADMIN],
  "/users-roles": [UserRole.ADMIN],
  "/audit-logs": [UserRole.ADMIN],
  "/user": [UserRole.ADMIN, UserRole.EMPLOYEE],
};

/**
 * Helper function to check if a user has access to a specific route
 */
export function hasRoutePermission(
  path: string,
  userRoles: UserRole[],
): boolean {
  // Find the most specific matching route
  const matchingRoutes = Object.keys(routePermissions)
    .filter((route) => path.startsWith(route))
    .sort((a, b) => b.length - a.length); // Sort by length descending (most specific first)

  if (matchingRoutes.length === 0) {
    // No specific permission defined - allow access
    return true;
  }

  const allowedRoles = routePermissions[matchingRoutes[0]];
  return allowedRoles.some((role) => userRoles.includes(role));
}

/**
 * Helper function to get allowed roles for a route
 */
export function getRouteAllowedRoles(path: string): UserRole[] {
  const matchingRoutes = Object.keys(routePermissions)
    .filter((route) => path.startsWith(route))
    .sort((a, b) => b.length - a.length);

  if (matchingRoutes.length === 0) {
    return [];
  }

  return routePermissions[matchingRoutes[0]];
}

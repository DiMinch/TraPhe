import { UserRole } from "@/enums/roles.enum";

/**
 * Route permission configuration
 * Define which roles can access which routes
 *
 * Roles aligned with backend RoleName enum:
 *   ADMIN, CUSTOMER, CASHIER, BARISTA, BRANCH_MANAGER
 */
export const routePermissions: Record<string, UserRole[]> = {
  // Dashboard - Admin + Branch Manager
  "/admin": [
    UserRole.ADMIN,
    UserRole.BRANCH_MANAGER,
  ],

  // Menu & Product Management — Admin only (master menu)
  "/admin/menu": [UserRole.ADMIN],
  "/admin/menu/toppings": [UserRole.ADMIN],
  "/admin/menu/branch": [UserRole.ADMIN, UserRole.BRANCH_MANAGER],
  "/admin/category": [UserRole.ADMIN],

  // Branches
  "/admin/branches": [UserRole.ADMIN],

  // Ingredients & Recipes
  "/admin/ingredients": [UserRole.ADMIN],

  // Inventory / Stock
  "/admin/stock": [UserRole.ADMIN, UserRole.BRANCH_MANAGER],

  // Suppliers / Procurement
  "/admin/suppliers": [UserRole.ADMIN, UserRole.BRANCH_MANAGER],

  // Orders / Sales
  "/admin/orders": [UserRole.ADMIN, UserRole.CASHIER, UserRole.BRANCH_MANAGER],
  "/admin/orders/pos": [UserRole.CASHIER],
  "/admin/orders/queue": [UserRole.CASHIER, UserRole.BARISTA],

  // Loyalty & Customers
  "/admin/loyalty": [UserRole.ADMIN],
  "/admin/loyalty/customers": [UserRole.ADMIN],
  "/admin/loyalty/tiers": [UserRole.ADMIN],
  "/admin/loyalty/rewards": [UserRole.ADMIN],

  // Promotions & Vouchers
  "/admin/promotions": [UserRole.ADMIN],
  "/admin/vouchers": [UserRole.ADMIN],

  // Reports
  "/admin/reports": [UserRole.ADMIN, UserRole.BRANCH_MANAGER],

  // Staff / Users & Roles
  "/admin/staff": [UserRole.ADMIN, UserRole.BRANCH_MANAGER],

  // Settings & System
  "/admin/settings": [UserRole.ADMIN],

  // User profile (admin side)
  "/admin/user": [UserRole.ADMIN],
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

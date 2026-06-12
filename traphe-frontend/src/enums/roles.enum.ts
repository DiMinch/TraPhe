export const UserRole = {
  ADMIN: "ROLE_ADMIN",
  CUSTOMER: "ROLE_CUSTOMER",
  CASHIER: "ROLE_CASHIER",
  BARISTA: "ROLE_BARISTA",
  BRANCH_MANAGER: "ROLE_BRANCH_MANAGER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

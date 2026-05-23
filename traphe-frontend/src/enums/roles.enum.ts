export const UserRole = {
  ADMIN: "ROLE_ADMIN",
  CUSTOMER: "ROLE_CUSTOMER",
  EMPLOYEE: "ROLE_EMPLOYEE",
  CASHIER: "ROLE_CASHIER",
  ACCOUNTANT: "ROLE_ACCOUNTANT",
  BARISTA: "ROLE_BARISTA",
  BRANCH_MANAGER: "ROLE_BRANCH_MANAGER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

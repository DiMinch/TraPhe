export const UserRole = {
  ADMIN: "ROLE_ADMIN",
  CUSTOMER: "ROLE_CUSTOMER",
  EMPLOYEE: "ROLE_EMPLOYEE",
  CASHIER: "ROLE_CASHIER",
  ACCOUNTANT: "ROLE_ACCOUNTANT",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

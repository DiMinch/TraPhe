export const UserRole = {
  ADMIN: "ROLE_ADMIN",
  CUSTOMER: "ROLE_CUSTOMER",
  EMPLOYEE: "ROLE_EMPLOYEE",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

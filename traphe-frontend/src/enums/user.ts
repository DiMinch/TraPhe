export const UserStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  TERMINATED: "TERMINATED",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const UserStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  TERMINATED: "TERMINATED",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const LinkingStatus = {
  NOT_LINKED: "NOT_LINKED",
  SKIPPED: "SKIPPED",
  LINKED: "LINKED",
} as const;
export type LinkingStatus = (typeof LinkingStatus)[keyof typeof LinkingStatus];

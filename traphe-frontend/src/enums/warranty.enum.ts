export const WarrantyStatus = {
  RECEIVED: "RECEIVED",
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  RETURNED: "RETURNED",
  CANCELED: "CANCELED",
} as const;

export type WarrantyStatus =
  (typeof WarrantyStatus)[keyof typeof WarrantyStatus];

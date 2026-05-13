export const NotificationType = {
  ORDER_NEW: "ORDER_NEW",
  ORDER_CONFIRMED: "ORDER_CONFIRMED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  ORDER_COMPLETED: "ORDER_COMPLETED",
  SYSTEM: "SYSTEM",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

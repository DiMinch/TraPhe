export const NotificationType = {
  ORDER_NEW: "ORDER_NEW",
  SYSTEM: "SYSTEM",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

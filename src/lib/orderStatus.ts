export const ORDER_STATUSES = [
  "order_received",
  "quote_sent",
  "quote_approved",
  "printing_started",
  "finishing_qc",
  "ready_pickup",
  "shipped",
  "completed",
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

// Index used for timeline progress
export const STATUS_INDEX: Record<OrderStatus, number> = {
  order_received: 0,
  quote_sent: 1,
  quote_approved: 2,
  printing_started: 3,
  finishing_qc: 4,
  ready_pickup: 5,
  shipped: 5,
  completed: 6,
};

// Steps shown in the customer timeline (collapsed view)
export const TIMELINE_STEPS: { key: OrderStatus; i18n: string }[] = [
  { key: "order_received", i18n: "track.step.received" },
  { key: "quote_approved", i18n: "track.step.approved" },
  { key: "printing_started", i18n: "track.step.printing" },
  { key: "finishing_qc", i18n: "track.step.finishing" },
  { key: "ready_pickup", i18n: "track.step.ready" },
];

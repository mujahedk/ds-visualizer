export type QueueState = {
  items: (number|string)[];
  op?: "enqueue" | "dequeue" | null;
  highlightIndex?: number | null;  // index being enq/deq
  frontIndex: number;              // conceptual; after each op we compact, so 0
};

export type QueueCommand =
  | { type: "enqueue"; value: number|string }
  | { type: "dequeue"; count?: number }
  | { type: "reset" };

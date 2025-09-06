export type StackState = {
  items: (number|string)[];
  op?: "push" | "pop" | null;
  highlightIndex?: number|null;   // index being affected (top)
};

export type StackCommand =
  | { type: "push"; value: number|string }
  | { type: "pop"; count?: number }
  | { type: "reset" };

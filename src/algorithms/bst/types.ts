export type BSTNode = {
  id: string;   // stable unique id (e.g., "n_42")
  key: number;
  left?: string;  // child ids
  right?: string;
  parent?: string;
};

export type BSTState = {
  nodes: Record<string, BSTNode>;
  root?: string;
  highlight?: string[];    // nodes emphasized this frame
  compare?: { from: string; to: string } | null; // traversal step
  relink?: { parent?: string; child?: string; side?: "left" | "right" } | null; // link changes
  op?: "insert" | "delete" | null;
  focusKey?: number | null;  // key being inserted/deleted
};

export type BSTCommand =
  | { type: "insert"; key: number }
  | { type: "delete"; key: number }
  | { type: "reset" };

export interface BSTFrame {
  state: BSTState;
  meta: {
    step: number;
    label: string;
  };
}

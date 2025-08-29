export type AVLNode = {
  id: string;            // stable unique id
  key: number;
  left?: string;
  right?: string;
  parent?: string;
  height: number;        // required
};

export type AVLState = {
  nodes: Record<string, AVLNode>;
  root?: string;
  highlight?: string[];  // nodes emphasized this frame
  compare?: { from: string; to: string } | null;   // traversal step
  relink?: { parent?: string; child?: string; side?: "left"|"right" } | null;
  rotation?: "LL" | "LR" | "RL" | "RR" | null;     // current rotation (if any)
  op?: "insert" | "delete" | null;
  focusKey?: number | null;
  bfAt?: { id: string; bf: number } | null;        // balance factor display for a node this frame
};

export type AVLCommand =
  | { type: "insert"; key: number }
  | { type: "delete"; key: number }
  | { type: "reset" };

export interface AVLFrame {
  state: AVLState;
  meta: {
    step: number;
    label: string;
  };
}

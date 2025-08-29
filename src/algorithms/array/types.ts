export interface ArrayState extends Record<string, unknown> {
  values: (number | string)[]
  highlight?: number[]
  focusIndex?: number | null
  op?: "insert" | "delete" | null
}

export type ArrayCommand = 
  | { type: "insert"; index: number; value: number | string } 
  | { type: "delete"; index: number } 
  | { type: "reset" }

export interface ArrayFrame {
  state: ArrayState
  meta: {
    step: number
    label: string
  }
}

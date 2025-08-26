export interface HeapState extends Record<string, unknown> {
  array: number[]
  highlight?: number[]
  swap?: [number, number] | null
}

export type HeapCommand = 
  | { type: "insert"; value: number } 
  | { type: "pop" } 
  | { type: "reset" }

export interface HeapFrame {
  state: HeapState
  meta: {
    step: number
    label: string
  }
}

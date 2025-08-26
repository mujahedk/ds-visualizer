// Universal algorithm system types and contracts

export type AlgorithmKey = 
  | "heap" 
  | "bst" 
  | "avl" 
  | "linked-list" 
  | "array" 
  | "stack" 
  | "queue" 
  | "hash" 
  | "graph"

export interface Frame<TState = Record<string, unknown>> {
  state: TState
  meta: {
    step: number
    label: string
  }
}

export interface Command {
  type: string
  payload?: unknown
}

export interface AlgorithmDescriptor {
  key: AlgorithmKey
  title: string
  description: string
  complexities: Record<string, string>
  createMockFrames(): Frame<Record<string, unknown>>[]
  parseCommand(input: string): Command | null
  // Future: run(commands: Command[]): Frame<Record<string, unknown>>[] - not implemented yet
}

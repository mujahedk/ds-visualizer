import { AlgorithmKey, AlgorithmDescriptor, Frame, Command } from './types'
import { algorithmPresets } from './presets'

// Mock frame generators for each algorithm type
const createMockFrames = (algorithmKey: AlgorithmKey): Frame<Record<string, unknown>>[] => {
  const mockStates = {
    heap: [
      { elements: [10, 5, 3], tree: "balanced" },
      { elements: [15, 10, 5, 3], tree: "inserting" },
      { elements: [15, 10, 5, 3], tree: "bubbling up" },
      { elements: [15, 10, 5, 3], tree: "balanced" },
      { elements: [10, 5, 3], tree: "extracting max" }
    ],
    bst: [
      { nodes: [{ value: 50, left: null, right: null }], height: 1 },
      { nodes: [{ value: 50, left: { value: 30 }, right: null }], height: 2 },
      { nodes: [{ value: 50, left: { value: 30 }, right: { value: 70 } }], height: 2 },
      { nodes: [{ value: 50, left: { value: 30 }, right: { value: 70 } }], height: 2, searching: 30 },
      { nodes: [{ value: 70, left: { value: 30 }, right: null }], height: 2, deleted: 50 }
    ],
    avl: [
      { nodes: [{ value: 10, height: 1, balance: 0 }], rotations: 0 },
      { nodes: [{ value: 10, height: 2, balance: -1 }, { value: 5, height: 1, balance: 0 }], rotations: 0 },
      { nodes: [{ value: 10, height: 2, balance: -2 }, { value: 5, height: 1, balance: 0 }], rotations: 1, needsRotation: true },
      { nodes: [{ value: 5, height: 2, balance: 0 }, { value: 3, height: 1, balance: 0 }, { value: 10, height: 1, balance: 0 }], rotations: 1 },
      { nodes: [{ value: 5, height: 2, balance: 0 }, { value: 3, height: 1, balance: 0 }, { value: 10, height: 1, balance: 0 }], rotations: 1, balanced: true }
    ],
    "linked-list": [
      { nodes: [{ value: 5, next: null }], head: 0, tail: 0, size: 1 },
      { nodes: [{ value: 5, next: null }, { value: 10, next: null }], head: 0, tail: 1, size: 2 },
      { nodes: [{ value: 15, next: 0 }, { value: 5, next: 1 }, { value: 10, next: null }], head: 0, tail: 2, size: 3 },
      { nodes: [{ value: 15, next: 0 }, { value: 5, next: 1 }, { value: 10, next: null }], head: 0, tail: 2, size: 3, inserting: "at position 1" },
      { nodes: [{ value: 15, next: 1 }, { value: 5, next: 2 }, { value: 10, next: null }], head: 0, tail: 2, size: 3, inserted: "15 at position 1" }
    ],
    array: [
      { elements: [1, 2, 3, 4, 5], size: 5, capacity: 10 },
      { elements: [1, 2, 3, 4, 5, 6], size: 6, capacity: 10, action: "appended 6" },
      { elements: [1, 2, 3, 4, 5, 6], size: 6, capacity: 10, action: "accessing index 2" },
      { elements: [1, 2, 8, 4, 5, 6], size: 6, capacity: 10, action: "set index 2 to 8" },
      { elements: [1, 2, 8, 4, 5, 6], size: 6, capacity: 10, action: "searching for value 8" }
    ],
    stack: [
      { elements: [], top: -1, capacity: 10, action: "empty stack" },
      { elements: [5], top: 0, capacity: 10, action: "pushed 5" },
      { elements: [5, 10], top: 1, capacity: 10, action: "pushed 10" },
      { elements: [5, 10], top: 1, capacity: 10, action: "peeking top" },
      { elements: [5], top: 0, capacity: 10, action: "popped 10" }
    ],
    queue: [
      { elements: [], front: 0, rear: -1, size: 0, capacity: 10 },
      { elements: [5], front: 0, rear: 0, size: 1, capacity: 10, action: "enqueued 5" },
      { elements: [5, 10], front: 0, rear: 1, size: 2, capacity: 10, action: "enqueued 10" },
      { elements: [5, 10], front: 0, rear: 1, size: 2, capacity: 10, action: "peeking front" },
      { elements: [10], front: 1, rear: 1, size: 1, capacity: 10, action: "dequeued 5" }
    ],
    hash: [
      { buckets: [], size: 0, capacity: 16, loadFactor: 0 },
      { buckets: [["key1", "value1"]], size: 1, capacity: 16, loadFactor: 0.0625, action: "put key1=value1" },
      { buckets: [["key1", "value1"], ["key2", "value2"]], size: 2, capacity: 16, loadFactor: 0.125, action: "put key2=value2" },
      { buckets: [["key1", "value1"], ["key2", "value2"]], size: 2, capacity: 16, loadFactor: 0.125, action: "get key1" },
      { buckets: [["key2", "value2"]], size: 1, capacity: 16, loadFactor: 0.0625, action: "removed key1" }
    ],
    graph: [
      { vertices: ["A"], edges: [], action: "added vertex A" },
      { vertices: ["A", "B"], edges: [["A", "B"]], action: "added edge A->B" },
      { vertices: ["A", "B", "C"], edges: [["A", "B"], ["B", "C"]], action: "added edge B->C" },
      { vertices: ["A", "B", "C"], edges: [["A", "B"], ["B", "C"]], action: "BFS traversal starting from A" },
      { vertices: ["A", "B", "C"], edges: [["A", "B"], ["B", "C"]], action: "shortest path A->C: A->B->C" }
    ]
  }

  const mockLabels = [
    "Initial state",
    "Processing input",
    "Updating structure",
    "Validating state",
    "Final result"
  ]

  return mockStates[algorithmKey].map((state, index) => ({
    state,
    meta: {
      step: index + 1,
      label: mockLabels[index]
    }
  }))
}

// Generic command parser for all algorithms
const parseCommand = (input: string): Command | null => {
  const trimmed = input.trim().toLowerCase()
  
  // Basic command parsing - can be enhanced per algorithm
  if (trimmed.startsWith('insert ')) {
    return { type: 'insert', payload: trimmed.substring(7) }
  }
  if (trimmed.startsWith('delete ')) {
    return { type: 'delete', payload: trimmed.substring(7) }
  }
  if (trimmed.startsWith('search ')) {
    return { type: 'search', payload: trimmed.substring(7) }
  }
  if (trimmed === 'clear') {
    return { type: 'clear' }
  }
  if (trimmed === 'reset') {
    return { type: 'reset' }
  }
  
  return null
}

// Create algorithm descriptors
const createAlgorithmDescriptor = (key: AlgorithmKey): AlgorithmDescriptor => {
  const preset = algorithmPresets[key]
  
  return {
    key,
    title: preset.title,
    description: preset.description,
    complexities: preset.complexities,
    createMockFrames: () => createMockFrames(key),
    parseCommand
  }
}

// Registry of all available algorithms
const algorithmRegistry = new Map<AlgorithmKey, AlgorithmDescriptor>()

// Initialize registry with all algorithms
Object.values(algorithmPresets).forEach(preset => {
  algorithmRegistry.set(preset.key, createAlgorithmDescriptor(preset.key))
})

// Public API
export const getAlgorithms = (): AlgorithmDescriptor[] => {
  return Array.from(algorithmRegistry.values())
}

export const getAlgorithm = (key: AlgorithmKey): AlgorithmDescriptor | undefined => {
  return algorithmRegistry.get(key)
}

export const hasAlgorithm = (key: AlgorithmKey): boolean => {
  return algorithmRegistry.has(key)
}

export { algorithmPresets }

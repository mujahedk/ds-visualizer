import { AlgorithmKey, AlgorithmDescriptor, Frame, Command } from './types'
import { algorithmPresets } from './presets'
import { runHeapCommands, parseHeapInput } from './heap'
import { runArrayCommands, parseArrayInput } from './array'
import { runBSTCommands, parseBSTInput } from './bst'
import { runAVLCommands, parseAVLInput } from './avl'
import { runQueueCommands, parseQueueInput } from './queue'
import { runStackCommands, parseStackInput } from './stack'

// Mock frame generators for each algorithm type (keeping for non-heap algorithms)
const createMockFrames = (algorithmKey: AlgorithmKey): Frame<Record<string, unknown>>[] => {
  const mockFrames = {
    heap: [
      {
        state: { array: [10, 5, 3], highlight: [], swap: null },
        meta: { step: 1, label: "Initial heap state" }
      },
      {
        state: { array: [10, 5, 3, 15], highlight: [3], swap: null },
        meta: { step: 2, label: "Inserting element 15" }
      },
      {
        state: { array: [15, 5, 3, 10], highlight: [0, 3], swap: [0, 3] },
        meta: { step: 3, label: "siftUp swap(i=3,j=0)" }
      },
      {
        state: { array: [15, 5, 3, 10], highlight: [], swap: null },
        meta: { step: 4, label: "Heap property restored" }
      },
      {
        state: { array: [10, 5, 3], highlight: [0], swap: null },
        meta: { step: 5, label: "Extracting maximum element" }
      },
      {
        state: { array: [10, 5, 3], highlight: [0, 1], swap: [0, 1] },
        meta: { step: 6, label: "siftDown swap(i=0,j=1)" }
      },
      {
        state: { array: [10, 5, 3], highlight: [], swap: null },
        meta: { step: 7, label: "Final heap state" }
      }
    ],
    bst: [
      {
        state: {
          nodes: [
            { id: "n1", key: 50, left: null, right: null }
          ],
          root: "n1",
          highlight: []
        },
        meta: { step: 1, label: "Initial tree state" }
      },
      {
        state: {
          nodes: [
            { id: "n1", key: 50, left: "n2", right: null },
            { id: "n2", key: 30, left: null, right: null }
          ],
          root: "n1",
          highlight: ["n2"]
        },
        meta: { step: 2, label: "Inserting key 30" }
      },
      {
        state: {
          nodes: [
            { id: "n1", key: 50, left: "n2", right: "n3" },
            { id: "n2", key: 30, left: null, right: null },
            { id: "n3", key: 70, left: null, right: null }
          ],
          root: "n1",
          highlight: ["n3"]
        },
        meta: { step: 3, label: "Inserting key 70" }
      },
      {
        state: {
          nodes: [
            { id: "n1", key: 50, left: "n2", right: "n3" },
            { id: "n2", key: 30, left: null, right: null },
            { id: "n3", key: 70, left: null, right: null }
          ],
          root: "n1",
          highlight: ["n2"]
        },
        meta: { step: 4, label: "Searching for key 30" }
      },
      {
        state: {
          nodes: [
            { id: "n1", key: 50, left: "n2", right: "n3" },
            { id: "n2", key: 30, left: null, right: null },
            { id: "n3", key: 70, left: null, right: null }
          ],
          root: "n1",
          highlight: ["n2"]
        },
        meta: { step: 5, label: "Key found at node n2" }
      }
    ],
    avl: [
      {
        state: {
          nodes: [
            { id: "n1", key: 30, left: null, right: null, height: 1 }
          ],
          root: "n1",
          highlight: []
        },
        meta: { step: 1, label: "Initial AVL tree" }
      },
      {
        state: {
          nodes: [
            { id: "n1", key: 30, left: "n2", right: null, height: 2 },
            { id: "n2", key: 20, left: null, right: null, height: 1 }
          ],
          root: "n1",
          highlight: ["n2"]
        },
        meta: { step: 2, label: "Inserting key 20" }
      },
      {
        state: {
          nodes: [
            { id: "n1", key: 30, left: "n2", right: null, height: 2 },
            { id: "n2", key: 20, left: null, right: null, height: 1 }
          ],
          root: "n1",
          highlight: ["n1", "n2"]
        },
        meta: { step: 3, label: "Height imbalance detected" }
      },
      {
        state: {
          nodes: [
            { id: "n1", key: 20, left: null, right: "n2", height: 2 },
            { id: "n2", key: 30, left: null, right: null, height: 1 }
          ],
          root: "n1",
          highlight: ["n1", "n2"]
        },
        meta: { step: 4, label: "LL rotation at node n1" }
      },
      {
        state: {
          nodes: [
            { id: "n1", key: 20, left: null, right: "n2", height: 2 },
            { id: "n2", key: 30, left: null, right: null, height: 1 }
          ],
          root: "n1",
          highlight: []
        },
        meta: { step: 5, label: "Tree rebalanced" }
      }
    ],
    "linked-list": [
      {
        state: {
          nodes: [
            { id: "n1", value: 10, next: null, prev: null }
          ],
          head: "n1",
          tail: "n1",
          highlight: []
        },
        meta: { step: 1, label: "Initial linked list" }
      },
      {
        state: {
          nodes: [
            { id: "n1", value: 10, next: "n2", prev: null },
            { id: "n2", value: 20, next: null, prev: "n1" }
          ],
          head: "n1",
          tail: "n2",
          highlight: ["n2"]
        },
        meta: { step: 2, label: "Appending to end" }
      },
      {
        state: {
          nodes: [
            { id: "n1", value: 10, next: "n2", prev: null },
            { id: "n2", value: 20, next: null, prev: "n1" }
          ],
          head: "n1",
          tail: "n2",
          highlight: ["n1"]
        },
        meta: { step: 3, label: "Apply" }
      },
      {
        state: {
          nodes: [
            { id: "n1", value: 5, next: "n2", prev: null },
            { id: "n2", value: 10, next: "n3", prev: "n1" },
            { id: "n3", value: 20, next: null, prev: "n2" }
          ],
          head: "n1",
          tail: "n3",
          highlight: ["n1"]
        },
        meta: { step: 4, label: "Inserting 5 at start" }
      },
      {
        state: {
          nodes: [
            { id: "n1", value: 5, next: "n2", prev: null },
            { id: "n2", value: 10, next: "n3", prev: "n1" },
            { id: "n3", value: 20, next: null, prev: "n2" }
          ],
          head: "n1",
          tail: "n3",
          highlight: ["n2"]
        },
        meta: { step: 5, label: "Searching for value 10" }
      }
    ],
    array: [
      {
        state: { values: [], highlight: [], focusIndex: null, op: null },
        meta: { step: 1, label: "Empty array" }
      },
      {
        state: { values: [5], highlight: [0], focusIndex: 0, op: "insert" },
        meta: { step: 2, label: "Inserted 5 at index 0" }
      },
      {
        state: { values: [5, 7], highlight: [1], focusIndex: 1, op: "insert" },
        meta: { step: 3, label: "Inserted 7 at index 1" }
      },
      {
        state: { values: [5, 6, 7], highlight: [1], focusIndex: 1, op: "insert" },
        meta: { step: 4, label: "Inserted 6 at index 1, shifted 7 right" }
      }
    ],
    stack: [
      {
        state: {
          items: [],
          highlightIndex: undefined
        },
        meta: { step: 1, label: "Initial empty stack" }
      },
      {
        state: {
          items: ["push"],
          highlightIndex: 0
        },
        meta: { step: 2, label: "Pushing element 'push'" }
      },
      {
        state: {
          items: ["push", "pop"],
          highlightIndex: 1
        },
        meta: { step: 3, label: "Pushing element 'pop'" }
      },
      {
        state: {
          items: ["push", "pop", "peek"],
          highlightIndex: 2
        },
        meta: { step: 4, label: "Pushing element 'peek'" }
      },
      {
        state: {
          items: ["push", "pop", "peek"],
          highlightIndex: 2
        },
        meta: { step: 5, label: "Peeking at top element" }
      },
      {
        state: {
          items: ["push", "pop"],
          highlightIndex: 1
        },
        meta: { step: 6, label: "Popping element 'peek'" }
      }
    ],
    queue: [
      {
        state: {
          items: [],
          op: null,
          highlightIndex: null,
          frontIndex: 0
        },
        meta: { step: 1, label: "Initial empty queue" }
      },
      {
        state: {
          items: ["A"],
          op: "enqueue",
          highlightIndex: 0,
          frontIndex: 0
        },
        meta: { step: 2, label: "enqueue A" }
      },
      {
        state: {
          items: ["A", "B"],
          op: "enqueue",
          highlightIndex: 1,
          frontIndex: 0
        },
        meta: { step: 3, label: "enqueue B" }
      },
      {
        state: {
          items: ["A", "B", "C"],
          op: "enqueue",
          highlightIndex: 2,
          frontIndex: 0
        },
        meta: { step: 4, label: "enqueue C" }
      },
      {
        state: {
          items: ["A", "B", "C"],
          op: "dequeue",
          highlightIndex: 0,
          frontIndex: 0
        },
        meta: { step: 5, label: "dequeue (front=0)" }
      },
      {
        state: {
          items: ["B", "C"],
          op: "dequeue",
          highlightIndex: null,
          frontIndex: 0
        },
        meta: { step: 6, label: "removed front (A)" }
      }
    ],
    hash: [
      {
        state: {
          buckets: [],
          highlight: {}
        },
        meta: { step: 1, label: "Initial empty hash table" }
      },
      {
        state: {
          buckets: [
            {
              index: 0,
              entries: [
                { key: "name", value: "John", id: "e1" }
              ]
            }
          ],
          highlight: { bucket: 0, entryId: "e1" }
        },
        meta: { step: 2, label: "Inserting key 'name' with value 'John'" }
      },
      {
        state: {
          nodes: [
            { id: "n1", key: 30, left: null, right: null, height: 1 }
          ],
          root: "n1",
          highlight: []
        },
        meta: { step: 3, label: "Hash collision at bucket 0" }
      },
      {
        state: {
          buckets: [
            {
              index: 0,
              entries: [
                { key: "name", value: "John", id: "e1" },
                { key: "age", value: 30, id: "e2" }
              ]
            },
            {
              index: 1,
              entries: [
                { key: "city", value: "NYC", id: "e3" }
              ]
            }
          ],
          highlight: { bucket: 1, entryId: "e3" }
        },
        meta: { step: 4, label: "Inserting key 'city' with value 'NYC'" }
      },
      {
        state: {
          buckets: [
            {
              index: 0,
              entries: [
                { key: "name", value: "John", id: "e1" },
                { key: "age", value: 30, id: "e2" }
              ]
            },
            {
              index: 1,
              entries: [
                { key: "city", value: "NYC", id: "e3" }
              ]
            }
          ],
          highlight: { bucket: 0, entryId: "e1" }
        },
        meta: { step: 5, label: "Retrieving value for key 'name'" }
      }
    ],
    graph: [
      {
        state: {
          nodes: [
            { id: "A", label: "Start", x: 100, y: 100, visited: false, dist: 0 }
          ],
          edges: [],
          current: undefined
        },
        meta: { step: 1, label: "Initial graph state" }
      },
      {
        state: {
          nodes: [
            { id: "A", label: "Start", x: 100, y: 100, visited: false, dist: 0 },
            { id: "B", label: "Node B", x: 200, y: 150, visited: false, dist: undefined }
          ],
          edges: [
            { id: "e1", u: "A", v: "B", w: 5, directed: true, relaxed: false }
          ],
          current: undefined
        },
        meta: { step: 2, label: "Inserting key 20" }
      },
      {
        state: {
          nodes: [
            { id: "A", label: "Start", x: 100, y: 100, visited: false, dist: 0 },
            { id: "B", label: "Node B", x: 200, y: 150, visited: false, dist: undefined },
            { id: "C", label: "Node C", x: 150, y: 200, visited: false, dist: undefined }
          ],
          edges: [
            { id: "e1", u: "A", v: "B", w: 5, directed: true, relaxed: false },
            { id: "e2", u: "A", v: "C", w: 3, directed: true, relaxed: false }
          ],
          current: undefined
        },
        meta: { step: 3, label: "Adding vertex C and edge A->C" }
      },
      {
        state: {
          nodes: [
            { id: "A", label: "Start", x: 100, y: 100, visited: true, dist: 0 },
            { id: "n2", key: 20, left: null, right: null, height: 1 }
          ],
          edges: [
            { id: "e1", u: "A", v: "B", w: 5, directed: true, relaxed: true },
            { id: "e2", u: "A", v: "C", w: 3, directed: true, relaxed: true }
          ],
          current: "A"
        },
        meta: { step: 4, label: "Starting BFS from node A" }
      },
      {
        state: {
          nodes: [
            { id: "A", label: "Start", x: 100, y: 100, visited: true, dist: 0 },
            { id: "B", label: "Node B", x: 200, y: 150, visited: true, dist: 5 },
            { id: "C", label: "Node C", x: 150, y: 200, visited: true, dist: 3 }
          ],
          edges: [
            { id: "e1", u: "A", v: "B", w: 5, directed: true, relaxed: true },
            { id: "e2", u: "A", v: "C", w: 3, directed: true, relaxed: true }
          ],
          current: "B"
        },
        meta: { step: 5, label: "Visiting node B" }
      }
    ]
  }

  return mockFrames[algorithmKey] || []
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
  
  // Special handling for heap algorithm
  if (key === 'heap') {
    return {
      key,
      title: "Min Heap",
      description: preset.description,
      complexities: {
        "Insert": "O(log n)",
        "Pop": "O(log n)",
        "Peak": "O(1)"
      },
      createMockFrames: () => createMockFrames(key),
      createFramesFromInput: (input: string) => {
        const commands = parseHeapInput(input)
        const heapFrames = runHeapCommands(commands)
        // Convert HeapState frames to Record<string, unknown> frames
        return heapFrames.map(frame => ({
          state: frame.state as Record<string, unknown>,
          meta: frame.meta
        }))
      },
      parseCommand
    }
  }
  
  // Special handling for array algorithm
  if (key === 'array') {
    return {
      key,
      title: "Array",
      description: preset.description,
      complexities: {
        "InsertAtIndex": "O(n)",
        "DeleteAtIndex": "O(n)",
        "Access": "O(1)"
      },
      createMockFrames: () => createMockFrames(key),
      createFramesFromInput: (input: string) => {
        const commands = parseArrayInput(input)
        const arrayFrames = runArrayCommands([], commands)
        // Convert ArrayState frames to Record<string, unknown> frames
        return arrayFrames.map(frame => ({
          state: frame.state as Record<string, unknown>,
          meta: frame.meta
        }))
      },
      parseCommand
    }
  }
  
  // Special handling for BST algorithm
  if (key === 'bst') {
    return {
      key,
      title: "Binary Search Tree",
      description: preset.description,
      complexities: {
        "Insert": "O(h)",
        "Search": "O(h)",
        "Delete": "O(h)"
      },
      createMockFrames: () => createMockFrames(key),
      createFramesFromInput: (input: string) => {
        const commands = parseBSTInput(input)
        const bstFrames = runBSTCommands(commands)
        // Convert BSTState frames to Record<string, unknown> frames
        return bstFrames.map(frame => ({
          state: frame.state as Record<string, unknown>,
          meta: frame.meta
        }))
      },
      parseCommand
    }
  }
  
  // Special handling for AVL algorithm
  if (key === 'avl') {
    return {
      key,
      title: "AVL Tree",
      description: preset.description,
      complexities: {
        "Insert": "O(log n)",
        "Search": "O(log n)",
        "Delete": "O(log n)"
      },
      createMockFrames: () => createMockFrames(key),
      createFramesFromInput: (input: string) => {
        const commands = parseAVLInput(input)
        const avlFrames = runAVLCommands(commands)
        // Convert AVLState frames to Record<string, unknown> frames
        return avlFrames.map(frame => ({
          state: frame.state as Record<string, unknown>,
          meta: frame.meta
        }))
      },
      parseCommand
    }
  }
  
  // Special handling for queue algorithm
  if (key === 'queue') {
    return {
      key,
      title: "Queue",
      description: preset.description,
      complexities: {
        "Enqueue": "O(1)",
        "Dequeue": "O(1)",
        "Peek": "O(1)"
      },
      createMockFrames: () => createMockFrames(key),
      createFramesFromInput: (input: string) => {
        const commands = parseQueueInput(input)
        const queueFrames = runQueueCommands([], commands)
        // Convert QueueState frames to Record<string, unknown> frames
        return queueFrames.map(frame => ({
          state: frame.state as Record<string, unknown>,
          meta: frame.meta
        }))
      },
      parseCommand
    }
  }
  
  // Special handling for stack algorithm
  if (key === 'stack') {
    return {
      key,
      title: "Stack",
      description: preset.description,
      complexities: {
        "Push": "O(1)",
        "Pop": "O(1)",
        "Peek": "O(1)"
      },
      createMockFrames: () => createMockFrames(key),
      createFramesFromInput: (input: string) => {
        const commands = parseStackInput(input)
        const stackFrames = runStackCommands([], commands)
        // Convert StackState frames to Record<string, unknown> frames
        return stackFrames.map(frame => ({
          state: frame.state as Record<string, unknown>,
          meta: frame.meta
        }))
      },
      parseCommand
    }
  }
  
  // Default descriptor for other algorithms
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

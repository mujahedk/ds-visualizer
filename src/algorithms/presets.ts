import { AlgorithmKey } from './types'

export interface AlgorithmPreset {
  key: AlgorithmKey
  title: string
  description: string
  sampleInputs: string[]
  complexities: Record<string, string>
  presets: Array<{
    description: string
    commands: string
  }>
}

export const algorithmPresets: Record<AlgorithmKey, AlgorithmPreset> = {
  heap: {
    key: "heap",
    title: "Binary Heap",
    description: "A complete binary tree where each parent node is greater than or equal to its children (max heap) or less than or equal to its children (min heap).",
    sampleInputs: ["insert 15", "insert 20", "insert 10", "extract", "heapify"],
    complexities: { "Insert": "O(log n)", "Extract": "O(log n)", "Peak": "O(1)", "Build": "O(n)" },
    presets: [
      {
        description: "Balanced-ish insert",
        commands: "insert 10,4,15,2,8,12,18"
      },
      {
        description: "Cascade sift up",
        commands: "insert 50,40,30,20,10,5,1"
      },
      {
        description: "Pop cascade",
        commands: "insert 5,1,9,2,7; pop 3"
      }
    ]
  },
  bst: {
    key: "bst",
    title: "Binary Search Tree",
    description: "A tree data structure where each node has at most two children, and the left subtree contains nodes with values less than the parent.",
    sampleInputs: ["insert 50", "insert 30", "insert 70", "search 30", "delete 30"],
    complexities: { "Insert": "O(h)", "Search": "O(h)", "Delete": "O(h)", "Traversal": "O(n)" },
    presets: [
      {
        description: "Balanced BST",
        commands: "insert 50,30,70,20,40,60,80"
      },
      {
        description: "Unbalanced BST",
        commands: "insert 10,20,30,40,50,60,70"
      },
      {
        description: "BST operations",
        commands: "insert 25,15,35,5,20,30,40; delete 15"
      }
    ]
  },
  avl: {
    key: "avl",
    title: "AVL Tree",
    description: "A self-balancing binary search tree where the heights of the two child subtrees of any node differ by at most one.",
    sampleInputs: ["insert 30", "insert 20", "insert 40", "insert 10", "insert 25"],
    complexities: { "Insert": "O(log n)", "Delete": "O(log n)", "Search": "O(log n)", "Balance": "O(1)" },
    presets: [
      {
        description: "LL rotation",
        commands: "insert 30,20,10"
      },
      {
        description: "RR rotation",
        commands: "insert 10,20,30"
      },
      {
        description: "LR rotation",
        commands: "insert 30,10,20"
      },
      {
        description: "RL rotation",
        commands: "insert 10,30,20"
      }
    ]
  },
  "linked-list": {
    key: "linked-list",
    title: "Linked List",
    description: "A linear data structure where elements are stored in nodes, and each node points to the next node in the sequence.",
    sampleInputs: ["insert 10", "insert 20", "insert 30", "delete 20", "search 30"],
    complexities: { "Insert": "O(1)", "Delete": "O(n)", "Search": "O(n)", "Access": "O(n)" },
    presets: [
      {
        description: "Basic operations",
        commands: "insert 10,20,30; delete 20; search 30"
      },
      {
        description: "Reverse list",
        commands: "insert 1,2,3,4,5; reverse"
      },
      {
        description: "Cycle detection",
        commands: "insert 1,2,3,4,5; create cycle"
      }
    ]
  },
  array: {
    key: "array",
    title: "Array",
    description: "A collection of elements stored at contiguous memory locations, accessible by index.",
    sampleInputs: ["insert 5", "delete 3", "search 10", "sort", "reverse"],
    complexities: { "Access": "O(1)", "Search": "O(n)", "Insert": "O(n)", "Delete": "O(n)" },
    presets: [
      {
        description: "Bubble sort",
        commands: "insert 64,34,25,12,22,11,90; sort"
      },
      {
        description: "Linear search",
        commands: "insert 15,8,22,3,17,9,12; search 17"
      },
      {
        description: "Array manipulation",
        commands: "insert 1,2,3,4,5; reverse; insert 10"
      }
    ]
  },
  stack: {
    key: "stack",
    title: "Stack",
    description: "A LIFO (Last In, First Out) data structure where elements are added and removed from the top.",
    sampleInputs: ["push 10", "push 20", "pop", "peek", "isEmpty"],
    complexities: { "Push": "O(1)", "Pop": "O(1)", "Peek": "O(1)", "Search": "O(n)" },
    presets: [
      {
        description: "Stack operations",
        commands: "push 10,20,30,40; pop 2; push 50"
      },
      {
        description: "Balanced parentheses",
        commands: "push (,),[,],{,}; check balance"
      },
      {
        description: "Stack reversal",
        commands: "push 1,2,3,4,5; reverse"
      }
    ]
  },
  queue: {
    key: "queue",
    title: "Queue",
    description: "A FIFO (First In, First Out) data structure where elements are added at the rear and removed from the front.",
    sampleInputs: ["enqueue 10", "enqueue 20", "dequeue", "peek", "isEmpty"],
    complexities: { "Enqueue": "O(1)", "Dequeue": "O(1)", "Peek": "O(1)", "Search": "O(n)" },
    presets: [
      {
        description: "Queue operations",
        commands: "enqueue 10,20,30,40; dequeue 2; enqueue 50"
      },
      {
        description: "Circular queue",
        commands: "enqueue 1,2,3,4,5; dequeue 3; enqueue 6,7,8"
      },
      {
        description: "Priority queue",
        commands: "enqueue 15,10,25,5,20; dequeue all"
      }
    ]
  },
  hash: {
    key: "hash",
    title: "Hash Table",
    description: "A data structure that implements an associative array abstract data type, mapping keys to values using a hash function.",
    sampleInputs: ["insert key1 value1", "get key1", "delete key1", "resize", "collision"],
    complexities: { "Insert": "O(1)", "Delete": "O(1)", "Search": "O(1)", "Worst Case": "O(n)" },
    presets: [
      {
        description: "Hash operations",
        commands: "insert name John, age 25, city NYC; get name; delete age"
      },
      {
        description: "Collision handling",
        commands: "insert a 1, b 2, c 3, d 4; force collision"
      },
      {
        description: "Hash table resize",
        commands: "insert 20 items; trigger resize; verify distribution"
      }
    ]
  },
  graph: {
    key: "graph",
    title: "Graph",
    description: "A collection of nodes (vertices) connected by edges, representing relationships between objects.",
    sampleInputs: ["add vertex A", "add edge A-B", "BFS A", "DFS A", "shortest path A-C"],
    complexities: { "BFS": "O(V+E)", "DFS": "O(V+E)", "Shortest Path": "O(V²)", "Topological Sort": "O(V+E)" },
    presets: [
      {
        description: "BFS traversal",
        commands: "add vertices A,B,C,D,E; add edges A-B,A-C,B-D,C-E; BFS A"
      },
      {
        description: "DFS traversal",
        commands: "add vertices 1,2,3,4,5; add edges 1-2,2-3,3-4,4-5; DFS 1"
      },
      {
        description: "Shortest path",
        commands: "add vertices S,A,B,C,T; add weighted edges; find S to T"
      }
    ]
  }
}

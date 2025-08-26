import { AlgorithmKey } from './types'

export interface AlgorithmPreset {
  key: AlgorithmKey
  title: string
  description: string
  sampleInputs: string[]
  complexities: Record<string, string>
}

export const algorithmPresets: Record<AlgorithmKey, AlgorithmPreset> = {
  heap: {
    key: "heap",
    title: "Binary Heap",
    description: "A complete binary tree where each parent node is greater than or equal to its children (max heap) or less than or equal to its children (min heap).",
    sampleInputs: ["insert 15", "insert 20", "insert 10", "extract", "heapify"],
    complexities: {
      "Insert": "O(log n)",
      "Extract": "O(log n)",
      "Peek": "O(1)",
      "Build": "O(n)"
    }
  },
  bst: {
    key: "bst",
    title: "Binary Search Tree",
    description: "A tree data structure where each node has at most two children, and the left subtree contains nodes with values less than the parent.",
    sampleInputs: ["insert 50", "insert 30", "insert 70", "search 30", "delete 50"],
    complexities: {
      "Insert": "O(h)",
      "Search": "O(h)",
      "Delete": "O(h)",
      "Traversal": "O(n)"
    }
  },
  avl: {
    key: "avl",
    title: "AVL Tree",
    description: "A self-balancing binary search tree where the heights of the two child subtrees of any node differ by at most one.",
    sampleInputs: ["insert 10", "insert 20", "insert 30", "balance", "rotate left"],
    complexities: {
      "Insert": "O(log n)",
      "Delete": "O(log n)",
      "Search": "O(log n)",
      "Balance": "O(1)"
    }
  },
  "linked-list": {
    key: "linked-list",
    title: "Linked List",
    description: "A linear data structure where elements are stored in nodes, and each node points to the next node in the sequence.",
    sampleInputs: ["append 5", "prepend 10", "insert 15 at 1", "delete at 1", "reverse"],
    complexities: {
      "Access": "O(n)",
      "Search": "O(n)",
      "Insert": "O(1)",
      "Delete": "O(1)"
    }
  },
  array: {
    key: "array",
    title: "Array",
    description: "A collection of elements stored at contiguous memory locations, accessible by index.",
    sampleInputs: ["set 0 to 5", "get 2", "resize 10", "fill 0", "slice 1 to 5"],
    complexities: {
      "Access": "O(1)",
      "Search": "O(n)",
      "Insert": "O(n)",
      "Delete": "O(n)"
    }
  },
  stack: {
    key: "stack",
    title: "Stack",
    description: "A LIFO (Last In, First Out) data structure where elements are added and removed from the top.",
    sampleInputs: ["push 5", "push 10", "pop", "peek", "isEmpty"],
    complexities: {
      "Push": "O(1)",
      "Pop": "O(1)",
      "Peek": "O(1)",
      "Search": "O(n)"
    }
  },
  queue: {
    key: "queue",
    title: "Queue",
    description: "A FIFO (First In, First Out) data structure where elements are added at the rear and removed from the front.",
    sampleInputs: ["enqueue 5", "enqueue 10", "dequeue", "peek", "size"],
    complexities: {
      "Enqueue": "O(1)",
      "Dequeue": "O(1)",
      "Peek": "O(1)",
      "Search": "O(n)"
    }
  },
  hash: {
    key: "hash",
    title: "Hash Table",
    description: "A data structure that implements an associative array abstract data type, mapping keys to values using a hash function.",
    sampleInputs: ["put key1 value1", "get key1", "remove key1", "resize", "clear"],
    complexities: {
      "Insert": "O(1)",
      "Search": "O(1)",
      "Delete": "O(1)",
      "Worst Case": "O(n)"
    }
  },
  graph: {
    key: "graph",
    title: "Graph",
    description: "A collection of nodes (vertices) connected by edges, representing relationships between objects.",
    sampleInputs: ["add vertex A", "add edge A to B", "remove vertex A", "traverse BFS", "shortest path A to C"],
    complexities: {
      "Add Vertex": "O(1)",
      "Add Edge": "O(1)",
      "Remove Vertex": "O(V + E)",
      "Traversal": "O(V + E)"
    }
  }
}

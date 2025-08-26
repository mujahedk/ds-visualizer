# Frame Schemas

This document defines the JSON schema for each algorithm's `Frame.state` property. These schemas establish the contract that algorithm engines must follow when emitting frames.

## Overview

Each frame contains:
- **`state`**: The data structure's current state (defined below)
- **`meta`**: Metadata including `step` (number) and `label` (string)

## 1. Heap

**Purpose**: Binary heap data structure for priority queues

### Schema
```typescript
{
  array: number[],                    // Required: Array representation of heap
  highlight?: number[]                // Optional: Indices to highlight
}
```

### Required Fields
- `array`: Array of numbers representing the heap in level-order traversal

### Optional Fields
- `highlight`: Array of indices to highlight (e.g., nodes being compared/swapped)

### Example Frame
```json
{
  "state": {
    "array": [15, 10, 5, 3, 7, 2, 1],
    "highlight": [1, 2]
  },
  "meta": {
    "step": 3,
    "label": "siftUp swap(i=1,j=2)"
  }
}
```

### Sample Meta Labels
- `"Initial heap state"`
- `"Inserting element 20"`
- `"siftUp swap(i=3,j=1)"`
- `"Heap property restored"`
- `"Extracting maximum element"`
- `"siftDown swap(i=0,j=1)"`
- `"Heapify complete"`
- `"Final heap state"`

---

## 2. Binary Search Tree (BST)

**Purpose**: Ordered tree structure for efficient searching

### Schema
```typescript
{
  nodes: {                            // Required: Array of tree nodes
    id: string;                       // Unique node identifier
    key: number;                      // Node value
    left?: string;                    // Left child ID (optional)
    right?: string;                   // Right child ID (optional)
  }[],
  root?: string,                      // Optional: Root node ID
  highlight?: string[]                // Optional: Node IDs to highlight
}
```

### Required Fields
- `nodes`: Array of tree nodes with their connections

### Optional Fields
- `root`: ID of the root node
- `highlight`: Array of node IDs to highlight

### Example Frame
```json
{
  "state": {
    "nodes": [
      { "id": "n1", "key": 50, "left": "n2", "right": "n3" },
      { "id": "n2", "key": 30, "left": null, "right": null },
      { "id": "n3", "key": 70, "left": null, "right": null }
    ],
    "root": "n1",
    "highlight": ["n2"]
  },
  "meta": {
    "step": 2,
    "label": "Searching for key 30"
  }
}
```

### Sample Meta Labels
- `"Initial tree state"`
- `"Inserting key 25"`
- `"Searching for key 30"`
- `"Key found at node n2"`
- `"Deleting node n3"`
- `"Rebalancing after deletion"`
- `"Inorder traversal"`
- `"Tree validation complete"`

---

## 3. AVL Tree

**Purpose**: Self-balancing binary search tree

### Schema
```typescript
{
  nodes: {                            // Required: Array of tree nodes
    id: string;                       // Unique node identifier
    key: number;                      // Node value
    left?: string;                    // Left child ID (optional)
    right?: string;                   // Right child ID (optional)
    height?: number;                  // Optional: Node height
  }[],
  root?: string,                      // Optional: Root node ID
  highlight?: string[]                // Optional: Node IDs to highlight
}
```

**Note**: Rotation information appears in `meta.label` as "LL", "LR", "RL", or "RR"

### Required Fields
- `nodes`: Array of tree nodes with their connections

### Optional Fields
- `root`: ID of the root node
- `highlight`: Array of node IDs to highlight
- `height`: Height of each node (for balance calculations)

### Example Frame
```json
{
  "state": {
    "nodes": [
      { "id": "n1", "key": 30, "left": "n2", "right": "n3", "height": 2 },
      { "id": "n2", "key": 20, "left": null, "right": null, "height": 1 },
      { "id": "n3", "key": 40, "left": null, "right": null, "height": 1 }
    ],
    "root": "n1",
    "highlight": ["n1", "n2"]
  },
  "meta": {
    "step": 4,
    "label": "LL rotation at node n1"
  }
}
```

### Sample Meta Labels
- `"Initial AVL tree"`
- `"Inserting key 15"`
- `"Height imbalance detected"`
- `"LL rotation at node n1"`
- `"LR rotation at node n2"`
- `"RL rotation at node n3"`
- `"RR rotation at node n1"`
- `"Tree rebalanced"`

---

## 4. Linked List

**Purpose**: Linear data structure with dynamic memory allocation

### Schema
```typescript
{
  nodes: {                            // Required: Array of list nodes
    id: string;                       // Unique node identifier
    value: number | string;           // Node value
    next?: string;                    // Next node ID (optional)
    prev?: string;                    // Previous node ID (optional, for doubly-linked)
  }[],
  head?: string,                      // Optional: Head node ID
  tail?: string,                      // Optional: Tail node ID
  highlight?: string[]                // Optional: Node IDs to highlight
}
```

### Required Fields
- `nodes`: Array of list nodes with their connections

### Optional Fields
- `head`: ID of the first node
- `tail`: ID of the last node
- `highlight`: Array of node IDs to highlight

### Example Frame
```json
{
  "state": {
    "nodes": [
      { "id": "n1", "value": 10, "next": "n2", "prev": null },
      { "id": "n2", "value": 20, "next": "n3", "prev": "n1" },
      { "id": "n3", "value": 30, "next": null, "prev": "n2" }
    ],
    "head": "n1",
    "tail": "n3",
    "highlight": ["n2"]
  },
  "meta": {
    "step": 3,
    "label": "Inserting 25 after node n2"
  }
}
```

### Sample Meta Labels
- `"Initial linked list"`
- `"Inserting 25 after node n2"`
- `"Deleting node n2"`
- `"Reversing the list"`
- `"Searching for value 20"`
- `"Appending to end"`
- `"Prepending to start"`
- `"List traversal complete"`

---

## 5. Array

**Purpose**: Contiguous memory storage for elements

### Schema
```typescript
{
  values: (number | string)[],        // Required: Array elements
  highlight?: number[]                // Optional: Indices to highlight
}
```

### Required Fields
- `values`: Array of elements (numbers or strings)

### Optional Fields
- `highlight`: Array of indices to highlight

### Example Frame
```json
{
  "state": {
    "values": [64, 34, 25, 12, 22, 11, 90],
    "highlight": [1, 2]
  },
  "meta": {
    "step": 2,
    "label": "Comparing elements at indices 1 and 2"
  }
}
```

### Sample Meta Labels
- `"Initial array state"`
- `"Comparing elements at indices 1 and 2"`
- `"Swapping elements at indices 0 and 1"`
- `"Partitioning around pivot"`
- `"Merging sorted subarrays"`
- `"Array sorted"`
- `"Binary search for value 25"`
- `"Array reversal complete"`

---

## 6. Stack

**Purpose**: LIFO (Last In, First Out) data structure

### Schema
```typescript
{
  items: any[],                      // Required: Stack elements
  highlightIndex?: number            // Optional: Index to highlight
}
```

**Note**: Top of stack is at `items[items.length - 1]`

### Required Fields
- `items`: Array of stack elements

### Optional Fields
- `highlightIndex`: Index of element to highlight

### Example Frame
```json
{
  "state": {
    "items": ["push", "pop", "peek", "isEmpty"],
    "highlightIndex": 2
  },
  "meta": {
    "step": 3,
    "label": "Peeking at top element"
  }
}
```

### Sample Meta Labels
- `"Initial empty stack"`
- `"Pushing element 'push'"`
- `"Pushing element 'pop'"`
- `"Peeking at top element"`
- `"Popping element 'pop'"`
- `"Stack is empty"`
- `"Stack overflow check"`
- `"Final stack state"`

---

## 7. Queue

**Purpose**: FIFO (First In, First Out) data structure

### Schema
```typescript
{
  items: any[],                      // Required: Queue elements
  highlightIndex?: number            // Optional: Index to highlight
}
```

**Note**: Front of queue is at `items[0]`, rear at `items[items.length - 1]`

### Required Fields
- `items`: Array of queue elements

### Optional Fields
- `highlightIndex`: Index of element to highlight

### Example Frame
```json
{
  "state": {
    "items": ["task1", "task2", "task3", "task4"],
    "highlightIndex": 0
  },
  "meta": {
    "step": 2,
    "label": "Processing front element 'task1'"
  }
}
```

### Sample Meta Labels
- `"Initial empty queue"`
- `"Enqueuing 'task1'"`
- `"Enqueuing 'task2'"`
- `"Processing front element 'task1'"`
- `"Dequeuing 'task1'"`
- `"Queue is empty"`
- `"Queue overflow check"`
- `"Final queue state"`

---

## 8. Hash Table

**Purpose**: Key-value storage with O(1) average access

### Schema
```typescript
{
  buckets: {                          // Required: Array of hash buckets
    index: number;                    // Bucket index
    entries: {                        // Array of entries in this bucket
      key: string;                    // Entry key
      value: any;                     // Entry value
      id: string;                     // Unique entry identifier
    }[];
  }[],
  highlight?: {                       // Optional: Highlighting information
    bucket?: number;                  // Bucket index to highlight
    entryId?: string;                 // Entry ID to highlight
  }
}
```

### Required Fields
- `buckets`: Array of hash buckets with their entries

### Optional Fields
- `highlight`: Object specifying what to highlight

### Example Frame
```json
{
  "state": {
    "buckets": [
      {
        "index": 0,
        "entries": [
          { "key": "name", "value": "John", "id": "e1" },
          { "key": "age", "value": 30, "id": "e2" }
        ]
      },
      {
        "index": 1,
        "entries": [
          { "key": "city", "value": "NYC", "id": "e3" }
        ]
      }
    ],
    "highlight": { "bucket": 0, "entryId": "e1" }
  },
  "meta": {
    "step": 4,
    "label": "Retrieving value for key 'name'"
  }
}
```

### Sample Meta Labels
- `"Initial empty hash table"`
- `"Inserting key 'name' with value 'John'"`
- `"Hash collision at bucket 0"`
- `"Retrieving value for key 'name'"`
- `"Deleting key 'age'"`
- `"Rehashing table"`
- `"Load factor check"`
- `"Hash table operations complete"`

---

## 9. Graph

**Purpose**: Network of interconnected nodes and edges

### Schema
```typescript
{
  nodes: {                            // Required: Array of graph nodes
    id: string;                       // Unique node identifier
    label?: string;                   // Optional: Node label
    x?: number;                       // Optional: X coordinate
    y?: number;                       // Optional: Y coordinate
    visited?: boolean;                // Optional: Visit status
    dist?: number;                    // Optional: Distance from source
  }[],
  edges: {                            // Required: Array of graph edges
    id: string;                       // Unique edge identifier
    u: string;                        // Source node ID
    v: string;                        // Target node ID
    w?: number;                       // Optional: Edge weight
    directed?: boolean;               // Optional: Directed edge flag
    relaxed?: boolean;                // Optional: Relaxation status
  }[],
  current?: string                    // Optional: Current node ID
}
```

### Required Fields
- `nodes`: Array of graph nodes
- `edges`: Array of graph edges

### Optional Fields
- `current`: ID of current node being processed
- Various node and edge properties for algorithms

### Example Frame
```json
{
  "state": {
    "nodes": [
      { "id": "A", "label": "Start", "x": 100, "y": 100, "visited": true, "dist": 0 },
      { "id": "B", "label": "Node B", "x": 200, "y": 150, "visited": false, "dist": 5 },
      { "id": "C", "label": "Node C", "x": 150, "y": 200, "visited": false, "dist": 3 }
    ],
    "edges": [
      { "id": "e1", "u": "A", "v": "B", "w": 5, "directed": true, "relaxed": false },
      { "id": "e2", "u": "A", "v": "C", "w": 3, "directed": true, "relaxed": true },
      { "id": "e3", "u": "B", "v": "C", "w": 2, "directed": true, "relaxed": false }
    ],
    "current": "B"
  },
  "meta": {
    "step": 5,
    "label": "Relaxing edge A->B"
  }
}
```

### Sample Meta Labels
- `"Initial graph state"`
- `"Starting BFS from node A"`
- `"Visiting node B"`
- `"Relaxing edge A->B"`
- `"Shortest path found to C"`
- `"Cycle detection in progress"`
- `"Topological sort complete"`
- `"Graph traversal finished"`

---

## Implementation Notes

### Highlighting Strategy
- **Indices**: Use for array-based structures (Heap, Array, Stack, Queue)
- **IDs**: Use for node-based structures (BST, AVL, Linked List, Graph)
- **Objects**: Use for complex highlighting (Hash Table)

### Coordinate Systems
- **Graph nodes**: Use `x`, `y` coordinates for positioning
- **Tree nodes**: Calculate positions based on tree structure
- **Linear structures**: Use sequential positioning

### State Transitions
- Each frame should represent a meaningful step in the algorithm
- Highlight fields should indicate what's changing or being examined
- Meta labels should clearly describe the current operation

### Performance Considerations
- Keep frame sizes reasonable (avoid excessive data)
- Use efficient data structures for large datasets
- Consider lazy loading for complex visualizations

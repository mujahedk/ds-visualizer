import { Frame } from '../types'
import { HeapState, HeapCommand } from './types'

/**
 * Pure MinHeap implementation that emits frames at each meaningful step
 * No DOM/React dependencies - just logic and JSON frame generation
 */
class MinHeap {
  private array: number[] = []

  constructor(initialValues: number[] = []) {
    this.array = [...initialValues]
    if (this.array.length > 0) {
      this.heapify()
    }
  }

  /**
   * Get the current heap array (immutable copy)
   */
  getArray(): number[] {
    return [...this.array]
  }

  /**
   * Get the size of the heap
   */
  getSize(): number {
    return this.array.length
  }

  /**
   * Check if heap is empty
   */
  isEmpty(): boolean {
    return this.array.length === 0
  }

  /**
   * Get the minimum element (root)
   */
  peek(): number | null {
    return this.array.length > 0 ? this.array[0] : null
  }

  /**
   * Insert a new value into the heap
   */
  insert(value: number): void {
    this.array.push(value)
    this.siftUp(this.array.length - 1)
  }

  /**
   * Remove and return the minimum element
   */
  pop(): number | null {
    if (this.array.length === 0) return null

    const min = this.array[0]
    const last = this.array.pop()!

    if (this.array.length > 0) {
      this.array[0] = last
      this.siftDown(0)
    }

    return min
  }

  /**
   * Build heap from array in O(n) time
   */
  private heapify(): void {
    for (let i = Math.floor(this.array.length / 2) - 1; i >= 0; i--) {
      this.siftDown(i)
    }
  }

  /**
   * Sift up operation to restore heap property after insertion
   */
  private siftUp(index: number): void {
    let current = index
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2)
      if (this.array[current] >= this.array[parent]) {
        break
      }
      
      // Swap current with parent
      [this.array[current], this.array[parent]] = [this.array[parent], this.array[current]]
      current = parent
    }
  }

  /**
   * Sift down operation to restore heap property after removal
   */
  private siftDown(index: number): void {
    let current = index
    while (true) {
      let smallest = current
      const left = 2 * current + 1
      const right = 2 * current + 2

      if (left < this.array.length && this.array[left] < this.array[smallest]) {
        smallest = left
      }

      if (right < this.array.length && this.array[right] < this.array[smallest]) {
        smallest = right
      }

      if (smallest === current) {
        break
      }

      // Swap current with smallest child
      [this.array[current], this.array[smallest]] = [this.array[smallest], this.array[current]]
      current = smallest
    }
  }

  /**
   * Reset heap to initial state
   */
  reset(initialValues: number[] = []): void {
    this.array = [...initialValues]
    if (this.array.length > 0) {
      this.heapify()
    }
  }

  /**
   * Validate heap property (for testing)
   */
  isValidHeap(): boolean {
    for (let i = 0; i < this.array.length; i++) {
      const left = 2 * i + 1
      const right = 2 * i + 2

      if (left < this.array.length && this.array[i] > this.array[left]) {
        return false
      }

      if (right < this.array.length && this.array[i] > this.array[right]) {
        return false
      }
    }
    return true
  }
}

/**
 * Deep clone a heap state for immutability
 */
function cloneHeapState(state: HeapState): HeapState {
  return {
    array: [...state.array],
    highlight: state.highlight ? [...state.highlight] : undefined,
    swap: state.swap ? [...state.swap] : undefined
  }
}

/**
 * Run heap commands and return frames for each meaningful step
 */
export function runHeapCommands(commands: HeapCommand[]): Frame<HeapState>[] {
  const frames: Frame<HeapState>[] = []
  const heap = new MinHeap()
  let step = 1

  // Initial state
  frames.push({
    state: cloneHeapState({
      array: heap.getArray(),
      highlight: [],
      swap: null
    }),
    meta: {
      step: step++,
      label: "Initial empty heap"
    }
  })

  for (const command of commands) {
    switch (command.type) {
      case "insert": {
        const value = command.value
        
        // Before insert
        frames.push({
          state: cloneHeapState({
            array: heap.getArray(),
            highlight: [heap.getSize()],
            swap: null
          }),
          meta: {
            step: step++,
            label: `Inserting element ${value}`
          }
        })

        // Insert and sift up
        heap.insert(value)
        
        // After insert (heap property restored)
        frames.push({
          state: cloneHeapState({
            array: heap.getArray(),
            highlight: [],
            swap: null
          }),
          meta: {
            step: step++,
            label: "Heap property restored"
          }
        })
        break
      }

      case "pop": {
        if (heap.isEmpty()) {
          frames.push({
            state: cloneHeapState({
              array: heap.getArray(),
              highlight: [],
              swap: null
            }),
            meta: {
              step: step++,
              label: "Cannot pop from empty heap"
            }
          })
          break
        }

        // Before pop - highlight root
        frames.push({
          state: cloneHeapState({
            array: heap.getArray(),
            highlight: [0],
            swap: null
          }),
          meta: {
            step: step++,
            label: "Extracting minimum element"
          }
        })

        // Store the minimum value
        const min = heap.peek()!
        
        // Perform the pop operation
        heap.pop()

        // After pop - show final state
        frames.push({
          state: cloneHeapState({
            array: heap.getArray(),
            highlight: [],
            swap: null
          }),
          meta: {
            step: step++,
            label: `Extracted ${min}, heap property restored`
          }
        })
        break
      }

      case "reset": {
        heap.reset()
        frames.push({
          state: cloneHeapState({
            array: heap.getArray(),
            highlight: [],
            swap: null
          }),
          meta: {
            step: step++,
            label: "Heap reset to empty state"
          }
        })
        break
      }
    }
  }

  return frames
}

/**
 * Create a MinHeap instance (for testing or direct use)
 */
export function createMinHeap(initialValues: number[] = []): MinHeap {
  return new MinHeap(initialValues)
}

import { describe, it, expect } from 'vitest'
import { runHeapCommands, createMinHeap } from '../src/algorithms/heap/engine'
import { parseHeapInput, isValidHeapInput } from '../src/algorithms/heap/parser'
import { HeapCommand } from '../src/algorithms/heap/types'

describe('Heap Engine', () => {
  describe('MinHeap Class', () => {
    it('should create an empty heap', () => {
      const heap = createMinHeap()
      expect(heap.getArray()).toEqual([])
      expect(heap.getSize()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should create a heap from initial values', () => {
      const heap = createMinHeap([5, 3, 7, 1, 9])
      expect(heap.getArray()).toEqual([1, 3, 7, 5, 9])
      expect(heap.isValidHeap()).toBe(true)
    })

    it('should insert values and maintain heap property', () => {
      const heap = createMinHeap()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      
      expect(heap.getArray()).toEqual([3, 5, 7])
      expect(heap.isValidHeap()).toBe(true)
    })

    it('should pop minimum value and maintain heap property', () => {
      const heap = createMinHeap([1, 3, 7, 5, 9])
      
      expect(heap.pop()).toBe(1)
      expect(heap.getArray()).toEqual([3, 5, 7, 9])
      expect(heap.isValidHeap()).toBe(true)
      
      expect(heap.pop()).toBe(3)
      expect(heap.getArray()).toEqual([5, 9, 7])
      expect(heap.isValidHeap()).toBe(true)
    })

    it('should handle empty heap operations', () => {
      const heap = createMinHeap()
      expect(heap.pop()).toBe(null)
      expect(heap.peek()).toBe(null)
    })

    it('should reset heap to empty state', () => {
      const heap = createMinHeap([1, 2, 3])
      heap.reset()
      expect(heap.getArray()).toEqual([])
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('runHeapCommands', () => {
    it('should return initial frame for empty command list', () => {
      const frames = runHeapCommands([])
      expect(frames).toHaveLength(1)
      expect(frames[0].meta.label).toBe('Initial empty heap')
      expect(frames[0].state.array).toEqual([])
    })

    it('should generate frames for insert operations', () => {
      const commands: HeapCommand[] = [
        { type: 'insert', value: 5 },
        { type: 'insert', value: 3 }
      ]
      
      const frames = runHeapCommands(commands)
      
      // Should have: initial + (before insert + after insert) * 2
      expect(frames).toHaveLength(5)
      
      // Check initial state
      expect(frames[0].meta.label).toBe('Initial empty heap')
      expect(frames[0].state.array).toEqual([])
      
      // Check first insert
      expect(frames[1].meta.label).toBe('Inserting element 5')
      expect(frames[2].meta.label).toBe('Heap property restored')
      expect(frames[2].state.array).toEqual([5])
      
      // Check second insert
      expect(frames[3].meta.label).toBe('Inserting element 3')
      expect(frames[4].meta.label).toBe('Heap property restored')
      expect(frames[4].state.array).toEqual([3, 5])
    })

    it('should generate frames for pop operations', () => {
      const commands: HeapCommand[] = [
        { type: 'insert', value: 5 },
        { type: 'insert', value: 3 },
        { type: 'pop' }
      ]
      
      const frames = runHeapCommands(commands)
      
      // Should have: initial + (before insert + after insert) * 2 + (before pop + after pop)
      expect(frames).toHaveLength(7)
      
      // Check pop operation
      expect(frames[5].meta.label).toBe('Extracting minimum element')
      expect(frames[6].meta.label).toBe('Extracted 3, heap property restored')
      expect(frames[6].state.array).toEqual([5])
    })

    it('should handle pop from empty heap', () => {
      const commands: HeapCommand[] = [{ type: 'pop' }]
      const frames = runHeapCommands(commands)
      
      expect(frames).toHaveLength(2)
      expect(frames[1].meta.label).toBe('Cannot pop from empty heap')
    })

    it('should handle reset command', () => {
      const commands: HeapCommand[] = [
        { type: 'insert', value: 5 },
        { type: 'reset' }
      ]
      
      const frames = runHeapCommands(commands)
      
      expect(frames).toHaveLength(4)
      expect(frames[3].meta.label).toBe('Heap reset to empty state')
      expect(frames[3].state.array).toEqual([])
    })

    it('should generate 5-30 frames for complex operations', () => {
      const commands: HeapCommand[] = [
        { type: 'insert', value: 10 },
        { type: 'insert', value: 5 },
        { type: 'insert', value: 15 },
        { type: 'insert', value: 3 },
        { type: 'insert', value: 7 },
        { type: 'pop' },
        { type: 'pop' }
      ]
      
      const frames = runHeapCommands(commands)
      
      // Should have reasonable number of frames
      expect(frames.length).toBeGreaterThanOrEqual(5)
      expect(frames.length).toBeLessThanOrEqual(30)
      
      // Last frame should be a valid heap
      const lastFrame = frames[frames.length - 1]
      expect(lastFrame.state.array.length).toBeGreaterThan(0)
      
      // Verify heap property in last frame
      const array = lastFrame.state.array
      for (let i = 0; i < array.length; i++) {
        const left = 2 * i + 1
        const right = 2 * i + 2
        
        if (left < array.length) {
          expect(array[i]).toBeLessThanOrEqual(array[left])
        }
        if (right < array.length) {
          expect(array[i]).toBeLessThanOrEqual(array[right])
        }
      }
    })

    it('should increment step numbers correctly', () => {
      const commands: HeapCommand[] = [
        { type: 'insert', value: 5 },
        { type: 'insert', value: 3 }
      ]
      
      const frames = runHeapCommands(commands)
      
      for (let i = 0; i < frames.length; i++) {
        expect(frames[i].meta.step).toBe(i + 1)
      }
    })

    it('should maintain immutability between frames', () => {
      const commands: HeapCommand[] = [
        { type: 'insert', value: 5 },
        { type: 'insert', value: 3 }
      ]
      
      const frames = runHeapCommands(commands)
      
      // Each frame should have a different array reference
      for (let i = 1; i < frames.length; i++) {
        expect(frames[i].state.array).not.toBe(frames[i - 1].state.array)
      }
    })
  })

  describe('Heap Parser', () => {
    it('should parse insert commands with comma separation', () => {
      const input = 'insert 5,1,9'
      const commands = parseHeapInput(input)
      
      expect(commands).toEqual([
        { type: 'insert', value: 5 },
        { type: 'insert', value: 1 },
        { type: 'insert', value: 9 }
      ])
    })

    it('should parse insert commands with space separation', () => {
      const input = 'insert 5 1 9'
      const commands = parseHeapInput(input)
      
      expect(commands).toEqual([
        { type: 'insert', value: 5 },
        { type: 'insert', value: 1 },
        { type: 'insert', value: 9 }
      ])
    })

    it('should parse pop commands with repeat count', () => {
      const input = 'pop 2'
      const commands = parseHeapInput(input)
      
      expect(commands).toEqual([
        { type: 'pop' },
        { type: 'pop' }
      ])
    })

    it('should parse single pop command', () => {
      const input = 'pop'
      const commands = parseHeapInput(input)
      
      expect(commands).toEqual([{ type: 'pop' }])
    })

    it('should parse reset command', () => {
      const input = 'reset'
      const commands = parseHeapInput(input)
      
      expect(commands).toEqual([{ type: 'reset' }])
    })

    it('should parse multiple commands separated by semicolons', () => {
      const input = 'insert 5,1,9; pop 2; reset'
      const commands = parseHeapInput(input)
      
      expect(commands).toEqual([
        { type: 'insert', value: 5 },
        { type: 'insert', value: 1 },
        { type: 'insert', value: 9 },
        { type: 'pop' },
        { type: 'pop' },
        { type: 'reset' }
      ])
    })

    it('should handle whitespace and mixed separators', () => {
      const input = '  insert  5, 1 , 9  ;  pop  2  ;  reset  '
      const commands = parseHeapInput(input)
      
      expect(commands).toEqual([
        { type: 'insert', value: 5 },
        { type: 'insert', value: 1 },
        { type: 'insert', value: 9 },
        { type: 'pop' },
        { type: 'pop' },
        { type: 'reset' }
      ])
    })

    it('should ignore invalid commands gracefully', () => {
      const input = 'insert 5, invalid, 9; unknown; pop 2'
      const commands = parseHeapInput(input)
      
      expect(commands).toEqual([
        { type: 'insert', value: 5 },
        { type: 'insert', value: 9 },
        { type: 'pop' },
        { type: 'pop' }
      ])
    })

    it('should handle empty input', () => {
      const input = ''
      const commands = parseHeapInput(input)
      
      expect(commands).toEqual([])
    })

    it('should validate input correctly', () => {
      expect(isValidHeapInput('insert 5,1,9')).toBe(true)
      expect(isValidHeapInput('pop 2')).toBe(true)
      expect(isValidHeapInput('reset')).toBe(true)
      expect(isValidHeapInput('')).toBe(false)
      expect(isValidHeapInput('invalid')).toBe(false)
    })
  })

  describe('Integration Tests', () => {
    it('should parse input and run commands to produce valid heap', () => {
      const input = 'insert 5,1,9; pop 2'
      const commands = parseHeapInput(input)
      const frames = runHeapCommands(commands)
      
      // Should have reasonable number of frames
      expect(frames.length).toBeGreaterThanOrEqual(5)
      expect(frames.length).toBeLessThanOrEqual(30)
      
      // Last frame should be a valid heap
      const lastFrame = frames[frames.length - 1]
      expect(lastFrame.state.array.length).toBeGreaterThan(0)
      
      // Verify heap property
      const array = lastFrame.state.array
      for (let i = 0; i < array.length; i++) {
        const left = 2 * i + 1
        const right = 2 * i + 1
        
        if (left < array.length) {
          expect(array[i]).toBeLessThanOrEqual(array[left])
        }
        if (right < array.length) {
          expect(array[i]).toBeLessThanOrEqual(array[right])
        }
      }
    })

    it('should handle complex command sequences', () => {
      const input = 'insert 10,5,15,3,7; pop 3; insert 2,8; pop 1'
      const commands = parseHeapInput(input)
      const frames = runHeapCommands(commands)
      
      // Should generate frames for all operations
      expect(frames.length).toBeGreaterThan(10)
      
      // Last frame should be valid
      const lastFrame = frames[frames.length - 1]
      expect(lastFrame.state.array.length).toBeGreaterThan(0)
    })
  })
})

import { describe, it, expect } from 'vitest'
import { runHeapCommands, createMinHeap } from '../src/algorithms/heap/engine'
import { parseHeapInput, isValidHeapInput } from '../src/algorithms/heap/parser'
import { HeapCommand } from '../src/algorithms/heap/types'

describe('Heap Engine', () => {
  describe('MinHeap Class', () => {
    it('should create an empty heap', () => {
      const heap = createMinHeap()
      expect(heap.getSize()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeNull()
    })

    it('should create a heap from initial values', () => {
      const heap = createMinHeap([10, 5, 15, 3, 7])
      expect(heap.getSize()).toBe(5)
      expect(heap.peek()).toBe(3) // Min value should be at root
      expect(heap.isValidHeap()).toBe(true)
    })

    it('should insert values and maintain heap property', () => {
      const heap = createMinHeap()
      heap.insert(10)
      heap.insert(5)
      heap.insert(15)
      
      expect(heap.getSize()).toBe(3)
      expect(heap.peek()).toBe(5)
      expect(heap.isValidHeap()).toBe(true)
    })

    it('should pop minimum value and maintain heap property', () => {
      const heap = createMinHeap([10, 5, 15, 3, 7])
      const min = heap.pop()
      
      expect(min).toBe(3)
      expect(heap.getSize()).toBe(4)
      expect(heap.peek()).toBe(5)
      expect(heap.isValidHeap()).toBe(true)
    })

    it('should handle empty heap operations', () => {
      const heap = createMinHeap()
      expect(heap.pop()).toBeNull()
      expect(heap.peek()).toBeNull()
    })

    it('should reset heap to empty state', () => {
      const heap = createMinHeap([10, 5, 15])
      heap.reset()
      expect(heap.getSize()).toBe(0)
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
      const commands: HeapCommand[] = [{ type: 'insert', value: 5 }]
      const frames = runHeapCommands(commands)
      
      expect(frames).toHaveLength(3) // initial + before insert + after insert
      expect(frames[frames.length - 1].state.array).toEqual([5])
      expect(frames[frames.length - 1].meta.label).toBe('Heap property restored')
    })

    it('should generate frames for pop operations', () => {
      const commands: HeapCommand[] = [
        { type: 'insert', value: 5 },
        { type: 'insert', value: 3 },
        { type: 'pop' }
      ]
      const frames = runHeapCommands(commands)
      
      expect(frames.length).toBeGreaterThan(5)
      const finalFrame = frames[frames.length - 1]
      expect(finalFrame.state.array).toEqual([5])
      expect(finalFrame.meta.label).toContain('Extracted 3')
    })

    it('should handle pop from empty heap', () => {
      const commands: HeapCommand[] = [{ type: 'pop' }]
      const frames = runHeapCommands(commands)
      
      expect(frames).toHaveLength(2) // initial + cannot pop
      expect(frames[1].meta.label).toBe('Cannot pop from empty heap')
    })

    it('should handle reset command', () => {
      const commands: HeapCommand[] = [
        { type: 'insert', value: 5 },
        { type: 'reset' }
      ]
      const frames = runHeapCommands(commands)
      
      const finalFrame = frames[frames.length - 1]
      expect(finalFrame.state.array).toEqual([])
      expect(finalFrame.meta.label).toBe('Heap reset to empty state')
    })

    it('should generate 5-30 frames for complex operations', () => {
      const commands: HeapCommand[] = [
        { type: 'insert', value: 10 },
        { type: 'insert', value: 5 },
        { type: 'insert', value: 15 },
        { type: 'pop' },
        { type: 'insert', value: 8 }
      ]
      const frames = runHeapCommands(commands)
      
      expect(frames.length).toBeGreaterThanOrEqual(5)
      expect(frames.length).toBeLessThanOrEqual(30)
    })

    it('should increment step numbers correctly', () => {
      const commands: HeapCommand[] = [
        { type: 'insert', value: 5 },
        { type: 'pop' }
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

    // New test: Parse "insert 5,1,9; pop 2" returns expected commands
    it('should parse "insert 5,1,9; pop 2" correctly', () => {
      const input = 'insert 5,1,9; pop 2'
      const commands = parseHeapInput(input)
      
      expect(commands).toHaveLength(5) // 3 inserts + 2 pops
      expect(commands.filter(cmd => cmd.type === 'insert')).toHaveLength(3)
      expect(commands.filter(cmd => cmd.type === 'pop')).toHaveLength(2)
      
      const insertValues = commands.filter(cmd => cmd.type === 'insert').map(cmd => (cmd as any).value)
      expect(insertValues).toEqual([5, 1, 9])
    })

    // New test: Frames end with array length reduced by 2 and heap property maintained
    it('should end with correct array length and maintain heap property after pop operations', () => {
      const input = 'insert 5,1,9; pop 2'
      const commands = parseHeapInput(input)
      const frames = runHeapCommands(commands)
      
      const finalFrame = frames[frames.length - 1]
      const finalArray = finalFrame.state.array
      
      // Should have 1 element left (3 inserts - 2 pops = 1)
      expect(finalArray).toHaveLength(1)
      
      // Should maintain heap property
      expect(isValidHeapProperty(finalArray)).toBe(true)
    })
  })

  describe('Heap Parser', () => {
    it('should parse insert commands with comma separation', () => {
      const input = 'insert 5,1,9'
      const commands = parseHeapInput(input)
      
      expect(commands).toHaveLength(3)
      expect(commands[0]).toEqual({ type: 'insert', value: 5 })
      expect(commands[1]).toEqual({ type: 'insert', value: 1 })
      expect(commands[2]).toEqual({ type: 'insert', value: 9 })
    })

    it('should parse insert commands with space separation', () => {
      const input = 'insert 5 1 9'
      const commands = parseHeapInput(input)
      
      expect(commands).toHaveLength(3)
      expect(commands[0]).toEqual({ type: 'insert', value: 5 })
      expect(commands[1]).toEqual({ type: 'insert', value: 1 })
      expect(commands[2]).toEqual({ type: 'insert', value: 9 })
    })

    it('should parse pop commands with repeat count', () => {
      const input = 'pop 2'
      const commands = parseHeapInput(input)
      
      expect(commands).toHaveLength(2)
      expect(commands[0]).toEqual({ type: 'pop' })
      expect(commands[1]).toEqual({ type: 'pop' })
    })

    it('should parse single pop command', () => {
      const input = 'pop'
      const commands = parseHeapInput(input)
      
      expect(commands).toHaveLength(1)
      expect(commands[0]).toEqual({ type: 'pop' })
    })

    it('should parse reset command', () => {
      const input = 'reset'
      const commands = parseHeapInput(input)
      
      expect(commands).toHaveLength(1)
      expect(commands[0]).toEqual({ type: 'reset' })
    })

    it('should parse multiple commands separated by semicolons', () => {
      const input = 'insert 5; pop; insert 10'
      const commands = parseHeapInput(input)
      
      expect(commands).toHaveLength(3)
      expect(commands[0]).toEqual({ type: 'insert', value: 5 })
      expect(commands[1]).toEqual({ type: 'pop' })
      expect(commands[2]).toEqual({ type: 'insert', value: 10 })
    })

    it('should handle whitespace and mixed separators', () => {
      const input = 'insert 5, 1 ,9; pop 2'
      const commands = parseHeapInput(input)
      
      expect(commands).toHaveLength(5)
      expect(commands.filter(cmd => cmd.type === 'insert')).toHaveLength(3)
      expect(commands.filter(cmd => cmd.type === 'pop')).toHaveLength(2)
    })

    it('should ignore invalid commands gracefully', () => {
      const input = 'insert 5; invalid; pop; nonsense'
      const commands = parseHeapInput(input)
      
      expect(commands).toHaveLength(2)
      expect(commands[0]).toEqual({ type: 'insert', value: 5 })
      expect(commands[1]).toEqual({ type: 'pop' })
    })

    it('should handle empty input', () => {
      const input = ''
      const commands = parseHeapInput(input)
      
      expect(commands).toHaveLength(0)
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
      const input = 'insert 5,1,9; pop 1'
      const commands = parseHeapInput(input)
      const frames = runHeapCommands(commands)
      
      const finalFrame = frames[frames.length - 1]
      expect(finalFrame.state.array).toHaveLength(2) // 3 inserts - 1 pop = 2
      expect(isValidHeapProperty(finalFrame.state.array)).toBe(true)
    })

    it('should handle complex command sequences', () => {
      const input = 'insert 10,5,15,2,8; pop 2; insert 12'
      const commands = parseHeapInput(input)
      const frames = runHeapCommands(commands)
      
      const finalFrame = frames[frames.length - 1]
      expect(finalFrame.state.array).toHaveLength(4) // 5 inserts - 2 pops + 1 insert = 4
      expect(isValidHeapProperty(finalFrame.state.array)).toBe(true)
    })
  })
})

// Helper function to check heap property (parent ≤ children)
function isValidHeapProperty(array: number[]): boolean {
  for (let i = 0; i < array.length; i++) {
    const left = 2 * i + 1
    const right = 2 * i + 2
    
    if (left < array.length && array[i] > array[left]) {
      return false
    }
    
    if (right < array.length && array[i] > array[right]) {
      return false
    }
  }
  return true
}

import { describe, it, expect } from 'vitest'
import { runQueueCommands } from '../src/algorithms/queue/engine'

describe('Queue Engine', () => {
  describe('Basic Operations', () => {
    it('handles empty initial queue', () => {
      const frames = runQueueCommands([], [])
      expect(frames).toEqual([])
    })

    it('handles single enqueue operation', () => {
      const frames = runQueueCommands([], [{ type: 'enqueue', value: 'A' }])
      expect(frames).toHaveLength(2)
      
      // Pre-frame: op:"enqueue", highlightIndex = items.length (incoming slot)
      expect(frames[0].state.items).toEqual([])
      expect(frames[0].state.op).toBe('enqueue')
      expect(frames[0].state.highlightIndex).toBe(0)
      expect(frames[0].state.frontIndex).toBe(0)
      expect(frames[0].meta.label).toBe('enqueue A')
      
      // Post-frame: items with v appended, highlightIndex = items.length-1
      expect(frames[1].state.items).toEqual(['A'])
      expect(frames[1].state.op).toBe('enqueue')
      expect(frames[1].state.highlightIndex).toBe(0)
      expect(frames[1].state.frontIndex).toBe(0)
      expect(frames[1].meta.label).toBe('placed A at rear')
    })

    it('handles single dequeue operation', () => {
      const frames = runQueueCommands(['A', 'B'], [{ type: 'dequeue', count: 1 }])
      expect(frames).toHaveLength(3)
      
      // Initial frame
      expect(frames[0].state.items).toEqual(['A', 'B'])
      expect(frames[0].state.op).toBeNull()
      expect(frames[0].state.highlightIndex).toBeNull()
      expect(frames[0].state.frontIndex).toBe(0)
      expect(frames[0].meta.label).toBe('Initial queue: [A, B]')
      
      // Pre-frame: op:"dequeue", highlightIndex=0
      expect(frames[1].state.items).toEqual(['A', 'B'])
      expect(frames[1].state.op).toBe('dequeue')
      expect(frames[1].state.highlightIndex).toBe(0)
      expect(frames[1].state.frontIndex).toBe(0)
      expect(frames[1].meta.label).toBe('dequeue (front=0)')
      
      // Post-frame: remove first element, compact to keep frontIndex=0
      expect(frames[2].state.items).toEqual(['B'])
      expect(frames[2].state.op).toBe('dequeue')
      expect(frames[2].state.highlightIndex).toBeNull()
      expect(frames[2].state.frontIndex).toBe(0)
      expect(frames[2].meta.label).toBe('removed front (A)')
    })

    it('handles reset operation', () => {
      const frames = runQueueCommands(['A', 'B', 'C'], [{ type: 'reset' }])
      expect(frames).toHaveLength(2)
      
      // Initial frame
      expect(frames[0].state.items).toEqual(['A', 'B', 'C'])
      expect(frames[0].state.op).toBeNull()
      expect(frames[0].state.highlightIndex).toBeNull()
      expect(frames[0].state.frontIndex).toBe(0)
      expect(frames[0].meta.label).toBe('Initial queue: [A, B, C]')
      
      // Reset frame
      expect(frames[1].state.items).toEqual([])
      expect(frames[1].state.op).toBeNull()
      expect(frames[1].state.highlightIndex).toBeNull()
      expect(frames[1].state.frontIndex).toBe(0)
      expect(frames[1].meta.label).toBe('reset')
    })

    it('handles dequeue on empty queue', () => {
      const frames = runQueueCommands([], [{ type: 'dequeue', count: 1 }])
      expect(frames).toHaveLength(1)
      expect(frames[0].state.items).toEqual([])
      expect(frames[0].state.op).toBe('dequeue')
      expect(frames[0].state.highlightIndex).toBeNull()
      expect(frames[0].state.frontIndex).toBe(0)
      expect(frames[0].meta.label).toBe('queue empty')
    })
  })

  describe('Complex Sequence - Requirements Example', () => {
    it('handles enqueue A; enqueue B; enqueue C; dequeue 2; enqueue D', () => {
      const commands = [
        { type: 'enqueue' as const, value: 'A' },
        { type: 'enqueue' as const, value: 'B' },
        { type: 'enqueue' as const, value: 'C' },
        { type: 'dequeue' as const, count: 2 },
        { type: 'enqueue' as const, value: 'D' }
      ]
      
      const frames = runQueueCommands([], commands)
      
      // Should have 2 frames per enqueue + 2 frames per dequeue + 2 frames for final enqueue
      // = 2 + 2 + 2 + 2 + 2 + 2 = 12 frames total
      expect(frames).toHaveLength(12)
      
      // Final state should be ["C", "D"]
      const finalFrame = frames[frames.length - 1]
      expect(finalFrame.state.items).toEqual(['C', 'D'])
      expect(finalFrame.state.frontIndex).toBe(0)
    })

    it('verifies FIFO order - removed items are ["A","B"]', () => {
      const commands = [
        { type: 'enqueue' as const, value: 'A' },
        { type: 'enqueue' as const, value: 'B' },
        { type: 'enqueue' as const, value: 'C' },
        { type: 'dequeue' as const, count: 2 }
      ]
      
      const frames = runQueueCommands([], commands)
      
      // Find the dequeue frames and check removed items
      const dequeueFrames = frames.filter(f => f.state.op === 'dequeue' && f.meta.label.includes('removed front'))
      expect(dequeueFrames).toHaveLength(2)
      
      // First dequeue removes A
      expect(dequeueFrames[0].meta.label).toBe('removed front (A)')
      // Second dequeue removes B  
      expect(dequeueFrames[1].meta.label).toBe('removed front (B)')
      
      // Final state should only have C
      const finalFrame = frames[frames.length - 1]
      expect(finalFrame.state.items).toEqual(['C'])
    })
  })

  describe('Length Invariants', () => {
    it('each enqueue increases length by 1', () => {
      const commands = [
        { type: 'enqueue' as const, value: 'A' },
        { type: 'enqueue' as const, value: 'B' },
        { type: 'enqueue' as const, value: 'C' }
      ]
      
      const frames = runQueueCommands([], commands)
      
      // Check that each enqueue operation increases length by 1
      let currentLength = 0
      for (const frame of frames) {
        if (frame.state.op === 'enqueue' && frame.meta.label.includes('placed')) {
          currentLength++
          expect(frame.state.items).toHaveLength(currentLength)
        }
      }
    })

    it('each dequeue decreases length by 1 (when not empty)', () => {
      const commands = [
        { type: 'enqueue' as const, value: 'A' },
        { type: 'enqueue' as const, value: 'B' },
        { type: 'enqueue' as const, value: 'C' },
        { type: 'dequeue' as const, count: 2 }
      ]
      
      const frames = runQueueCommands([], commands)
      
      // Track length changes through dequeue operations
      let currentLength = 3 // After all enqueues
      for (const frame of frames) {
        if (frame.state.op === 'dequeue' && frame.meta.label.includes('removed front')) {
          currentLength--
          expect(frame.state.items).toHaveLength(currentLength)
        }
      }
    })
  })

  describe('Empty Queue Handling', () => {
    it('emits "queue empty" info frame for dequeue on empty', () => {
      const frames = runQueueCommands([], [{ type: 'dequeue', count: 1 }])
      
      expect(frames).toHaveLength(1)
      expect(frames[0].meta.label).toBe('queue empty')
      expect(frames[0].state.items).toEqual([])
    })

    it('handles multiple dequeues on empty queue', () => {
      const frames = runQueueCommands([], [{ type: 'dequeue', count: 3 }])
      
      expect(frames).toHaveLength(3)
      frames.forEach(frame => {
        expect(frame.meta.label).toBe('queue empty')
        expect(frame.state.items).toEqual([])
      })
    })

    it('continues after empty dequeue', () => {
      const commands = [
        { type: 'dequeue' as const, count: 1 },
        { type: 'enqueue' as const, value: 'X' },
        { type: 'dequeue' as const, count: 2 }
      ]
      
      const frames = runQueueCommands([], commands)
      
      // Should have: empty dequeue + enqueue X + dequeue X + empty dequeue
      expect(frames).toHaveLength(6)
      
      // Check the sequence
      expect(frames[0].meta.label).toBe('queue empty')
      expect(frames[1].meta.label).toBe('enqueue X')
      expect(frames[2].meta.label).toBe('placed X at rear')
      expect(frames[3].meta.label).toBe('dequeue (front=0)')
      expect(frames[4].meta.label).toBe('removed front (X)')
      expect(frames[5].meta.label).toBe('queue empty')
    })
  })

  describe('Multiple Dequeues', () => {
    it('handles dequeue with count > 1', () => {
      const commands = [
        { type: 'enqueue' as const, value: 'A' },
        { type: 'enqueue' as const, value: 'B' },
        { type: 'enqueue' as const, value: 'C' },
        { type: 'dequeue' as const, count: 2 }
      ]
      
      const frames = runQueueCommands([], commands)
      
      // Should have 2 frames per enqueue + 4 frames for dequeue (2 operations)
      expect(frames).toHaveLength(10)
      
      // Final state should only have C
      const finalFrame = frames[frames.length - 1]
      expect(finalFrame.state.items).toEqual(['C'])
    })
  })

  describe('Front Index Invariant', () => {
    it('maintains frontIndex = 0 after compaction', () => {
      const commands = [
        { type: 'enqueue' as const, value: 'A' },
        { type: 'enqueue' as const, value: 'B' },
        { type: 'dequeue' as const, count: 1 }
      ]
      
      const frames = runQueueCommands([], commands)
      
      // All frames should have frontIndex = 0
      frames.forEach(frame => {
        expect(frame.state.frontIndex).toBe(0)
      })
    })
  })

  describe('Deterministic and Pure', () => {
    it('produces same output for same input', () => {
      const commands = [
        { type: 'enqueue' as const, value: 'A' },
        { type: 'enqueue' as const, value: 'B' },
        { type: 'dequeue' as const, count: 1 }
      ]
      
      const frames1 = runQueueCommands([], commands)
      const frames2 = runQueueCommands([], commands)
      
      expect(frames1).toEqual(frames2)
    })

    it('does not mutate input arrays', () => {
      const initial = ['X', 'Y']
      const commands = [{ type: 'enqueue' as const, value: 'Z' }]
      
      runQueueCommands(initial, commands)
      
      // Original array should be unchanged
      expect(initial).toEqual(['X', 'Y'])
    })
  })

  describe('Step Numbering', () => {
    it('increments step numbers correctly', () => {
      const commands = [
        { type: 'enqueue' as const, value: 'A' },
        { type: 'enqueue' as const, value: 'B' }
      ]
      
      const frames = runQueueCommands([], commands)
      
      expect(frames[0].meta.step).toBe(1)
      expect(frames[1].meta.step).toBe(2)
      expect(frames[2].meta.step).toBe(3)
      expect(frames[3].meta.step).toBe(4)
    })
  })
})

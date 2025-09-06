import { describe, it, expect } from 'vitest'
import { runStackCommands } from '../src/algorithms/stack/engine'

describe('Stack Engine', () => {
  describe('Basic Operations', () => {
    it('handles empty initial stack', () => {
      const frames = runStackCommands([], [])
      expect(frames).toEqual([])
    })

    it('handles single push operation', () => {
      const frames = runStackCommands([], [{ type: 'push', value: 'A' }])
      expect(frames).toHaveLength(2)
      
      // Pre-frame: op:"push", highlightIndex = items.length (incoming top slot)
      expect(frames[0].state.items).toEqual([])
      expect(frames[0].state.op).toBe('push')
      expect(frames[0].state.highlightIndex).toBe(0)
      expect(frames[0].meta.label).toBe('push A')
      
      // Post-frame: items with v appended, highlightIndex = items.length-1
      expect(frames[1].state.items).toEqual(['A'])
      expect(frames[1].state.op).toBe('push')
      expect(frames[1].state.highlightIndex).toBe(0)
      expect(frames[1].meta.label).toBe('placed A on top')
    })

    it('handles single pop operation', () => {
      const frames = runStackCommands(['A', 'B'], [{ type: 'pop', count: 1 }])
      expect(frames).toHaveLength(3)
      
      // Initial frame
      expect(frames[0].state.items).toEqual(['A', 'B'])
      expect(frames[0].state.op).toBeNull()
      expect(frames[0].state.highlightIndex).toBeNull()
      expect(frames[0].meta.label).toBe('Initial stack: [A, B]')
      
      // Pre-frame: op:"pop", highlightIndex = items.length-1
      expect(frames[1].state.items).toEqual(['A', 'B'])
      expect(frames[1].state.op).toBe('pop')
      expect(frames[1].state.highlightIndex).toBe(1)
      expect(frames[1].meta.label).toBe('pop (top=1)')
      
      // Post-frame: remove last element, clear highlight
      expect(frames[2].state.items).toEqual(['A'])
      expect(frames[2].state.op).toBe('pop')
      expect(frames[2].state.highlightIndex).toBeNull()
      expect(frames[2].meta.label).toBe('removed top (B)')
    })

    it('handles reset operation', () => {
      const frames = runStackCommands(['A', 'B', 'C'], [{ type: 'reset' }])
      expect(frames).toHaveLength(2)
      
      // Initial frame
      expect(frames[0].state.items).toEqual(['A', 'B', 'C'])
      expect(frames[0].state.op).toBeNull()
      expect(frames[0].state.highlightIndex).toBeNull()
      expect(frames[0].meta.label).toBe('Initial stack: [A, B, C]')
      
      // Reset frame
      expect(frames[1].state.items).toEqual([])
      expect(frames[1].state.op).toBeNull()
      expect(frames[1].state.highlightIndex).toBeNull()
      expect(frames[1].meta.label).toBe('reset')
    })

    it('handles pop on empty stack', () => {
      const frames = runStackCommands([], [{ type: 'pop', count: 1 }])
      expect(frames).toHaveLength(1)
      expect(frames[0].state.items).toEqual([])
      expect(frames[0].state.op).toBe('pop')
      expect(frames[0].state.highlightIndex).toBeNull()
      expect(frames[0].meta.label).toBe('stack empty')
    })
  })

  describe('Complex Sequence - Requirements Example', () => {
    it('handles push 1; push 2; push 3; pop 2', () => {
      const commands = [
        { type: 'push' as const, value: 1 },
        { type: 'push' as const, value: 2 },
        { type: 'push' as const, value: 3 },
        { type: 'pop' as const, count: 2 }
      ]
      
      const frames = runStackCommands([], commands)
      
      // Should have 2 frames per push + 4 frames for pop (2 operations)
      // = 2 + 2 + 2 + 2 + 2 = 10 frames total
      expect(frames).toHaveLength(10)
      
      // Final state should be [1]
      const finalFrame = frames[frames.length - 1]
      expect(finalFrame.state.items).toEqual([1])
    })

    it('verifies LIFO order - removed items are [3, 2]', () => {
      const commands = [
        { type: 'push' as const, value: 1 },
        { type: 'push' as const, value: 2 },
        { type: 'push' as const, value: 3 },
        { type: 'pop' as const, count: 2 }
      ]
      
      const frames = runStackCommands([], commands)
      
      // Find the pop frames and check removed items
      const popFrames = frames.filter(f => f.state.op === 'pop' && f.meta.label.includes('removed top'))
      expect(popFrames).toHaveLength(2)
      
      // First pop removes 3 (top)
      expect(popFrames[0].meta.label).toBe('removed top (3)')
      // Second pop removes 2 (now top)
      expect(popFrames[1].meta.label).toBe('removed top (2)')
      
      // Final state should only have 1
      const finalFrame = frames[frames.length - 1]
      expect(finalFrame.state.items).toEqual([1])
    })
  })

  describe('Length Invariants', () => {
    it('each push increases length by 1', () => {
      const commands = [
        { type: 'push' as const, value: 'A' },
        { type: 'push' as const, value: 'B' },
        { type: 'push' as const, value: 'C' }
      ]
      
      const frames = runStackCommands([], commands)
      
      // Check that each push operation increases length by 1
      let currentLength = 0
      for (const frame of frames) {
        if (frame.state.op === 'push' && frame.meta.label.includes('placed')) {
          currentLength++
          expect(frame.state.items).toHaveLength(currentLength)
        }
      }
    })

    it('each pop decreases length by 1 (when not empty)', () => {
      const commands = [
        { type: 'push' as const, value: 'A' },
        { type: 'push' as const, value: 'B' },
        { type: 'push' as const, value: 'C' },
        { type: 'pop' as const, count: 2 }
      ]
      
      const frames = runStackCommands([], commands)
      
      // Track length changes through pop operations
      let currentLength = 3 // After all pushes
      for (const frame of frames) {
        if (frame.state.op === 'pop' && frame.meta.label.includes('removed top')) {
          currentLength--
          expect(frame.state.items).toHaveLength(currentLength)
        }
      }
    })
  })

  describe('Empty Stack Handling', () => {
    it('emits "stack empty" info frame for pop on empty', () => {
      const frames = runStackCommands([], [{ type: 'pop', count: 1 }])
      
      expect(frames).toHaveLength(1)
      expect(frames[0].meta.label).toBe('stack empty')
      expect(frames[0].state.items).toEqual([])
    })

    it('handles multiple pops on empty stack', () => {
      const frames = runStackCommands([], [{ type: 'pop', count: 3 }])
      
      expect(frames).toHaveLength(3)
      frames.forEach(frame => {
        expect(frame.meta.label).toBe('stack empty')
        expect(frame.state.items).toEqual([])
      })
    })

    it('continues after empty pop', () => {
      const commands = [
        { type: 'pop' as const, count: 1 },
        { type: 'push' as const, value: 'X' },
        { type: 'pop' as const, count: 2 }
      ]
      
      const frames = runStackCommands([], commands)
      
      // Should have: empty pop + push X + pop X + empty pop
      expect(frames).toHaveLength(6)
      
      // Check the sequence
      expect(frames[0].meta.label).toBe('stack empty')
      expect(frames[1].meta.label).toBe('push X')
      expect(frames[2].meta.label).toBe('placed X on top')
      expect(frames[3].meta.label).toBe('pop (top=0)')
      expect(frames[4].meta.label).toBe('removed top (X)')
      expect(frames[5].meta.label).toBe('stack empty')
    })
  })

  describe('Multiple Pops', () => {
    it('handles pop with count > 1', () => {
      const commands = [
        { type: 'push' as const, value: 'A' },
        { type: 'push' as const, value: 'B' },
        { type: 'push' as const, value: 'C' },
        { type: 'pop' as const, count: 2 }
      ]
      
      const frames = runStackCommands([], commands)
      
      // Should have 2 frames per push + 4 frames for pop (2 operations)
      expect(frames).toHaveLength(10)
      
      // Final state should only have A
      const finalFrame = frames[frames.length - 1]
      expect(finalFrame.state.items).toEqual(['A'])
    })
  })

  describe('Top Index Invariant', () => {
    it('top index equals items.length-1 when non-empty', () => {
      const commands = [
        { type: 'push' as const, value: 'A' },
        { type: 'push' as const, value: 'B' },
        { type: 'pop' as const, count: 1 }
      ]
      
      const frames = runStackCommands([], commands)
      
      // Check that highlightIndex is valid when highlighting
      for (const frame of frames) {
        if (frame.state.highlightIndex !== null) {
          expect(frame.state.highlightIndex).toBeGreaterThanOrEqual(0)
          // For push operations, highlightIndex can be equal to items.length (incoming slot)
          // For pop operations, highlightIndex should be < items.length
          if (frame.state.op === 'pop') {
            expect(frame.state.highlightIndex).toBeLessThan(frame.state.items.length)
          } else {
            expect(frame.state.highlightIndex).toBeLessThanOrEqual(frame.state.items.length)
          }
        }
      }
    })
  })

  describe('Deterministic and Pure', () => {
    it('produces same output for same input', () => {
      const commands = [
        { type: 'push' as const, value: 'A' },
        { type: 'push' as const, value: 'B' },
        { type: 'pop' as const, count: 1 }
      ]
      
      const frames1 = runStackCommands([], commands)
      const frames2 = runStackCommands([], commands)
      
      expect(frames1).toEqual(frames2)
    })

    it('does not mutate input arrays', () => {
      const initial = ['X', 'Y']
      const commands = [{ type: 'push' as const, value: 'Z' }]
      
      runStackCommands(initial, commands)
      
      // Original array should be unchanged
      expect(initial).toEqual(['X', 'Y'])
    })
  })

  describe('Step Numbering', () => {
    it('increments step numbers correctly', () => {
      const commands = [
        { type: 'push' as const, value: 'A' },
        { type: 'push' as const, value: 'B' }
      ]
      
      const frames = runStackCommands([], commands)
      
      expect(frames[0].meta.step).toBe(1)
      expect(frames[1].meta.step).toBe(2)
      expect(frames[2].meta.step).toBe(3)
      expect(frames[3].meta.step).toBe(4)
    })
  })

  describe('Preset Examples', () => {
    it('handles "Basic push/pop" preset', () => {
      const commands = [
        { type: 'push' as const, value: 1 },
        { type: 'push' as const, value: 2 },
        { type: 'push' as const, value: 3 },
        { type: 'pop' as const, count: 1 },
        { type: 'push' as const, value: 4 },
        { type: 'pop' as const, count: 2 }
      ]
      
      const frames = runStackCommands([], commands)
      
      // Final state should be [1]
      const finalFrame = frames[frames.length - 1]
      expect(finalFrame.state.items).toEqual([1])
    })

    it('handles "Pop on empty safe" preset', () => {
      const commands = [
        { type: 'pop' as const, count: 1 },
        { type: 'push' as const, value: 7 },
        { type: 'pop' as const, count: 2 }
      ]
      
      const frames = runStackCommands([], commands)
      
      // Should have: empty pop + push 7 + pop 7 + empty pop
      expect(frames).toHaveLength(6)
      
      // Check the sequence
      expect(frames[0].meta.label).toBe('stack empty')
      expect(frames[1].meta.label).toBe('push 7')
      expect(frames[2].meta.label).toBe('placed 7 on top')
      expect(frames[3].meta.label).toBe('pop (top=0)')
      expect(frames[4].meta.label).toBe('removed top (7)')
      expect(frames[5].meta.label).toBe('stack empty')
    })

    it('handles "Strings + numbers" preset', () => {
      const commands = [
        { type: 'push' as const, value: 'A' },
        { type: 'push' as const, value: 10 },
        { type: 'push' as const, value: 'B' },
        { type: 'pop' as const, count: 1 },
        { type: 'push' as const, value: 20 }
      ]
      
      const frames = runStackCommands([], commands)
      
      // Final state should be ['A', 10, 20]
      const finalFrame = frames[frames.length - 1]
      expect(finalFrame.state.items).toEqual(['A', 10, 20])
    })
  })
})

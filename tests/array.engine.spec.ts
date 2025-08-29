import { describe, it, expect } from 'vitest'
import { runArrayCommands } from '../src/algorithms/array/engine'

describe('Array Engine', () => {
  describe('Basic Operations', () => {
    it('handles empty initial array', () => {
      const frames = runArrayCommands([], [])
      expect(frames).toEqual([])
    })

    it('handles single insert operation', () => {
      const frames = runArrayCommands([], [{ type: 'insert', index: 0, value: 5 }])
      expect(frames).toHaveLength(2)
      expect(frames[0].state.values).toEqual([])
      expect(frames[0].state.focusIndex).toBe(0)
      expect(frames[0].state.op).toBe('insert')
      expect(frames[1].state.values).toEqual([5])
      expect(frames[1].state.highlight).toEqual([0])
    })

    it('handles single delete operation', () => {
      const frames = runArrayCommands([5, 7], [{ type: 'delete', index: 0 }])
      expect(frames).toHaveLength(4) // Initial + focus + shift + final
      expect(frames[0].state.values).toEqual([5, 7]) // Initial frame
      expect(frames[1].state.values).toEqual([5, 7])
      expect(frames[1].state.focusIndex).toBe(0)
      expect(frames[1].state.op).toBe('delete')
      expect(frames[2].state.values).toEqual([7, 7])
      expect(frames[2].state.highlight).toEqual([1, 0])
      expect(frames[3].state.values).toEqual([7])
      expect(frames[3].state.highlight).toEqual([])
    })

    it('handles reset operation', () => {
      const frames = runArrayCommands([5, 7, 9], [{ type: 'reset' }])
      expect(frames).toHaveLength(2) // Initial + reset
      expect(frames[0].state.values).toEqual([5, 7, 9]) // Initial frame
      expect(frames[1].state.values).toEqual([])
      expect(frames[1].state.highlight).toEqual([])
      expect(frames[1].state.focusIndex).toBeNull()
      expect(frames[1].state.op).toBeNull()
    })
  })

  describe('Complex Sequence', () => {
    it('handles the specified test sequence correctly', () => {
      const commands = [
        { type: 'insert' as const, index: 0, value: 1 },
        { type: 'insert' as const, index: 1, value: 2 },
        { type: 'insert' as const, index: 1, value: 99 },
        { type: 'delete' as const, index: 2 }
      ]
      
      const frames = runArrayCommands([], commands)
      
      // Final state should be [1, 99] (2 was deleted)
      const finalState = frames[frames.length - 1].state
      expect(finalState.values).toEqual([1, 99])
      
      // Frame count should be greater than number of commands due to shifts
      expect(frames.length).toBeGreaterThan(commands.length)
      
      // Verify the sequence of operations
      let currentIndex = 0
      
      // Frame 1: Focus on index 0 for insertion of 1
      expect(frames[currentIndex].state.values).toEqual([])
      expect(frames[currentIndex].state.focusIndex).toBe(0)
      expect(frames[currentIndex].state.op).toBe('insert')
      currentIndex++
      
      // Frame 2: Place 1 at index 0
      expect(frames[currentIndex].state.values).toEqual([1])
      expect(frames[currentIndex].state.highlight).toEqual([0])
      currentIndex++
      
      // Frame 3: Focus on index 1 for insertion of 2
      expect(frames[currentIndex].state.values).toEqual([1])
      expect(frames[currentIndex].state.focusIndex).toBe(1)
      currentIndex++
      
      // Frame 4: Place 2 at index 1
      expect(frames[currentIndex].state.values).toEqual([1, 2])
      expect(frames[currentIndex].state.highlight).toEqual([1])
      currentIndex++
      
      // Frame 5: Focus on index 1 for insertion of 99
      expect(frames[currentIndex].state.values).toEqual([1, 2])
      expect(frames[currentIndex].state.focusIndex).toBe(1)
      currentIndex++
      
      // Frame 6: Shift values[1] → values[2]
      expect(frames[currentIndex].state.values).toEqual([1, 2, 2])
      expect(frames[currentIndex].state.highlight).toEqual([1, 2])
      currentIndex++
      
      // Frame 7: Place 99 at index 1
      expect(frames[currentIndex].state.values).toEqual([1, 99, 2])
      expect(frames[currentIndex].state.highlight).toEqual([1])
      currentIndex++
      
      // Frame 8: Focus on index 2 for deletion
      expect(frames[currentIndex].state.values).toEqual([1, 99, 2])
      expect(frames[currentIndex].state.focusIndex).toBe(2)
      expect(frames[currentIndex].state.op).toBe('delete')
      currentIndex++
      
      // Frame 9: Delete completed at index 2
      expect(frames[currentIndex].state.values).toEqual([1, 99])
      expect(frames[currentIndex].state.highlight).toEqual([])
      expect(frames[currentIndex].state.focusIndex).toBeNull()
      expect(frames[currentIndex].state.op).toBeNull()
    })
  })

  describe('Invariants', () => {
    it('maintains correct array length evolution during insert operations', () => {
      const commands = [
        { type: 'insert' as const, index: 0, value: 5 },
        { type: 'insert' as const, index: 1, value: 7 },
        { type: 'insert' as const, index: 0, value: 3 }
      ]
      
      const frames = runArrayCommands([], commands)
      
      // Track length changes
      let previousLength = 0
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i]
        const currentLength = frame.state.values.length
        
        // Length should never decrease during insert operations
        expect(currentLength).toBeGreaterThanOrEqual(previousLength)
        
        // If this is a final placement frame (highlight has focusIndex), length should increase by 1
        if (frame.state.highlight?.includes(frame.state.focusIndex || -1)) {
          expect(currentLength).toBe(previousLength + 1)
        }
        
        previousLength = currentLength
      }
      
      // Final length should be 3
      expect(frames[frames.length - 1].state.values).toHaveLength(3)
    })

    it('maintains correct array length evolution during delete operations', () => {
      const commands = [
        { type: 'insert' as const, index: 0, value: 5 },
        { type: 'insert' as const, index: 1, value: 7 },
        { type: 'insert' as const, index: 2, value: 9 },
        { type: 'delete' as const, index: 1 }
      ]
      
      const frames = runArrayCommands([], commands)
      
      // Find the delete operation frames
      const deleteFrames = frames.filter(f => f.state.op === 'delete')
      expect(deleteFrames.length).toBeGreaterThan(0)
      
      // Find the frame where deletion is completed (op becomes null)
      const deleteCompletedFrame = frames.find(f => f.state.op === null && f.meta.label.includes('Delete completed'))
      expect(deleteCompletedFrame).toBeDefined()
      
      // During delete, length should decrease by 1 at the final removal
      const deleteStartFrame = deleteFrames[0]
      
      // The final delete frame should have length decreased by 1
      expect(deleteCompletedFrame!.state.values.length).toBe(deleteStartFrame.state.values.length - 1)
    })

    it('maintains frame step increment', () => {
      const commands = [
        { type: 'insert' as const, index: 0, value: 5 },
        { type: 'insert' as const, index: 1, value: 7 }
      ]
      
      const frames = runArrayCommands([], commands)
      
      for (let i = 0; i < frames.length; i++) {
        expect(frames[i].meta.step).toBe(i + 1)
      }
    })

    it('maintains immutable state between frames', () => {
      const commands = [
        { type: 'insert' as const, index: 0, value: 5 },
        { type: 'insert' as const, index: 1, value: 7 }
      ]
      
      const frames = runArrayCommands([], commands)
      
      // Each frame should have a different state object reference
      for (let i = 1; i < frames.length; i++) {
        expect(frames[i].state).not.toBe(frames[i - 1].state)
        expect(frames[i].state.values).not.toBe(frames[i - 1].state.values)
      }
    })
  })

  describe('Edge Cases', () => {
    it('handles insert at end of array', () => {
      const frames = runArrayCommands([1, 2], [{ type: 'insert' as const, index: 2, value: 3 }])
      expect(frames).toHaveLength(3) // Initial + focus + place
      expect(frames[2].state.values).toEqual([1, 2, 3])
    })

    it('handles insert at beginning of array', () => {
      const frames = runArrayCommands([1, 2], [{ type: 'insert' as const, index: 0, value: 0 }])
      expect(frames).toHaveLength(5) // Initial + focus + 2 shifts + place
      expect(frames[4].state.values).toEqual([0, 1, 2])
    })

    it('handles delete from beginning of array', () => {
      const frames = runArrayCommands([1, 2, 3], [{ type: 'delete' as const, index: 0 }])
      expect(frames).toHaveLength(5) // Initial + focus + 2 shifts + final
      expect(frames[4].state.values).toEqual([2, 3])
    })

    it('handles delete from end of array', () => {
      const frames = runArrayCommands([1, 2, 3], [{ type: 'delete' as const, index: 2 }])
      expect(frames).toHaveLength(3) // Initial + focus + final
      expect(frames[2].state.values).toEqual([1, 2])
    })

    it('throws error for insert at invalid index', () => {
      expect(() => {
        runArrayCommands([1, 2], [{ type: 'insert' as const, index: 5, value: 3 }])
      }).toThrow('Cannot insert at index 5: array length is 2')
    })

    it('throws error for delete at invalid index', () => {
      expect(() => {
        runArrayCommands([1, 2], [{ type: 'delete' as const, index: 5 }])
      }).toThrow('Cannot delete at index 5: array length is 2')
    })
  })

  describe('Mixed Data Types', () => {
    it('handles mixed number and string values', () => {
      const commands = [
        { type: 'insert' as const, index: 0, value: 42 },
        { type: 'insert' as const, index: 1, value: 'hello' },
        { type: 'insert' as const, index: 2, value: 3.14 }
      ]
      
      const frames = runArrayCommands([], commands)
      const finalState = frames[frames.length - 1].state
      
      expect(finalState.values).toEqual([42, 'hello', 3.14])
      expect(typeof finalState.values[0]).toBe('number')
      expect(typeof finalState.values[1]).toBe('string')
      expect(typeof finalState.values[2]).toBe('number')
    })
  })
})

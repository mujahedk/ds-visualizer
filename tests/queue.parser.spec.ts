import { describe, it, expect } from 'vitest'
import { parseQueueInput } from '../src/algorithms/queue/parser'

describe('Queue Parser', () => {
  describe('Valid Commands', () => {
    it('parses simple enqueue commands with numbers', () => {
      const result = parseQueueInput('enqueue 5')
      expect(result).toEqual([
        { type: 'enqueue', value: 5 }
      ])
    })

    it('parses enqueue commands with strings', () => {
      const result = parseQueueInput('enqueue A')
      expect(result).toEqual([
        { type: 'enqueue', value: 'A' }
      ])
    })

    it('parses enqueue commands with quoted strings', () => {
      const result = parseQueueInput('enqueue "A"')
      expect(result).toEqual([
        { type: 'enqueue', value: 'A' }
      ])
    })

    it('parses enqueue commands with single quotes', () => {
      const result = parseQueueInput("enqueue 'B'")
      expect(result).toEqual([
        { type: 'enqueue', value: 'B' }
      ])
    })

    it('parses dequeue command without count', () => {
      const result = parseQueueInput('dequeue')
      expect(result).toEqual([
        { type: 'dequeue', count: 1 }
      ])
    })

    it('parses dequeue command with count', () => {
      const result = parseQueueInput('dequeue 3')
      expect(result).toEqual([
        { type: 'dequeue', count: 3 }
      ])
    })

    it('parses reset command', () => {
      const result = parseQueueInput('reset')
      expect(result).toEqual([
        { type: 'reset' }
      ])
    })

    it('parses multiple commands separated by semicolon', () => {
      const result = parseQueueInput('enqueue A; enqueue B; dequeue 1')
      expect(result).toEqual([
        { type: 'enqueue', value: 'A' },
        { type: 'enqueue', value: 'B' },
        { type: 'dequeue', count: 1 }
      ])
    })

    it('parses multiple commands separated by newlines', () => {
      const result = parseQueueInput('enqueue 1\nenqueue 2\ndequeue')
      expect(result).toEqual([
        { type: 'enqueue', value: 1 },
        { type: 'enqueue', value: 2 },
        { type: 'dequeue', count: 1 }
      ])
    })

    it('parses mixed separators', () => {
      const result = parseQueueInput('enqueue A; enqueue B\nenqueue C; dequeue 2')
      expect(result).toEqual([
        { type: 'enqueue', value: 'A' },
        { type: 'enqueue', value: 'B' },
        { type: 'enqueue', value: 'C' },
        { type: 'dequeue', count: 2 }
      ])
    })

    it('handles extra whitespace', () => {
      const result = parseQueueInput('  enqueue  5  ;  dequeue  2  ')
      expect(result).toEqual([
        { type: 'enqueue', value: 5 },
        { type: 'dequeue', count: 2 }
      ])
    })

    it('parses case insensitive commands', () => {
      const result = parseQueueInput('ENQUEUE A; DEQUEUE 2; RESET')
      expect(result).toEqual([
        { type: 'enqueue', value: 'A' },
        { type: 'dequeue', count: 2 },
        { type: 'reset' }
      ])
    })

    it('coerces numbers when possible', () => {
      const result = parseQueueInput('enqueue 42; enqueue 3.14')
      expect(result).toEqual([
        { type: 'enqueue', value: 42 },
        { type: 'enqueue', value: 3.14 }
      ])
    })

    it('preserves strings when not numbers', () => {
      const result = parseQueueInput('enqueue abc; enqueue 123abc')
      expect(result).toEqual([
        { type: 'enqueue', value: 'abc' },
        { type: 'enqueue', value: '123abc' }
      ])
    })

    it('handles empty input', () => {
      const result = parseQueueInput('')
      expect(result).toEqual([])
    })

    it('handles whitespace only input', () => {
      const result = parseQueueInput('   \n  \t  ')
      expect(result).toEqual([])
    })
  })

  describe('Error Cases', () => {
    it('throws error for invalid command', () => {
      expect(() => parseQueueInput('invalid')).toThrow('Invalid command: "invalid". Examples: enqueue 5; dequeue 2; reset')
    })

    it('throws error for invalid enqueue command', () => {
      expect(() => parseQueueInput('enqueue')).toThrow('Invalid enqueue command: "enqueue". Expected: enqueue <value>. Examples: enqueue 5, enqueue "A", enqueue A')
    })

    it('throws error for invalid dequeue count', () => {
      expect(() => parseQueueInput('dequeue abc')).toThrow('Invalid dequeue count: "dequeue abc". Count must be a positive integer. Examples: dequeue, dequeue 3')
    })

    it('throws error for negative dequeue count', () => {
      expect(() => parseQueueInput('dequeue -1')).toThrow('Invalid dequeue count: "dequeue -1". Count must be a positive integer. Examples: dequeue, dequeue 3')
    })

    it('throws error for zero dequeue count', () => {
      expect(() => parseQueueInput('dequeue 0')).toThrow('Invalid dequeue count: "dequeue 0". Count must be a positive integer. Examples: dequeue, dequeue 3')
    })

    it('throws error for decimal dequeue count', () => {
      expect(() => parseQueueInput('dequeue 2.5')).toThrow('Invalid dequeue count: "dequeue 2.5". Count must be a positive integer. Examples: dequeue, dequeue 3')
    })

    it('throws error for unknown command', () => {
      expect(() => parseQueueInput('unknown 5')).toThrow('Invalid command: "unknown 5". Examples: enqueue 5; dequeue 2; reset')
    })
  })

  describe('Complex Scenarios', () => {
    it('parses the example from requirements', () => {
      const result = parseQueueInput('enqueue A; enqueue B; enqueue C; dequeue 2; enqueue D')
      expect(result).toEqual([
        { type: 'enqueue', value: 'A' },
        { type: 'enqueue', value: 'B' },
        { type: 'enqueue', value: 'C' },
        { type: 'dequeue', count: 2 },
        { type: 'enqueue', value: 'D' }
      ])
    })

    it('parses preset examples', () => {
      const result = parseQueueInput('enqueue 1; enqueue 2; enqueue 3; enqueue 4')
      expect(result).toEqual([
        { type: 'enqueue', value: 1 },
        { type: 'enqueue', value: 2 },
        { type: 'enqueue', value: 3 },
        { type: 'enqueue', value: 4 }
      ])
    })

    it('parses dequeue on empty safe example', () => {
      const result = parseQueueInput('dequeue 1; enqueue X; dequeue 2')
      expect(result).toEqual([
        { type: 'dequeue', count: 1 },
        { type: 'enqueue', value: 'X' },
        { type: 'dequeue', count: 2 }
      ])
    })
  })
})

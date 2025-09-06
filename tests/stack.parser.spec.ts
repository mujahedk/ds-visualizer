import { describe, it, expect } from 'vitest'
import { parseStackInput } from '../src/algorithms/stack/parser'

describe('Stack Parser', () => {
  describe('Valid Commands', () => {
    it('parses simple push commands with numbers', () => {
      const result = parseStackInput('push 5')
      expect(result).toEqual([
        { type: 'push', value: 5 }
      ])
    })

    it('parses push commands with strings', () => {
      const result = parseStackInput('push A')
      expect(result).toEqual([
        { type: 'push', value: 'A' }
      ])
    })

    it('parses push commands with quoted strings', () => {
      const result = parseStackInput('push "A"')
      expect(result).toEqual([
        { type: 'push', value: 'A' }
      ])
    })

    it('parses push commands with single quotes', () => {
      const result = parseStackInput("push 'B'")
      expect(result).toEqual([
        { type: 'push', value: 'B' }
      ])
    })

    it('parses pop command without count', () => {
      const result = parseStackInput('pop')
      expect(result).toEqual([
        { type: 'pop', count: 1 }
      ])
    })

    it('parses pop command with count', () => {
      const result = parseStackInput('pop 3')
      expect(result).toEqual([
        { type: 'pop', count: 3 }
      ])
    })

    it('parses reset command', () => {
      const result = parseStackInput('reset')
      expect(result).toEqual([
        { type: 'reset' }
      ])
    })

    it('parses multiple commands separated by semicolon', () => {
      const result = parseStackInput('push A; push B; pop 1')
      expect(result).toEqual([
        { type: 'push', value: 'A' },
        { type: 'push', value: 'B' },
        { type: 'pop', count: 1 }
      ])
    })

    it('parses multiple commands separated by newlines', () => {
      const result = parseStackInput('push 1\npush 2\npop')
      expect(result).toEqual([
        { type: 'push', value: 1 },
        { type: 'push', value: 2 },
        { type: 'pop', count: 1 }
      ])
    })

    it('parses mixed separators', () => {
      const result = parseStackInput('push A; push B\npush C; pop 2')
      expect(result).toEqual([
        { type: 'push', value: 'A' },
        { type: 'push', value: 'B' },
        { type: 'push', value: 'C' },
        { type: 'pop', count: 2 }
      ])
    })

    it('handles extra whitespace', () => {
      const result = parseStackInput('  push  5  ;  pop  2  ')
      expect(result).toEqual([
        { type: 'push', value: 5 },
        { type: 'pop', count: 2 }
      ])
    })

    it('parses case insensitive commands', () => {
      const result = parseStackInput('PUSH A; POP 2; RESET')
      expect(result).toEqual([
        { type: 'push', value: 'A' },
        { type: 'pop', count: 2 },
        { type: 'reset' }
      ])
    })

    it('coerces numbers when possible', () => {
      const result = parseStackInput('push 42; push 3.14')
      expect(result).toEqual([
        { type: 'push', value: 42 },
        { type: 'push', value: 3.14 }
      ])
    })

    it('preserves strings when not numbers', () => {
      const result = parseStackInput('push abc; push 123abc')
      expect(result).toEqual([
        { type: 'push', value: 'abc' },
        { type: 'push', value: '123abc' }
      ])
    })

    it('handles empty input', () => {
      const result = parseStackInput('')
      expect(result).toEqual([])
    })

    it('handles whitespace only input', () => {
      const result = parseStackInput('   \n  \t  ')
      expect(result).toEqual([])
    })
  })

  describe('Error Cases', () => {
    it('throws error for invalid command', () => {
      expect(() => parseStackInput('invalid')).toThrow('Invalid command: "invalid". Examples: push 5; pop 2; reset')
    })

    it('throws error for invalid push command', () => {
      expect(() => parseStackInput('push')).toThrow('Invalid push command: "push". Expected: push <value>. Examples: push 5, push "A", push A')
    })

    it('throws error for invalid pop count', () => {
      expect(() => parseStackInput('pop abc')).toThrow('Invalid pop count: "pop abc". Count must be a positive integer. Examples: pop, pop 3')
    })

    it('throws error for negative pop count', () => {
      expect(() => parseStackInput('pop -1')).toThrow('Invalid pop count: "pop -1". Count must be a positive integer. Examples: pop, pop 3')
    })

    it('throws error for zero pop count', () => {
      expect(() => parseStackInput('pop 0')).toThrow('Invalid pop count: "pop 0". Count must be a positive integer. Examples: pop, pop 3')
    })

    it('throws error for decimal pop count', () => {
      expect(() => parseStackInput('pop 2.5')).toThrow('Invalid pop count: "pop 2.5". Count must be a positive integer. Examples: pop, pop 3')
    })

    it('throws error for unknown command', () => {
      expect(() => parseStackInput('unknown 5')).toThrow('Invalid command: "unknown 5". Examples: push 5; pop 2; reset')
    })
  })

  describe('Complex Scenarios', () => {
    it('parses the example from requirements', () => {
      const result = parseStackInput('push 1; push 2; push 3; pop 2')
      expect(result).toEqual([
        { type: 'push', value: 1 },
        { type: 'push', value: 2 },
        { type: 'push', value: 3 },
        { type: 'pop', count: 2 }
      ])
    })

    it('parses preset examples', () => {
      const result = parseStackInput('push 1; push 2; push 3; pop 1; push 4; pop 2')
      expect(result).toEqual([
        { type: 'push', value: 1 },
        { type: 'push', value: 2 },
        { type: 'push', value: 3 },
        { type: 'pop', count: 1 },
        { type: 'push', value: 4 },
        { type: 'pop', count: 2 }
      ])
    })

    it('parses pop on empty safe example', () => {
      const result = parseStackInput('pop 1; push 7; pop 2')
      expect(result).toEqual([
        { type: 'pop', count: 1 },
        { type: 'push', value: 7 },
        { type: 'pop', count: 2 }
      ])
    })

    it('parses strings + numbers example', () => {
      const result = parseStackInput('push A; push 10; push B; pop 1; push 20')
      expect(result).toEqual([
        { type: 'push', value: 'A' },
        { type: 'push', value: 10 },
        { type: 'push', value: 'B' },
        { type: 'pop', count: 1 },
        { type: 'push', value: 20 }
      ])
    })
  })
})

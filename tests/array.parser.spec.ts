import { describe, it, expect } from 'vitest'
import { parseArrayInput } from '../src/algorithms/array/parser'

describe('Array Parser', () => {
  describe('Valid Commands', () => {
    it('parses simple insert commands', () => {
      const result = parseArrayInput('insert 0 5')
      expect(result).toEqual([
        { type: 'insert', index: 0, value: 5 }
      ])
    })

    it('parses insert with named parameters', () => {
      const result = parseArrayInput('insert index=1 value=7')
      expect(result).toEqual([
        { type: 'insert', index: 1, value: 7 }
      ])
    })

    it('parses insert with parentheses', () => {
      const result = parseArrayInput('insert (2,42)')
      expect(result).toEqual([
        { type: 'insert', index: 2, value: 42 }
      ])
    })

    it('parses delete commands', () => {
      const result = parseArrayInput('delete 0')
      expect(result).toEqual([
        { type: 'delete', index: 0 }
      ])
    })

    it('parses delete with named parameters', () => {
      const result = parseArrayInput('delete index=2')
      expect(result).toEqual([
        { type: 'delete', index: 2 }
      ])
    })

    it('parses reset command', () => {
      const result = parseArrayInput('reset')
      expect(result).toEqual([
        { type: 'reset' }
      ])
    })

    it('parses multiple commands separated by semicolon', () => {
      const result = parseArrayInput('insert 0 5; insert 1 7; delete 0')
      expect(result).toEqual([
        { type: 'insert', index: 0, value: 5 },
        { type: 'insert', index: 1, value: 7 },
        { type: 'delete', index: 0 }
      ])
    })

    it('parses multiple commands separated by newlines', () => {
      const result = parseArrayInput('insert 0 5\ninsert 1 7\ndelete 0')
      expect(result).toEqual([
        { type: 'insert', index: 0, value: 5 },
        { type: 'insert', index: 1, value: 7 },
        { type: 'delete', index: 0 }
      ])
    })

    it('parses mixed separators', () => {
      const result = parseArrayInput('insert 0 5; insert 1 7\nreset')
      expect(result).toEqual([
        { type: 'insert', index: 0, value: 5 },
        { type: 'insert', index: 1, value: 7 },
        { type: 'reset' }
      ])
    })

    it('handles whitespace variations', () => {
      const result = parseArrayInput('  insert  0  5  ;  insert  1  7  ')
      expect(result).toEqual([
        { type: 'insert', index: 0, value: 5 },
        { type: 'insert', index: 1, value: 7 }
      ])
    })

    it('parses string values', () => {
      const result = parseArrayInput('insert 0 hello; insert 1 world')
      expect(result).toEqual([
        { type: 'insert', index: 0, value: 'hello' },
        { type: 'insert', index: 1, value: 'world' }
      ])
    })

    it('parses numeric values as numbers', () => {
      const result = parseArrayInput('insert 0 42.5; insert 1 -10')
      expect(result).toEqual([
        { type: 'insert', index: 0, value: 42.5 },
        { type: 'insert', index: 1, value: -10 }
      ])
    })
  })

  describe('Error Handling', () => {
    it('throws error for invalid command', () => {
      expect(() => parseArrayInput('invalid command')).toThrow(
        'Invalid command: "invalid command". Expected: insert, delete, or reset. Examples: insert 0 5, delete 2, reset'
      )
    })

    it('throws error for missing index in insert', () => {
      expect(() => parseArrayInput('insert 5')).toThrow(
        'Invalid insert command: "insert 5". Expected: insert <index> <value>. Examples: insert 0 5'
      )
    })

    it('throws error for missing value in insert', () => {
      expect(() => parseArrayInput('insert index=0')).toThrow(
        'Invalid insert command: "insert index=0". Expected: insert index=<number> value=<value>. Examples: insert index=0 value=5'
      )
    })

    it('throws error for invalid index in insert', () => {
      expect(() => parseArrayInput('insert -1 5')).toThrow(
        'Invalid index in insert command: "insert -1 5". Index must be a non-negative integer. Got: -1'
      )
    })

    it('throws error for invalid index in delete', () => {
      expect(() => parseArrayInput('delete -1')).toThrow(
        'Invalid index in delete command: "delete -1". Index must be a non-negative integer. Got: -1'
      )
    })

    it('throws error for non-integer index', () => {
      expect(() => parseArrayInput('insert 1.5 5')).toThrow(
        'Invalid index in insert command: "insert 1.5 5". Index must be a non-negative integer. Got: 1.5'
      )
    })

    it('throws error for invalid delete format', () => {
      expect(() => parseArrayInput('delete index=invalid')).toThrow(
        'Invalid index in delete command: "delete index=invalid". Index must be a non-negative integer. Got: index=invalid'
      )
    })

    it('throws error for malformed parentheses', () => {
      expect(() => parseArrayInput('insert (0,')).toThrow(
        'Invalid insert command: "insert (0,". Expected: insert <index> <value>. Examples: insert 0 5'
      )
    })

    it('throws error for empty parentheses', () => {
      expect(() => parseArrayInput('insert ()')).toThrow(
        'Invalid insert command: "insert ()". Expected: insert (<index>,<value>). Examples: insert (0,5)'
      )
    })
  })

  describe('Edge Cases', () => {
    it('handles empty input', () => {
      const result = parseArrayInput('')
      expect(result).toEqual([])
    })

    it('handles whitespace-only input', () => {
      const result = parseArrayInput('   \n  \t  ')
      expect(result).toEqual([])
    })

    it('handles single semicolon', () => {
      const result = parseArrayInput(';')
      expect(result).toEqual([])
    })

    it('handles multiple semicolons', () => {
      const result = parseArrayInput('insert 0 5;;;insert 1 7')
      expect(result).toEqual([
        { type: 'insert', index: 0, value: 5 },
        { type: 'insert', index: 1, value: 7 }
      ])
    })

    it('handles large indices', () => {
      const result = parseArrayInput('insert 999999 42')
      expect(result).toEqual([
        { type: 'insert', index: 999999, value: 42 }
      ])
    })

    it('handles zero index', () => {
      const result = parseArrayInput('insert 0 42')
      expect(result).toEqual([
        { type: 'insert', index: 0, value: 42 }
      ])
    })
  })
})

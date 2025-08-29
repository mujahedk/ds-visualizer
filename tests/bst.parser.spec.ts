import { describe, it, expect } from 'vitest'
import { parseBSTInput } from '../src/algorithms/bst/parser'

describe('BST Parser', () => {
  describe('Valid Commands', () => {
    it('parses single insert command with key', () => {
      const commands = parseBSTInput('insert 8')
      expect(commands).toHaveLength(1)
      expect(commands[0]).toEqual({ type: 'insert', key: 8 })
    })

    it('parses single insert command with key=value format', () => {
      const commands = parseBSTInput('insert key=5')
      expect(commands).toHaveLength(1)
      expect(commands[0]).toEqual({ type: 'insert', key: 5 })
    })

    it('parses single delete command with key', () => {
      const commands = parseBSTInput('delete 3')
      expect(commands).toHaveLength(1)
      expect(commands[0]).toEqual({ type: 'delete', key: 3 })
    })

    it('parses single delete command with key=value format', () => {
      const commands = parseBSTInput('delete key=7')
      expect(commands).toHaveLength(1)
      expect(commands[0]).toEqual({ type: 'delete', key: 7 })
    })

    it('parses single reset command', () => {
      const commands = parseBSTInput('reset')
      expect(commands).toHaveLength(1)
      expect(commands[0]).toEqual({ type: 'reset' })
    })

    it('parses multiple commands separated by semicolons', () => {
      const commands = parseBSTInput('insert 8; insert 3; delete 3')
      expect(commands).toHaveLength(3)
      expect(commands[0]).toEqual({ type: 'insert', key: 8 })
      expect(commands[1]).toEqual({ type: 'insert', key: 3 })
      expect(commands[2]).toEqual({ type: 'delete', key: 3 })
    })

    it('parses multiple commands separated by newlines', () => {
      const commands = parseBSTInput('insert 8\ninsert 3\ndelete 3')
      expect(commands).toHaveLength(3)
      expect(commands[0]).toEqual({ type: 'insert', key: 8 })
      expect(commands[1]).toEqual({ type: 'insert', key: 3 })
      expect(commands[2]).toEqual({ type: 'delete', key: 3 })
    })

    it('parses multiple commands separated by semicolons', () => {
      const commands = parseBSTInput('insert 8; insert 3; delete 3')
      expect(commands).toHaveLength(3)
      expect(commands[0]).toEqual({ type: 'insert', key: 8 })
      expect(commands[1]).toEqual({ type: 'insert', key: 3 })
      expect(commands[2]).toEqual({ type: 'delete', key: 3 })
    })

    it('handles mixed separators (semicolons and newlines)', () => {
      const commands = parseBSTInput('insert 8; insert 3\ninsert 10')
      expect(commands).toHaveLength(3)
      expect(commands[0]).toEqual({ type: 'insert', key: 8 })
      expect(commands[1]).toEqual({ type: 'insert', key: 3 })
      expect(commands[2]).toEqual({ type: 'insert', key: 10 })
    })

    it('tolerates extra whitespace', () => {
      const commands = parseBSTInput('  insert   8  ;  insert  3  ')
      expect(commands).toHaveLength(2)
      expect(commands[0]).toEqual({ type: 'insert', key: 8 })
      expect(commands[1]).toEqual({ type: 'insert', key: 3 })
    })

    it('handles case-insensitive commands', () => {
      const commands = parseBSTInput('INSERT 8; DELETE 3; RESET')
      expect(commands).toHaveLength(3)
      expect(commands[0]).toEqual({ type: 'insert', key: 8 })
      expect(commands[1]).toEqual({ type: 'delete', key: 3 })
      expect(commands[2]).toEqual({ type: 'reset' })
    })

    it('parses large numeric keys', () => {
      const commands = parseBSTInput('insert 999999; insert 0; insert -42')
      expect(commands).toHaveLength(3)
      expect(commands[0]).toEqual({ type: 'insert', key: 999999 })
      expect(commands[1]).toEqual({ type: 'insert', key: 0 })
      expect(commands[2]).toEqual({ type: 'insert', key: -42 })
    })

    it('handles empty input gracefully', () => {
      const commands = parseBSTInput('')
      expect(commands).toHaveLength(0)
    })

    it('handles whitespace-only input gracefully', () => {
      const commands = parseBSTInput('   \n  \t  ')
      expect(commands).toHaveLength(0)
    })
  })

  describe('Error Handling', () => {
    it('throws error for invalid command type', () => {
      expect(() => parseBSTInput('invalid 8')).toThrow('Invalid command: "invalid 8". Expected: insert, delete, or reset. Examples: insert 8, delete 3, reset')
    })

    it('throws error for missing key in insert command', () => {
      expect(() => parseBSTInput('insert')).toThrow('Invalid insert command: "insert". Expected: insert <key>. Examples: insert 8, insert key=8')
    })

    it('throws error for missing key in delete command', () => {
      expect(() => parseBSTInput('delete')).toThrow('Invalid delete command: "delete". Expected: delete <key>. Examples: delete 3, delete key=3')
    })

    it('throws error for non-numeric key in insert command', () => {
      expect(() => parseBSTInput('insert abc')).toThrow('Invalid key in insert command: "insert abc". Key must be an integer. Got: abc')
    })

    it('throws error for non-numeric key in delete command', () => {
      expect(() => parseBSTInput('delete xyz')).toThrow('Invalid key in delete command: "delete xyz". Key must be an integer. Got: xyz')
    })

    it('throws error for decimal numbers in insert command', () => {
      expect(() => parseBSTInput('insert 3.14')).toThrow('Invalid key in insert command: "insert 3.14". Key must be an integer. Got: 3.14')
    })

    it('throws error for decimal numbers in delete command', () => {
      expect(() => parseBSTInput('delete 2.5')).toThrow('Invalid key in delete command: "delete 2.5". Key must be an integer. Got: 2.5')
    })

    it('throws error for malformed key=value in insert command', () => {
      expect(() => parseBSTInput('insert key=')).toThrow('Invalid key in insert command: "insert key=". Key must be an integer. Got: key=')
    })

    it('throws error for malformed key=value in delete command', () => {
      expect(() => parseBSTInput('delete key=')).toThrow('Invalid key in delete command: "delete key=". Key must be an integer. Got: key=')
    })

    it('throws error for invalid key=value format in insert command', () => {
      expect(() => parseBSTInput('insert invalid=8')).toThrow('Invalid insert command: "insert invalid=8". Expected: insert key=<number>. Got: insert invalid=8')
    })

    it('throws error for invalid key=value format in delete command', () => {
      expect(() => parseBSTInput('delete invalid=3')).toThrow('Invalid delete command: "delete invalid=3". Expected: delete key=<number>. Got: delete invalid=3')
    })

    it('throws error for malformed parentheses', () => {
      expect(() => parseBSTInput('insert (8')).toThrow('Invalid key in insert command: "insert (8". Key must be an integer. Got: (8')
    })

    it('throws error for incomplete command', () => {
      expect(() => parseBSTInput('insert 8; insert')).toThrow('Invalid insert command: "insert". Expected: insert <key>. Examples: insert 8, insert key=8')
    })
  })

  describe('Edge Cases', () => {
    it('handles single semicolon gracefully', () => {
      const commands = parseBSTInput(';')
      expect(commands).toHaveLength(0)
    })

    it('handles multiple consecutive separators', () => {
      const commands = parseBSTInput('insert 8;;;insert 3')
      expect(commands).toHaveLength(2)
      expect(commands[0]).toEqual({ type: 'insert', key: 8 })
      expect(commands[1]).toEqual({ type: 'insert', key: 3 })
    })

    it('handles mixed valid and invalid commands (stops at first error)', () => {
      expect(() => parseBSTInput('insert 8; invalid 3')).toThrow('Invalid command: "invalid 3". Expected: insert, delete, or reset. Examples: insert 8, delete 3, reset')
    })
  })
})

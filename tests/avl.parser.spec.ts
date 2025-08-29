import { describe, it, expect } from 'vitest'
import { parseAVLInput } from '../src/algorithms/avl/parser'

describe('AVL Parser', () => {
  it('should parse insert commands', () => {
    const commands = parseAVLInput('insert 42')
    expect(commands).toHaveLength(1)
    expect(commands[0]).toEqual({ type: 'insert', key: 42 })
  })

  it('should parse delete commands', () => {
    const commands = parseAVLInput('delete 17')
    expect(commands).toHaveLength(1)
    expect(commands[0]).toEqual({ type: 'delete', key: 17 })
  })

  it('should parse reset commands', () => {
    const commands = parseAVLInput('reset')
    expect(commands).toHaveLength(1)
    expect(commands[0]).toEqual({ type: 'reset' })
  })

  it('should parse multiple commands separated by semicolons', () => {
    const commands = parseAVLInput('insert 30; insert 20; insert 10')
    expect(commands).toHaveLength(3)
    expect(commands[0]).toEqual({ type: 'insert', key: 30 })
    expect(commands[1]).toEqual({ type: 'insert', key: 20 })
    expect(commands[2]).toEqual({ type: 'insert', key: 10 })
  })

  it('should parse multiple commands separated by newlines', () => {
    const commands = parseAVLInput('insert 30\ninsert 20\ninsert 10')
    expect(commands).toHaveLength(3)
    expect(commands[0]).toEqual({ type: 'insert', key: 30 })
    expect(commands[1]).toEqual({ type: 'insert', key: 20 })
    expect(commands[2]).toEqual({ type: 'insert', key: 10 })
  })

  it('should parse key= format', () => {
    const commands = parseAVLInput('insert key=42; delete key=17')
    expect(commands).toHaveLength(2)
    expect(commands[0]).toEqual({ type: 'insert', key: 42 })
    expect(commands[1]).toEqual({ type: 'delete', key: 17 })
  })

  it('should handle case-insensitive commands', () => {
    const commands = parseAVLInput('INSERT 42; DELETE 17; RESET')
    expect(commands).toHaveLength(3)
    expect(commands[0]).toEqual({ type: 'insert', key: 42 })
    expect(commands[1]).toEqual({ type: 'delete', key: 17 })
    expect(commands[2]).toEqual({ type: 'reset' })
  })

  it('should handle spaced commands', () => {
    const commands = parseAVLInput('insert 8, insert key=5, delete 3')
    expect(commands).toHaveLength(3)
    expect(commands[0]).toEqual({ type: 'insert', key: 8 })
    expect(commands[1]).toEqual({ type: 'insert', key: 5 })
    expect(commands[2]).toEqual({ type: 'delete', key: 3 })
  })

  it('should handle mixed separators', () => {
    const commands = parseAVLInput('insert 10; insert 20\ninsert 30, insert 40')
    expect(commands).toHaveLength(4)
    expect(commands[0]).toEqual({ type: 'insert', key: 10 })
    expect(commands[1]).toEqual({ type: 'insert', key: 20 })
    expect(commands[2]).toEqual({ type: 'insert', key: 30 })
    expect(commands[3]).toEqual({ type: 'insert', key: 40 })
  })

  it('should throw error for invalid insert command', () => {
    expect(() => parseAVLInput('insert abc')).toThrow('Invalid key in insert command')
  })

  it('should throw error for invalid delete command', () => {
    expect(() => parseAVLInput('delete xyz')).toThrow('Invalid key in delete command')
  })

  it('should throw error for missing key in insert', () => {
    expect(() => parseAVLInput('insert')).toThrow('Invalid command')
  })

  it('should throw error for missing key in delete', () => {
    expect(() => parseAVLInput('delete')).toThrow('Invalid command')
  })

  it('should throw error for unknown command', () => {
    expect(() => parseAVLInput('unknown 42')).toThrow('Invalid command')
  })

  it('should throw error for malformed key= format', () => {
    expect(() => parseAVLInput('insert key=')).toThrow('Invalid key in insert command')
  })

  it('should handle empty input gracefully', () => {
    const commands = parseAVLInput('')
    expect(commands).toHaveLength(0)
  })

  it('should handle whitespace-only input gracefully', () => {
    const commands = parseAVLInput('   \n  \t  ')
    expect(commands).toHaveLength(0)
  })
})

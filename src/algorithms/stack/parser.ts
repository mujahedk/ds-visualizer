import { StackCommand } from './types'

/**
 * Parse stack algorithm input into commands
 * Accepts various formats:
 * - push 5, push "A", push A (coerce numbers when possible)
 * - pop (defaults 1), pop 3
 * - reset
 * Multiple commands separated by semicolon or newline
 */
export function parseStackInput(input: string): StackCommand[] {
  const commands: StackCommand[] = []
  
  // Split by semicolon or newline
  const lines = input.split(/[;\n]/).map(line => line.trim()).filter(line => line.length > 0)
  
  for (const line of lines) {
    const command = parseSingleCommand(line)
    if (command) {
      commands.push(command)
    }
  }
  
  return commands
}

function parseSingleCommand(input: string): StackCommand | null {
  const trimmed = input.trim()
  const lowerTrimmed = trimmed.toLowerCase()
  
  if (lowerTrimmed === 'reset') {
    return { type: 'reset' }
  }
  
  if (lowerTrimmed.startsWith('pop')) {
    return parsePopCommand(trimmed)
  }
  
  if (lowerTrimmed.startsWith('push')) {
    return parsePushCommand(trimmed)
  }
  
  throw new Error(`Invalid command: "${input}". Examples: push 5; pop 2; reset`)
}

function parsePopCommand(input: string): StackCommand {
  // Format: pop (defaults 1) OR pop 3
  const parts = input.split(/\s+/)
  
  if (parts.length === 1) {
    // Just "pop" - default to 1
    return { type: 'pop', count: 1 }
  }
  
  const countStr = parts[1]
  const count = parseInt(countStr)
  
  // Check if the original string contains a decimal point (which would make it non-integer)
  if (countStr.includes('.') || isNaN(count) || count < 1 || !Number.isInteger(count)) {
    throw new Error(`Invalid pop count: "${input}". Count must be a positive integer. Examples: pop, pop 3`)
  }
  
  return { type: 'pop', count }
}

function parsePushCommand(input: string): StackCommand {
  // Format: push 5, push "A", push A
  const parts = input.split(/\s+/)
  
  if (parts.length < 2) {
    throw new Error(`Invalid push command: "${input}". Expected: push <value>. Examples: push 5, push "A", push A`)
  }
  
  const valueStr = parts[1]
  const value = parseValue(valueStr)
  
  return { type: 'push', value }
}

function parseValue(valueStr: string): number | string {
  // Remove quotes if present
  const trimmed = valueStr.trim()
  
  // Check if it's quoted
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  
  // Try to parse as number first, but only if it's a pure number
  const num = parseFloat(trimmed)
  if (!isNaN(num) && trimmed !== '' && trimmed === num.toString()) {
    return num
  }
  
  // If not a valid number, return as string
  return trimmed
}

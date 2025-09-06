import { QueueCommand } from './types'

/**
 * Parse queue algorithm input into commands
 * Accepts various formats:
 * - enqueue 5, enqueue "A", enqueue A (coerce numbers when possible)
 * - dequeue (defaults 1), dequeue 3
 * - reset
 * Multiple commands separated by semicolon or newline
 */
export function parseQueueInput(input: string): QueueCommand[] {
  const commands: QueueCommand[] = []
  
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

function parseSingleCommand(input: string): QueueCommand | null {
  const trimmed = input.trim()
  const lowerTrimmed = trimmed.toLowerCase()
  
  if (lowerTrimmed === 'reset') {
    return { type: 'reset' }
  }
  
  if (lowerTrimmed.startsWith('dequeue')) {
    return parseDequeueCommand(trimmed)
  }
  
  if (lowerTrimmed.startsWith('enqueue')) {
    return parseEnqueueCommand(trimmed)
  }
  
  throw new Error(`Invalid command: "${input}". Examples: enqueue 5; dequeue 2; reset`)
}

function parseDequeueCommand(input: string): QueueCommand {
  // Format: dequeue (defaults 1) OR dequeue 3
  const parts = input.split(/\s+/)
  
  if (parts.length === 1) {
    // Just "dequeue" - default to 1
    return { type: 'dequeue', count: 1 }
  }
  
  const countStr = parts[1]
  const count = parseInt(countStr)
  
  // Check if the original string contains a decimal point (which would make it non-integer)
  if (countStr.includes('.') || isNaN(count) || count < 1 || !Number.isInteger(count)) {
    throw new Error(`Invalid dequeue count: "${input}". Count must be a positive integer. Examples: dequeue, dequeue 3`)
  }
  
  return { type: 'dequeue', count }
}

function parseEnqueueCommand(input: string): QueueCommand {
  // Format: enqueue 5, enqueue "A", enqueue A
  const parts = input.split(/\s+/)
  
  if (parts.length < 2) {
    throw new Error(`Invalid enqueue command: "${input}". Expected: enqueue <value>. Examples: enqueue 5, enqueue "A", enqueue A`)
  }
  
  const valueStr = parts[1]
  const value = parseValue(valueStr)
  
  return { type: 'enqueue', value }
}

function parseValue(valueStr: string): number | string {
  // Remove quotes if present
  const trimmed = valueStr.trim()
  
  // Check if it's quoted
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  
  // Try to parse as number first
  const num = parseFloat(trimmed)
  if (!isNaN(num) && trimmed !== '') {
    return num
  }
  
  // If not a valid number, return as string
  return trimmed
}

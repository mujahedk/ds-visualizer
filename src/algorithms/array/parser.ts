import { ArrayCommand } from './types'

/**
 * Parse array algorithm input into commands
 * Accepts various formats:
 * - insert index=3 value=42
 * - insert 3 42
 * - insert (3,42)
 * - delete index=2 OR delete 2
 * - reset
 * Multiple commands separated by semicolon or newline
 */
export function parseArrayInput(input: string): ArrayCommand[] {
  const commands: ArrayCommand[] = []
  
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

function parseSingleCommand(input: string): ArrayCommand | null {
  const trimmed = input.trim().toLowerCase()
  
  if (trimmed === 'reset') {
    return { type: 'reset' }
  }
  
  if (trimmed.startsWith('delete')) {
    return parseDeleteCommand(trimmed)
  }
  
  if (trimmed.startsWith('insert')) {
    return parseInsertCommand(trimmed)
  }
  
  throw new Error(`Invalid command: "${input}". Expected: insert, delete, or reset. Examples: insert 0 5, delete 2, reset`)
}

function parseDeleteCommand(input: string): ArrayCommand {
  // Format: delete index=2 OR delete 2
  const parts = input.split(/\s+/)
  
  if (parts.length < 2) {
    throw new Error(`Invalid delete command: "${input}". Expected: delete <index>. Examples: delete 2, delete index=2`)
  }
  
  let index: number
  
  if (parts[1].includes('=')) {
    // Format: delete index=2
    const [key, value] = parts[1].split('=')
    if (key !== 'index') {
      throw new Error(`Invalid delete command: "${input}". Expected: delete index=<number>. Got: delete ${key}=${value}`)
    }
    index = parseInt(value)
  } else {
    // Format: delete 2
    index = parseInt(parts[1])
  }
  
  // Check if the original string contains a decimal point (which would make it non-integer)
  if (parts[1].includes('.') || isNaN(index) || index < 0 || !Number.isInteger(index)) {
    throw new Error(`Invalid index in delete command: "${input}". Index must be a non-negative integer. Got: ${parts[1]}`)
  }
  
  return { type: 'delete', index }
}

function parseInsertCommand(input: string): ArrayCommand {
  // Format: insert index=3 value=42 OR insert 3 42 OR insert (3,42)
  const parts = input.split(/\s+/)
  
  if (parts.length < 2) {
    throw new Error(`Invalid insert command: "${input}". Expected: insert <index> <value>. Examples: insert 0 5, insert index=0 value=5, insert (0,5)`)
  }
  
  let index: number
  let value: number | string
  
  if (parts[1].includes('=')) {
    // Format: insert index=3 value=42
    const indexPart = parts.find(part => part.startsWith('index='))
    const valuePart = parts.find(part => part.startsWith('value='))
    
    if (!indexPart || !valuePart) {
      throw new Error(`Invalid insert command: "${input}". Expected: insert index=<number> value=<value>. Examples: insert index=0 value=5`)
    }
    
    const indexValue = indexPart.split('=')[1]
    const valueValue = valuePart.split('=')[1]
    
    index = parseInt(indexValue)
    value = parseValue(valueValue)
  } else if (parts[1].startsWith('(') && parts[1].endsWith(')')) {
    // Format: insert (3,42)
    const content = parts[1].slice(1, -1)
    const [indexStr, valueStr] = content.split(',').map(s => s.trim())
    
    if (!indexStr || !valueStr) {
      throw new Error(`Invalid insert command: "${input}". Expected: insert (<index>,<value>). Examples: insert (0,5)`)
    }
    
    index = parseInt(indexStr)
    value = parseValue(valueStr)
    
    // Check if the index string contains a decimal point
    if (indexStr.includes('.') || isNaN(index) || index < 0 || !Number.isInteger(index)) {
      throw new Error(`Invalid index in insert command: "${input}". Index must be a non-negative integer. Got: ${indexStr}`)
    }
  } else {
    // Format: insert 3 42
    if (parts.length < 3) {
      throw new Error(`Invalid insert command: "${input}". Expected: insert <index> <value>. Examples: insert 0 5`)
    }
    
    index = parseInt(parts[1])
    value = parseValue(parts[2])
    
    // Check if the original string contains a decimal point (which would make it non-integer)
    if (parts[1].includes('.') || isNaN(index) || index < 0 || !Number.isInteger(index)) {
      throw new Error(`Invalid index in insert command: "${input}". Index must be a non-negative integer. Got: ${parts[1]}`)
    }
  }
  
  return { type: 'insert', index, value }
}

function parseValue(valueStr: string): number | string {
  // Try to parse as number first
  const num = parseFloat(valueStr)
  if (!isNaN(num) && valueStr.trim() !== '') {
    return num
  }
  
  // If not a valid number, return as string
  return valueStr
}

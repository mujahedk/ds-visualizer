import { BSTCommand } from './types'

/**
 * Parse BST algorithm input into commands
 * Accepts various formats:
 * - insert 8
 * - insert key=8
 * - delete 3
 * - delete key=3
 * - reset
 * Multiple commands separated by semicolon or newline
 */
export function parseBSTInput(input: string): BSTCommand[] {
  const commands: BSTCommand[] = []
  
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

function parseSingleCommand(input: string): BSTCommand | null {
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
  
  throw new Error(`Invalid command: "${input}". Expected: insert, delete, or reset. Examples: insert 8, delete 3, reset`)
}

function parseDeleteCommand(input: string): BSTCommand {
  // Format: delete 3 OR delete key=3
  const parts = input.split(/\s+/)
  
  if (parts.length < 2) {
    throw new Error(`Invalid delete command: "${input}". Expected: delete <key>. Examples: delete 3, delete key=3`)
  }
  
  let key: number
  
  if (parts[1].includes('=')) {
    // Format: delete key=3
    const [keyName, value] = parts[1].split('=')
    if (keyName !== 'key') {
      throw new Error(`Invalid delete command: "${input}". Expected: delete key=<number>. Got: delete ${keyName}=${value}`)
    }
    key = parseFloat(value)
  } else {
    // Format: delete 3
    key = parseFloat(parts[1])
  }
  
  if (isNaN(key) || !Number.isInteger(key)) {
    throw new Error(`Invalid key in delete command: "${input}". Key must be an integer. Got: ${parts[1]}`)
  }
  
  return { type: 'delete', key }
}

function parseInsertCommand(input: string): BSTCommand {
  // Format: insert 8 OR insert key=8
  const parts = input.split(/\s+/)
  
  if (parts.length < 2) {
    throw new Error(`Invalid insert command: "${input}". Expected: insert <key>. Examples: insert 8, insert key=8`)
  }
  
  let key: number
  
  if (parts[1].includes('=')) {
    // Format: insert key=8
    const [keyName, value] = parts[1].split('=')
    if (keyName !== 'key') {
      throw new Error(`Invalid insert command: "${input}". Expected: insert key=<number>. Got: insert ${keyName}=${value}`)
    }
    key = parseFloat(value)
  } else {
    // Format: insert 8
    key = parseFloat(parts[1])
  }
  
  if (isNaN(key) || !Number.isInteger(key)) {
    throw new Error(`Invalid key in insert command: "${input}". Key must be an integer. Got: ${parts[1]}`)
  }
  
  return { type: 'insert', key }
}

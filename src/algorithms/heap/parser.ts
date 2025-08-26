import { HeapCommand } from './types'

/**
 * Parse heap commands from input string
 * Supports: insert 5,1,9 (commas/whitespace tolerated), pop 2 (repeat), and reset
 */
export function parseHeapInput(input: string): HeapCommand[] {
  const commands: HeapCommand[] = []
  const trimmed = input.trim()
  
  if (!trimmed) return commands

  // Split by semicolon or newline for multiple commands
  const commandStrings = trimmed.split(/[;\n]/).map(s => s.trim()).filter(Boolean)

  for (const commandStr of commandStrings) {
    const parts = commandStr.split(/\s+/).filter(Boolean)
    if (parts.length === 0) continue

    const commandType = parts[0].toLowerCase()

    switch (commandType) {
      case 'insert':
        // Handle multiple values: insert 5,1,9 or insert 5 1 9
        const values = parts.slice(1)
        for (const valueStr of values) {
          // Split by comma if present
          const commaValues = valueStr.split(',').map(v => v.trim()).filter(Boolean)
          for (const val of commaValues) {
            const num = parseFloat(val)
            if (!isNaN(num) && Number.isInteger(num)) {
              commands.push({ type: 'insert', value: num })
            }
          }
        }
        break

      case 'pop':
        // Handle repeat count: pop 2 means pop twice
        const repeatCount = parts.length > 1 ? parseInt(parts[1]) : 1
        if (!isNaN(repeatCount) && repeatCount > 0) {
          for (let i = 0; i < repeatCount; i++) {
            commands.push({ type: 'pop' })
          }
        } else {
          commands.push({ type: 'pop' })
        }
        break

      case 'reset':
        commands.push({ type: 'reset' })
        break

      // Ignore unknown commands
    }
  }

  return commands
}

/**
 * Parse a single heap command (for testing or direct use)
 */
export function parseSingleHeapCommand(input: string): HeapCommand | null {
  const commands = parseHeapInput(input)
  return commands.length > 0 ? commands[0] : null
}

/**
 * Validate if a string contains valid heap commands
 */
export function isValidHeapInput(input: string): boolean {
  const commands = parseHeapInput(input)
  return commands.length > 0
}

import { AVLCommand } from './types'

export function parseAVLInput(input: string): AVLCommand[] {
  const commands: AVLCommand[] = []
  const lines = input.split(/[;\n,]/).map(line => line.trim()).filter(line => line.length > 0)
  
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase()
    
    if (trimmed === 'reset') {
      commands.push({ type: 'reset' })
      continue
    }
    
    // Parse insert commands
    if (trimmed.startsWith('insert ')) {
      const keyPart = trimmed.substring(7).trim()
      let key: number
      
      if (keyPart.startsWith('key=')) {
        key = parseInt(keyPart.substring(4))
      } else {
        key = parseInt(keyPart)
      }
      
      if (isNaN(key)) {
        throw new Error(`Invalid key in insert command: "${line}". Examples: insert 42, insert key=42`)
      }
      
      commands.push({ type: 'insert', key })
      continue
    }
    
    // Parse delete commands
    if (trimmed.startsWith('delete ')) {
      const keyPart = trimmed.substring(7).trim()
      let key: number
      
      if (keyPart.startsWith('key=')) {
        key = parseInt(keyPart.substring(4))
      } else {
        key = parseInt(keyPart)
      }
      
      if (isNaN(key)) {
        throw new Error(`Invalid key in delete command: "${line}". Examples: delete 17, delete key=17`)
      }
      
      commands.push({ type: 'delete', key })
      continue
    }
    
    throw new Error(`Invalid command: "${line}". Valid commands: insert <key>, delete <key>, reset. Examples: insert 30, delete 17, reset`)
  }
  
  return commands
}

import { Frame } from '../types'
import { StackState, StackCommand } from './types'

/**
 * Deep clone an object to ensure immutability
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Run stack commands and generate frames showing the step-by-step process
 * @param initial - Initial stack items (defaults to empty array)
 * @param commands - Array of commands to execute
 * @returns Array of frames showing each step
 */
export function runStackCommands(
  initial: (number | string)[] = [], 
  commands: StackCommand[]
): Frame<StackState>[] {
  const frames: Frame<StackState>[] = []
  let currentState: StackState = {
    items: [...initial],
    op: null,
    highlightIndex: null
  }
  
  let step = 1
  
  // Add initial frame if there are initial values
  if (initial.length > 0) {
    frames.push({
      state: deepClone(currentState),
      meta: { step: step++, label: `Initial stack: [${initial.join(', ')}]` }
    })
  }
  
  for (const command of commands) {
    const commandFrames = executeCommand(currentState, command, step)
    frames.push(...commandFrames)
    
    // Update current state to the last frame's state
    if (commandFrames.length > 0) {
      currentState = deepClone(commandFrames[commandFrames.length - 1].state)
      step = commandFrames[commandFrames.length - 1].meta.step + 1
    }
  }
  
  return frames
}

function executeCommand(
  currentState: StackState, 
  command: StackCommand, 
  startStep: number
): Frame<StackState>[] {
  const frames: Frame<StackState>[] = []
  let step = startStep
  
  switch (command.type) {
    case 'push':
      frames.push(...executePush(currentState, command, step))
      break
    case 'pop':
      frames.push(...executePop(currentState, command, step))
      break
    case 'reset':
      frames.push(executeReset(step))
      break
  }
  
  return frames
}

function executePush(
  currentState: StackState, 
  command: { type: 'push'; value: number | string }, 
  startStep: number
): Frame<StackState>[] {
  const frames: Frame<StackState>[] = []
  let step = startStep
  const { value } = command
  
  // Pre-frame: op:"push", highlightIndex = items.length (incoming top slot), label "push v"
  frames.push({
    state: {
      items: [...currentState.items],
      op: 'push',
      highlightIndex: currentState.items.length
    },
    meta: { step: step++, label: `push ${value}` }
  })
  
  // Post-frame: items with v appended, highlightIndex = items.length-1, label "placed v on top"
  const newItems = [...currentState.items, value]
  frames.push({
    state: {
      items: newItems,
      op: 'push',
      highlightIndex: newItems.length - 1
    },
    meta: { step: step++, label: `placed ${value} on top` }
  })
  
  return frames
}

function executePop(
  currentState: StackState, 
  command: { type: 'pop'; count?: number }, 
  startStep: number
): Frame<StackState>[] {
  const frames: Frame<StackState>[] = []
  let step = startStep
  const count = command.count || 1
  
  let items = [...currentState.items]
  
  for (let i = 0; i < count; i++) {
    // If empty: emit info frame label:"stack empty"; continue
    if (items.length === 0) {
      frames.push({
        state: {
          items: [],
          op: 'pop',
          highlightIndex: null
        },
        meta: { step: step++, label: 'stack empty' }
      })
      continue
    }
    
    // Pre-frame: op:"pop", highlightIndex = items.length-1, label "pop (top=i)"
    const topIndex = items.length - 1
    frames.push({
      state: {
        items: [...items],
        op: 'pop',
        highlightIndex: topIndex
      },
      meta: { step: step++, label: `pop (top=${topIndex})` }
    })
    
    // Post-frame: remove last element, clear highlight, label "removed top"
    const removedValue = items[items.length - 1]
    items = items.slice(0, -1) // Remove last element
    
    frames.push({
      state: {
        items: items,
        op: 'pop',
        highlightIndex: null
      },
      meta: { step: step++, label: `removed top (${removedValue})` }
    })
  }
  
  return frames
}

function executeReset(step: number): Frame<StackState> {
  return {
    state: {
      items: [],
      op: null,
      highlightIndex: null
    },
    meta: { step, label: 'reset' }
  }
}

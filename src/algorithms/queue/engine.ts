import { Frame } from '../types'
import { QueueState, QueueCommand } from './types'

/**
 * Deep clone an object to ensure immutability
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Run queue commands and generate frames showing the step-by-step process
 * @param initial - Initial queue items (defaults to empty array)
 * @param commands - Array of commands to execute
 * @returns Array of frames showing each step
 */
export function runQueueCommands(
  initial: (number | string)[] = [], 
  commands: QueueCommand[]
): Frame<QueueState>[] {
  const frames: Frame<QueueState>[] = []
  let currentState: QueueState = {
    items: [...initial],
    op: null,
    highlightIndex: null,
    frontIndex: 0
  }
  
  let step = 1
  
  // Add initial frame if there are initial values
  if (initial.length > 0) {
    frames.push({
      state: deepClone(currentState),
      meta: { step: step++, label: `Initial queue: [${initial.join(', ')}]` }
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
  currentState: QueueState, 
  command: QueueCommand, 
  startStep: number
): Frame<QueueState>[] {
  const frames: Frame<QueueState>[] = []
  let step = startStep
  
  switch (command.type) {
    case 'enqueue':
      frames.push(...executeEnqueue(currentState, command, step))
      break
    case 'dequeue':
      frames.push(...executeDequeue(currentState, command, step))
      break
    case 'reset':
      frames.push(executeReset(step))
      break
  }
  
  return frames
}

function executeEnqueue(
  currentState: QueueState, 
  command: { type: 'enqueue'; value: number | string }, 
  startStep: number
): Frame<QueueState>[] {
  const frames: Frame<QueueState>[] = []
  let step = startStep
  const { value } = command
  
  // Pre-frame: op:"enqueue", highlightIndex = items.length (incoming slot), label "enqueue v"
  frames.push({
    state: {
      items: [...currentState.items],
      op: 'enqueue',
      highlightIndex: currentState.items.length,
      frontIndex: currentState.frontIndex
    },
    meta: { step: step++, label: `enqueue ${value}` }
  })
  
  // Post-frame: items with v appended, highlightIndex = items.length-1, label "placed v at rear"
  const newItems = [...currentState.items, value]
  frames.push({
    state: {
      items: newItems,
      op: 'enqueue',
      highlightIndex: newItems.length - 1,
      frontIndex: currentState.frontIndex
    },
    meta: { step: step++, label: `placed ${value} at rear` }
  })
  
  return frames
}

function executeDequeue(
  currentState: QueueState, 
  command: { type: 'dequeue'; count?: number }, 
  startStep: number
): Frame<QueueState>[] {
  const frames: Frame<QueueState>[] = []
  let step = startStep
  const count = command.count || 1
  
  let items = [...currentState.items]
  let frontIndex = currentState.frontIndex
  
  for (let i = 0; i < count; i++) {
    // If empty: emit a no-op info frame label:"queue empty" and continue
    if (items.length === 0) {
      frames.push({
        state: {
          items: [],
          op: 'dequeue',
          highlightIndex: null,
          frontIndex: 0
        },
        meta: { step: step++, label: 'queue empty' }
      })
      continue
    }
    
    // Pre-frame: op:"dequeue", highlightIndex=0, label "dequeue (front=0)"
    frames.push({
      state: {
        items: [...items],
        op: 'dequeue',
        highlightIndex: 0,
        frontIndex: frontIndex
      },
      meta: { step: step++, label: 'dequeue (front=0)' }
    })
    
    // Post-frame: remove the first element (compact to keep frontIndex=0), label "removed front"
    const removedValue = items[0]
    items = items.slice(1) // Remove first element
    frontIndex = 0 // Keep frontIndex at 0 after compaction
    
    frames.push({
      state: {
        items: items,
        op: 'dequeue',
        highlightIndex: null,
        frontIndex: frontIndex
      },
      meta: { step: step++, label: `removed front (${removedValue})` }
    })
  }
  
  return frames
}

function executeReset(step: number): Frame<QueueState> {
  return {
    state: {
      items: [],
      op: null,
      highlightIndex: null,
      frontIndex: 0
    },
    meta: { step, label: 'reset' }
  }
}

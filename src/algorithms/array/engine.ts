import { Frame } from '../types'
import { ArrayState, ArrayCommand } from './types'

/**
 * Deep clone an object to ensure immutability
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Run array commands and generate frames showing the step-by-step process
 * @param initial - Initial array values (defaults to empty array)
 * @param commands - Array of commands to execute
 * @returns Array of frames showing each step
 */
export function runArrayCommands(
  initial: (number | string)[] = [], 
  commands: ArrayCommand[]
): Frame<ArrayState>[] {
  const frames: Frame<ArrayState>[] = []
  let currentState: ArrayState = {
    values: [...initial],
    highlight: [],
    focusIndex: null,
    op: null
  }
  
  let step = 1
  
  // Add initial frame if there are initial values
  if (initial.length > 0) {
    frames.push({
      state: deepClone(currentState),
      meta: { step: step++, label: `Initial array: [${initial.join(', ')}]` }
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
  currentState: ArrayState, 
  command: ArrayCommand, 
  startStep: number
): Frame<ArrayState>[] {
  const frames: Frame<ArrayState>[] = []
  let step = startStep
  
  switch (command.type) {
    case 'insert':
      frames.push(...executeInsert(currentState, command, step))
      break
    case 'delete':
      frames.push(...executeDelete(currentState, command, step))
      break
    case 'reset':
      frames.push(executeReset(step))
      break
  }
  
  return frames
}

function executeInsert(
  currentState: ArrayState, 
  command: { type: 'insert'; index: number; value: number | string }, 
  startStep: number
): Frame<ArrayState>[] {
  const frames: Frame<ArrayState>[] = []
  let step = startStep
  const { index, value } = command
  
  // Validate index
  if (index > currentState.values.length) {
    throw new Error(`Cannot insert at index ${index}: array length is ${currentState.values.length}`)
  }
  
  // Frame 1: Focus target index with op: "insert"
  frames.push({
    state: {
      values: [...currentState.values],
      highlight: [],
      focusIndex: index,
      op: 'insert'
    },
    meta: { step: step++, label: `Focusing on index ${index} for insertion of ${value}` }
  })
  
  // Frames for shifting elements to the right (from end → index)
  const values = [...currentState.values]
  for (let i = values.length - 1; i >= index; i--) {
    const shiftedValue = values[i]
    values[i + 1] = shiftedValue
    
    frames.push({
      state: {
        values: [...values],
        highlight: [i, i + 1],
        focusIndex: index,
        op: 'insert'
      },
      meta: { step: step++, label: `Shift values[${i}] → values[${i + 1}]` }
    })
  }
  
  // Final frame: place value at index
  values[index] = value
  
  frames.push({
    state: {
      values: [...values],
      highlight: [index],
      focusIndex: index,
      op: 'insert'
    },
    meta: { step: step++, label: `Place ${value} at index ${index}` }
  })
  
  return frames
}

function executeDelete(
  currentState: ArrayState, 
  command: { type: 'delete'; index: number }, 
  startStep: number
): Frame<ArrayState>[] {
  const frames: Frame<ArrayState>[] = []
  let step = startStep
  const { index } = command
  
  // Validate index
  if (index >= currentState.values.length) {
    throw new Error(`Cannot delete at index ${index}: array length is ${currentState.values.length}`)
  }
  
  // Frame 1: Focus target index with op: "delete"
  frames.push({
    state: {
      values: [...currentState.values],
      highlight: [],
      focusIndex: index,
      op: 'delete'
    },
    meta: { step: step++, label: `Focusing on index ${index} for deletion` }
  })
  
  // Frames for shifting elements to the left (from index+1 → end)
  const values = [...currentState.values]
  for (let i = index + 1; i < values.length; i++) {
    const shiftedValue = values[i]
    values[i - 1] = shiftedValue
    
    frames.push({
      state: {
        values: [...values],
        highlight: [i, i - 1],
        focusIndex: index,
        op: 'delete'
      },
      meta: { step: step++, label: `Shift values[${i}] → values[${i - 1}]` }
    })
  }
  
  // Remove the last duplicate slot
  values.pop()
  
  frames.push({
    state: {
      values: [...values],
      highlight: [],
      focusIndex: null,
      op: null
    },
    meta: { step: step++, label: `Delete completed at index ${index}` }
  })
  
  return frames
}

function executeReset(step: number): Frame<ArrayState> {
  return {
    state: {
      values: [],
      highlight: [],
      focusIndex: null,
      op: null
    },
    meta: { step, label: 'Reset to empty array' }
  }
}

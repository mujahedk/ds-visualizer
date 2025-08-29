import { Frame } from '../types'
import { BSTState, BSTCommand, BSTNode } from './types'

let nextNodeId = 1

function generateNodeId(): string {
  return `n_${nextNodeId++}`
}

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T
  }
  
  const cloned = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

function createEmptyState(): BSTState {
  return {
    nodes: {},
    root: undefined,
    highlight: [],
    compare: null,
    relink: null,
    op: null,
    focusKey: null
  }
}

function createNode(key: number, parent?: string): BSTNode {
  return {
    id: generateNodeId(),
    key,
    left: undefined,
    right: undefined,
    parent
  }
}

function findNode(state: BSTState, key: number): { node: BSTNode | null; parent: BSTNode | null; side: 'left' | 'right' | null } {
  if (!state.root) {
    return { node: null, parent: null, side: null }
  }
  
  let current: BSTNode | null = state.nodes[state.root]
  let parent: BSTNode | null = null
  let side: 'left' | 'right' | null = null
  
  while (current) {
    if (key === current.key) {
      return { node: current, parent, side }
    }
    
    parent = current
    if (key < current.key) {
      side = 'left'
      current = current.left ? state.nodes[current.left] : null
    } else {
      side = 'right'
      current = current.right ? state.nodes[current.right] : null
    }
  }
  
  return { node: null, parent, side }
}

function findInOrderSuccessor(state: BSTState, nodeId: string): BSTNode | null {
  const node = state.nodes[nodeId]
  if (!node || !node.right) {
    return null
  }
  
  let current = state.nodes[node.right]
  while (current.left) {
    current = state.nodes[current.left]
  }
  
  return current
}



function deleteNodeById(state: BSTState, nodeId: string, startStep: number): Frame<BSTState>[] {
  const frames: Frame<BSTState>[] = []
  let step = startStep
  
  const targetNode = state.nodes[nodeId]
  if (!targetNode) {
    return frames
  }
  
  const targetParent = targetNode.parent ? state.nodes[targetNode.parent] : null
  const targetSide = targetParent ? (targetParent.left === nodeId ? 'left' : 'right') : null
  
  // Handle different deletion cases
  const isLeaf = !targetNode.left && !targetNode.right
  const hasOneChild = (targetNode.left && !targetNode.right) || (!targetNode.left && targetNode.right)
  
  if (isLeaf) {
    // Leaf node
    if (!targetParent) {
      // Root node
      const finalState = deepClone(state)
      delete finalState.nodes[nodeId]
      finalState.root = undefined
      finalState.highlight = []
      finalState.op = null
      finalState.focusKey = null
      
      frames.push({
        state: finalState,
        meta: {
          step,
          label: `Delete complete: removed root ${targetNode.key}`
        }
      })
    } else {
      // Remove child link from parent
      const finalState = deepClone(state)
      delete finalState.nodes[nodeId]
      
      // Update parent's left/right pointer to undefined
      if (targetSide === 'left') {
        finalState.nodes[targetParent.id].left = undefined
      } else {
        finalState.nodes[targetParent.id].right = undefined
      }
      
      finalState.highlight = [targetParent.id]
      finalState.relink = { parent: targetParent.id, child: undefined, side: targetSide! }
      
      frames.push({
        state: finalState,
        meta: {
          step,
          label: `relink parent ${targetParent.key}.${targetSide} = null`
        }
      })
      step++
      
      // Clear transient flags
      const completeState = deepClone(finalState)
      completeState.highlight = []
      completeState.relink = null
      completeState.op = null
      completeState.focusKey = null
      
      frames.push({
        state: completeState,
        meta: {
          step,
          label: `Delete complete: ${targetNode.key}`
        }
      })
    }
  } else if (hasOneChild) {
    // One child
    const childId = targetNode.left || targetNode.right!
    const child = state.nodes[childId]
    
    if (!targetParent) {
      // Root node
      const finalState = deepClone(state)
      delete finalState.nodes[nodeId]
      finalState.root = childId
      finalState.nodes[childId].parent = undefined
      finalState.highlight = [childId]
      finalState.relink = { parent: undefined, child: childId, side: undefined }
      
      frames.push({
        state: finalState,
        meta: {
          step,
          label: `relink root = ${child.key}`
        }
      })
      step++
    } else {
      // Bypass removed node
      const finalState = deepClone(state)
      delete finalState.nodes[nodeId]
      
      // Update parent's left/right pointer to point to the child
      if (targetSide === 'left') {
        finalState.nodes[targetParent.id].left = childId
      } else {
        finalState.nodes[targetParent.id].right = childId
      }
      
      finalState.nodes[childId].parent = targetParent.id
      finalState.highlight = [targetParent.id, childId]
      finalState.relink = { parent: targetParent.id, child: childId, side: targetSide! }
      
      frames.push({
        state: finalState,
        meta: {
          step,
          label: `relink parent ${targetParent.key}.${targetSide} = ${child.key}`
        }
      })
      step++
    }
    
    // Clear transient flags
    const completeState = deepClone(frames[frames.length - 1].state)
    completeState.highlight = []
    completeState.relink = null
    completeState.op = null
    completeState.focusKey = null
    
    frames.push({
      state: completeState,
      meta: {
        step,
        label: `Delete complete: ${targetNode.key}`
      }
    })
  }
  
  return frames
}

export function runBSTCommands(commands: BSTCommand[]): Frame<BSTState>[] {
  const frames: Frame<BSTState>[] = []
  let currentState = createEmptyState()
  let step = 0
  
  for (const command of commands) {
    const commandFrames = executeCommand(currentState, command, step + 1)
    frames.push(...commandFrames)
    
    if (commandFrames.length > 0) {
      currentState = deepClone(commandFrames[commandFrames.length - 1].state)
      step = commandFrames[commandFrames.length - 1].meta.step
    }
  }
  
  return frames
}

function executeCommand(currentState: BSTState, command: BSTCommand, startStep: number): Frame<BSTState>[] {
  const frames: Frame<BSTState>[] = []
  
  switch (command.type) {
    case 'insert':
      frames.push(...executeInsert(currentState, command.key, startStep))
      break
    case 'delete':
      frames.push(...executeDelete(currentState, command.key, startStep))
      break
    case 'reset':
      frames.push(executeReset(startStep))
      break
  }
  
  return frames
}

function executeInsert(currentState: BSTState, key: number, startStep: number): Frame<BSTState>[] {
  const frames: Frame<BSTState>[] = []
  let step = startStep
  
  // Start frame: op:"insert", focusKey:k, highlight root if exists
  const startState = deepClone(currentState)
  startState.op = 'insert'
  startState.focusKey = key
  startState.highlight = currentState.root ? [currentState.root] : []
  startState.compare = null
  startState.relink = null
  
  frames.push({
    state: startState,
    meta: {
      step,
      label: `Start inserting ${key}`
    }
  })
  step++
  
  if (!currentState.root) {
    // Empty tree, create root
    const newNode = createNode(key)
    const finalState = deepClone(startState)
    finalState.nodes[newNode.id] = newNode
    finalState.root = newNode.id
    finalState.highlight = [newNode.id]
    finalState.relink = { parent: undefined, child: newNode.id, side: undefined }
    finalState.op = null
    finalState.focusKey = null
    
    frames.push({
      state: finalState,
      meta: {
        step,
        label: `Insert complete: ${key} becomes root`
      }
    })
    
    return frames
  }
  
  // Traverse to find insertion point
  let currentId = currentState.root
  
  while (currentId) {
    const current = currentState.nodes[currentId]
    
    // Check if key already exists
    if (key === current.key) {
      // Key already exists, don't insert duplicate
      const duplicateState = deepClone(startState)
      duplicateState.highlight = [current.id]
      duplicateState.compare = null
      duplicateState.op = null
      duplicateState.focusKey = null
      
      frames.push({
        state: duplicateState,
        meta: {
          step,
          label: `Key ${key} already exists, skipping insertion`
        }
      })
      
      return frames
    }
    
    // Emit comparison frame
    const compareState = deepClone(startState)
    compareState.highlight = [current.id]
    compareState.compare = { from: current.id, to: key < current.key ? 'left' : 'right' }
    
    frames.push({
      state: compareState,
      meta: {
        step,
        label: `Compare ${key} ${key < current.key ? '<' : '>'} ${current.key} → going ${key < current.key ? 'left' : 'right'}`
      }
    })
    step++
    
    if (key < current.key) {
      if (!current.left) {
        // Insert as left child
        const newNode = createNode(key, current.id)
        const relinkState = deepClone(compareState)
        relinkState.nodes[newNode.id] = newNode
        relinkState.highlight = [newNode.id]
        relinkState.relink = { parent: current.id, child: newNode.id, side: 'left' }
        relinkState.compare = null
        relinkState.op = null
        relinkState.focusKey = null
        
        frames.push({
          state: relinkState,
          meta: {
            step,
            label: `relink parent ${current.key}.left = ${key}`
          }
        })
        step++
        
        // Update the actual tree structure in the state
        relinkState.nodes[current.id].left = newNode.id
        
        break
      }
      currentId = current.left
    } else {
      if (!current.right) {
        // Insert as right child
        const newNode = createNode(key, current.id)
        const relinkState = deepClone(compareState)
        relinkState.nodes[newNode.id] = newNode
        relinkState.highlight = [newNode.id]
        relinkState.relink = { parent: current.id, child: newNode.id, side: 'right' }
        relinkState.compare = null
        relinkState.op = null
        relinkState.focusKey = null
        
        frames.push({
          state: relinkState,
          meta: {
            step,
            label: `relink parent ${current.key}.right = ${key}`
          }
        })
        step++
        
        // Update the actual tree structure in the state
        relinkState.nodes[current.id].right = newNode.id
        
        break
      }
      currentId = current.right
    }
  }
  
  // Final frame: label:"insert complete", clear transient flags
  const finalState = deepClone(frames[frames.length - 1].state)
  finalState.highlight = []
  finalState.relink = null
  
  frames.push({
    state: finalState,
    meta: {
      step,
      label: `Insert complete: ${key}`
    }
  })
  
  return frames
}

function executeDelete(currentState: BSTState, key: number, startStep: number): Frame<BSTState>[] {
  const frames: Frame<BSTState>[] = []
  let step = startStep
  
  // Start frame: op:"delete", focusKey:k
  const startState = deepClone(currentState)
  startState.op = 'delete'
  startState.focusKey = key
  startState.highlight = []
  startState.compare = null
  startState.relink = null
  
  frames.push({
    state: startState,
    meta: {
      step,
      label: `Start deleting ${key}`
    }
  })
  step++
  
  if (!currentState.root) {
    // Empty tree
    const finalState = deepClone(startState)
    finalState.op = null
    finalState.focusKey = null
    
    frames.push({
      state: finalState,
      meta: {
        step,
        label: `Delete complete: tree is empty`
      }
    })
    
    return frames
  }
  
  // Find the node to delete
  const { node: targetNode, parent: targetParent, side: targetSide } = findNode(currentState, key)
  
  if (!targetNode) {
    // Key not found
    const finalState = deepClone(startState)
    finalState.op = null
    finalState.focusKey = null
    
    frames.push({
      state: finalState,
      meta: {
        step,
        label: `Delete complete: ${key} not found`
      }
    })
    
    return frames
  }
  
  // Highlight the target node
  const targetState = deepClone(startState)
  targetState.highlight = [targetNode.id]
  
  frames.push({
    state: targetState,
      meta: {
        step,
        label: `Found node to delete: ${key}`
      }
    })
  step++
  
  // Handle different deletion cases
  const isLeaf = !targetNode.left && !targetNode.right
  const hasOneChild = (targetNode.left && !targetNode.right) || (!targetNode.left && targetNode.right)
  
  if (isLeaf) {
    // Leaf node
    if (!targetParent) {
      // Root node
      const finalState = deepClone(targetState)
      delete finalState.nodes[targetNode.id]
      finalState.root = undefined
      finalState.highlight = []
      finalState.op = null
      finalState.focusKey = null
      
      frames.push({
        state: finalState,
        meta: {
          step,
          label: `Delete complete: removed root ${key}`
        }
      })
    } else {
      // Remove child link from parent
      const finalState = deepClone(targetState)
      delete finalState.nodes[targetNode.id]
      
      // Update parent's left/right pointer to undefined
      if (targetSide === 'left') {
        finalState.nodes[targetParent.id].left = undefined
      } else {
        finalState.nodes[targetParent.id].right = undefined
      }
      
      finalState.highlight = [targetParent.id]
      finalState.relink = { parent: targetParent.id, child: undefined, side: targetSide! }
      
      frames.push({
        state: finalState,
        meta: {
          step,
          label: `relink parent ${targetParent.key}.${targetSide} = null`
        }
      })
      step++
      
      // Clear transient flags
      const completeState = deepClone(finalState)
      completeState.highlight = []
      completeState.relink = null
      completeState.op = null
      completeState.focusKey = null
      
      frames.push({
        state: completeState,
        meta: {
          step,
          label: `Delete complete: ${key}`
        }
      })
    }
  } else if (hasOneChild) {
    // One child
    const childId = targetNode.left || targetNode.right!
    const child = currentState.nodes[childId]
    
    if (!targetParent) {
      // Root node
      const finalState = deepClone(targetState)
      delete finalState.nodes[targetNode.id]
      finalState.root = childId
      finalState.nodes[childId].parent = undefined
      finalState.highlight = [childId]
      finalState.relink = { parent: undefined, child: childId, side: undefined }
      
      frames.push({
        state: finalState,
        meta: {
          step,
          label: `relink root = ${child.key}`
        }
      })
      step++
    } else {
      // Bypass removed node
      const finalState = deepClone(targetState)
      delete finalState.nodes[targetNode.id]
      
      // Update parent's left/right pointer to point to the child
      if (targetSide === 'left') {
        finalState.nodes[targetParent.id].left = childId
      } else {
        finalState.nodes[targetParent.id].right = childId
      }
      
      finalState.nodes[childId].parent = targetParent.id
      finalState.highlight = [targetParent.id, childId]
      finalState.relink = { parent: targetParent.id, child: childId, side: targetSide! }
      
      frames.push({
        state: finalState,
        meta: {
          step,
          label: `relink parent ${targetParent.key}.${targetSide} = ${child.key}`
        }
      })
      step++
    }
    
    // Clear transient flags
    const completeState = deepClone(frames[frames.length - 1].state)
    completeState.highlight = []
    completeState.relink = null
    completeState.op = null
    completeState.focusKey = null
    
    frames.push({
      state: completeState,
      meta: {
        step,
        label: `Delete complete: ${key}`
      }
    })
  } else {
    // Two children - find in-order successor
    const successor = findInOrderSuccessor(currentState, targetNode.id)
    if (!successor) {
      // This shouldn't happen, but handle gracefully
      const finalState = deepClone(targetState)
      finalState.op = null
      finalState.focusKey = null
      
      frames.push({
        state: finalState,
        meta: {
          step,
          label: `Delete complete: ${key} (error finding successor)`
        }
      })
      
      return frames
    }
    
    // Emit frame: label:"swap with successor" highlighting both nodes
    const swapState = deepClone(targetState)
    swapState.highlight = [targetNode.id, successor.id]
    swapState.compare = null
    
    frames.push({
      state: swapState,
      meta: {
        step,
        label: `swap with successor: ${targetNode.key} ↔ ${successor.key}`
      }
    })
    step++
    
    // Swap keys (simpler than relinking)
    const swappedState = deepClone(swapState)
    swappedState.nodes[targetNode.id].key = successor.key
    swappedState.nodes[successor.id].key = targetNode.key
    
    frames.push({
      state: swappedState,
      meta: {
        step,
        label: `Keys swapped, now deleting successor ${successor.key}`
      }
    })
    step++
    
    // Now delete the successor (which is now a leaf or has one child)
    // Since we swapped keys, the successor now has the original target key
    // We need to delete the successor node by its ID, not by its key
    const successorFrames = deleteNodeById(swappedState, successor.id, step)
    frames.push(...successorFrames)
    
    // Clear transient flags from the final frame
    if (successorFrames.length > 0) {
      const finalState = deepClone(successorFrames[successorFrames.length - 1].state)
      finalState.highlight = []
      finalState.relink = null
      finalState.op = null
      finalState.focusKey = null
      
      frames.push({
        state: finalState,
        meta: {
          step: step + successorFrames.length,
          label: `Delete complete: ${key}`
        }
      })
    }
  }
  
  return frames
}

function executeReset(step: number): Frame<BSTState> {
  return {
    state: createEmptyState(),
    meta: {
      step,
      label: 'Reset to empty BST'
    }
  }
}

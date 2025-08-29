import { Frame } from '../types'
import { AVLState, AVLCommand, AVLNode } from './types'

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

function createEmptyState(): AVLState {
  return {
    nodes: {},
    root: undefined,
    highlight: [],
    compare: null,
    relink: null,
    rotation: null,
    op: null,
    focusKey: null,
    bfAt: null
  }
}

function createNode(key: number, parent?: string): AVLNode {
  return {
    id: generateNodeId(),
    key,
    left: undefined,
    right: undefined,
    parent,
    height: 1
  }
}

function getHeight(state: AVLState, nodeId?: string): number {
  if (!nodeId) return 0
  const node = state.nodes[nodeId]
  return node ? node.height : 0
}

function getBalanceFactor(state: AVLState, nodeId: string): number {
  const node = state.nodes[nodeId]
  if (!node) return 0
  
  const leftHeight = getHeight(state, node.left)
  const rightHeight = getHeight(state, node.right)
  
  return leftHeight - rightHeight
}

function updateHeight(state: AVLState, nodeId: string): void {
  const node = state.nodes[nodeId]
  if (!node) return
  
  const leftHeight = getHeight(state, node.left)
  const rightHeight = getHeight(state, node.right)
  
  node.height = Math.max(leftHeight, rightHeight) + 1
}

function findNode(state: AVLState, key: number): { node: AVLNode | null; parent: AVLNode | null; side: 'left' | 'right' | null } {
  if (!state.root) {
    return { node: null, parent: null, side: null }
  }
  
  let current: AVLNode | null = state.nodes[state.root]
  let parent: AVLNode | null = null
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

function findInOrderSuccessor(state: AVLState, nodeId: string): AVLNode | null {
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

function rotateRight(state: AVLState, zId: string): void {
  const z = state.nodes[zId]
  if (!z || !z.left) return
  
  const y = state.nodes[z.left]
  if (!y) return
  
  // Perform rotation
  const yRight = y.right
  
  // Update parent references
  if (z.parent) {
    const parent = state.nodes[z.parent]
    if (parent.left === zId) {
      parent.left = y.id
    } else {
      parent.right = y.id
    }
  } else {
    // z was root, update root
    state.root = y.id
  }
  
  y.parent = z.parent
  z.parent = y.id
  y.right = z.id
  z.left = yRight
  
  if (yRight) {
    state.nodes[yRight].parent = z.id
  }
  
  // Update heights
  updateHeight(state, z.id)
  updateHeight(state, y.id)
}

function rotateLeft(state: AVLState, zId: string): void {
  const z = state.nodes[zId]
  if (!z || !z.right) return
  
  const y = state.nodes[z.right]
  if (!y) return
  
  // Perform rotation
  const yLeft = y.left
  
  // Update parent references
  if (z.parent) {
    const parent = state.nodes[z.parent]
    if (parent.left === zId) {
      parent.left = y.id
    } else {
      parent.right = y.id
    }
  } else {
    // z was root, update root
    state.root = y.id
  }
  
  y.parent = z.parent
  z.parent = y.id
  y.left = z.id
  z.right = yLeft
  
  if (yLeft) {
    state.nodes[yLeft].parent = z.id
  }
  
  // Update heights
  updateHeight(state, z.id)
  updateHeight(state, y.id)
}

function insertNode(state: AVLState, key: number, startStep: number): Frame<AVLState>[] {
  const frames: Frame<AVLState>[] = []
  let step = startStep
  
  // If tree is empty, create root
  if (!state.root) {
    const newNode = createNode(key)
    state.nodes[newNode.id] = newNode
    state.root = newNode.id
    state.highlight = [newNode.id]
    state.op = 'insert'
    state.focusKey = key
    
    frames.push({
      state: deepClone(state),
      meta: { step: step++, label: `insert complete` }
    })
    
    return frames
  }
  
  // Find insertion position
  let current: AVLNode | null = state.nodes[state.root]
  let parent: AVLNode | null = null
  let side: 'left' | 'right' | undefined = undefined
  
  while (current) {
    // Emit comparison frame
    state.compare = { from: current.id, to: current.id }
    state.highlight = [current.id]
    frames.push({
      state: deepClone(state),
      meta: { step: step++, label: `compare ${key} ${key < current.key ? '<' : '>'} ${current.key} → ${key < current.key ? 'left' : 'right'}` }
    })
    
    if (key === current.key) {
      // Key already exists
      state.compare = null
      state.highlight = [current.id]
      frames.push({
        state: deepClone(state),
        meta: { step: step++, label: `key ${key} already exists` }
      })
      return frames
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
  
  // Create and insert new node
  const newNode = createNode(key, parent!.id)
  state.nodes[newNode.id] = newNode
  
  // Link to parent
  if (side === 'left') {
    parent!.left = newNode.id
  } else {
    parent!.right = newNode.id
  }
  
        // Emit relink frame
      state.relink = { parent: parent!.id, child: newNode.id, side: side! }
      state.highlight = [newNode.id, parent!.id]
      state.compare = null
      frames.push({
        state: deepClone(state),
        meta: { step: step++, label: `relink parent ${parent!.key}.${side} = ${newNode.key}` }
      })
  
  // Walk back up updating heights and checking balance
  let currentId: string | undefined = parent!.id
  while (currentId) {
    const node: AVLNode = state.nodes[currentId]!
    
    updateHeight(state, currentId)
    const newHeight = node.height
    const bf = getBalanceFactor(state, currentId)
    
    // Emit height update frame
    state.relink = null
    state.highlight = [currentId]
    state.bfAt = { id: currentId, bf }
    frames.push({
      state: deepClone(state),
      meta: { step: step++, label: `update height(${node.key})=${newHeight}, bf=${bf > 0 ? '+' : ''}${bf}` }
    })
    
    // Check if rotation is needed
    if (Math.abs(bf) > 1) {
      // Determine rotation type
      let rotationType: "LL" | "LR" | "RL" | "RR"
      
      if (bf > 1) { // Left heavy
        const leftChild = state.nodes[node.left!]
        const leftBF = getBalanceFactor(state, leftChild.id)
        
        if (leftBF >= 0) {
          rotationType = "LL"
        } else {
          rotationType = "LR"
        }
      } else { // Right heavy
        const rightChild = state.nodes[node.right!]
        const rightBF = getBalanceFactor(state, rightChild.id)
        
        if (rightBF <= 0) {
          rotationType = "RR"
        } else {
          rotationType = "RL"
        }
      }
      
      // Emit pre-rotation frame
      const z = node
      const y = bf > 1 ? state.nodes[z.left!] : state.nodes[z.right!]
      const x = bf > 1 
        ? (rotationType === "LL" ? state.nodes[y.left!] : state.nodes[y.right!])
        : (rotationType === "RR" ? state.nodes[y.right!] : state.nodes[y.left!])
      
      state.rotation = rotationType
      state.highlight = [z.id, y.id, x.id]
      state.bfAt = null
      frames.push({
        state: deepClone(state),
        meta: { step: step++, label: `rotation ${rotationType} at ${z.key}` }
      })
      
      // Perform rotation(s)
      if (rotationType === "LL") {
        rotateRight(state, z.id)
      } else if (rotationType === "RR") {
        rotateLeft(state, z.id)
      } else if (rotationType === "LR") {
        rotateLeft(state, y.id)
        rotateRight(state, z.id)
      } else if (rotationType === "RL") {
        rotateRight(state, y.id)
        rotateLeft(state, z.id)
      }
      
      // Emit post-rotation frame
      state.rotation = null
      state.highlight = [z.id, y.id, x.id]
      frames.push({
        state: deepClone(state),
        meta: { step: step++, label: `rotation ${rotationType} complete` }
      })
      
      // Update heights after rotation
      updateHeight(state, z.id)
      if (y.id !== z.id) {
        updateHeight(state, y.id)
      }
      if (x.id !== y.id && x.id !== z.id) {
        updateHeight(state, x.id)
      }
      
      // Emit final height update frame
      state.highlight = [z.id]
      const finalBF = getBalanceFactor(state, z.id)
      state.bfAt = { id: z.id, bf: finalBF }
      frames.push({
        state: deepClone(state),
        meta: { step: step++, label: `post-rotation height(${z.key})=${state.nodes[z.id].height}, bf=${finalBF > 0 ? '+' : ''}${finalBF}` }
      })
      
      break // No need to check further up after rotation
    }
    
    // Move up to parent
    currentId = node.parent || undefined
  }
  
  // Final frame
  state.highlight = []
  state.bfAt = null
  state.op = null
  state.focusKey = null
  frames.push({
    state: deepClone(state),
    meta: { step: step++, label: `insert complete` }
  })
  
  return frames
}

function deleteNode(state: AVLState, key: number, startStep: number): Frame<AVLState>[] {
  const frames: Frame<AVLState>[] = []
  let step = startStep
  
  // Find the node to delete
  const { node: targetNode, parent: targetParent, side: targetSide } = findNode(state, key)
  
  if (!targetNode) {
    // Key not found
    frames.push({
      state: deepClone(state),
      meta: { step: step++, label: `key ${key} not found` }
    })
    return frames
  }
  
  // Highlight the target node
  state.highlight = [targetNode.id]
  state.op = 'delete'
  state.focusKey = key
  frames.push({
    state: deepClone(state),
    meta: { step: step++, label: `found node to delete: ${key}` }
  })
  
  // Handle deletion based on number of children
  if (!targetNode.left && !targetNode.right) {
    // Leaf node
    if (targetParent) {
      if (targetSide === 'left') {
        targetParent.left = undefined
      } else {
        targetParent.right = undefined
      }
      
      // Emit relink frame
      state.relink = { parent: targetParent.id, child: undefined, side: targetSide! }
      frames.push({
        state: deepClone(state),
        meta: { step: step++, label: `relink parent ${targetParent.key}.${targetSide} = null` }
      })
    } else {
      // Root node
      state.root = undefined
    }
    
    delete state.nodes[targetNode.id]
    
  } else if (!targetNode.left || !targetNode.right) {
    // One child
    const childId = targetNode.left || targetNode.right!
    const child = state.nodes[childId]
    
    if (targetParent) {
      if (targetSide === 'left') {
        targetParent.left = childId
      } else {
        targetParent.right = childId
      }
      
      // Emit relink frame
      state.relink = { parent: targetParent.id, child: childId, side: targetSide! }
      frames.push({
        state: deepClone(state),
        meta: { step: step++, label: `relink parent ${targetParent.key}.${targetSide} = ${child.key}` }
      })
    } else {
      // Root node
      state.root = childId
    }
    
    child.parent = targetParent?.id
    delete state.nodes[targetNode.id]
    
  } else {
    // Two children - find successor and swap
    const successor = findInOrderSuccessor(state, targetNode.id)
    if (!successor) return frames
    
    // Highlight successor
    state.highlight = [targetNode.id, successor.id]
    frames.push({
      state: deepClone(state),
      meta: { step: step++, label: `found successor: ${successor.key}` }
    })
    
    // Swap keys
    const tempKey = targetNode.key
    targetNode.key = successor.key
    successor.key = tempKey
    
    // Now delete the successor (which is now a leaf or one-child node)
    const successorParent = successor.parent ? state.nodes[successor.parent] : null
    const successorSide = successorParent?.left === successor.id ? 'left' : 'right'
    
    if (successorParent) {
      if (successorSide === 'left') {
        successorParent.left = successor.right || successor.left
      } else {
        successorParent.right = successor.right || successor.left
      }
      
      if (successor.left) {
        state.nodes[successor.left].parent = successorParent.id
      }
      if (successor.right) {
        state.nodes[successor.right].parent = successorParent.id
      }
      
      // Emit relink frame
      state.relink = { parent: successorParent.id, child: successor.left || successor.right, side: successorSide }
      frames.push({
        state: deepClone(state),
        meta: { step: step++, label: `relink successor parent ${successorParent.key}.${successorSide} = ${successor.left || successor.right || 'null'}` }
      })
    }
    
    delete state.nodes[successor.id]
  }
  
  // Walk back up updating heights and checking balance
  let currentId: string | undefined = targetParent?.id
  while (currentId) {
    const node: AVLNode = state.nodes[currentId]!
    
    updateHeight(state, currentId)
    const newHeight = node.height
    const bf = getBalanceFactor(state, currentId)
    
    // Emit height update frame
    state.relink = null
    state.highlight = [currentId]
    state.bfAt = { id: currentId, bf }
    frames.push({
      state: deepClone(state),
      meta: { step: step++, label: `update height(${node.key})=${newHeight}, bf=${bf > 0 ? '+' : ''}${bf}` }
    })
    
    // Check if rotation is needed
    if (Math.abs(bf) > 1) {
      // Determine rotation type
      let rotationType: "LL" | "LR" | "RL" | "RR"
      
      if (bf > 1) { // Left heavy
        const leftChild = state.nodes[node.left!]
        const leftBF = getBalanceFactor(state, leftChild.id)
        
        if (leftBF >= 0) {
          rotationType = "LL"
        } else {
          rotationType = "LR"
        }
      } else { // Right heavy
        const rightChild = state.nodes[node.right!]
        const rightBF = getBalanceFactor(state, rightChild.id)
        
        if (rightBF <= 0) {
          rotationType = "RR"
        } else {
          rotationType = "RL"
        }
      }
      
      // Emit pre-rotation frame
      const z = node
      const y = bf > 1 ? state.nodes[z.left!] : state.nodes[z.right!]
      const x = bf > 1 
        ? (rotationType === "LL" ? state.nodes[y.left!] : state.nodes[y.right!])
        : (rotationType === "RR" ? state.nodes[y.right!] : state.nodes[y.left!])
      
      state.rotation = rotationType
      state.highlight = [z.id, y.id, x.id]
      state.bfAt = null
      frames.push({
        state: deepClone(state),
        meta: { step: step++, label: `rotation ${rotationType} at ${z.key}` }
      })
      
      // Perform rotation(s)
      if (rotationType === "LL") {
        rotateRight(state, z.id)
      } else if (rotationType === "RR") {
        rotateLeft(state, z.id)
      } else if (rotationType === "LR") {
        rotateLeft(state, y.id)
        rotateRight(state, z.id)
      } else if (rotationType === "RL") {
        rotateRight(state, y.id)
        rotateLeft(state, z.id)
      }
      
      // Emit post-rotation frame
      state.rotation = null
      state.highlight = [z.id, y.id, x.id]
      frames.push({
        state: deepClone(state),
        meta: { step: step++, label: `rotation ${rotationType} complete` }
      })
      
      // Update heights after rotation
      updateHeight(state, z.id)
      if (y.id !== z.id) {
        updateHeight(state, y.id)
      }
      if (x.id !== y.id && x.id !== z.id) {
        updateHeight(state, x.id)
      }
      
      // Emit final height update frame
      state.highlight = [z.id]
      const finalBF = getBalanceFactor(state, z.id)
      state.bfAt = { id: z.id, bf: finalBF }
      frames.push({
        state: deepClone(state),
        meta: { step: step++, label: `post-rotation height(${z.key})=${state.nodes[z.id].height}, bf=${finalBF > 0 ? '+' : ''}${finalBF}` }
      })
      
      break // No need to check further up after rotation
    }
    
    // Move up to parent
    currentId = node.parent || undefined
  }
  
  // Final frame
  state.highlight = []
  state.bfAt = null
  state.op = null
  state.focusKey = null
  frames.push({
    state: deepClone(state),
    meta: { step: step++, label: `delete complete` }
  })
  
  return frames
}

export function runAVLCommands(commands: AVLCommand[]): Frame<AVLState>[] {
  const frames: Frame<AVLState>[] = []
  let currentState = createEmptyState()
  let step = 1
  
  for (const command of commands) {
    switch (command.type) {
      case 'insert':
        const insertFrames = insertNode(currentState, command.key, step)
        frames.push(...insertFrames)
        step += insertFrames.length
        break
        
      case 'delete':
        const deleteFrames = deleteNode(currentState, command.key, step)
        frames.push(...deleteFrames)
        step += deleteFrames.length
        break
        
      case 'reset':
        currentState = createEmptyState()
        frames.push({
          state: deepClone(currentState),
          meta: { step: step++, label: 'reset complete' }
        })
        break
    }
  }
  
  return frames
}

import { describe, it, expect } from 'vitest'
import { runAVLCommands } from '../src/algorithms/avl/engine'
import type { AVLState } from '../src/algorithms/avl/types'

describe('AVL Engine', () => {
  // Helper functions for testing invariants
  const isBST = (state: AVLState): boolean => {
    const nodes = state.nodes
    const root = state.root
    
    if (!root) return true
    
    const inorderTraversal = (nodeId: string, min: number, max: number): boolean => {
      const node = nodes[nodeId]
      if (!node) return true
      
      if (node.key < min || node.key > max) return false
      
      const leftValid = node.left ? inorderTraversal(node.left, min, node.key - 1) : true
      const rightValid = node.right ? inorderTraversal(node.right, node.key + 1, max) : true
      
      return leftValid && rightValid
    }
    
    return inorderTraversal(root, -Infinity, Infinity)
  }
  
  const isAVL = (state: AVLState): boolean => {
    const nodes = state.nodes
    const root = state.root
    
    if (!root) return true
    
    const checkBalance = (nodeId: string): { balanced: boolean; height: number } => {
      const node = nodes[nodeId]
      if (!node) return { balanced: true, height: 0 }
      
      const leftResult = node.left ? checkBalance(node.left) : { balanced: true, height: 0 }
      const rightResult = node.right ? checkBalance(node.right) : { balanced: true, height: 0 }
      
      if (!leftResult.balanced || !rightResult.balanced) {
        return { balanced: false, height: 0 }
      }
      
      const balanceFactor = leftResult.height - rightResult.height
      if (Math.abs(balanceFactor) > 1) {
        return { balanced: false, height: 0 }
      }
      
      const height = Math.max(leftResult.height, rightResult.height) + 1
      return { balanced: true, height }
    }
    
    const result = checkBalance(root)
    return result.balanced
  }
  
  const getInorderKeys = (state: AVLState): number[] => {
    const nodes = state.nodes
    const root = state.root
    const result: number[] = []
    
    if (!root) return result
    
    const inorderTraversal = (nodeId: string) => {
      const node = nodes[nodeId]
      if (!node) return
      
      if (node.left) inorderTraversal(node.left)
      result.push(node.key)
      if (node.right) inorderTraversal(node.right)
    }
    
    inorderTraversal(root)
    return result
  }

  it('should handle empty commands', () => {
    const frames = runAVLCommands([])
    expect(frames).toHaveLength(0)
  })

  it('should handle reset command', () => {
    const frames = runAVLCommands([{ type: 'reset' }])
    expect(frames).toHaveLength(1)
    expect(frames[0].meta.label).toBe('reset complete')
    expect(frames[0].state.nodes).toEqual({})
    expect(frames[0].state.root).toBeUndefined()
  })

  it('should insert single node', () => {
    const frames = runAVLCommands([{ type: 'insert', key: 42 }])
    expect(frames).toHaveLength(1)
    expect(frames[0].meta.label).toBe('insert complete')
    expect(frames[0].state.root).toBeDefined()
    
    const rootId = frames[0].state.root!
    const rootNode = frames[0].state.nodes[rootId]
    expect(rootNode.key).toBe(42)
    expect(rootNode.height).toBe(1)
    
    // Check invariants
    const finalState = frames[0].state as unknown as AVLState
    expect(isBST(finalState)).toBe(true)
    expect(isAVL(finalState)).toBe(true)
  })

  it('should handle LL rotation correctly', () => {
    const frames = runAVLCommands([
      { type: 'insert', key: 30 },
      { type: 'insert', key: 20 },
      { type: 'insert', key: 10 }
    ])
    
    expect(frames.length).toBeGreaterThan(3)
    
    // Check that the final frame shows completion
    const finalFrame = frames[frames.length - 1]
    expect(finalFrame.meta.label).toBe('insert complete')
    
    // Check that we have a rotation frame
    const rotationFrame = frames.find(f => f.state.rotation === 'LL')
    expect(rotationFrame).toBeDefined()
    
    // Verify the final tree structure
    const finalState = finalFrame.state as unknown as AVLState
    expect(finalState.root).toBeDefined()
    
    const rootId = finalState.root!
    const rootNode = finalState.nodes[rootId]
    expect(rootNode.key).toBe(20) // After LL rotation, 20 should be root
    expect(rootNode.height).toBe(2)
    
    // Check invariants
    expect(isBST(finalState)).toBe(true)
    expect(isAVL(finalState)).toBe(true)
    
    // Check inorder traversal yields sorted keys
    const inorderKeys = getInorderKeys(finalState)
    expect(inorderKeys).toEqual([10, 20, 30])
  })

  it('should handle RR rotation correctly', () => {
    const frames = runAVLCommands([
      { type: 'insert', key: 10 },
      { type: 'insert', key: 20 },
      { type: 'insert', key: 30 }
    ])
    
    expect(frames.length).toBeGreaterThan(3)
    
    // Check that the final frame shows completion
    const finalFrame = frames[frames.length - 1]
    expect(finalFrame.meta.label).toBe('insert complete')
    
    // Check that we have a rotation frame
    const rotationFrame = frames.find(f => f.state.rotation === 'RR')
    expect(rotationFrame).toBeDefined()
    
    // Verify the final tree structure
    const finalState = finalFrame.state as unknown as AVLState
    expect(finalState.root).toBeDefined()
    
    const rootId = finalState.root!
    const rootNode = finalState.nodes[rootId]
    expect(rootNode.key).toBe(20) // After RR rotation, 20 should be root
    expect(rootNode.height).toBe(2)
    
    // Check invariants
    expect(isBST(finalState)).toBe(true)
    expect(isAVL(finalState)).toBe(true)
    
    // Check inorder traversal yields sorted keys
    const inorderKeys = getInorderKeys(finalState)
    expect(inorderKeys).toEqual([10, 20, 30])
  })

  it('should handle LR rotation correctly', () => {
    const frames = runAVLCommands([
      { type: 'insert', key: 30 },
      { type: 'insert', key: 10 },
      { type: 'insert', key: 20 }
    ])
    
    expect(frames.length).toBeGreaterThan(3)
    
    // Check that the final frame shows completion
    const finalFrame = frames[frames.length - 1]
    expect(finalFrame.meta.label).toBe('insert complete')
    
    // Check that we have a rotation frame
    const rotationFrame = frames.find(f => f.state.rotation === 'LR')
    expect(rotationFrame).toBeDefined()
    
    // Check invariants
    const finalState = finalFrame.state as unknown as AVLState
    expect(isBST(finalState)).toBe(true)
    expect(isAVL(finalState)).toBe(true)
    
    // Check inorder traversal yields sorted keys
    const inorderKeys = getInorderKeys(finalState)
    expect(inorderKeys).toEqual([10, 20, 30])
  })

  it('should handle RL rotation correctly', () => {
    const frames = runAVLCommands([
      { type: 'insert', key: 10 },
      { type: 'insert', key: 30 },
      { type: 'insert', key: 20 }
    ])
    
    expect(frames.length).toBeGreaterThan(3)
    
    // Check that the final frame shows completion
    const finalFrame = frames[frames.length - 1]
    expect(finalFrame.meta.label).toBe('insert complete')
    
    // Check that we have a rotation frame
    const rotationFrame = frames.find(f => f.state.rotation === 'RL')
    expect(rotationFrame).toBeDefined()
    
    // Check invariants
    const finalState = finalFrame.state as unknown as AVLState
    expect(isBST(finalState)).toBe(true)
    expect(isAVL(finalState)).toBe(true)
    
    // Check inorder traversal yields sorted keys
    const inorderKeys = getInorderKeys(finalState)
    expect(inorderKeys).toEqual([10, 20, 30])
  })

  it('should maintain AVL property after multiple insertions', () => {
    const frames = runAVLCommands([
      { type: 'insert', key: 50 },
      { type: 'insert', key: 30 },
      { type: 'insert', key: 70 },
      { type: 'insert', key: 20 },
      { type: 'insert', key: 40 },
      { type: 'insert', key: 60 },
      { type: 'insert', key: 80 }
    ])
    
    expect(frames.length).toBeGreaterThan(7)
    
    const finalFrame = frames[frames.length - 1]
    expect(finalFrame.meta.label).toBe('insert complete')
    
    // Check that all nodes have valid heights
    const finalState = finalFrame.state as unknown as AVLState
    Object.values(finalState.nodes).forEach(node => {
      expect(node.height).toBeGreaterThan(0)
      expect(typeof node.height).toBe('number')
    })
    
    // Check invariants
    expect(isBST(finalState)).toBe(true)
    expect(isAVL(finalState)).toBe(true)
  })

  it('should handle deletion with rebalancing', () => {
    // Build a small tree that will need rebalancing after deletion
    const frames = runAVLCommands([
      { type: 'insert', key: 9 },
      { type: 'insert', key: 5 },
      { type: 'insert', key: 10 },
      { type: 'insert', key: 0 },
      { type: 'insert', key: 6 },
      { type: 'insert', key: 11 },
      { type: 'delete', key: 0 },
      { type: 'delete', key: 11 }
    ])
    
    expect(frames.length).toBeGreaterThan(8)
    
    const finalFrame = frames[frames.length - 1]
    expect(finalFrame.meta.label).toBe('delete complete')
    
    // Check invariants after deletion
    const finalState = finalFrame.state as unknown as AVLState
    expect(isBST(finalState)).toBe(true)
    expect(isAVL(finalState)).toBe(true)
    
    // Verify the tree structure is maintained
    const inorderKeys = getInorderKeys(finalState)
    expect(inorderKeys).toEqual([5, 6, 9, 10])
  })

  it('should handle complex deletion scenarios', () => {
    // Test deletion of nodes with two children (successor swap)
    const frames = runAVLCommands([
      { type: 'insert', key: 50 },
      { type: 'insert', key: 30 },
      { type: 'insert', key: 70 },
      { type: 'insert', key: 20 },
      { type: 'insert', key: 40 },
      { type: 'insert', key: 60 },
      { type: 'insert', key: 80 },
      { type: 'delete', key: 50 } // Delete root with two children
    ])
    
    expect(frames.length).toBeGreaterThan(8)
    
    const finalFrame = frames[frames.length - 1]
    expect(finalFrame.meta.label).toBe('delete complete')
    
    // Check invariants
    const finalState = finalFrame.state as unknown as AVLState
    expect(isBST(finalState)).toBe(true)
    expect(isAVL(finalState)).toBe(true)
    
    // The successor (60) should now be the root
    const rootId = finalState.root!
    const rootNode = finalState.nodes[rootId]
    expect(rootNode.key).toBe(60)
  })

  it('should maintain heights correctly after operations', () => {
    const frames = runAVLCommands([
      { type: 'insert', key: 30 },
      { type: 'insert', key: 20 },
      { type: 'insert', key: 40 },
      { type: 'insert', key: 10 },
      { type: 'insert', key: 25 }
    ])
    
    const finalFrame = frames[frames.length - 1]
    const finalState = finalFrame.state as unknown as AVLState
    
    // Check that heights are calculated correctly
    Object.values(finalState.nodes).forEach(node => {
      const leftHeight = node.left ? finalState.nodes[node.left].height : 0
      const rightHeight = node.right ? finalState.nodes[node.right].height : 0
      const expectedHeight = Math.max(leftHeight, rightHeight) + 1
      expect(node.height).toBe(expectedHeight)
    })
  })

  it('should handle edge cases gracefully', () => {
    // Test inserting duplicate keys
    const frames = runAVLCommands([
      { type: 'insert', key: 10 },
      { type: 'insert', key: 10 } // Duplicate
    ])
    
    expect(frames.length).toBeGreaterThan(1)
    
    // Test deleting non-existent key
    const deleteFrames = runAVLCommands([
      { type: 'insert', key: 10 },
      { type: 'delete', key: 99 } // Non-existent
    ])
    
    expect(deleteFrames.length).toBeGreaterThan(1)
    const finalFrame = deleteFrames[deleteFrames.length - 1]
    expect(finalFrame.meta.label).toBe('key 99 not found')
  })
})

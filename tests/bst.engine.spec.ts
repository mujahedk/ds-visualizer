import { describe, it, expect } from 'vitest'
import { runBSTCommands } from '../src/algorithms/bst/engine'
import { BSTCommand } from '../src/algorithms/bst/types'

describe('BST Engine', () => {
  describe('Tree Construction', () => {
    it('builds tree with insert 8; insert 3; insert 10; insert 1; insert 6', () => {
      const commands: BSTCommand[] = [
        { type: 'insert', key: 8 },
        { type: 'insert', key: 3 },
        { type: 'insert', key: 10 },
        { type: 'insert', key: 1 },
        { type: 'insert', key: 6 }
      ]
      
      const frames = runBSTCommands(commands)
      expect(frames.length).toBeGreaterThan(0)
      
      // Check final frame
      const finalFrame = frames[frames.length - 1]
      const state = finalFrame.state
      
      // Should have 5 nodes
      expect(Object.keys(state.nodes)).toHaveLength(5)
      expect(state.root).toBeDefined()
      
      // Check BST structure
      const rootNode = state.nodes[state.root!]
      expect(rootNode.key).toBe(8)
      
      // Left subtree: 3 -> 1, 6
      const leftChild = state.nodes[rootNode.left!]
      expect(leftChild.key).toBe(3)
      expect(leftChild.left).toBeDefined()
      expect(leftChild.right).toBeDefined()
      
      const leftLeftChild = state.nodes[leftChild.left!]
      const leftRightChild = state.nodes[leftChild.right!]
      expect(leftLeftChild.key).toBe(1)
      expect(leftRightChild.key).toBe(6)
      
      // Right subtree: 10
      const rightChild = state.nodes[rootNode.right!]
      expect(rightChild.key).toBe(10)
      expect(rightChild.left).toBeUndefined()
      expect(rightChild.right).toBeUndefined()
    })

    it('maintains BST property after each insertion', () => {
      const commands: BSTCommand[] = [
        { type: 'insert', key: 8 },
        { type: 'insert', key: 3 },
        { type: 'insert', key: 10 },
        { type: 'insert', key: 1 },
        { type: 'insert', key: 6 }
      ]
      
      const frames = runBSTCommands(commands)
      
      // Check BST property after each command
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i]
        if (command.type === 'insert') {
          // Find the frame where this insertion is completed
          const completedFrame = frames.find(f => 
            f.meta.label.includes(`Insert complete: ${command.key}`)
          )
          expect(completedFrame).toBeDefined()
          
          const state = completedFrame!.state
          expect(isValidBST(state)).toBe(true)
        }
      }
    })
  })

  describe('BST Property Invariants', () => {
    it('maintains BST property: left subtree keys < node.key < right subtree keys', () => {
      const commands: BSTCommand[] = [
        { type: 'insert', key: 8 },
        { type: 'insert', key: 3 },
        { type: 'insert', key: 10 },
        { type: 'insert', key: 1 },
        { type: 'insert', key: 6 }
      ]
      
      const frames = runBSTCommands(commands)
      
      // Check final frame
      const finalFrame = frames[frames.length - 1]
      const state = finalFrame.state
      
      expect(isValidBST(state)).toBe(true)
    })

    it('handles duplicate keys correctly (should not insert duplicates)', () => {
      const commands: BSTCommand[] = [
        { type: 'insert', key: 8 },
        { type: 'insert', key: 8 }, // Duplicate
        { type: 'insert', key: 3 }
      ]
      
      const frames = runBSTCommands(commands)
      const finalFrame = frames[frames.length - 1]
      const state = finalFrame.state
      
      // Should only have 2 unique nodes
      expect(Object.keys(state.nodes)).toHaveLength(2)
      expect(isValidBST(state)).toBe(true)
    })
  })

  describe('Deletion Cases', () => {
    it('deletes leaf node (1) correctly', () => {
      const commands: BSTCommand[] = [
        { type: 'insert', key: 8 },
        { type: 'insert', key: 3 },
        { type: 'insert', key: 10 },
        { type: 'insert', key: 1 },
        { type: 'insert', key: 6 },
        { type: 'delete', key: 1 }
      ]
      
      const frames = runBSTCommands(commands)
      const finalFrame = frames[frames.length - 1]
      const state = finalFrame.state
      
      // Should have 4 nodes after deletion
      expect(Object.keys(state.nodes)).toHaveLength(4)
      
      // Node 1 should be removed
      const node1Exists = Object.values(state.nodes).some(n => n.key === 1)
      expect(node1Exists).toBe(false)
      
      // BST property should be maintained
      expect(isValidBST(state)).toBe(true)
      
      // Parent node 3 should no longer have left child
      const node3 = Object.values(state.nodes).find(n => n.key === 3)
      expect(node3).toBeDefined()
      expect(node3!.left).toBeUndefined()
    })

    it('deletes one-child node (10 with right child 14) correctly', () => {
      const commands: BSTCommand[] = [
        { type: 'insert', key: 8 },
        { type: 'insert', key: 3 },
        { type: 'insert', key: 10 },
        { type: 'insert', key: 14 }, // Right child of 10
        { type: 'delete', key: 10 }
      ]
      
      const frames = runBSTCommands(commands)
      const finalFrame = frames[frames.length - 1]
      const state = finalFrame.state
      
      // Should have 3 nodes after deletion
      expect(Object.keys(state.nodes)).toHaveLength(3)
      
      // Node 10 should be removed
      const node10Exists = Object.values(state.nodes).some(n => n.key === 10)
      expect(node10Exists).toBe(false)
      
      // BST property should be maintained
      expect(isValidBST(state)).toBe(true)
      
      // Node 8 should now have 14 as right child
      const rootNode = state.nodes[state.root!]
      expect(rootNode.right).toBeDefined()
      const rightChild = state.nodes[rootNode.right!]
      expect(rightChild.key).toBe(14)
      
      // Node 14 should have 8 as parent
      expect(rightChild.parent).toBe(rootNode.id)
    })

    it('deletes two-children node (3) via successor swap correctly', () => {
      const commands: BSTCommand[] = [
        { type: 'insert', key: 8 },
        { type: 'insert', key: 3 },
        { type: 'insert', key: 10 },
        { type: 'insert', key: 1 },
        { type: 'insert', key: 6 },
        { type: 'delete', key: 3 }
      ]
      
      const frames = runBSTCommands(commands)
      const finalFrame = frames[frames.length - 1]
      const state = finalFrame.state
      
      // Should have 4 nodes after deletion
      expect(Object.keys(state.nodes)).toHaveLength(4)
      
      // Node 3 should be removed
      const node3Exists = Object.values(state.nodes).some(n => n.key === 3)
      expect(node3Exists).toBe(false)
      
      // BST property should be maintained
      expect(isValidBST(state)).toBe(true)
      
      // The successor (6) should now be in the position where 3 was
      const rootNode = state.nodes[state.root!]
      const leftChild = state.nodes[rootNode.left!]
      expect(leftChild.key).toBe(6) // Successor should replace 3
      
      // Node 6 should have 1 as left child and no right child
      expect(leftChild.left).toBeDefined()
      expect(leftChild.right).toBeUndefined()
      const leftLeftChild = state.nodes[leftChild.left!]
      expect(leftLeftChild.key).toBe(1)
    })

    it('handles deletion of root node correctly', () => {
      const commands: BSTCommand[] = [
        { type: 'insert', key: 8 },
        { type: 'insert', key: 3 },
        { type: 'delete', key: 8 }
      ]
      
      const frames = runBSTCommands(commands)
      const finalFrame = frames[frames.length - 1]
      const state = finalFrame.state
      
      // Should have 1 node after deletion
      expect(Object.keys(state.nodes)).toHaveLength(1)
      
      // Node 8 should be removed
      const node8Exists = Object.values(state.nodes).some(n => n.key === 8)
      expect(node8Exists).toBe(false)
      
      // Node 3 should be the new root
      expect(state.root).toBeDefined()
      const newRoot = state.nodes[state.root!]
      expect(newRoot.key).toBe(3)
      expect(newRoot.parent).toBeUndefined()
    })
  })

  describe('Frame Generation', () => {
    it('generates frames with correct step increments', () => {
      const commands: BSTCommand[] = [
        { type: 'insert', key: 8 },
        { type: 'insert', key: 3 }
      ]
      
      const frames = runBSTCommands(commands)
      
      for (let i = 0; i < frames.length; i++) {
        expect(frames[i].meta.step).toBe(i + 1)
      }
    })

    it('generates frames with descriptive labels', () => {
      const commands: BSTCommand[] = [
        { type: 'insert', key: 8 }
      ]
      
      const frames = runBSTCommands(commands)
      
      // Should have frames for start, traversal, and completion
      const startFrame = frames.find(f => f.meta.label.includes('Start inserting'))
      const completeFrame = frames.find(f => f.meta.label.includes('Insert complete'))
      
      expect(startFrame).toBeDefined()
      expect(completeFrame).toBeDefined()
    })

    it('maintains state immutability between frames', () => {
      const commands: BSTCommand[] = [
        { type: 'insert', key: 8 },
        { type: 'insert', key: 3 }
      ]
      
      const frames = runBSTCommands(commands)
      
      // Each frame should have a different state object
      for (let i = 1; i < frames.length; i++) {
        expect(frames[i].state).not.toBe(frames[i - 1].state)
      }
    })
  })

  describe('Reset Functionality', () => {
    it('resets tree to empty state', () => {
      const commands: BSTCommand[] = [
        { type: 'insert', key: 8 },
        { type: 'insert', key: 3 },
        { type: 'reset' }
      ]
      
      const frames = runBSTCommands(commands)
      const finalFrame = frames[frames.length - 1]
      const state = finalFrame.state
      
      // Should have no nodes after reset
      expect(Object.keys(state.nodes)).toHaveLength(0)
      expect(state.root).toBeUndefined()
      expect(state.highlight).toEqual([])
      expect(state.compare).toBeNull()
      expect(state.relink).toBeNull()
      expect(state.op).toBeNull()
      expect(state.focusKey).toBeNull()
    })
  })
})

// Helper function to validate BST property
function isValidBST(state: any): boolean {
  const nodes = state.nodes || {}
  const root = state.root
  
  if (!root) return true // Empty tree is valid
  
  function validateNode(nodeId: string, min: number, max: number): boolean {
    if (!nodeId || !nodes[nodeId]) return true
    
    const node = nodes[nodeId]
    const key = node.key
    
    // Check if key is within bounds
    if (key <= min || key >= max) return false
    
    // Recursively validate left and right subtrees
    const leftValid = !node.left || validateNode(node.left, min, key)
    const rightValid = !node.right || validateNode(node.right, key, max)
    
    return leftValid && rightValid
  }
  
  return validateNode(root, -Infinity, Infinity)
}

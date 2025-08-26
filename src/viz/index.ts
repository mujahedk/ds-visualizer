// Visualization module exports
export { default as Canvas } from './Canvas'

// Algorithm-specific views
export { default as HeapView } from './HeapView'
export { default as BSTView } from './BSTView'
export { default as AVLView } from './AVLView'
export { default as LinkedListView } from './LinkedListView'
export { default as ArrayView } from './ArrayView'
export { default as StackView } from './StackView'
export { default as QueueView } from './QueueView'
export { default as HashView } from './HashView'
export { default as GraphView } from './GraphView'

// Algorithm view mapping
import HeapView from './HeapView'
import BSTView from './BSTView'
import AVLView from './AVLView'
import LinkedListView from './LinkedListView'
import ArrayView from './ArrayView'
import StackView from './StackView'
import QueueView from './QueueView'
import HashView from './HashView'
import GraphView from './GraphView'

export const algorithmViews = {
  heap: HeapView,
  bst: BSTView,
  avl: AVLView,
  'linked-list': LinkedListView,
  array: ArrayView,
  stack: StackView,
  queue: QueueView,
  hash: HashView,
  graph: GraphView
} as const

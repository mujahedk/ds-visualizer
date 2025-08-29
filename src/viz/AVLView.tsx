import React from 'react'
import { Frame } from '../algorithms/types'

interface AVLViewProps {
  frame: Frame<Record<string, unknown>> | null
  currentFrameIndex?: number
  totalFrames?: number
}

interface AVLNode {
  id: string
  key: number
  left?: string
  right?: string
  parent?: string
  height: number
}

interface AVLState {
  nodes: Record<string, AVLNode>
  root?: string
  highlight?: string[]
  compare?: { from: string; to: string } | null
  relink?: { parent?: string; child?: string; side?: "left" | "right" } | null
  rotation?: "LL" | "LR" | "RL" | "RR" | null
  op?: "insert" | "delete" | null
  focusKey?: number | null
  bfAt?: { id: string; bf: number } | null
}

const AVLView: React.FC<AVLViewProps> = ({ frame, currentFrameIndex = 0, totalFrames = 0 }) => {
  if (!frame) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">🌳</div>
          <h3 className="text-xl font-semibold mb-2">No AVL Data</h3>
          <p className="text-gray-500">Load a preset or enter commands to see the AVL visualization</p>
        </div>
      </div>
    )
  }

  // Safely extract AVL state properties
  const state = frame.state as unknown as AVLState
  const nodes = state.nodes || {}
  const root = state.root
  const highlight = state.highlight || []
  const compare = state.compare
  const relink = state.relink
  const rotation = state.rotation
  const op = state.op
  const focusKey = state.focusKey
  const bfAt = state.bfAt

  if (!root || Object.keys(nodes).length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold mb-2">Empty AVL Tree</h3>
          <p className="text-gray-500">The AVL tree is empty. Try inserting some values!</p>
        </div>
      </div>
    )
  }

  // Calculate tree dimensions using BFS
  const calculateLevels = (): { levels: AVLNode[][]; maxLevel: number } => {
    if (!root || !nodes[root]) return { levels: [], maxLevel: 0 }
    
    const levels: AVLNode[][] = []
    const queue: { node: AVLNode; level: number }[] = [{ node: nodes[root], level: 0 }]
    
    while (queue.length > 0) {
      const { node, level } = queue.shift()!
      
      if (!levels[level]) levels[level] = []
      levels[level].push(node)
      
      if (node.left && nodes[node.left]) {
        queue.push({ node: nodes[node.left], level: level + 1 })
      }
      if (node.right && nodes[node.right]) {
        queue.push({ node: nodes[node.right], level: level + 1 })
      }
    }
    
    return { levels, maxLevel: levels.length - 1 }
  }

  const { levels } = calculateLevels()
  
  // SVG dimensions
  const svgWidth = 600
  const svgHeight = 450
  const nodeRadius = 20
  const levelSpacing = 90
  const nodeSpacing = Math.min(svgWidth / 8, 80) // Support up to 8 nodes per level

  // Calculate node positions
  const getNodePosition = (nodeId: string): { x: number; y: number } => {
    const node = nodes[nodeId]
    if (!node) return { x: 0, y: 0 }
    
    // Find the level and position within the level
    let level = 0
    let positionInLevel = 0
    
    for (let l = 0; l < levels.length; l++) {
      const levelIndex = levels[l].findIndex(n => n.id === nodeId)
      if (levelIndex !== -1) {
        level = l
        positionInLevel = levelIndex
        break
      }
    }
    
    const nodesAtThisLevel = levels[level].length
    const x = (svgWidth / 2) + (positionInLevel - (nodesAtThisLevel - 1) / 2) * nodeSpacing
    const y = 50 + level * levelSpacing
    
    return { x, y }
  }

  // Check if a node should be highlighted
  const isHighlighted = (nodeId: string): boolean => {
    return highlight.includes(nodeId)
  }

  // Check if a node is part of comparison
  const isCompared = (nodeId: string): boolean => {
    return compare ? (compare.from === nodeId || compare.to === nodeId) : false
  }

  // Check if a node is part of relinking
  const isRelinking = (nodeId: string): boolean => {
    return relink ? (relink.parent === nodeId || relink.child === nodeId) : false
  }

  // Check if a node is part of rotation
  const isRotationNode = (nodeId: string): boolean => {
    return rotation !== null && isHighlighted(nodeId)
  }

  // Check if a node has balance factor display
  const hasBalanceFactor = (nodeId: string): boolean => {
    return bfAt ? bfAt.id === nodeId : false
  }

  // Generate SVG edges
  const generateEdges = () => {
    const edges: JSX.Element[] = []
    
    Object.values(nodes).forEach(node => {
      if (node.left && nodes[node.left]) {
        const parentPos = getNodePosition(node.id)
        const childPos = getNodePosition(node.left)
        
        const isHighlightedEdge = isHighlighted(node.id) && isHighlighted(node.left)
        const isRotationEdge = isRotationNode(node.id) && isRotationNode(node.left)
        
        edges.push(
          <line
            key={`edge-${node.id}-${node.left}`}
            x1={parentPos.x}
            y1={parentPos.y}
            x2={childPos.x}
            y2={childPos.y}
            stroke={isRotationEdge ? "#fbbf24" : isHighlightedEdge ? "#10b981" : "#6b7280"}
            strokeWidth={isRotationEdge ? 4 : isHighlightedEdge ? 3 : 2}
            strokeDasharray={isRotationEdge ? "8,4" : isHighlightedEdge ? "5,5" : "none"}
            className="transition-all duration-200"
          />
        )
      }
      
      if (node.right && nodes[node.right]) {
        const parentPos = getNodePosition(node.id)
        const childPos = getNodePosition(node.right)
        
        const isHighlightedEdge = isHighlighted(node.id) && isHighlighted(node.right)
        const isRotationEdge = isRotationNode(node.id) && isRotationNode(node.right)
        
        edges.push(
          <line
            key={`edge-${node.id}-${node.right}`}
            x1={parentPos.x}
            y1={parentPos.y}
            x2={childPos.x}
            y2={childPos.y}
            stroke={isRotationEdge ? "#fbbf24" : isHighlightedEdge ? "#10b981" : "#6b7280"}
            strokeWidth={isRotationEdge ? 4 : isHighlightedEdge ? 3 : 2}
            strokeDasharray={isRotationEdge ? "8,4" : isHighlightedEdge ? "5,5" : "none"}
            className="transition-all duration-200"
          />
        )
      }
    })
    
    return edges
  }

  // Generate SVG nodes
  const generateNodes = () => {
    return Object.values(nodes).map(node => {
      const { x, y } = getNodePosition(node.id)
      const highlighted = isHighlighted(node.id)
      const compared = isCompared(node.id)
      const relinking = isRelinking(node.id)
      const rotationNode = isRotationNode(node.id)
      const balanceFactorNode = hasBalanceFactor(node.id)
      
      // Determine node styling based on state
      let fill = "#1f2937" // Default dark gray
      let stroke = "#6b7280" // Default border
      let strokeWidth = 2
      let strokeDasharray = "none"
      
      if (rotationNode) {
        fill = "#fbbf24" // Amber for rotation nodes
        stroke = "#f59e0b"
        strokeWidth = 4
        strokeDasharray = "8,4"
      } else if (relinking) {
        fill = "#dc2626" // Red for relinking nodes
        stroke = "#ef4444"
        strokeWidth = 3
        strokeDasharray = "5,5"
      } else if (compared) {
        fill = "#f59e0b" // Amber for comparison nodes
        stroke = "#fbbf24"
        strokeWidth = 3
      } else if (highlighted) {
        fill = "#059669" // Green for highlighted nodes
        stroke = "#10b981"
        strokeWidth = 3
      }
      
      return (
        <g key={`node-${node.id}`}>
          {/* Node circle */}
          <circle
            cx={x}
            cy={y}
            r={nodeRadius}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            className="transition-all duration-200"
          />
          
          {/* Node key */}
          <text
            x={x}
            y={y + 5}
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="600"
            className="select-none"
          >
            {node.key}
          </text>
          
          {/* Height display (bottom-right) */}
          <text
            x={x + nodeRadius - 5}
            y={y + nodeRadius - 5}
            textAnchor="end"
            fill="#9ca3af"
            fontSize="10"
            fontWeight="500"
            className="select-none"
          >
            h={node.height}
          </text>
          
          {/* Balance factor badge when active */}
          {balanceFactorNode && bfAt && (
            <g>
              <rect
                x={x - nodeRadius - 25}
                y={y - nodeRadius - 15}
                width={50}
                height={20}
                fill="#3b82f6"
                stroke="#60a5fa"
                strokeWidth="1"
                rx="3"
              />
              <text
                x={x - nodeRadius}
                y={y - nodeRadius - 5}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="600"
                className="select-none"
              >
                bf={bfAt.bf > 0 ? `+${bfAt.bf}` : bfAt.bf}
              </text>
            </g>
          )}
        </g>
      )
    })
  }

  // Generate comparison hint arrow
  const generateComparisonHint = () => {
    if (!compare) return null
    
    const fromPos = getNodePosition(compare.from)
    const toPos = getNodePosition(compare.to)
    
    // Calculate arrow direction
    const dx = toPos.x - fromPos.x
    const dy = toPos.y - fromPos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance < nodeRadius * 2) return null // Too close
    
    // Normalize and scale
    const unitX = dx / distance
    const unitY = dy / distance
    
    // Arrow start and end points (outside the nodes)
    const startX = fromPos.x + unitX * (nodeRadius + 5)
    const startY = fromPos.y + unitY * (nodeRadius + 5)
    const endX = toPos.x - unitX * (nodeRadius + 5)
    const endY = toPos.y - unitY * (nodeRadius + 5)
    
    // Arrow head
    const arrowLength = 10
    const arrowAngle = Math.PI / 6
    
    const angle = Math.atan2(dy, dx)
    const arrow1X = endX - arrowLength * Math.cos(angle - arrowAngle)
    const arrow1Y = endY - arrowLength * Math.sin(angle - arrowAngle)
    const arrow2X = endX - arrowLength * Math.cos(angle + arrowAngle)
    const arrow2Y = endY - arrowLength * Math.sin(angle + arrowAngle)
    
    return (
      <g key="comparison-hint">
        {/* Arrow line */}
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="#fbbf24"
          strokeWidth={2}
          strokeDasharray="5,5"
          opacity={0.7}
        />
        {/* Arrow head */}
        <polygon
          points={`${endX},${endY} ${arrow1X},${arrow1Y} ${arrow2X},${arrow2Y}`}
          fill="#fbbf24"
          opacity={0.7}
        />
      </g>
    )
  }

  // Generate relink label
  const generateRelinkLabel = () => {
    if (!relink || !relink.parent || !relink.child || !relink.side) return null
    
    const parentPos = getNodePosition(relink.parent)
    const childPos = getNodePosition(relink.child)
    
    const labelX = (parentPos.x + childPos.x) / 2
    const labelY = (parentPos.y + childPos.y) / 2 - 10
    
    return (
      <g key="relink-label">
        <rect
          x={labelX - 30}
          y={labelY - 15}
          width={60}
          height={30}
          fill="#dc2626"
          stroke="#ef4444"
          strokeWidth={2}
          rx={5}
        />
        <text
          x={labelX}
          y={labelY + 5}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="600"
          className="select-none"
        >
          {relink.side}
        </text>
      </g>
    )
  }

  // Generate rotation label
  const generateRotationLabel = () => {
    if (!rotation) return null
    
    // Find the highlighted nodes to determine position
    const highlightedNodes = Object.values(nodes).filter(node => isHighlighted(node.id))
    if (highlightedNodes.length === 0) return null
    
    // Use the first highlighted node as reference
    const refNode = highlightedNodes[0]
    const pos = getNodePosition(refNode.id)
    
    const labelX = pos.x
    const labelY = pos.y - nodeRadius - 30
    
    return (
      <g key="rotation-label">
        <rect
          x={labelX - 60}
          y={labelY - 15}
          width={120}
          height={30}
          fill="#f59e0b"
          stroke="#fbbf24"
          strokeWidth={2}
          rx={5}
        />
        <text
          x={labelX}
          y={labelY + 5}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="600"
          className="select-none"
        >
          Rotation {rotation}
        </text>
      </g>
    )
  }

  // Calculate viewBox based on content
  const allPositions = Object.values(nodes).map(node => getNodePosition(node.id))
  const minX = Math.min(...allPositions.map(p => p.x)) - nodeRadius - 50 // Extra space for balance factor badges
  const maxX = Math.max(...allPositions.map(p => p.x)) + nodeRadius + 50
  const minY = Math.min(...allPositions.map(p => p.y)) - nodeRadius - 50 // Extra space for rotation labels
  const maxY = Math.max(...allPositions.map(p => p.y)) + nodeRadius + 50
  
  const viewBoxWidth = Math.max(maxX - minX, svgWidth)
  const viewBoxHeight = Math.max(maxY - minY, svgHeight)
  const viewBox = `${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`

  return (
    <div className="w-full h-full flex flex-col">
      {/* Operation label */}
      <div className="p-3 bg-gray-800 border-b border-gray-700">
        <div className="text-sm text-gray-300 font-medium">
          {frame.meta.label}
        </div>
        {op && focusKey !== null && (
          <div className="text-xs text-gray-400 mt-1">
            {op === 'insert' ? 'Inserting' : 'Deleting'} key: {focusKey}
          </div>
        )}
        {rotation && (
          <div className="text-xs text-amber-400 mt-1 font-medium">
            🔄 {rotation} Rotation in progress
          </div>
        )}
      </div>
      
      {/* SVG Canvas */}
      <div className="flex-1 flex items-center justify-center p-4">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={viewBox}
          className="bg-gray-900 rounded-lg"
          role="img"
          aria-label={`AVL visualization, frame ${currentFrameIndex + 1} of ${totalFrames}`}
        >
          {/* Edges */}
          {generateEdges()}
          
          {/* Comparison hint */}
          {generateComparisonHint()}
          
          {/* Relink label */}
          {generateRelinkLabel()}
          
          {/* Rotation label */}
          {generateRotationLabel()}
          
          {/* Nodes */}
          {generateNodes()}
        </svg>
      </div>
    </div>
  )
}

export default AVLView

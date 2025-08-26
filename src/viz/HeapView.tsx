import React from 'react'
import { Frame } from '../algorithms/types'



interface HeapViewProps {
  frame: Frame<Record<string, unknown>> | null
  currentFrameIndex?: number
  totalFrames?: number
}

const HeapView: React.FC<HeapViewProps> = ({ frame, currentFrameIndex = 0, totalFrames = 0 }) => {
  if (!frame) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">🌳</div>
          <h3 className="text-xl font-semibold mb-2">No Heap Data</h3>
          <p className="text-gray-500">Load a preset or enter commands to see the heap visualization</p>
        </div>
      </div>
    )
  }

  // Safely extract heap state properties
  const array = (frame.state.array as number[]) || []
  const highlight = (frame.state.highlight as number[]) || []
  const swap = (frame.state.swap as [number, number] | null) || null
  const totalNodes = array.length

  if (totalNodes === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold mb-2">Empty Heap</h3>
          <p className="text-gray-500">The heap is empty. Try inserting some values!</p>
        </div>
      </div>
    )
  }

  // Calculate tree dimensions
  const levels = Math.floor(Math.log2(totalNodes)) + 1
  const maxNodesAtLevel = Math.pow(2, levels - 1)
  
  // SVG dimensions - more compact for better screen fit
  const svgWidth = 600
  const svgHeight = 450
  const nodeRadius = 20
  const levelSpacing = 90
  const nodeSpacing = Math.min(svgWidth / (maxNodesAtLevel + 1), 80)

  // Calculate node positions
  const getNodePosition = (index: number): { x: number; y: number } => {
    if (index === 0) {
      // Root node at center top
      return { x: svgWidth / 2, y: 50 }
    }

    const level = Math.floor(Math.log2(index + 1))
    const levelStartIndex = Math.pow(2, level) - 1
    const positionInLevel = index - levelStartIndex
    const nodesAtThisLevel = Math.pow(2, level)
    
    const x = (svgWidth / 2) + (positionInLevel - (nodesAtThisLevel - 1) / 2) * nodeSpacing
    const y = 50 + level * levelSpacing

    return { x, y }
  }

  // Check if a node has children
  const hasLeftChild = (index: number): boolean => 2 * index + 1 < totalNodes
  const hasRightChild = (index: number): boolean => 2 * index + 2 < totalNodes



  // Check if a node should be highlighted
  const isHighlighted = (index: number): boolean => {
    return highlight.includes(index)
  }

  // Check if a node is part of a swap
  const isSwapped = (index: number): boolean => {
    return swap ? (swap[0] === index || swap[1] === index) : false
  }

  // Check if an edge should be highlighted (connects swapped nodes)
  const isEdgeHighlighted = (parentIndex: number, childIndex: number): boolean => {
    if (!swap) return false
    return (swap[0] === parentIndex && swap[1] === childIndex) ||
           (swap[0] === childIndex && swap[1] === parentIndex)
  }

  // Generate SVG elements
  const generateEdges = () => {
    const edges: JSX.Element[] = []
    
    for (let i = 0; i < totalNodes; i++) {
      if (hasLeftChild(i)) {
        const leftChildIndex = 2 * i + 1
        const parentPos = getNodePosition(i)
        const childPos = getNodePosition(leftChildIndex)
        
        const edgeHighlighted = isEdgeHighlighted(i, leftChildIndex)
        
        edges.push(
          <line
            key={`edge-${i}-${leftChildIndex}`}
            x1={parentPos.x}
            y1={parentPos.y}
            x2={childPos.x}
            y2={childPos.y}
            stroke={edgeHighlighted ? "#ef4444" : "#6b7280"}
            strokeWidth={edgeHighlighted ? 3 : 2}
            strokeDasharray={edgeHighlighted ? "5,5" : "none"}
            className="transition-all duration-200"
          />
        )
      }
      
      if (hasRightChild(i)) {
        const rightChildIndex = 2 * i + 2
        const parentPos = getNodePosition(i)
        const childPos = getNodePosition(rightChildIndex)
        
        const edgeHighlighted = isEdgeHighlighted(i, rightChildIndex)
        
        edges.push(
          <line
            key={`edge-${i}-${rightChildIndex}`}
            x1={parentPos.x}
            y1={parentPos.y}
            x2={childPos.x}
            y2={childPos.y}
            stroke={edgeHighlighted ? "#ef4444" : "#6b7280"}
            strokeWidth={edgeHighlighted ? 3 : 2}
            strokeDasharray={edgeHighlighted ? "5,5" : "none"}
            className="transition-all duration-200"
          />
        )
      }
    }
    
    return edges
  }

  const generateNodes = () => {
    return array.map((value, index) => {
      const { x, y } = getNodePosition(index)
      const highlighted = isHighlighted(index)
      const swapped = isSwapped(index)
      
      // Determine node styling based on state
      let fill = "#1f2937" // Default dark gray
      let stroke = "#6b7280" // Default border
      let strokeWidth = 2
      let strokeDasharray = "none"
      
      if (swapped) {
        fill = "#dc2626" // Red for swapped nodes
        stroke = "#ef4444"
        strokeWidth = 3
        strokeDasharray = "5,5"
      } else if (highlighted) {
        fill = "#059669" // Green for highlighted nodes
        stroke = "#10b981"
        strokeWidth = 3
      }
      
      return (
        <g key={`node-${index}`}>
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
          
          {/* Node value */}
          <text
            x={x}
            y={y + 5}
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="600"
            className="select-none"
          >
            {value}
          </text>
          
          {/* Node index (small) */}
          <text
            x={x}
            y={y + nodeRadius + 15}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="10"
            className="select-none"
          >
            {index}
          </text>
        </g>
      )
    })
  }

  const ariaLabel = `Heap visualization, frame ${currentFrameIndex + 1} of ${totalFrames}. ${frame.meta.label}`

  return (
    <div className="w-full h-full flex flex-col">
      {/* Frame info header */}
      <div className="mb-2 p-2 bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-400">Step:</span>
            <span className="text-white font-semibold ml-2">{frame.meta.step}</span>
          </div>
          <div>
            <span className="text-gray-400">Frame:</span>
            <span className="text-white font-semibold ml-2">{currentFrameIndex + 1} of {totalFrames}</span>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-gray-400">Action:</span>
          <span className="text-white ml-2">{frame.meta.label}</span>
        </div>
      </div>

      {/* SVG Visualization */}
      <div className="flex-1 bg-gray-900 rounded-lg overflow-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          role="img"
          aria-label={ariaLabel}
          className="w-full h-full"
        >
          {/* Background grid (optional, for debugging) */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          
          {/* Grid background */}
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Edges (lines connecting nodes) */}
          {generateEdges()}
          
          {/* Nodes (circles with values) */}
          {generateNodes()}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-1 flex items-center justify-center space-x-3 text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gray-600 border-2 border-gray-500"></div>
          <span>Normal Node</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-600 border-2 border-green-500"></div>
          <span>Highlighted</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-600 border-2 border-red-500 border-dashed"></div>
          <span>Swapping</span>
        </div>
      </div>
    </div>
  )
}

export default HeapView

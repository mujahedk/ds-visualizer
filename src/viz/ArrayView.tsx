import React from 'react'
import { Frame } from '../algorithms/types'

interface ArrayViewProps {
  frame: Frame<Record<string, unknown>> | null
  currentFrameIndex?: number
  totalFrames?: number
}

const ArrayView: React.FC<ArrayViewProps> = ({ frame, currentFrameIndex = 0, totalFrames = 0 }) => {
  if (!frame) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No Array Data</h3>
          <p className="text-gray-500">Load a preset or enter commands to see the array visualization</p>
        </div>
      </div>
    )
  }

  // Safely extract array state properties
  const values = (frame.state.values as (number | string)[]) || []
  const highlight = (frame.state.highlight as number[]) || []
  const focusIndex = (frame.state.focusIndex as number | null) ?? null
  const op = (frame.state.op as "insert" | "delete" | null) ?? null

  if (values.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">Empty Array</h3>
          <p className="text-gray-500">The array is empty. Try inserting some values!</p>
        </div>
      </div>
    )
  }

  // Calculate dimensions
  const maxElements = 25
  const elementCount = Math.min(values.length, maxElements)
  
  // SVG dimensions - responsive
  const svgWidth = Math.max(800, elementCount * 60)
  const svgHeight = 300
  
  // Element dimensions
  const boxWidth = 50
  const boxHeight = 60
  const spacing = 10
  const totalWidth = elementCount * (boxWidth + spacing) - spacing
  
  // Starting position to center the array
  const startX = (svgWidth - totalWidth) / 2
  const startY = 120

  // Check if an element should be highlighted
  const isHighlighted = (index: number): boolean => {
    return highlight.includes(index)
  }

  // Check if an element is the focus index
  const isFocused = (index: number): boolean => {
    return focusIndex === index
  }

  // Generate array elements
  const generateElements = () => {
    return values.slice(0, maxElements).map((value, index) => {
      const x = startX + index * (boxWidth + spacing)
      const y = startY
      
      // Determine box styling based on state
      let strokeColor = "#6b7280" // Default gray
      let strokeWidth = 2
      let fillColor = "#374151" // Dark gray background
      let strokeDasharray = "none"
      
      if (isFocused(index)) {
        strokeColor = "#f59e0b" // Amber for focus
        strokeWidth = 4
        fillColor = "#92400e" // Darker amber background
      } else if (isHighlighted(index)) {
        strokeColor = "#10b981" // Green for highlight
        strokeWidth = 3
        fillColor = "#065f46" // Darker green background
        strokeDasharray = "5,5" // Dashed border for highlight
      }

      return (
        <g key={index}>
          {/* Box */}
          <rect
            x={x}
            y={y}
            width={boxWidth}
            height={boxHeight}
            rx="6"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            className="transition-all duration-200"
          />
          
          {/* Value */}
          <text
            x={x + boxWidth / 2}
            y={y + boxHeight / 2 + 5}
            textAnchor="middle"
            fill="white"
            fontSize="16"
            fontWeight="600"
            className="select-none"
          >
            {String(value)}
          </text>
          
          {/* Index */}
          <text
            x={x + boxWidth / 2}
            y={y + boxHeight + 20}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="12"
            className="select-none"
          >
            {index}
          </text>
          
          {/* Focus indicator (caret/triangle) */}
          {isFocused(index) && (
            <g>
              {/* Upward triangle above box */}
              <polygon
                points={`${x + boxWidth / 2 - 8},${y - 8} ${x + boxWidth / 2 + 8},${y - 8} ${x + boxWidth / 2},${y - 20}`}
                fill="#f59e0b"
                className="transition-all duration-200"
              />
              {/* Downward triangle below box */}
              <polygon
                points={`${x + boxWidth / 2 - 8},${y + boxHeight + 8} ${x + boxWidth / 2 + 8},${y + boxHeight + 8} ${x + boxWidth / 2},${y + boxHeight + 20}`}
                fill="#f59e0b"
                className="transition-all duration-200"
              />
            </g>
          )}
        </g>
      )
    })
  }

  // Generate operation indicator
  const generateOperationIndicator = () => {
    if (!op || focusIndex === null) return null
    
    const x = startX + focusIndex * (boxWidth + spacing) + boxWidth / 2
    const y = startY - 40
    
    let operationText = ""
    let textColor = "#f59e0b"
    
    if (op === "insert") {
      operationText = "INSERT"
      textColor = "#10b981"
    } else if (op === "delete") {
      operationText = "DELETE"
      textColor = "#ef4444"
    }
    
    return (
      <g>
        {/* Background circle */}
        <circle
          cx={x}
          cy={y}
          r="25"
          fill="#1f2937"
          stroke={textColor}
          strokeWidth="2"
        />
        {/* Operation text */}
        <text
          x={x}
          y={y + 4}
          textAnchor="middle"
          fill={textColor}
          fontSize="10"
          fontWeight="700"
          className="select-none"
        >
          {operationText}
        </text>
      </g>
    )
  }

  const ariaLabel = `Array visualization, frame ${currentFrameIndex + 1} of ${totalFrames}. ${frame.meta.label}`

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
          {/* Background */}
          <rect width="100%" height="100%" fill="#111827" />
          
          {/* Operation indicator */}
          {generateOperationIndicator()}
          
          {/* Array elements */}
          {generateElements()}
          
          {/* Warning if too many elements */}
          {values.length > maxElements && (
            <text
              x={svgWidth / 2}
              y={svgHeight - 20}
              textAnchor="middle"
              fill="#f59e0b"
              fontSize="14"
              className="select-none"
            >
              Showing first {maxElements} of {values.length} elements
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-1 flex items-center justify-center space-x-3 text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-gray-600 border-2 border-gray-500"></div>
          <span>Normal Element</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-green-600 border-2 border-green-500 border-dashed"></div>
          <span>Highlighted</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-amber-600 border-4 border-amber-500"></div>
          <span>Focus Index</span>
        </div>
      </div>
    </div>
  )
}

export default ArrayView

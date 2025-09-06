import React from 'react'
import { Frame } from '../algorithms/types'

interface StackViewProps {
  frame: Frame<Record<string, unknown>> | null
  currentFrameIndex?: number
  totalFrames?: number
}

const StackView: React.FC<StackViewProps> = ({ frame, currentFrameIndex = 0, totalFrames = 0 }) => {
  if (!frame) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">No Stack Data</h3>
          <p className="text-gray-500">Load a preset or enter commands to see the stack visualization</p>
        </div>
      </div>
    )
  }

  // Safely extract stack state properties
  const items = (frame.state.items as (number | string)[]) || []
  const highlightIndex = (frame.state.highlightIndex as number | null) ?? null
  const op = (frame.state.op as "push" | "pop" | null) ?? null

  // Calculate dimensions
  const maxElements = 20
  const elementCount = Math.min(items.length, maxElements)
  
  // SVG dimensions - responsive
  const svgWidth = 400
  const svgHeight = Math.max(400, elementCount * 100 + 200)
  
  // Element dimensions
  const boxWidth = 120
  const boxHeight = 60
  const boxSpacing = 20
  const startX = 140
  const startY = 50

  return (
    <div className="w-full h-full p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">📚</div>
        <h2 className="text-xl font-semibold text-white">Stack</h2>
        <p className="text-gray-400 text-sm">
          Frame {frame.meta.step}: {frame.meta.label}
        </p>
        {totalFrames > 0 && (
          <p className="text-gray-500 text-xs mt-1">
            {currentFrameIndex + 1} of {totalFrames}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <svg
          width="100%"
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Stack visualization, frame ${frame.meta.step} of ${totalFrames || 'N'}`}
          className="max-w-full"
        >
          {/* Define arrow markers */}
          <defs>
            <marker
              id="arrowhead-up"
              markerWidth="10"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 7, 5 0, 10 7"
                fill="currentColor"
                className="text-blue-400"
              />
            </marker>
          </defs>

          {/* Stack boxes - rendered from bottom to top */}
          {items.length === 0 ? (
            <g>
              <rect
                x={startX}
                y={startY + 200}
                width={boxWidth}
                height={boxHeight}
                rx="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="text-gray-500"
              />
              <text
                x={startX + boxWidth / 2}
                y={startY + 200 + boxHeight / 2 + 5}
                textAnchor="middle"
                className="text-sm fill-gray-500"
              >
                Empty
              </text>
            </g>
          ) : (
            items.map((item, index) => {
              // Stack grows upward, so reverse the order for visual representation
              const visualIndex = items.length - 1 - index
              const y = startY + visualIndex * (boxHeight + boxSpacing)
              const isHighlighted = highlightIndex === index
              const isTop = index === items.length - 1

              return (
                <g key={index}>
                  {/* Box */}
                  <rect
                    x={startX}
                    y={y}
                    width={boxWidth}
                    height={boxHeight}
                    rx="8"
                    fill={isHighlighted ? "rgb(59 130 246 / 0.1)" : "rgb(31 41 55)"}
                    stroke={isHighlighted ? "rgb(59 130 246)" : "rgb(75 85 99)"}
                    strokeWidth={isHighlighted ? "3" : "2"}
                    strokeDasharray={isHighlighted ? "5,5" : "none"}
                    className={isHighlighted ? "drop-shadow-lg" : ""}
                  />
                  
                  {/* Item value */}
                  <text
                    x={startX + boxWidth / 2}
                    y={y + boxHeight / 2 + 5}
                    textAnchor="middle"
                    className={`text-sm font-medium ${
                      isHighlighted ? "fill-blue-300" : "fill-white"
                    }`}
                  >
                    {String(item)}
                  </text>
                  
                  {/* Index label on the side */}
                  <text
                    x={startX - 20}
                    y={y + boxHeight / 2 + 5}
                    textAnchor="middle"
                    className="text-xs fill-gray-400"
                  >
                    {index}
                  </text>
                  
                  {/* Top indicator */}
                  {isTop && (
                    <g>
                      <text
                        x={startX + boxWidth / 2}
                        y={y - 10}
                        textAnchor="middle"
                        className="text-xs font-bold fill-green-400"
                      >
                        TOP
                      </text>
                      <line
                        x1={startX + boxWidth / 2}
                        y1={y - 5}
                        x2={startX + boxWidth / 2}
                        y2={y}
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-green-400"
                        markerEnd="url(#arrowhead-up)"
                      />
                    </g>
                  )}
                </g>
              )
            })
          )}

          {/* Stack base indicator */}
          {items.length > 0 && (
            <g>
              <rect
                x={startX - 10}
                y={startY + items.length * (boxHeight + boxSpacing) - boxSpacing + boxHeight}
                width={boxWidth + 20}
                height="8"
                rx="4"
                fill="rgb(75 85 99)"
                className="text-gray-500"
              />
              <text
                x={startX + boxWidth / 2}
                y={startY + items.length * (boxHeight + boxSpacing) - boxSpacing + boxHeight + 20}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                Base
              </text>
            </g>
          )}

          {/* Operation indicators */}
          {op && (
            <g>
              <text
                x={svgWidth / 2}
                y={startY + Math.max(items.length * (boxHeight + boxSpacing), 200) + 60}
                textAnchor="middle"
                className="text-sm font-medium fill-blue-300"
              >
                Operation: {op}
                {highlightIndex !== null && ` (index ${highlightIndex})`}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center space-x-6 text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-green-400 rounded"></div>
          <span>Top</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-400 border-dashed rounded bg-blue-400/10"></div>
          <span>Highlighted</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-500 rounded"></div>
          <span>Base</span>
        </div>
      </div>
    </div>
  )
}

export default StackView
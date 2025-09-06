import React from 'react'
import { Frame } from '../algorithms/types'

interface QueueViewProps {
  frame: Frame<Record<string, unknown>> | null
  currentFrameIndex?: number
  totalFrames?: number
}

const QueueView: React.FC<QueueViewProps> = ({ frame, currentFrameIndex = 0, totalFrames = 0 }) => {
  if (!frame) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">No Queue Data</h3>
          <p className="text-gray-500">Load a preset or enter commands to see the queue visualization</p>
        </div>
      </div>
    )
  }

  // Safely extract queue state properties
  const items = (frame.state.items as (number | string)[]) || []
  const highlightIndex = (frame.state.highlightIndex as number | null) ?? null
  const op = (frame.state.op as "enqueue" | "dequeue" | null) ?? null
  const frontIndex = (frame.state.frontIndex as number) ?? 0

  // Calculate dimensions
  const maxElements = 25
  const elementCount = Math.min(items.length, maxElements)
  
  // SVG dimensions - responsive
  const svgWidth = Math.max(800, elementCount * 80 + 200)
  const svgHeight = 300
  
  // Element dimensions
  const boxWidth = 60
  const boxHeight = 80
  const boxSpacing = 20
  const startX = 100
  const startY = 100

  // Arrow dimensions
  const arrowLength = 30
  const arrowHeadSize = 8

  return (
    <div className="w-full h-full p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">📋</div>
        <h2 className="text-xl font-semibold text-white">Queue</h2>
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
          aria-label={`Queue visualization, frame ${frame.meta.step} of ${totalFrames || 'N'}`}
          className="max-w-full"
        >
          {/* Define arrow markers */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="currentColor"
                className="text-blue-400"
              />
            </marker>
            <marker
              id="arrowhead-green"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="currentColor"
                className="text-green-400"
              />
            </marker>
          </defs>

          {/* Queue boxes */}
          {items.length === 0 ? (
            <g>
              <rect
                x={startX}
                y={startY}
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
                y={startY + boxHeight / 2 + 5}
                textAnchor="middle"
                className="text-sm fill-gray-500"
              >
                Empty
              </text>
            </g>
          ) : (
            items.map((item, index) => {
              const x = startX + index * (boxWidth + boxSpacing)
              const isHighlighted = highlightIndex === index
              const isFront = index === frontIndex
              const isRear = index === items.length - 1

              return (
                <g key={index}>
                  {/* Box */}
                  <rect
                    x={x}
                    y={startY}
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
                    x={x + boxWidth / 2}
                    y={startY + boxHeight / 2 + 5}
                    textAnchor="middle"
                    className={`text-sm font-medium ${
                      isHighlighted ? "fill-blue-300" : "fill-white"
                    }`}
                  >
                    {String(item)}
                  </text>
                  
                  {/* Index label */}
                  <text
                    x={x + boxWidth / 2}
                    y={startY + boxHeight + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-400"
                  >
                    {index}
                  </text>
                  
                  {/* Front indicator */}
                  {isFront && (
                    <g>
                      <text
                        x={x + boxWidth / 2}
                        y={startY - 10}
                        textAnchor="middle"
                        className="text-xs font-bold fill-green-400"
                      >
                        FRONT
                      </text>
                      <line
                        x1={x + boxWidth / 2}
                        y1={startY - 5}
                        x2={x + boxWidth / 2}
                        y2={startY}
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-green-400"
                      />
                    </g>
                  )}
                  
                  {/* Rear indicator */}
                  {isRear && (
                    <g>
                      <text
                        x={x + boxWidth / 2}
                        y={startY + boxHeight + 35}
                        textAnchor="middle"
                        className="text-xs font-bold fill-orange-400"
                      >
                        REAR
                      </text>
                      <line
                        x1={x + boxWidth / 2}
                        y1={startY + boxHeight + 5}
                        x2={x + boxWidth / 2}
                        y2={startY + boxHeight + 20}
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-orange-400"
                      />
                    </g>
                  )}
                </g>
              )
            })
          )}

          {/* Flow direction arrow */}
          {items.length > 1 && (
            <g>
              <line
                x1={startX - 20}
                y1={startY + boxHeight / 2}
                x2={startX + items.length * (boxWidth + boxSpacing) - boxSpacing + 20}
                y2={startY + boxHeight / 2}
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="3,3"
                className="text-gray-500"
                markerEnd="url(#arrowhead)"
              />
              <text
                x={startX + (items.length * (boxWidth + boxSpacing) - boxSpacing) / 2}
                y={startY + boxHeight / 2 - 10}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                front → rear
              </text>
            </g>
          )}

          {/* Operation indicators */}
          {op && (
            <g>
              <text
                x={svgWidth / 2}
                y={startY + boxHeight + 60}
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
          <span>Front</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-orange-400 rounded"></div>
          <span>Rear</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-400 border-dashed rounded bg-blue-400/10"></div>
          <span>Highlighted</span>
        </div>
      </div>
    </div>
  )
}

export default QueueView
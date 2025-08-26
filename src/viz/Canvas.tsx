import React from 'react'
import { AlgorithmKey, Frame } from '../algorithms'

/**
 * Props for the universal Canvas component
 */
export interface CanvasProps {
  /** The algorithm key to determine which view to use */
  algorithmKey: AlgorithmKey
  /** The current frame to render, or null if no frame */
  frame: Frame<Record<string, unknown>> | null
  /** Optional custom renderer function for fallback */
  renderer?: (frame: Frame<Record<string, unknown>>) => React.ReactNode
  /** Custom CSS class for the canvas container */
  className?: string
}

/**
 * Universal canvas component that renders algorithm frames
 * 
 * Features:
 * - Algorithm-specific view selection
 * - Fallback to generic renderer if specific view missing
 * - Empty state when no frame
 * - JSON preview of frame state
 * 
 * @param props - Canvas props
 * @returns Rendered canvas with appropriate view
 */
const Canvas: React.FC<CanvasProps> = ({
  algorithmKey,
  frame,
  renderer,
  className = ''
}) => {
  // Default fallback renderer
  const defaultRenderer = (frame: Frame<Record<string, unknown>>) => (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Frame {frame.meta.step}: {frame.meta.label}
        </h3>
        <div className="text-sm text-gray-400">
          Algorithm: {algorithmKey}
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">State Preview:</h4>
        <div className="bg-gray-800 rounded p-3 max-h-48 overflow-y-auto">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">
            {JSON.stringify(frame.state, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )

  // Render empty state
  if (!frame) {
    return (
      <div className={`w-full h-full bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-medium mb-2">Visualization Canvas</h3>
          <p className="text-sm">
            Load a preset or add commands to see the visualization
          </p>
        </div>
      </div>
    )
  }

  // For now, always use the fallback renderer
  // Algorithm-specific views will be implemented later
  const renderFunction = renderer || defaultRenderer
  return (
    <div className={`w-full h-full bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      {renderFunction(frame)}
    </div>
  )
}

export default Canvas

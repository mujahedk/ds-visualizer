import React from 'react'
import { Frame, AlgorithmKey } from '../algorithms/types'
import { algorithmViews } from './index'

export interface CanvasProps {
  algorithmKey: AlgorithmKey
  frame: Frame<Record<string, unknown>> | null
  currentFrameIndex?: number
  totalFrames?: number
}

const Canvas: React.FC<CanvasProps> = ({ 
  algorithmKey, 
  frame, 
  currentFrameIndex = 0, 
  totalFrames = 0 
}) => {
  if (!frame) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold mb-2">No Frame Loaded</h3>
          <p className="text-gray-500">Load a preset or enter commands to see the visualization</p>
        </div>
      </div>
    )
  }

  // Get the specific algorithm view component
  const AlgorithmView = algorithmViews[algorithmKey]
  
  if (AlgorithmView) {
    // Render the algorithm-specific view
    return (
      <AlgorithmView 
        frame={frame} 
        currentFrameIndex={currentFrameIndex}
        totalFrames={totalFrames}
      />
    )
  }

  // Fallback to generic JSON inspector
  return (
    <div className="w-full h-full p-2">
      <div className="text-center mb-3">
        <div className="text-3xl mb-2">📊</div>
        <h2 className="text-lg font-semibold text-white">Algorithm Visualization</h2>
        <p className="text-gray-400 text-sm">
          Frame {currentFrameIndex + 1} of {totalFrames}: {frame.meta.label}
        </p>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-2 mb-2">
        <h3 className="text-sm font-medium text-gray-300 mb-2">State:</h3>
        <div className="bg-gray-800 rounded p-2 max-h-48 overflow-y-auto">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">
            {JSON.stringify(frame.state, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="text-center text-gray-500 text-sm">
        🚧 Custom visualization coming soon for {algorithmKey}...
      </div>
    </div>
  )
}

export default Canvas

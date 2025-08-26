import React from 'react'
import { Frame } from '../algorithms'

/**
 * Props for the HashView component
 */
export interface HashViewProps {
  /** The frame to render */
  frame: Frame<Record<string, unknown>>
}

/**
 * Hash Table visualization component
 * 
 * @param props - Component props
 * @returns Rendered hash table visualization
 */
const HashView: React.FC<HashViewProps> = ({ frame }) => {
  return (
    <div className="w-full h-full p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🗂️</div>
        <h2 className="text-xl font-semibold text-white">Hash Table</h2>
        <p className="text-gray-400 text-sm">
          Frame {frame.meta.step}: {frame.meta.label}
        </p>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Hash Table State:</h3>
        <div className="bg-gray-800 rounded p-3 max-h-32 overflow-y-auto">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">
            {JSON.stringify(frame.state, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="text-center text-gray-500 text-sm">
        🚧 Hash table visualization coming soon...
      </div>
    </div>
  )
}

export default HashView

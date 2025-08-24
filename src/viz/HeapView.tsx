import React from 'react'

interface HeapViewProps {
  // TODO: Define props for heap visualization
  data?: number[]; // Placeholder prop
}

const HeapView: React.FC<HeapViewProps> = () => {
  return (
    <div className="heap-view">
      <h2>Heap Visualization</h2>
      {/* TODO: Implement heap visualization with SVG */}
    </div>
  )
}

export default HeapView

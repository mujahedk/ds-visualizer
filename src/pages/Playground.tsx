import React from 'react'
import Container from '../components/layout/Container'
import { getAlgorithms } from '../algorithms/registry'

const Playground: React.FC = () => {
  const algorithms = getAlgorithms()

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <Container>
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6">
            Interactive Playground
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            This is where you'll be able to interactively explore data structures and algorithms.
          </p>
          
          {/* Algorithm Registry Test */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Algorithm Registry Test
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {algorithms.map((algo) => (
                <div key={algo.key} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{algo.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{algo.description}</p>
                  
                  {/* Complexities */}
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Complexities:</h4>
                    <div className="space-y-1">
                      {Object.entries(algo.complexities).map(([operation, complexity]) => (
                        <div key={operation} className="flex justify-between text-xs">
                          <span className="text-gray-300">{operation}:</span>
                          <span className="text-red-400 font-mono">{complexity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Mock Frames Info */}
                  <div className="text-xs text-gray-400">
                    Mock frames: {algo.createMockFrames().length}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-12">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-400">
              We're building an interactive playground where you can:
            </p>
            <ul className="text-gray-400 mt-4 space-y-2 text-left max-w-md mx-auto">
              <li>• Insert and delete elements</li>
              <li>• Watch step-by-step algorithm execution</li>
              <li>• Control animation speed and playback</li>
              <li>• Learn with interactive examples</li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Playground

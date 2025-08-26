import React from 'react'
import Container from '../components/layout/Container'

const Playground: React.FC = () => {
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

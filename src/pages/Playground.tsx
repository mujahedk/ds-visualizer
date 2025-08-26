import React, { useState, useCallback } from 'react'
import Container from '../components/layout/Container'
import PlaybackControls from '../player/PlaybackControls'
import { usePlayerStore, getCurrentFrame } from '../player/playerStore'
import Canvas from '../viz/Canvas'
import Toast from '../components/Toast'
import { getAlgorithms, getAlgorithm, AlgorithmKey, algorithmPresets } from '../algorithms'

const Playground: React.FC = () => {
  // Player store
  const player = usePlayerStore()
  const { frames, index } = player
  const { setFrames } = player

  // Local state
  const [algorithmKey, setAlgorithmKey] = useState<AlgorithmKey>('heap')
  const [commandInput, setCommandInput] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null)

  const algorithms = getAlgorithms()
  const currentAlgorithm = getAlgorithm(algorithmKey)
  const currentFrame = getCurrentFrame(frames, index)

  // Load frames when algorithm changes
  React.useEffect(() => {
    if (currentAlgorithm) {
      const newFrames = currentAlgorithm.createMockFrames()
      setFrames(newFrames)
    }
  }, [algorithmKey, currentAlgorithm, setFrames])

  // Event handlers
  const handleAlgorithmChange = useCallback((newKey: AlgorithmKey) => {
    setAlgorithmKey(newKey)
  }, [])

  const handleRunPreset = useCallback((presetIndex: number) => {
    if (!currentAlgorithm) return
    
    const presets = currentAlgorithm.createMockFrames()
    if (presets[presetIndex]) {
      setFrames(presets)
      setToast({ message: `Loaded preset ${presetIndex + 1}`, type: 'success' })
    }
  }, [currentAlgorithm, setFrames])

  const handleApply = useCallback(() => {
    if (!currentAlgorithm || !commandInput.trim()) return
    
    const command = currentAlgorithm.parseCommand(commandInput.trim())
    if (command) {
      setToast({ 
        message: `Commands parsed (mock): ${command.type}${command.payload ? ` ${command.payload}` : ''}`, 
        type: 'info' 
      })
    } else {
      setToast({ 
        message: 'Invalid command format. Try: insert 5, delete 3, search 10', 
        type: 'warning' 
      })
    }
  }, [currentAlgorithm, commandInput])

  const handleResetAlgorithm = useCallback(() => {
    if (currentAlgorithm) {
      const newFrames = currentAlgorithm.createMockFrames()
      setFrames(newFrames)
      setToast({ message: 'Algorithm reset to initial state', type: 'success' })
    }
  }, [currentAlgorithm, setFrames])

  // Helper text for command input
  const getCommandHelperText = () => {
    if (!currentAlgorithm) return ''
    
    const presets = currentAlgorithm.createMockFrames()
    if (presets.length > 0) {
      const sampleCommands = ['insert 5', 'delete 3', 'search 10', 'clear', 'reset']
      return `Try: ${sampleCommands.slice(0, 3).join(', ')}`
    }
    return 'Enter commands separated by semicolons'
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <Container>
          <div className="flex items-center justify-between">
            {/* Algorithm Selector */}
            <div className="flex items-center space-x-4">
              <label htmlFor="algorithm-select" className="text-white font-medium">
                Algorithm:
              </label>
              <select
                id="algorithm-select"
                value={algorithmKey}
                onChange={(e) => handleAlgorithmChange(e.target.value as AlgorithmKey)}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {algorithms.map((algo) => (
                  <option key={algo.key} value={algo.key}>
                    {algo.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Complexity Badges */}
            {currentAlgorithm && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Complexities:</span>
                {Object.entries(currentAlgorithm.complexities).slice(0, 3).map(([operation, complexity]) => (
                  <span
                    key={operation}
                    className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                    title={`${operation}: ${complexity}`}
                  >
                    {operation}: {complexity}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Controls */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Controls</h2>
          
          {/* Command Input */}
          <div className="mb-6">
            <label htmlFor="command-input" className="block text-gray-300 text-sm font-medium mb-2">
              Command(s):
            </label>
            <textarea
              id="command-input"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="insert 5, 1, 9; pop 2"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-gray-400 text-xs mt-2">{getCommandHelperText()}</p>
          </div>

          {/* Control Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleApply}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
            >
              Apply
            </button>
            
            <button
              onClick={handleResetAlgorithm}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
            >
              Reset
            </button>

            {/* Run Preset Dropdown */}
            <div className="relative">
              <label htmlFor="preset-select" className="block text-gray-300 text-sm font-medium mb-2">
                Run Preset:
              </label>
              <select
                id="preset-select"
                onChange={(e) => handleRunPreset(parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                defaultValue=""
              >
                <option value="" disabled>Select a preset...</option>
                {currentAlgorithm && algorithmPresets[currentAlgorithm.key].presets.map((preset: string, index: number) => (
                  <option key={index} value={index}>
                    {preset}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Frame Info */}
          {currentFrame && (
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-gray-300 text-sm font-medium mb-2">Current Frame</h3>
              <div className="text-white text-sm">
                <div className="mb-1">
                  <span className="text-gray-400">Step:</span> {currentFrame.meta.step}
                </div>
                <div>
                  <span className="text-gray-400">Label:</span> {currentFrame.meta.label}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Area */}
          <div className="flex-1 bg-gray-900 p-6">
            <Canvas
              algorithmKey={algorithmKey}
              frame={currentFrame}
            />
          </div>

          {/* Playback Controls */}
          <PlaybackControls
            player={player}
            actions={player}
          />
        </div>
      </div>

      {/* Toast Notifications */}
      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'info'}
        isVisible={!!toast}
        onClose={() => setToast(null)}
      />
    </div>
  )
}

export default Playground

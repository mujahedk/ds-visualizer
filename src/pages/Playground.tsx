import React, { useState, useCallback, useEffect } from 'react'
import Container from '../components/layout/Container'
import PlaybackControls from '../player/PlaybackControls'
import { usePlayerStore, getCurrentFrame } from '../player/playerStore'
import Canvas from '../viz/Canvas'
import Toast from '../components/Toast'
import { getAlgorithms, getAlgorithm, AlgorithmKey, algorithmPresets } from '../algorithms'

const Playground: React.FC = () => {
  const player = usePlayerStore()
  const { frames, index } = player
  const { setFrames } = player

  const [algorithmKey, setAlgorithmKey] = useState<AlgorithmKey>('heap')
  const [commandInput, setCommandInput] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  const algorithms = getAlgorithms()
  const currentAlgorithm = getAlgorithm(algorithmKey)
  const currentFrame = getCurrentFrame(frames, index)

  React.useEffect(() => {
    if (currentAlgorithm) {
      const newFrames = currentAlgorithm.createMockFrames()
      setFrames(newFrames)
    }
  }, [algorithmKey, currentAlgorithm, setFrames])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
        return
      }

      switch (event.key) {
        case ' ':
          event.preventDefault()
          if (player.playing) {
            player.pause()
          } else {
            player.play()
          }
          break
        case 'ArrowLeft':
          event.preventDefault()
          player.stepPrev()
          break
        case 'ArrowRight':
          event.preventDefault()
          player.stepNext()
          break
        case 'r':
        case 'R':
          event.preventDefault()
          player.reset()
          break
        case '?':
          event.preventDefault()
          setShowKeyboardShortcuts(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [player])

  const handleAlgorithmChange = useCallback((newKey: AlgorithmKey) => {
    setAlgorithmKey(newKey)
  }, [])

  const handleRunPreset = useCallback((presetIndex: number) => {
    if (!currentAlgorithm) return
    const presets = currentAlgorithm.createMockFrames()
    if (presets[presetIndex]) {
      setFrames(presets)
      setToast({ message: `Loaded preset: ${algorithmPresets[algorithmKey].presets[presetIndex]}`, type: 'success' })
    }
  }, [currentAlgorithm, setFrames, algorithmKey])

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

  const getCommandHelperText = () => {
    if (!currentAlgorithm) return 'Select an algorithm to see command examples'
    return `Examples: ${algorithmPresets[algorithmKey].sampleInputs.slice(0, 3).join(', ')}`
  }

  const getCanvasAriaLabel = () => {
    if (!currentFrame) {
      return `Visualization canvas for ${currentAlgorithm?.title || 'algorithm'}. No frame loaded.`
    }
    return `Visualization canvas for ${currentAlgorithm?.title || 'algorithm'}. Frame ${currentFrame.meta.step}: ${currentFrame.meta.label}`
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <Container>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label htmlFor="algorithm-select" className="text-white font-medium">
                Algorithm:
              </label>
              <select
                id="algorithm-select"
                value={algorithmKey}
                onChange={(e) => handleAlgorithmChange(e.target.value as AlgorithmKey)}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Select algorithm to visualize"
              >
                {algorithms.map((algo) => (
                  <option key={algo.key} value={algo.key}>
                    {algo.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-4">
              {currentAlgorithm && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">Complexities:</span>
                  {Object.entries(currentAlgorithm.complexities).slice(0, 3).map(([operation, complexity]) => (
                    <span 
                      key={operation} 
                      className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded" 
                      title={`${operation}: ${complexity}`}
                      role="text"
                      aria-label={`${operation} complexity: ${complexity}`}
                    >
                      {operation}: {complexity}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowKeyboardShortcuts(prev => !prev)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors text-sm"
                aria-label="Show keyboard shortcuts help"
                title="Press ? for keyboard shortcuts"
              >
                ⌨️ Help
              </button>
            </div>
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
              aria-label="Enter algorithm commands"
              aria-describedby="command-help"
            />
            <p id="command-help" className="text-gray-400 text-xs mt-2">
              {getCommandHelperText()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={handleApply} 
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
              aria-label="Apply the entered commands"
            >
              Apply
            </button>
            <button 
              onClick={handleResetAlgorithm} 
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
              aria-label="Reset algorithm to initial state"
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
                aria-label="Select a preset to run"
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
          <div 
            className="flex-1 bg-gray-900 p-6"
            role="img"
            aria-label={getCanvasAriaLabel()}
          >
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

      {/* Keyboard Shortcuts Help */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="text-gray-400 hover:text-white text-2xl"
                aria-label="Close keyboard shortcuts help"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-gray-300">
              <div className="flex justify-between">
                <span>Space</span>
                <span>Play/Pause</span>
              </div>
              <div className="flex justify-between">
                <span>← →</span>
                <span>Step Previous/Next</span>
              </div>
              <div className="flex justify-between">
                <span>R</span>
                <span>Reset</span>
              </div>
              <div className="flex justify-between">
                <span>?</span>
                <span>Show/Hide This Help</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

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

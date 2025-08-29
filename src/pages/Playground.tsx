import React, { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Container from '../components/layout/Container'
import PlaybackControls from '../player/PlaybackControls'
import { usePlayerStore, getCurrentFrame } from '../player/playerStore'
import Canvas from '../viz/Canvas'
import Toast from '../components/Toast'
import { getAlgorithms, getAlgorithm, AlgorithmKey, algorithmPresets } from '../algorithms'

const Playground: React.FC = () => {
  const [searchParams] = useSearchParams()
  const player = usePlayerStore()
  const { frames, index } = player
  const { setFrames, setIndex, pause } = player

  const [algorithmKey, setAlgorithmKey] = useState<AlgorithmKey>(() => {
    // Get algorithm from URL parameter, default to 'heap'
    const algoParam = searchParams.get('algo') as AlgorithmKey
    console.log('Playground: URL algo param:', algoParam)
    console.log('Playground: Available algorithms:', Object.keys(algorithmPresets))
    console.log('Playground: Algorithm found:', getAlgorithm(algoParam))
    return algoParam && getAlgorithm(algoParam) ? algoParam : 'heap'
  })
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
          handleResetAlgorithm()
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

  // Handle Cmd/Ctrl+Enter in command input
  const handleCommandKeyDown = (event: React.KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      handleApply()
    }
  }

  const handleAlgorithmChange = useCallback((newKey: AlgorithmKey) => {
    setAlgorithmKey(newKey)
    setCommandInput('') // Clear input when switching algorithms
  }, [])

  const handleRunPreset = useCallback((presetIndex: number) => {
    if (!currentAlgorithm) return

    // Get the preset object
    const preset = algorithmPresets[algorithmKey].presets[presetIndex]
    if (!preset) return

    // Try to execute the preset commands using createFramesFromInput
    if (currentAlgorithm.createFramesFromInput) {
      try {
        const frames = currentAlgorithm.createFramesFromInput(preset.commands)
        if (frames.length > 0) {
          setFrames(frames)
          setIndex(0)
          pause()
          setToast({ 
            message: `Loaded preset: ${preset.description} (${frames.length} frames generated)`, 
            type: 'success' 
          })
        } else {
          setToast({ 
            message: 'No frames generated from preset. Check preset format.', 
            type: 'warning' 
          })
        }
      } catch (error) {
        console.error('Error executing preset:', error)
        
        // Provide more helpful error messages for Array algorithm
        let errorMessage = 'Error executing preset. Check preset format.'
        if (algorithmKey === 'array') {
          errorMessage = `Array preset error: ${error instanceof Error ? error.message : 'Invalid format'}. Check preset commands.`
        }
        
        setToast({ 
          message: errorMessage, 
          type: 'error' 
        })
      }
    } else {
      // Fallback to mock frames if createFramesFromInput is not available
      const mockFrames = currentAlgorithm.createMockFrames()
      setFrames(mockFrames)
      setIndex(0)
      pause()
      setToast({ 
        message: `Loaded mock preset: ${preset.description}`, 
        type: 'info' 
      })
    }
  }, [currentAlgorithm, setFrames, setIndex, pause, algorithmKey])

  const handleApply = useCallback(() => {
    if (!currentAlgorithm || !commandInput.trim()) {
      setToast({
        message: 'Please enter some commands to execute',
        type: 'warning'
      })
      return
    }
    
    // Try to use real algorithm execution if available
    if (currentAlgorithm.createFramesFromInput) {
      try {
        const frames = currentAlgorithm.createFramesFromInput(commandInput.trim())
        if (frames.length > 0) {
          setFrames(frames)
          setIndex(0) // Start at frame 0
          pause() // Pause playback
          setToast({
            message: `Executed commands: ${commandInput.trim()} (${frames.length} frames generated)`,
            type: 'success'
          })
          return
        } else {
          setToast({
            message: 'No frames generated. Check your command format.',
            type: 'warning'
          })
          return
        }
      } catch (error) {
        console.error('Error executing algorithm:', error)
        
        // Provide more helpful error messages for Array algorithm
        let errorMessage = 'Error executing algorithm. Check command format.'
        if (algorithmKey === 'array') {
          errorMessage = `Array command error: ${error instanceof Error ? error.message : 'Invalid format'}. Try: insert 0 5; delete 1`
        }
        
        setToast({
          message: errorMessage,
          type: 'error'
        })
        return
      }
    }
    
    // Fallback to mock command parsing
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
  }, [currentAlgorithm, commandInput, setFrames, setIndex, pause, algorithmKey])

  const handleResetAlgorithm = useCallback(() => {
    if (currentAlgorithm) {
      const newFrames = currentAlgorithm.createMockFrames()
      setFrames(newFrames)
      setIndex(0) // Reset to first frame
      pause() // Pause playback
      setToast({ message: 'Algorithm reset to initial state', type: 'success' })
    }
  }, [currentAlgorithm, setFrames, setIndex, pause])

  const getCommandHelperText = () => {
    if (!currentAlgorithm) return 'Select an algorithm to see command examples'
    
    if (algorithmKey === 'heap') {
      return 'Examples: insert 5,1,9; pop 2; insert 10,3,7; pop 1'
    }
    
    if (algorithmKey === 'array') {
      return 'Formats: insert 3 42 or insert index=3 value=42; delete 2 or delete index=2; Separate with ; or newlines'
    }
    
    return `Examples: ${algorithmPresets[algorithmKey].sampleInputs.slice(0, 3).join(', ')}`
  }

  const getCommandPlaceholder = () => {
    if (algorithmKey === 'heap') {
      return 'insert 5,1,9,2,7; pop 2\ninsert 10; insert 3,7; pop 1'
    }
    
    if (algorithmKey === 'array') {
      return 'insert 0 5; insert 1 7\ninsert 1 6; delete 2'
    }
    
    return 'insert 5, delete 3, search 10'
  }

  const getCanvasAriaLabel = () => {
    if (!currentFrame) {
      return `Visualization canvas for ${currentAlgorithm?.title || 'algorithm'}. No frame loaded.`
    }
    return `Visualization canvas for ${currentAlgorithm?.title || 'algorithm'}. Frame ${currentFrame.meta.step}: ${currentFrame.meta.label}`
  }

      return (
      <div className="h-screen bg-gray-900 flex flex-col">
              {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 p-2">
        <Container>
          <div className="flex items-center justify-between">
            {/* Algorithm Selector */}
            <div className="flex items-center space-x-4">
              <label htmlFor="algorithm-select" className="text-white font-medium">Algorithm:</label>
              <select
                id="algorithm-select"
                value={algorithmKey}
                onChange={(e) => handleAlgorithmChange(e.target.value as AlgorithmKey)}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Select algorithm to visualize"
              >
                {algorithms.map((algo) => (
                  <option key={algo.key} value={algo.key}>{algo.title}</option>
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
        <div className="w-72 bg-gray-800 border-r border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-white mb-4 text-center">🎮 Controls</h2>
          
          {/* Presets Section */}
          <div className="mb-4 p-3 bg-gray-750 rounded-lg border border-gray-600">
            <label htmlFor="preset-select" className="block text-gray-200 text-sm font-medium mb-2 flex items-center">
              <span className="mr-2">⚡</span>
              Quick Presets
            </label>
            <select
              id="preset-select"
              onChange={(e) => handleRunPreset(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              defaultValue=""
              aria-label="Select a preset to run"
            >
              <option value="" disabled>Select a preset...</option>
              {currentAlgorithm && algorithmPresets[algorithmKey].presets.map((preset, index: number) => (
                <option key={index} value={index}>
                  {preset.description}: {preset.commands}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Commands Section */}
          <div className="mb-4 p-3 bg-gray-750 rounded-lg border border-gray-600">
            <label htmlFor="command-input" className="block text-gray-200 text-sm font-medium mb-2 flex items-center">
              <span className="mr-2">⌨️</span>
              Custom Commands
              <span className="text-gray-400 text-xs ml-2">(⌘+Enter to apply)</span>
            </label>
                                  <textarea
                        id="command-input"
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        onKeyDown={handleCommandKeyDown}
                        placeholder={getCommandPlaceholder()}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        aria-label="Enter algorithm commands"
                        aria-describedby="command-help"
                      />
            <p id="command-help" className="text-gray-400 text-xs mt-2">
              {getCommandHelperText()}
            </p>
            
            {/* Array-specific detailed help */}
            {algorithmKey === 'array' && (
              <div className="mt-3 p-2 bg-gray-700 rounded border border-gray-600">
                <details className="text-gray-300 text-xs">
                  <summary className="cursor-pointer hover:text-white font-medium">
                    📖 Array Command Reference
                  </summary>
                  <div className="mt-2 space-y-1">
                    <div><strong>Insert:</strong> <code className="bg-gray-800 px-1 rounded">insert 0 5</code> or <code className="bg-gray-800 px-1 rounded">insert index=0 value=5</code></div>
                    <div><strong>Delete:</strong> <code className="bg-gray-800 px-1 rounded">delete 1</code> or <code className="bg-gray-800 px-1 rounded">delete index=1</code></div>
                    <div><strong>Reset:</strong> <code className="bg-gray-800 px-1 rounded">reset</code></div>
                    <div><strong>Multiple:</strong> Separate with <code className="bg-gray-800 px-1 rounded">;</code> or newlines</div>
                    <div><strong>Example:</strong> <code className="bg-gray-800 px-1 rounded">insert 0 5; insert 1 7; delete 0</code></div>
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 mb-4">
            <button
              onClick={handleApply}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              aria-label="Apply the entered commands"
            >
              🚀 Run (⌘+Enter)
            </button>
            <button
              onClick={handleResetAlgorithm}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              aria-label="Reset algorithm to initial state"
            >
              🔄 Reset (R)
            </button>
          </div>

          {/* Current Frame Info */}
          {currentFrame && (
            <div className="p-3 bg-gradient-to-r from-gray-700 to-gray-750 rounded-lg border border-gray-600 shadow-lg">
              <h3 className="text-gray-200 text-sm font-medium mb-3 flex items-center">
                <span className="mr-2">📊</span>
                Current Frame
              </h3>
              <div className="text-white text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Step:</span>
                  <span className="bg-gray-600 px-2 py-1 rounded text-xs font-mono">{currentFrame.meta.step}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Label:</span>
                  <span className="bg-gray-600 px-2 py-1 rounded text-xs max-w-32 truncate" title={currentFrame.meta.label}>{currentFrame.meta.label}</span>
                </div>
              </div>
            </div>
          )}
        </div>

                  {/* Right Panel - Canvas */}
          <div
            className="flex-1 bg-gray-900 p-2"
            role="img"
            aria-label={getCanvasAriaLabel()}
          >
          <Canvas
            algorithmKey={algorithmKey}
            frame={currentFrame}
            currentFrameIndex={index}
            totalFrames={frames.length}
          />
        </div>
      </div>

                      {/* Playback Controls */}
                <PlaybackControls
                  player={player}
                  actions={player}
                  className="py-1"
                />

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
                <span>⌘+Enter</span>
                <span>Apply Commands</span>
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

import React, { useEffect, useCallback, useState } from 'react'
import { PlayerState, PlayerActions } from './playerStore'
import { soundManager } from '../utils/sound'

export interface PlaybackControlsProps {
  /** Player state (frames, index, playing, speed) */
  player: PlayerState
  /** Player actions (play, pause, step, etc.) */
  actions: PlayerActions
  /** Whether to show keyboard shortcuts help */
  showShortcuts?: boolean
  /** Additional CSS classes */
  className?: string
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  player, actions, showShortcuts = true, className = ''
}) => {
  const { frames, index, playing, speed } = player
  const { play, pause, stepNext, stepPrev, setSpeed, reset, setIndex } = actions
  
  // Sound toggle state
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isSoundEnabled())

  const totalFrames = frames.length
  const currentFrame = frames[index] || null

  // Auto-pause when reaching the last frame
  useEffect(() => {
    if (playing && index >= totalFrames - 1) {
      pause()
    }
  }, [playing, index, totalFrames, pause])

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
          if (playing) {
            pause()
          } else {
            play()
          }
          break
        case 'ArrowLeft':
          event.preventDefault()
          stepPrev()
          break
        case 'ArrowRight':
          event.preventDefault()
          stepNext()
          break
        case 'r':
        case 'R':
          event.preventDefault()
          reset()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playing, play, pause, stepNext, stepPrev, reset])

  // Handle frame slider change
  const handleFrameSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(event.target.value) - 1
    if (newIndex >= 0 && newIndex < totalFrames) {
      setIndex(newIndex)
    }
  }, [setIndex, totalFrames])

  // Handle frame input change
  const handleFrameInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(event.target.value) - 1
    if (!isNaN(newIndex) && newIndex >= 0 && newIndex < totalFrames) {
      setIndex(newIndex)
    }
  }, [setIndex, totalFrames])

  // Handle frame input blur (when user finishes typing)
  const handleFrameInputBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const newIndex = parseInt(event.target.value) - 1
    if (isNaN(newIndex) || newIndex < 0) {
      event.target.value = '1'
      setIndex(0)
    } else if (newIndex >= totalFrames) {
      event.target.value = totalFrames.toString()
      setIndex(totalFrames - 1)
    }
  }, [setIndex, totalFrames])

  // Handle sound toggle
  const toggleSound = useCallback(() => {
    const newState = !soundEnabled
    setSoundEnabled(newState)
    soundManager.setEnabled(newState)
  }, [soundEnabled])

  const getShortcutText = (action: string) => {
    const shortcuts: Record<string, string> = {
      play: 'Space',
      prev: '←',
      next: '→',
      reset: 'R'
    }
    return shortcuts[action] || ''
  }

  return (
    <div className={`bg-gray-800 border-t border-gray-700 p-2 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left: Playback Controls */}
        <div className="flex items-center space-x-3">
          {/* Play/Pause Button */}
          <button
            onClick={playing ? pause : play}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label={playing ? 'Pause playback' : 'Start playback'}
            title={`${playing ? 'Pause' : 'Play'} (${getShortcutText('play')})`}
          >
            {playing ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Step Previous Button */}
          <button
            onClick={stepPrev}
            disabled={index <= 0}
            className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 text-white p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed"
            aria-label="Go to previous frame"
            title={`Previous frame (${getShortcutText('prev')})`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Step Next Button */}
          <button
            onClick={stepNext}
            disabled={index >= totalFrames - 1}
            className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 text-white p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed"
            aria-label="Go to next frame"
            title={`Next frame (${getShortcutText('next')})`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Reset Button */}
          <button
            onClick={reset}
            className="bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label="Reset to first frame"
            title={`Reset (${getShortcutText('reset')})`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.881.664A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.008a.5.5 0 01.416.223l.008.016a.5.5 0 01-.008.761l-.016.008a.5.5 0 01-.761-.008l-.008-.016a.5.5 0 01.008-.761l.016-.008zM16 17a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 011.881-.664A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 01-1 1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Center: Frame Navigation */}
        <div className="flex-1 mx-4">
          <div className="flex items-center space-x-3">
            {/* Frame Counter */}
            <span className="text-gray-300 text-sm min-w-[80px] text-center">
              Frame {index + 1} of {totalFrames}
            </span>
            
            {/* Frame Slider */}
            <div className="flex-1">
              <input
                type="range"
                min="1"
                max={totalFrames}
                value={index + 1}
                onChange={handleFrameSliderChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                aria-label={`Navigate to frame ${index + 1} of ${totalFrames}`}
              />
            </div>
            
            {/* Frame Input */}
            <input
              type="number"
              min="1"
              max={totalFrames}
              value={index + 1}
              onChange={handleFrameInputChange}
              onBlur={handleFrameInputBlur}
              className="w-16 bg-gray-700 border border-gray-600 text-white text-center rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Enter frame number"
            />
          </div>
        </div>

        {/* Right: Speed Control & Sound Toggle */}
        <div className="flex items-center space-x-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
              soundEnabled 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
            }`}
            aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
            title={soundEnabled ? 'Sound: ON' : 'Sound: OFF'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          
          {/* Speed Control */}
          <label htmlFor="speed-select" className="text-gray-300 text-sm">
            Speed:
          </label>
          <select
            id="speed-select"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Select playback speed"
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4×</option>
          </select>
        </div>
      </div>

      {/* Status Line - Current Frame Info */}
      {currentFrame && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-center">
            <span className="text-gray-400 text-sm">Current:</span>
            <span className="text-white font-medium ml-2">
              {currentFrame.meta.label}
            </span>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Legend */}
      {showShortcuts && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
            <span>⌨️ {getShortcutText('play')} Play/Pause</span>
            <span>⌨️ {getShortcutText('prev')} Previous</span>
            <span>⌨️ {getShortcutText('next')} Next</span>
            <span>⌨️ {getShortcutText('reset')} Reset</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaybackControls

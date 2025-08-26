import React, { useEffect } from 'react'
import { PlayerState, PlayerActions } from './playerStore'

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

/**
 * Universal playback controls for algorithm visualization
 * Provides play/pause, step navigation, speed control, and progress indication
 */
const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  player,
  actions,
  showShortcuts = true,
  className = ''
}) => {
  const { frames, index, playing, speed } = player
  const { play, pause, stepNext, stepPrev, setSpeed, reset } = actions

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

  const getShortcutText = (action: string) => {
    const shortcuts: Record<string, string> = {
      play: 'Space',
      prev: '←',
      next: '→',
      reset: 'R'
    }
    return shortcuts[action] || ''
  }

  const totalFrames = frames.length
  const progress = totalFrames > 0 ? ((index + 1) / totalFrames) * 100 : 0

  return (
    <div className={`bg-gray-800 border-t border-gray-700 p-4 ${className}`}>
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

          {/* Step Previous */}
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

          {/* Step Next */}
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
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Center: Progress Bar */}
        <div className="flex-1 mx-6">
          <div className="flex items-center space-x-3">
            <span className="text-gray-300 text-sm min-w-[60px] text-center">
              Frame {index + 1} of {totalFrames}
            </span>
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={index + 1}
                aria-valuemin={1}
                aria-valuemax={totalFrames}
                aria-label={`Frame ${index + 1} of ${totalFrames}`}
              />
            </div>
          </div>
        </div>

        {/* Right: Speed Control */}
        <div className="flex items-center space-x-3">
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

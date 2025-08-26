import React, { useEffect } from 'react'
import { PlayerState, PlayerActions } from './playerStore'

/**
 * Props for the PlaybackControls component
 */
export interface PlaybackControlsProps {
  /** Player state from usePlayerStore */
  player: PlayerState
  /** Player actions from usePlayerStore */
  actions: PlayerActions
  /** Whether to show keyboard shortcuts in tooltips */
  showShortcuts?: boolean
  /** Custom CSS class for the container */
  className?: string
}

/**
 * Universal playback controls component that works with any player store
 * 
 * Features:
 * - Play/Pause toggle
 * - Step Previous/Next navigation
 * - Speed selector (0.5×, 1×, 2×, 4×)
 * - Reset button
 * - Frame progress indicator
 * - Keyboard shortcuts (Space, ←/→, R)
 * 
 * @param props - Component props
 * @returns Rendered playback controls
 */
const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  player,
  actions,
  showShortcuts = true,
  className = ''
}) => {
  const { frames, index, playing, speed } = player
  const { play, pause, stepNext, stepPrev, setSpeed, reset } = actions
  
  const speeds = [0.5, 1, 2, 4]
  const totalFrames = frames.length
  const currentFrame = index + 1

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in form elements
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (playing) {
            pause()
          } else {
            play()
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (index > 0) stepPrev()
          break
        case 'ArrowRight':
          e.preventDefault()
          if (index < totalFrames - 1) stepNext()
          break
        case 'r':
        case 'R':
          e.preventDefault()
          reset()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playing, play, pause, stepNext, stepPrev, reset, index, totalFrames])

  const handlePlayPause = () => {
    if (totalFrames === 0) return
    if (playing) {
      pause()
    } else {
      play()
    }
  }

  const getShortcutText = (key: string) => {
    return showShortcuts ? ` (${key})` : ''
  }

  return (
    <div className={`bg-gray-800 border-t border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Left side - Playback controls */}
        <div className="flex items-center space-x-3">
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            disabled={totalFrames === 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
            aria-label={playing ? 'Pause' : 'Play'}
            title={`${playing ? 'Pause' : 'Play'}${getShortcutText('Space')}`}
          >
            {playing ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V9a1 1 0 00-1-1H7z" clipRule="evenodd" />
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
            disabled={index === 0}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white p-3 rounded-lg transition-colors disabled:cursor-not-allowed"
            aria-label="Step to previous frame"
            title={`Previous frame${getShortcutText('←')}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Step Next */}
          <button
            onClick={stepNext}
            disabled={index >= totalFrames - 1}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white p-3 rounded-lg transition-colors disabled:cursor-not-allowed"
            aria-label="Step to next frame"
            title={`Next frame${getShortcutText('→')}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Reset */}
          <button
            onClick={reset}
            disabled={totalFrames === 0}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white p-3 rounded-lg transition-colors disabled:cursor-not-allowed"
            aria-label="Reset to first frame"
            title={`Reset${getShortcutText('R')}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Center - Progress indicator */}
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">
              Frame {currentFrame} of {totalFrames}
            </div>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-200"
                style={{ 
                  width: `${totalFrames > 0 ? (currentFrame / totalFrames) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Right side - Speed control */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Speed:</span>
          <div className="flex bg-gray-700 rounded-lg p-1">
            {speeds.map((speedOption) => (
              <button
                key={speedOption}
                onClick={() => setSpeed(speedOption)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  speed === speedOption
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
                aria-label={`Set speed to ${speedOption}x`}
                title={`${speedOption}x speed`}
              >
                {speedOption}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaybackControls

import { useState, useCallback, useEffect } from 'react'
import { Frame } from '../algorithms'
import { soundManager } from '../utils/sound'

/**
 * Player store state interface
 */
export interface PlayerState {
  /** Array of frames to play through */
  frames: Frame[]
  /** Current frame index (0-based) */
  index: number
  /** Whether the player is currently playing */
  playing: boolean
  /** Playback speed multiplier (0.5x, 1x, 2x, 4x) */
  speed: number
}

/**
 * Player store actions interface
 */
export interface PlayerActions {
  /** Set the frames array and reset to first frame */
  setFrames: (frames: Frame[]) => void
  /** Set the current frame index */
  setIndex: (index: number) => void
  /** Start playing from current frame */
  play: () => void
  /** Pause playback */
  pause: () => void
  /** Step to next frame */
  stepNext: () => void
  /** Step to previous frame */
  stepPrev: () => void
  /** Set playback speed multiplier */
  setSpeed: (speed: number) => void
  /** Reset to first frame and pause */
  reset: () => void
}

/**
 * Hook that provides a universal player store
 * @returns Player state and actions
 */
export const usePlayerStore = (): PlayerState & PlayerActions => {
  const [frames, setFramesState] = useState<Frame[]>([])
  const [index, setIndexState] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeedState] = useState(1)

  // Auto-advance frames when playing
  useEffect(() => {
    if (!playing || frames.length === 0) return

    const interval = setInterval(() => {
      setIndexState(prev => {
        if (prev >= frames.length - 1) {
          setPlaying(false) // Stop at last frame
          return prev
        }
        const newIndex = prev + 1
        soundManager.playDing()
        return newIndex
      })
    }, 1000 / speed) // Convert speed multiplier to milliseconds

    return () => clearInterval(interval)
  }, [playing, frames.length, speed])

  // Actions
  const setFrames = useCallback((newFrames: Frame[]) => {
    setFramesState(newFrames)
    setIndexState(0) // Reset to first frame
    setPlaying(false) // Stop playing
  }, [])

  const setIndex = useCallback((newIndex: number) => {
    setIndexState(prev => {
      const clampedIndex = Math.max(0, Math.min(newIndex, frames.length - 1))
      if (clampedIndex !== prev) {
        soundManager.playDing()
      }
      return clampedIndex
    })
  }, [frames.length])

  const play = useCallback(() => {
    if (frames.length > 0) {
      setPlaying(true)
    }
  }, [frames.length])

  const pause = useCallback(() => {
    setPlaying(false)
  }, [])

  const stepNext = useCallback(() => {
    setIndexState(prev => {
      const newIndex = Math.min(prev + 1, frames.length - 1)
      if (newIndex !== prev) {
        soundManager.playDing()
      }
      return newIndex
    })
  }, [frames.length])

  const stepPrev = useCallback(() => {
    setIndexState(prev => {
      const newIndex = Math.max(prev - 1, 0)
      if (newIndex !== prev) {
        soundManager.playDing()
      }
      return newIndex
    })
  }, [])

  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed)
  }, [])

  const reset = useCallback(() => {
    setIndexState(0)
    setPlaying(false)
  }, [])

  return {
    frames,
    index,
    playing,
    speed,
    setFrames,
    setIndex,
    play,
    pause,
    stepNext,
    stepPrev,
    setSpeed,
    reset
  }
}

/**
 * Get the current frame safely
 * @param frames - Array of frames
 * @param index - Current frame index
 * @returns Current frame or null if invalid
 */
export const getCurrentFrame = (frames: Frame[], index: number): Frame | null => {
  if (frames.length === 0 || index < 0 || index >= frames.length) {
    return null
  }
  return frames[index]
}

/**
 * Check if player can step to previous frame
 * @param index - Current frame index
 * @returns True if can step previous
 */
export const canStepPrev = (index: number): boolean => {
  return index > 0
}

/**
 * Check if player can step to next frame
 * @param index - Current frame index
 * @param totalFrames - Total number of frames
 * @returns True if can step next
 */
export const canStepNext = (index: number, totalFrames: number): boolean => {
  return index < totalFrames - 1
}

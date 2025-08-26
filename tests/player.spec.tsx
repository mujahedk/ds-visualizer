import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { usePlayerStore } from '../src/player/playerStore'
import PlaybackControls from '../src/player/PlaybackControls'

// Mock frames for testing
const mockFrames = [
  { state: { array: [1] }, meta: { step: 1, label: 'Frame 1' } },
  { state: { array: [1, 2] }, meta: { step: 2, label: 'Frame 2' } },
  { state: { array: [1, 2, 3] }, meta: { step: 3, label: 'Frame 3' } },
  { state: { array: [1, 2, 3, 4] }, meta: { step: 4, label: 'Frame 4' } },
  { state: { array: [1, 2, 3, 4, 5] }, meta: { step: 5, label: 'Frame 5' } },
  { state: { array: [1, 2, 3, 4, 5, 6] }, meta: { step: 6, label: 'Frame 6' } }
]

// Mock the player store
vi.mock('../src/player/playerStore', () => ({
  usePlayerStore: vi.fn()
}))

describe('Player Functionality', () => {
  const mockPlayerStore = {
    frames: mockFrames,
    index: 0,
    playing: false,
    speed: 1,
    setFrames: vi.fn(),
    setIndex: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    stepNext: vi.fn(),
    stepPrev: vi.fn(),
    setSpeed: vi.fn(),
    reset: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(usePlayerStore as any).mockReturnValue(mockPlayerStore)
  })

  describe('Frame Navigation', () => {
    it('should step Next from 0→1→2', () => {
      render(<PlaybackControls player={mockPlayerStore} actions={mockPlayerStore} />)
      
      const nextButton = screen.getByLabelText('Go to next frame')
      
      // Step from 0 to 1
      fireEvent.click(nextButton)
      expect(mockPlayerStore.stepNext).toHaveBeenCalledTimes(1)
      
      // Step from 1 to 2
      fireEvent.click(nextButton)
      expect(mockPlayerStore.stepNext).toHaveBeenCalledTimes(2)
    })

    it('should step Previous and decrement index', () => {
      // Set initial index to 2
      const playerAtIndex2 = { ...mockPlayerStore, index: 2 }
      render(<PlaybackControls player={playerAtIndex2} actions={playerAtIndex2} />)
      
      const prevButton = screen.getByLabelText('Go to previous frame')
      
      // Step from 2 to 1
      fireEvent.click(prevButton)
      expect(playerAtIndex2.stepPrev).toHaveBeenCalledTimes(1)
      
      // Step from 1 to 0
      fireEvent.click(prevButton)
      expect(playerAtIndex2.stepPrev).toHaveBeenCalledTimes(2)
    })

    it('should respect bounds on step buttons', () => {
      // Test at first frame (index 0)
      const playerAtStart = { ...mockPlayerStore, index: 0 }
      render(<PlaybackControls player={playerAtStart} actions={playerAtStart} />)
      
      const prevButton = screen.getByLabelText('Go to previous frame')
      const nextButton = screen.getByLabelText('Go to next frame')
      
      // Previous should be disabled at start
      expect(prevButton).toBeDisabled()
      
      // Next should be enabled
      expect(nextButton).not.toBeDisabled()
      
      // Test at last frame (index 5)
      const playerAtEnd = { ...mockPlayerStore, index: 5 }
      render(<PlaybackControls player={playerAtEnd} actions={playerAtEnd} />)
      
      const prevButtonEnd = screen.getByLabelText('Go to previous frame')
      const nextButtonEnd = screen.getByLabelText('Go to next frame')
      
      // Previous should be enabled at end
      expect(prevButtonEnd).not.toBeDisabled()
      
      // Next should be disabled at end
      expect(nextButtonEnd).toBeDisabled()
    })
  })

  describe('Frame Slider Navigation', () => {
    it('should allow jumping to any frame via slider', () => {
      render(<PlaybackControls player={mockPlayerStore} actions={mockPlayerStore} />)
      
      const slider = screen.getByLabelText('Navigate to frame 1 of 6')
      
      // Jump to frame 4
      fireEvent.change(slider, { target: { value: '4' } })
      expect(mockPlayerStore.setIndex).toHaveBeenCalledWith(3) // 0-based index
    })

    it('should allow typing exact frame numbers', () => {
      render(<PlaybackControls player={mockPlayerStore} actions={mockPlayerStore} />)
      
      const frameInput = screen.getByLabelText('Enter frame number')
      
      // Type frame 3
      fireEvent.change(frameInput, { target: { value: '3' } })
      expect(mockPlayerStore.setIndex).toHaveBeenCalledWith(2) // 0-based index
    })
  })

  describe('Playback Controls', () => {
    it('should toggle play/pause state', () => {
      render(<PlaybackControls player={mockPlayerStore} actions={mockPlayerStore} />)
      
      const playButton = screen.getByLabelText('Start playback')
      fireEvent.click(playButton)
      expect(mockPlayerStore.play).toHaveBeenCalledTimes(1)
      
      // Change to playing state
      const playingPlayer = { ...mockPlayerStore, playing: true }
      render(<PlaybackControls player={playingPlayer} actions={playingPlayer} />)
      
      const pauseButton = screen.getByLabelText('Pause playback')
      fireEvent.click(pauseButton)
      expect(playingPlayer.pause).toHaveBeenCalledTimes(1)
    })

    it('should reset to first frame', () => {
      const playerAtIndex3 = { ...mockPlayerStore, index: 3 }
      render(<PlaybackControls player={playerAtIndex3} actions={playerAtIndex3} />)
      
      const resetButton = screen.getByLabelText('Reset to first frame')
      fireEvent.click(resetButton)
      expect(playerAtIndex3.reset).toHaveBeenCalledTimes(1)
    })

    it('should change playback speed', () => {
      render(<PlaybackControls player={mockPlayerStore} actions={mockPlayerStore} />)
      
      const speedSelect = screen.getByLabelText('Select playback speed')
      fireEvent.change(speedSelect, { target: { value: '2' } })
      expect(mockPlayerStore.setSpeed).toHaveBeenCalledWith(2)
    })
  })

  describe('Status Display', () => {
    it('should show current frame information', () => {
      render(<PlaybackControls player={mockPlayerStore} actions={mockPlayerStore} />)
      
      // Should show current frame label
      expect(screen.getByText('Frame 1')).toBeInTheDocument()
      expect(screen.getByText('Frame 1 of 6')).toBeInTheDocument()
    })

    it('should display current frame action', () => {
      render(<PlaybackControls player={mockPlayerStore} actions={mockPlayerStore} />)
      
      // Should show the current frame's meta label
      expect(screen.getByText('Frame 1')).toBeInTheDocument()
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should show keyboard shortcuts legend', () => {
      render(<PlaybackControls player={mockPlayerStore} actions={mockPlayerStore} />)
      
      // Should display keyboard shortcuts
      expect(screen.getByText('⌨️ Space Play/Pause')).toBeInTheDocument()
      expect(screen.getByText('⌨️ ← Previous')).toBeInTheDocument()
      expect(screen.getByText('⌨️ → Next')).toBeInTheDocument()
      expect(screen.getByText('⌨️ R Reset')).toBeInTheDocument()
    })
  })
})

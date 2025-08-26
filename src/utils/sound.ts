class SoundManager {
  private audio: HTMLAudioElement | null = null
  private isEnabled: boolean = true
  private userHasInteracted: boolean = false

  constructor() {
    this.loadAudio()
    this.setupUserInteraction()
  }

  private loadAudio() {
    try {
      this.audio = new Audio('/sounds/ding.mp3')
      this.audio.preload = 'auto'
      this.audio.volume = 0.3 // Set volume to 30%
    } catch (error) {
      console.warn('Could not load audio file:', error)
    }
  }

  private setupUserInteraction() {
    // Listen for any user interaction to enable audio
    const enableAudio = () => {
      this.userHasInteracted = true
      
      // Try to unlock audio context with multiple strategies
      this.unlockAudioContext()
      
      // Remove listeners after first interaction
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('keydown', enableAudio)
      document.removeEventListener('touchstart', enableAudio)
    }

    document.addEventListener('click', enableAudio, { once: true })
    document.addEventListener('keydown', enableAudio, { once: true })
    document.addEventListener('touchstart', enableAudio, { once: true })
  }

  private unlockAudioContext() {
    // Strategy 1: Try to play silent audio
    if (this.audio) {
      this.audio.play().then(() => {
        this.audio!.pause()
        this.audio!.currentTime = 0
      }).catch(() => {
        // Ignore errors for silent audio
      })
    }

    // Strategy 2: Create and play a silent audio buffer
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }
      
      // Create a silent buffer
      const buffer = audioContext.createBuffer(1, 1, 22050)
      const source = audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(audioContext.destination)
      source.start(0)
      source.stop(0.001)
    } catch (error) {
      // Ignore errors for audio context
    }
  }

  playDing() {
    if (!this.isEnabled || !this.audio || !this.userHasInteracted) return

    try {
      // Reset audio to beginning and play
      this.audio.currentTime = 0
      this.audio.play().catch(error => {
        console.warn('Could not play audio:', error)
      })
    } catch (error) {
      console.warn('Error playing sound:', error)
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  isSoundEnabled() {
    return this.isEnabled
  }

  isAudioReady() {
    return this.userHasInteracted
  }

  setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume))
    }
  }
}

// Create a singleton instance
export const soundManager = new SoundManager()

// Export the class for testing purposes
export { SoundManager }

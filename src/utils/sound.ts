class SoundManager {
  private audio: HTMLAudioElement | null = null
  private isEnabled: boolean = true

  constructor() {
    this.loadAudio()
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

  playDing() {
    if (!this.isEnabled || !this.audio) return

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

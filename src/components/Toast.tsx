import React, { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'info' | 'warning' | 'error'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const bgColor = {
    success: 'bg-green-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  }[type]

  const icon = {
    success: '✓',
    info: 'ℹ',
    warning: '⚠',
    error: '✗'
  }[type]

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 min-w-64`}>
        <span className="text-lg">{icon}</span>
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast

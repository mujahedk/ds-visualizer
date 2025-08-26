import React from 'react'

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 ${className}`}>
      {children}
    </div>
  )
}

export default Container

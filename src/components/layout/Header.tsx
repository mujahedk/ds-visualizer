import React from 'react'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2"
            aria-label="Go to home page"
          >
            <span className="text-2xl font-bold text-red-400">DS Visualizer</span>
          </Link>
          <nav className="flex space-x-8" role="navigation" aria-label="Main navigation">
            <Link
              to="/"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Go to home page"
            >
              Home
            </Link>
            <Link
              to="/playground"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Go to interactive playground"
            >
              Playground
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

import React from 'react'
import { Link } from 'react-router-dom'
import Container from '../components/layout/Container'

const Home: React.FC = () => {
  const algorithms = [
    {
      id: 'heap',
      name: 'Heap',
      icon: '🌳',
      description: 'Binary heap data structure for priority queues'
    },
    {
      id: 'bst',
      name: 'Binary Search Tree',
      icon: '🌲',
      description: 'Ordered tree structure for efficient searching'
    },
    {
      id: 'avl',
      name: 'AVL Tree',
      icon: '🔄',
      description: 'Self-balancing binary search tree'
    },
    {
      id: 'linkedlist',
      name: 'Linked List',
      icon: '🔗',
      description: 'Linear data structure with dynamic memory allocation'
    },
    {
      id: 'array',
      name: 'Array',
      icon: '📊',
      description: 'Contiguous memory storage for elements'
    },
    {
      id: 'stack',
      name: 'Stack',
      icon: '📚',
      description: 'LIFO data structure for function calls'
    },
    {
      id: 'queue',
      name: 'Queue',
      icon: '🚶',
      description: 'FIFO data structure for task scheduling'
    },
    {
      id: 'hashtable',
      name: 'Hash Table',
      icon: '🗂️',
      description: 'Key-value storage with O(1) average access'
    },
    {
      id: 'graph',
      name: 'Graph',
      icon: '🕸️',
      description: 'Network of interconnected nodes and edges'
    }
  ]

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-white mb-6">
              DS Visualizer
            </h1>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Interactive, step-by-step visualizations of classic data structures and algorithms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/playground"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                aria-label="Open the interactive playground"
              >
                Open Playground
              </Link>
              <button
                onClick={scrollToFeatures}
                className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200"
                aria-label="View available algorithms and data structures"
              >
                View Algorithms
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-800/50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Available Data Structures
            </h2>
            <p className="text-xl text-gray-300">
              Explore our comprehensive collection of data structure visualizations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {algorithms.map((algo) => (
              <div
                key={algo.id}
                className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-xl cursor-pointer group"
              >
                <div className="text-4xl mb-4">{algo.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {algo.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {algo.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  )
}

export default Home

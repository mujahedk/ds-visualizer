import React from 'react'
import { Link } from 'react-router-dom'
import Container from '../components/layout/Container'

const Home: React.FC = () => {
  const algorithms = [
    {
      id: 'heap',
      name: 'Binary Heap',
      description: 'A complete binary tree where each parent node is greater than or equal to its children (max heap) or less than or equal to its children (min heap).',
      icon: '🌳',
      href: '/playground?algo=heap'
    },
    {
      id: 'bst',
      name: 'Binary Search Tree',
      description: 'A tree data structure where each node has at most two children, and the left subtree contains nodes with values less than the parent.',
      icon: '🌲',
      href: '/playground?algo=bst'
    },
    {
      id: 'avl',
      name: 'AVL Tree',
      description: 'A self-balancing binary search tree where the heights of the two child subtrees of any node differ by at most one.',
      icon: '⚖️',
      href: '/playground?algo=avl'
    },
    {
      id: 'linked-list',
      name: 'Linked List',
      description: 'A linear data structure where elements are stored in nodes, and each node points to the next node in the sequence.',
      icon: '🔗',
      href: '/playground?algo=linked-list'
    },
    {
      id: 'array',
      name: 'Array',
      description: 'A collection of elements stored at contiguous memory locations, accessible by index.',
      icon: '📊',
      href: '/playground?algo=array'
    },
    {
      id: 'stack',
      name: 'Stack',
      description: 'A LIFO (Last In, First Out) data structure where elements are added and removed from the top.',
      icon: '📚',
      href: '/playground?algo=stack'
    },
    {
      id: 'queue',
      name: 'Queue',
      description: 'A FIFO (First In, First Out) data structure where elements are added at the rear and removed from the front.',
      icon: '🚶',
      href: '/playground?algo=queue'
    },
    {
      id: 'hash',
      name: 'Hash Table',
      description: 'A data structure that implements an associative array abstract data type, mapping keys to values using a hash function.',
      icon: '🗂️',
      href: '/playground?algo=hash'
    },
    {
      id: 'graph',
      name: 'Graph',
      description: 'A collection of nodes (vertices) connected by edges, representing relationships between objects.',
      icon: '🕸️',
      href: '/playground?algo=graph'
    }
  ]

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 px-4" role="banner" aria-labelledby="hero-title">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 id="hero-title" className="text-6xl font-bold text-white mb-6">
              DS Visualizer
            </h1>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Interactive, step-by-step visualizations of classic data structures and algorithms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/playground"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Open the interactive playground to start visualizing algorithms"
              >
                Open Playground
              </Link>
              <button
                onClick={scrollToFeatures}
                className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="View available algorithms and data structures"
              >
                View Algorithms
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-800/50" role="region" aria-labelledby="features-title">
        <Container>
          <div className="text-center mb-16">
            <h2 id="features-title" className="text-4xl font-bold text-white mb-4">
              Available Data Structures
            </h2>
            <p className="text-xl text-gray-300">
              Explore our comprehensive collection of data structure visualizations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
            {algorithms.map((algo) => (
              <div
                key={algo.id}
                className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-xl cursor-pointer group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    window.location.href = algo.href
                  }
                }}
                onClick={() => window.location.href = algo.href}
                aria-label={`Learn about ${algo.name}: ${algo.description}`}
              >
                <div className="text-4xl mb-4" role="img" aria-label={`${algo.name} icon`}>
                  {algo.icon}
                </div>
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

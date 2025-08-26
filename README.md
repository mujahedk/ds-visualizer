# 🎯 DS Visualizer

**Interactive, step-by-step visualizations of classic data structures and algorithms**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Coming%20Soon-blue?style=for-the-badge)](https://ds-visualizer.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=for-the-badge)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge)](https://reactjs.org/)

> **📸 Screenshots coming soon!** We're working on capturing the beautiful visualizations in action.

## 🚀 Live Demo

**Coming Soon:** [https://ds-visualizer.vercel.app](https://ds-visualizer.vercel.app)

The live demo will showcase all algorithms with real-time visualizations and interactive controls.

## 🎯 Why DS Visualizer?

**Teaching & Intuition:** Understanding data structures and algorithms can be challenging. This project bridges the gap between theory and practice by providing:

- **Step-by-step visualizations** that show exactly what happens during algorithm execution
- **Interactive controls** to pause, step through, and replay operations
- **Real-time state inspection** to see how data structures evolve
- **Multiple preset scenarios** for each algorithm to explore different cases

**Perfect for:**
- Computer Science students learning algorithms
- Developers preparing for technical interviews
- Educators creating interactive lessons
- Anyone curious about how algorithms work

## 🎬 MVP Scope

**Current Features:**
- ✅ **Universal Player System** - Consistent playback controls across all algorithms
- ✅ **Mock Frames** - Realistic algorithm demonstrations with 5-10 frames each
- ✅ **9 Algorithm Types** - Heap, BST, AVL, Linked List, Array, Stack, Queue, Hash Table, Graph
- ✅ **Interactive Playground** - Algorithm switching, preset loading, command parsing
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile devices
- ✅ **Accessibility** - ARIA labels, keyboard shortcuts, screen reader support

**What's Next:**
- 🚧 Real algorithm implementations
- 🚧 Custom visualization renderers
- 🚧 Algorithm comparison tools
- 🚧 GIF export functionality

## 🔧 How It Works

The system follows a clean, modular architecture:

```
Algorithm Engine → Frames → Player Store → Canvas Renderer
```

1. **Algorithm Engine** generates frames following the [Frame Schema Contract](docs/frame-schemas.md)
2. **Player Store** manages playback state (current frame, playing, speed, etc.)
3. **Canvas Renderer** displays the current frame with algorithm-specific visualizations
4. **Universal Controls** provide consistent playback experience across all algorithms

### Frame Schema

Each algorithm emits frames with:
- **State**: Current data structure representation
- **Meta**: Step number and descriptive label
- **Highlights**: Visual indicators for what's changing

Example frame:
```json
{
  "state": {
    "array": [15, 10, 5, 3, 7, 2, 1],
    "highlight": [1, 2]
  },
  "meta": {
    "step": 3,
    "label": "siftUp swap(i=1,j=2)"
  }
}
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint
- **Deployment**: Vercel (planned)

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Project setup and configuration
- [x] Universal algorithm registry
- [x] Mock frame system
- [x] Basic visualization canvas

### Phase 2: Real Algorithms 🚧
- [ ] **Heaps** - Insert, extract, heapify operations
- [ ] **Binary Search Trees** - Insert, delete, search, traversal
- [ ] **AVL Trees** - Self-balancing with rotation visualizations
- [ ] **Linked Lists** - Singly/doubly linked operations
- [ ] **Arrays** - Sorting, searching, manipulation
- [ ] **Stacks & Queues** - Push/pop, enqueue/dequeue
- [ ] **Hash Tables** - Insert, delete, collision resolution
- [ ] **Graphs** - BFS, DFS, shortest path algorithms

### Phase 3: Advanced Features 🚧
- [ ] **Algorithm Comparison** - Side-by-side execution
- [ ] **Performance Metrics** - Time complexity visualization
- [ ] **Custom Inputs** - User-defined test cases
- [ ] **Export Options** - GIF, MP4, PNG sequences
- [ ] **Mobile App** - React Native version

### Phase 4: Educational Features 🚧
- [ ] **Tutorial Mode** - Guided learning paths
- [ ] **Quiz System** - Interactive assessments
- [ ] **Code Generation** - Algorithm implementations
- [ ] **Multi-language Support** - Python, Java, C++ examples

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/ds-visualizer.git
cd ds-visualizer

# Install dependencies
npm install
```

### Development
```bash
# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Building
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Run linting
npm run lint
```

## 📚 Documentation

- **[Frame Schemas](docs/frame-schemas.md)** - Complete data contract specifications
- **[API Reference](docs/api.md)** - Component and hook documentation
- **[Contributing](CONTRIBUTING.md)** - Development guidelines

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

**Quick Start:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first styling
- **Vite** for the lightning-fast build tool
- **Open Source Community** for inspiration and tools

---

**Made with ❤️ for the CS community**

*Questions? [Open an issue](https://github.com/yourusername/ds-visualizer/issues) or [start a discussion](https://github.com/yourusername/ds-visualizer/discussions)!*

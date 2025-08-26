# DS Visualizer

An interactive, step-by-step visualization tool for classic data structures and algorithms built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern UI**: Clean, dark-themed interface with responsive design
- **Data Structure Coverage**: 9 core data structures planned (Heap, BST, AVL, Linked List, Array, Stack, Queue, Hash Table, Graph)
- **Interactive Playground**: Universal player system with step-by-step algorithm visualization
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **Routing**: React Router DOM

## 📁 Project Structure

```
src/
├── app/           # Main App component and routing
├── components/    # Reusable UI components
│   ├── layout/   # Layout components (Header, Container)
│   └── Toast.tsx # Notification system
├── pages/        # Page components (Home, Playground)
├── algorithms/   # Algorithm implementations and registry
├── player/       # Universal player system
│   ├── playerStore.ts    # Player state management
│   ├── PlaybackControls.tsx # Reusable playback UI
│   └── index.ts          # Player module exports
├── viz/          # Visualization components
│   ├── Canvas.tsx        # Universal canvas component
│   ├── HeapView.tsx      # Heap visualization (placeholder)
│   ├── BSTView.tsx       # BST visualization (placeholder)
│   ├── AVLView.tsx       # AVL visualization (placeholder)
│   ├── LinkedListView.tsx # Linked list visualization (placeholder)
│   ├── ArrayView.tsx     # Array visualization (placeholder)
│   ├── StackView.tsx     # Stack visualization (placeholder)
│   ├── QueueView.tsx     # Queue visualization (placeholder)
│   ├── HashView.tsx      # Hash table visualization (placeholder)
│   ├── GraphView.tsx     # Graph visualization (placeholder)
│   └── index.ts          # Visualization module exports
├── styles/       # Global styles and Tailwind config
└── main.tsx      # Application entry point
```

## 🎮 Universal Player System

The project includes a headless, reusable player system that can be used by any visualization:

### **Player Store (`usePlayerStore`)**
- **State**: frames, index, playing, speed
- **Actions**: setFrames, setIndex, play, pause, stepNext, stepPrev, setSpeed, reset
- **Auto-advance**: Automatically steps through frames when playing
- **Speed control**: Configurable playback speed (0.5× to 4×)

### **Playback Controls**
- **Universal UI**: Works with any player store instance
- **Keyboard shortcuts**: Space (play/pause), ←/→ (step), R (reset)
- **Progress indicator**: Visual frame progress bar
- **Speed selector**: 0.5×, 1×, 2×, 4× options

### **Integration**
- **Clean API**: Pass player state and actions to PlaybackControls
- **Reusable**: Can be used in multiple views simultaneously
- **Type-safe**: Full TypeScript support with proper interfaces

## 🎨 Universal Visualization System

The project includes a flexible visualization layer that can render any algorithm frame:

### **Canvas Component (`Canvas`)**
- **Universal**: Renders any algorithm frame with appropriate view
- **Algorithm-aware**: Automatically selects the right visualization component
- **Fallback support**: Generic JSON preview when specific views aren't ready
- **Empty state**: Shows helpful message when no frame is loaded

### **Algorithm-Specific Views**
- **Placeholder views**: Ready for each of the 9 data structures
- **Consistent interface**: All views accept the same `frame` prop
- **Easy extension**: Simple to implement real visualizations later
- **Type-safe**: Full TypeScript support with proper interfaces

### **Features**
- **Dynamic view selection**: Based on algorithm key
- **JSON state preview**: Shows frame data in readable format
- **Responsive design**: Works in any container size
- **Custom renderers**: Support for custom visualization logic

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the app.

### Build
```bash
npm run build
```

### Testing
```bash
npm test
npm run test:ui
```

## 📚 Documentation

- **Frame Schemas**: See [`docs/frame-schemas.md`](docs/frame-schemas.md) for detailed specifications of the data contracts that algorithm engines must follow when emitting frames.

## 🎯 Current Status

✅ **Completed:**
- Project setup and configuration
- Routing system (Home ↔ Playground)
- Landing page with hero section
- Algorithm grid layout
- Responsive design with Tailwind CSS
- Dark theme implementation
- Universal algorithm registry system
- Universal player store and controls
- Interactive playground with mock frames
- Universal visualization canvas system
- Algorithm-specific view placeholders

🚧 **In Progress:**
- Algorithm implementations
- Visualization components

## 🔮 Roadmap

1. **Phase 1**: Implement core data structure algorithms (Heap, BST)
2. **Phase 2**: Create interactive visualization components
3. **Phase 3**: Add step-by-step algorithm execution
4. **Phase 4**: Expand to more data structures and algorithms

## 🤝 Contributing

This is a learning project. Feel free to contribute by implementing algorithms, improving visualizations, or enhancing the UI.

## 📝 License

MIT License - feel free to use this project for learning and development.

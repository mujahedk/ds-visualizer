import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from '../components/layout/Header'
import Home from '../pages/Home'
import Playground from '../pages/Playground'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-900 text-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playground" element={<Playground />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

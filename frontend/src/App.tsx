import { HashRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Prediction from './pages/Prediction'
import ModelAnalytics from './pages/ModelAnalytics'
import HowItWorks from './pages/HowItWorks'
import About from './pages/About'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-neural-black text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predict" element={<Prediction />} />
          <Route path="/models" element={<ModelAnalytics />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/research" element={<About />} />
        </Routes>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#f8fafc',
              border: '1px solid rgba(0, 212, 255, 0.2)',
            },
          }}
        />
      </div>
    </HashRouter>
  )
}

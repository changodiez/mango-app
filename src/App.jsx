import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Auth } from './components/Auth'
import { Dashboard } from './components/Dashboard'
import { TransactionList } from './components/TransactionList'
import { Menu, X } from 'lucide-react'
import './App.css'

function Navigation() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!user) return null

  return (
    <>
      {/* Header fijo siempre visible */}
      <header className="app-header">
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="app-brand">
            <h1>💰 Mango App</h1>
          </div>
        </div>
        
        <div className="header-right">
          <span className="user-welcome">Hola, {user.email}</span>
          <button onClick={signOut} className="logout-btn">Salir</button>
        </div>
      </header>

      {/* Menú lateral que se desliza */}
      <nav className={`app-navigation ${isMenuOpen ? 'open' : 'closed'}`}>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            📊 Dashboard
          </Link>
          <Link 
            to="/transactions" 
            className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            📋 Transacciones
          </Link>
        </div>
      </nav>

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isMenuOpen && (
        <div 
          className="menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  )
}

function AppContent() {
  const { user } = useAuth()

  if (!user) {
    return <Auth />
  }

  return (
    <div className="app">
      <Navigation />
      
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionList />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
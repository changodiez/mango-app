import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Auth } from './components/Auth'
import { Dashboard } from './components/Dashboard'
import { TransactionList } from './components/TransactionList'
import { CategoryManager } from './components/CategoryManager'
import { useTransactions } from './hooks/useTransactions'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import './App.css'

function Navigation() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false)
  const { categories, addCategory, updateCategory, deleteCategory } = useTransactions()

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
        
       
      </header>

      {/* Menú lateral que se desliza */}
      <nav className={`app-navigation ${isMenuOpen ? 'open' : 'closed'}`}>
        <div className="nav-links">
        <div className="header-right">
          <span className="user-welcome">Hola, {user.email}</span>
          
        </div>
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
          
          {/* Botón para gestionar categorías */}
          <button 
            className="nav-link categories-link"
            onClick={() => {
              setIsCategoriesModalOpen(true)
              setIsMenuOpen(false)
            }}
          >
            🎨 Gestionar Categorías
          </button>

          <button onClick={signOut} className="logout-btn">Salir</button>
          
        </div>
      </nav>

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isMenuOpen && (
        <div 
          className="menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Modal para gestionar categorías */}
      {isCategoriesModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCategoriesModalOpen(false)}>
          <div className="modal-content categories-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎨 Gestionar Categorías</h3>
              <button 
                className="close-btn" 
                onClick={() => setIsCategoriesModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <CategoryManager 
                categories={categories}
                onAddCategory={addCategory}
                onEditCategory={updateCategory}
                onDeleteCategory={deleteCategory}
              />
            </div>
          </div>
        </div>
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
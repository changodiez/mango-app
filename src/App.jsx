import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Auth } from './components/Auth'
import { Dashboard } from './components/Dashboard'
import { TransactionManager } from './components/TransactionManager'
import { TransactionList } from './components/TransactionList'
import './App.css'

function Navigation() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  if (!user) return null

  return (
    <nav className="app-navigation">
      <div className="nav-brand">
        <h1>💰 Mango App</h1>
      </div>
      <div className="nav-links">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          📊 Dashboard
        </Link>
        <Link 
          to="/transactions" 
          className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}
        >
          📋 Transacciones
        </Link>
      </div>
      <div className="nav-user">
        <span>Hola, {user.email}</span>
        <button onClick={signOut} className="logout-btn">Salir</button>
      </div>
    </nav>
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
        {/* Mover TransactionManager al Dashboard y Transactions */}
        {location.pathname === '/' && (
          <aside className="sidebar">
            <TransactionManager />
          </aside>
        )}
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionList />} />
          </Routes>
        </main>
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
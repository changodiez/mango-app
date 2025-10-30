import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isLogin) {
        const { error } = await signIn({ email, password })
        if (error) throw error
      } else {
        const { error } = await signUp({ email, password })
        if (error) throw error
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarse')}
          </button>
        </form>

        <p>
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="link-btn"
          >
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}
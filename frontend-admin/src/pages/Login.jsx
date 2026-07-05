import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

export default function Login() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login/', { username, password })
      localStorage.setItem('vetcare_access_token', data.access)
      localStorage.setItem('vetcare_refresh_token', data.refresh)
      navigate('/')
    } catch (err) {
      setError('Usuario o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo: imagen */}
      <div
        className="hidden md:flex w-1/2 relative bg-vet-dark items-end p-12"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(20,70,63,0.35) 0%, rgba(20,70,63,0.85) 100%), url('https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?q=80&w=1200&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-white max-w-md">
          <p className="font-serif text-3xl leading-snug">
            Cuidamos cada mascota como parte de la familia.
          </p>
          <p className="mt-4 text-white/70 text-sm">
            Gestiona citas, historiales clínicos, inventario y facturación desde un solo lugar.
          </p>
        </div>
      </div>

      {/* Panel derecho: formulario */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-vet-bg px-8">
        <div className="w-full max-w-sm">
          <p className="font-serif text-3xl text-vet-primary mb-1">VetCare</p>
          <p className="text-vet-primary/60 mb-8">Ingresa a tu panel administrativo</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-vet-dark mb-1">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-vet-accent px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-vet-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-vet-dark mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-vet-accent px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-vet-primary"
                required
              />
            </div>

            {error && <p className="text-vet-secondary text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-vet-primary hover:bg-vet-soft text-white font-medium rounded-lg py-2.5 transition-colors disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-xs text-vet-primary/50 mt-6">
            Usuario de prueba: <strong>admin</strong> / clave: <strong>admin1234</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { to: '/', label: 'Panel', icon: '🏠', end: true },
  { to: '/clientes-mascotas', label: 'Clientes y mascotas', icon: '🐾' },
  { to: '/citas', label: 'Citas', icon: '📅' },
  { to: '/historial-clinico', label: 'Historial clínico', icon: '🩺' },
  { to: '/facturacion', label: 'Facturación', icon: '🧾' },
  { to: '/inventario', label: 'Inventario', icon: '📦' },
  { to: '/doctores', label: 'Doctores', icon: '👩‍⚕️' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('vetcare_access_token')
    localStorage.removeItem('vetcare_refresh_token')
    navigate('/login')
  }

  return (
    <aside className="w-64 shrink-0 bg-vet-dark text-white flex flex-col min-h-screen">
      <div className="px-6 py-7 border-b border-white/10">
        <p className="font-serif text-2xl tracking-tight">VetCare</p>
        <p className="text-xs text-white/50 mt-1">Panel administrativo</p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-vet-secondary text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ClientesMascotas from './pages/ClientesMascotas.jsx'
import Citas from './pages/Citas.jsx'
import HistorialClinico from './pages/HistorialClinico.jsx'
import Facturacion from './pages/Facturacion.jsx'
import Inventario from './pages/Inventario.jsx'
import Doctores from './pages/Doctores.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/clientes-mascotas" element={<ProtectedRoute><ClientesMascotas /></ProtectedRoute>} />
        <Route path="/citas" element={<ProtectedRoute><Citas /></ProtectedRoute>} />
        <Route path="/historial-clinico" element={<ProtectedRoute><HistorialClinico /></ProtectedRoute>} />
        <Route path="/facturacion" element={<ProtectedRoute><Facturacion /></ProtectedRoute>} />
        <Route path="/inventario" element={<ProtectedRoute><Inventario /></ProtectedRoute>} />
        <Route path="/doctores" element={<ProtectedRoute><Doctores /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

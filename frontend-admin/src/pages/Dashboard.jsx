import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import api from '../api/axios.js'

const StatCard = ({ label, value, accent }) => (
  <div className="bg-white rounded-xl border border-vet-accent p-6">
    <p className="text-sm text-vet-primary/60">{label}</p>
    <p className={`font-serif text-3xl mt-2 ${accent ? 'text-vet-secondary' : 'text-vet-primary'}`}>{value}</p>
  </div>
)

export default function Dashboard() {
  const [resumen, setResumen] = useState(null)

  useEffect(() => {
    api.get('/dashboard/resumen/').then((res) => setResumen(res.data)).catch(() => {})
  }, [])

  return (
    <Layout title="Panel general" subtitle="Resumen de la actividad de la clínica">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <StatCard label="Citas de hoy" value={resumen?.citas_hoy ?? '—'} />
        <StatCard label="Facturas de hoy" value={resumen?.facturas_hoy ?? '—'} />
        <StatCard label="Ingresos del mes (S/)" value={resumen ? Number(resumen.ingresos_mes).toFixed(2) : '—'} accent />
        <StatCard label="Productos con stock bajo" value={resumen?.productos_bajo_stock ?? '—'} />
        <StatCard label="Mascotas registradas" value={resumen?.total_mascotas ?? '—'} />
        <StatCard label="Clientes registrados" value={resumen?.total_clientes ?? '—'} />
      </div>
    </Layout>
  )
}

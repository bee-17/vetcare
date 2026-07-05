import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import api from '../api/axios.js'

export default function Doctores() {
  const [resumen, setResumen] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nombres: '', apellidos: '', especialidad: '', telefono: '', email: '' })

  const cargar = async () => {
    const { data } = await api.get('/veterinarios/resumen/')
    setResumen(data)
  }

  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    await api.post('/veterinarios/', form)
    setOpen(false)
    setForm({ nombres: '', apellidos: '', especialidad: '', telefono: '', email: '' })
    cargar()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este veterinario?')) return
    await api.delete(`/veterinarios/${id}/`)
    cargar()
  }

  return (
    <Layout title="Doctores" subtitle="Veterinarios y su actividad (citas y consultas atendidas)">
      <div className="flex justify-end mb-5">
        <button onClick={() => setOpen(true)} className="bg-vet-secondary hover:opacity-90 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Registrar doctor
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'nombres', label: 'Nombre', render: (r) => `${r.nombres} ${r.apellidos}` },
          { key: 'especialidad', label: 'Especialidad' },
          { key: 'total_citas', label: 'Total citas' },
          { key: 'total_consultas', label: 'Total consultas' },
          { key: 'activo', label: 'Estado', render: (r) => (
            <span className={`px-2 py-1 rounded-full text-xs ${r.activo ? 'bg-vet-primary/10 text-vet-primary' : 'bg-vet-secondary/10 text-vet-secondary'}`}>
              {r.activo ? 'Activo' : 'Inactivo'}
            </span>
          ) },
        ]}
        rows={resumen}
        actions={(row) => <button onClick={() => eliminar(row.id)} className="text-vet-secondary text-xs font-medium">Eliminar</button>}
      />

      <Modal open={open} title="Registrar doctor" onClose={() => setOpen(false)}>
        <form onSubmit={guardar} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Nombres" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
            <input required placeholder="Apellidos" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
          </div>
          <input placeholder="Especialidad" value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
          <input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
          <input type="email" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
          <button type="submit" className="w-full bg-vet-primary hover:bg-vet-soft text-white rounded-lg py-2.5 font-medium">Guardar doctor</button>
        </form>
      </Modal>
    </Layout>
  )
}

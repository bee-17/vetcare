import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import api from '../api/axios.js'

const estados = ['pendiente', 'confirmada', 'atendida', 'cancelada']

export default function Citas() {
  const [citas, setCitas] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [veterinarios, setVeterinarios] = useState([])
  const [open, setOpen] = useState(false)
  const [soloHoy, setSoloHoy] = useState(false)
  const [form, setForm] = useState({ mascota: '', veterinario: '', fecha: '', hora: '', motivo: '' })

  const cargar = async () => {
    const url = soloHoy ? '/reportes/citas/dia/' : '/citas/'
    const { data } = await api.get(url)
    setCitas(data.results || data)
  }

  useEffect(() => { cargar() }, [soloHoy])

  useEffect(() => {
    api.get('/mascotas/').then((res) => setMascotas(res.data.results || res.data))
    api.get('/veterinarios/').then((res) => setVeterinarios(res.data.results || res.data))
  }, [])

  const guardar = async (e) => {
    e.preventDefault()
    await api.post('/citas/', form)
    setOpen(false)
    setForm({ mascota: '', veterinario: '', fecha: '', hora: '', motivo: '' })
    cargar()
  }

  const cambiarEstado = async (id, estado) => {
    await api.patch(`/citas/${id}/estado/`, { estado })
    cargar()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return
    await api.delete(`/citas/${id}/`)
    cargar()
  }

  return (
    <Layout title="Citas" subtitle="Registro y seguimiento de citas de la clínica">
      <div className="flex justify-between items-center mb-5">
        <label className="flex items-center gap-2 text-sm text-vet-primary">
          <input type="checkbox" checked={soloHoy} onChange={(e) => setSoloHoy(e.target.checked)} />
          Ver solo citas de hoy
        </label>
        <button onClick={() => setOpen(true)} className="bg-vet-secondary hover:opacity-90 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Agendar cita
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'mascota_nombre', label: 'Mascota' },
          { key: 'veterinario_nombre', label: 'Veterinario' },
          { key: 'fecha', label: 'Fecha' },
          { key: 'hora', label: 'Hora' },
          { key: 'motivo', label: 'Motivo' },
          { key: 'estado', label: 'Estado', render: (r) => (
            <span className="px-2 py-1 rounded-full text-xs bg-vet-accent text-vet-primary capitalize">{r.estado}</span>
          ) },
        ]}
        rows={citas}
        actions={(row) => (
          <>
            <select
              value={row.estado}
              onChange={(e) => cambiarEstado(row.id, e.target.value)}
              className="text-xs border border-vet-accent rounded px-2 py-1 mr-2"
            >
              {estados.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            <button onClick={() => eliminar(row.id)} className="text-vet-secondary text-xs font-medium">Eliminar</button>
          </>
        )}
      />

      <Modal open={open} title="Agendar nueva cita" onClose={() => setOpen(false)}>
        <form onSubmit={guardar} className="space-y-3">
          <select required value={form.mascota} onChange={(e) => setForm({ ...form, mascota: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2">
            <option value="">Selecciona mascota</option>
            {mascotas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
          <select required value={form.veterinario} onChange={(e) => setForm({ ...form, veterinario: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2">
            <option value="">Selecciona veterinario</option>
            {veterinarios.map((v) => <option key={v.id} value={v.id}>{v.nombres} {v.apellidos}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input required type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
            <input required type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
          </div>
          <input placeholder="Motivo" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
          <button type="submit" className="w-full bg-vet-primary hover:bg-vet-soft text-white rounded-lg py-2.5 font-medium">Guardar cita</button>
        </form>
      </Modal>
    </Layout>
  )
}

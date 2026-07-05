import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import api from '../api/axios.js'

const TABS = [
  { key: 'consultas', label: 'Consultas' },
  { key: 'vacunas', label: 'Vacunas' },
]

export default function HistorialClinico() {
  const [tab, setTab] = useState('consultas')
  const [consultas, setConsultas] = useState([])
  const [vacunas, setVacunas] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [veterinarios, setVeterinarios] = useState([])
  const [open, setOpen] = useState(false)

  const [formConsulta, setFormConsulta] = useState({ mascota: '', veterinario: '', motivo_consulta: '', diagnostico: '', tratamiento: '' })
  const [formVacuna, setFormVacuna] = useState({ mascota: '', veterinario: '', nombre_vacuna: '', fecha_aplicacion: '', fecha_proxima: '' })

  const cargar = async () => {
    const [c, v] = await Promise.all([api.get('/consultas/'), api.get('/vacunas/')])
    setConsultas(c.data.results || c.data)
    setVacunas(v.data.results || v.data)
  }

  useEffect(() => { cargar() }, [])
  useEffect(() => {
    api.get('/mascotas/').then((res) => setMascotas(res.data.results || res.data))
    api.get('/veterinarios/').then((res) => setVeterinarios(res.data.results || res.data))
  }, [])

  const guardarConsulta = async (e) => {
    e.preventDefault()
    await api.post('/consultas/', formConsulta)
    setOpen(false)
    setFormConsulta({ mascota: '', veterinario: '', motivo_consulta: '', diagnostico: '', tratamiento: '' })
    cargar()
  }

  const guardarVacuna = async (e) => {
    e.preventDefault()
    await api.post('/vacunas/', formVacuna)
    setOpen(false)
    setFormVacuna({ mascota: '', veterinario: '', nombre_vacuna: '', fecha_aplicacion: '', fecha_proxima: '' })
    cargar()
  }

  const eliminarConsulta = async (id) => {
    if (!confirm('¿Eliminar esta consulta?')) return
    await api.delete(`/consultas/${id}/`)
    cargar()
  }

  const eliminarVacuna = async (id) => {
    if (!confirm('¿Eliminar este registro de vacuna?')) return
    await api.delete(`/vacunas/${id}/`)
    cargar()
  }

  return (
    <Layout title="Historial clínico" subtitle="Consultas, diagnósticos y vacunas por mascota">
      <div className="flex justify-between items-center mb-5">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.key ? 'bg-vet-primary text-white' : 'bg-white text-vet-primary border border-vet-accent'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => setOpen(true)} className="bg-vet-secondary hover:opacity-90 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Registrar {tab === 'consultas' ? 'consulta' : 'vacuna'}
        </button>
      </div>

      {tab === 'consultas' && (
        <DataTable
          columns={[
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'veterinario_nombre', label: 'Veterinario' },
            { key: 'fecha', label: 'Fecha' },
            { key: 'diagnostico', label: 'Diagnóstico' },
            { key: 'tratamiento', label: 'Tratamiento' },
          ]}
          rows={consultas}
          actions={(row) => <button onClick={() => eliminarConsulta(row.id)} className="text-vet-secondary text-xs font-medium">Eliminar</button>}
        />
      )}

      {tab === 'vacunas' && (
        <DataTable
          columns={[
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'nombre_vacuna', label: 'Vacuna' },
            { key: 'fecha_aplicacion', label: 'Aplicada' },
            { key: 'fecha_proxima', label: 'Próxima dosis' },
          ]}
          rows={vacunas}
          actions={(row) => <button onClick={() => eliminarVacuna(row.id)} className="text-vet-secondary text-xs font-medium">Eliminar</button>}
        />
      )}

      <Modal open={open} title={tab === 'consultas' ? 'Registrar consulta' : 'Registrar vacuna'} onClose={() => setOpen(false)}>
        {tab === 'consultas' ? (
          <form onSubmit={guardarConsulta} className="space-y-3">
            <select required value={formConsulta.mascota} onChange={(e) => setFormConsulta({ ...formConsulta, mascota: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2">
              <option value="">Selecciona mascota</option>
              {mascotas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <select required value={formConsulta.veterinario} onChange={(e) => setFormConsulta({ ...formConsulta, veterinario: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2">
              <option value="">Selecciona veterinario</option>
              {veterinarios.map((v) => <option key={v.id} value={v.id}>{v.nombres} {v.apellidos}</option>)}
            </select>
            <input placeholder="Motivo de consulta" value={formConsulta.motivo_consulta} onChange={(e) => setFormConsulta({ ...formConsulta, motivo_consulta: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
            <input required placeholder="Diagnóstico" value={formConsulta.diagnostico} onChange={(e) => setFormConsulta({ ...formConsulta, diagnostico: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
            <textarea placeholder="Tratamiento" value={formConsulta.tratamiento} onChange={(e) => setFormConsulta({ ...formConsulta, tratamiento: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" rows={3} />
            <button type="submit" className="w-full bg-vet-primary hover:bg-vet-soft text-white rounded-lg py-2.5 font-medium">Guardar consulta</button>
          </form>
        ) : (
          <form onSubmit={guardarVacuna} className="space-y-3">
            <select required value={formVacuna.mascota} onChange={(e) => setFormVacuna({ ...formVacuna, mascota: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2">
              <option value="">Selecciona mascota</option>
              {mascotas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <select required value={formVacuna.veterinario} onChange={(e) => setFormVacuna({ ...formVacuna, veterinario: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2">
              <option value="">Selecciona veterinario</option>
              {veterinarios.map((v) => <option key={v.id} value={v.id}>{v.nombres} {v.apellidos}</option>)}
            </select>
            <input required placeholder="Nombre de la vacuna" value={formVacuna.nombre_vacuna} onChange={(e) => setFormVacuna({ ...formVacuna, nombre_vacuna: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
            <div className="grid grid-cols-2 gap-3">
              <input required type="date" value={formVacuna.fecha_aplicacion} onChange={(e) => setFormVacuna({ ...formVacuna, fecha_aplicacion: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
              <input type="date" value={formVacuna.fecha_proxima} onChange={(e) => setFormVacuna({ ...formVacuna, fecha_proxima: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
            </div>
            <button type="submit" className="w-full bg-vet-primary hover:bg-vet-soft text-white rounded-lg py-2.5 font-medium">Guardar vacuna</button>
          </form>
        )}
      </Modal>
    </Layout>
  )
}

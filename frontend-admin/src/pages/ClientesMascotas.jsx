import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import api from '../api/axios.js'

const TABS = [
  { key: 'clientes', label: 'Clientes' },
  { key: 'mascotas', label: 'Mascotas' },
]

export default function ClientesMascotas() {
  const [tab, setTab] = useState('clientes')
  const [clientes, setClientes] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [open, setOpen] = useState(false)

  const [formCliente, setFormCliente] = useState({
    nombres: '', apellidos: '', tipo_documento: 'DNI', num_documento: '',
    telefono: '', email: '', direccion: '',
  })
  const [formMascota, setFormMascota] = useState({
    cliente: '', nombre: '', especie: '', raza: '', sexo: 'M', fecha_nacimiento: '',
  })

  const cargar = async () => {
    const [c, m] = await Promise.all([api.get('/clientes/'), api.get('/mascotas/')])
    setClientes(c.data.results || c.data)
    setMascotas(m.data.results || m.data)
  }

  useEffect(() => { cargar() }, [])

  const guardarCliente = async (e) => {
    e.preventDefault()
    await api.post('/clientes/', formCliente)
    setOpen(false)
    setFormCliente({ nombres: '', apellidos: '', tipo_documento: 'DNI', num_documento: '', telefono: '', email: '', direccion: '' })
    cargar()
  }

  const guardarMascota = async (e) => {
    e.preventDefault()
    await api.post('/mascotas/', formMascota)
    setOpen(false)
    setFormMascota({ cliente: '', nombre: '', especie: '', raza: '', sexo: 'M', fecha_nacimiento: '' })
    cargar()
  }

  const eliminarCliente = async (id) => {
    if (!confirm('¿Eliminar este cliente? También se eliminarán sus mascotas asociadas.')) return
    await api.delete(`/clientes/${id}/`)
    cargar()
  }

  const eliminarMascota = async (id) => {
    if (!confirm('¿Eliminar esta mascota?')) return
    await api.delete(`/mascotas/${id}/`)
    cargar()
  }

  return (
    <Layout title="Clientes y mascotas" subtitle="Registro de dueños y sus mascotas">
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
          + Registrar {tab === 'clientes' ? 'cliente' : 'mascota'}
        </button>
      </div>

      {tab === 'clientes' && (
        <DataTable
          columns={[
            { key: 'nombres', label: 'Nombre', render: (r) => `${r.nombres} ${r.apellidos}` },
            { key: 'tipo_documento', label: 'Documento', render: (r) => `${r.tipo_documento} ${r.num_documento}` },
            { key: 'telefono', label: 'Teléfono' },
            { key: 'email', label: 'Correo' },
          ]}
          rows={clientes}
          actions={(row) => <button onClick={() => eliminarCliente(row.id)} className="text-vet-secondary text-xs font-medium">Eliminar</button>}
        />
      )}

      {tab === 'mascotas' && (
        <DataTable
          columns={[
            { key: 'nombre', label: 'Mascota' },
            { key: 'especie', label: 'Especie' },
            { key: 'raza', label: 'Raza' },
            { key: 'sexo', label: 'Sexo' },
            { key: 'cliente_nombre', label: 'Dueño' },
          ]}
          rows={mascotas}
          actions={(row) => <button onClick={() => eliminarMascota(row.id)} className="text-vet-secondary text-xs font-medium">Eliminar</button>}
        />
      )}

      <Modal open={open} title={tab === 'clientes' ? 'Registrar cliente' : 'Registrar mascota'} onClose={() => setOpen(false)}>
        {tab === 'clientes' ? (
          <form onSubmit={guardarCliente} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Nombres" value={formCliente.nombres} onChange={(e) => setFormCliente({ ...formCliente, nombres: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
              <input required placeholder="Apellidos" value={formCliente.apellidos} onChange={(e) => setFormCliente({ ...formCliente, apellidos: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={formCliente.tipo_documento} onChange={(e) => setFormCliente({ ...formCliente, tipo_documento: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2">
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">Carné de extranjería</option>
              </select>
              <input required placeholder="Número de documento" value={formCliente.num_documento} onChange={(e) => setFormCliente({ ...formCliente, num_documento: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
            </div>
            <input placeholder="Teléfono" value={formCliente.telefono} onChange={(e) => setFormCliente({ ...formCliente, telefono: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
            <input type="email" placeholder="Correo" value={formCliente.email} onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
            <input placeholder="Dirección" value={formCliente.direccion} onChange={(e) => setFormCliente({ ...formCliente, direccion: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
            <button type="submit" className="w-full bg-vet-primary hover:bg-vet-soft text-white rounded-lg py-2.5 font-medium">Guardar cliente</button>
          </form>
        ) : (
          <form onSubmit={guardarMascota} className="space-y-3">
            <select required value={formMascota.cliente} onChange={(e) => setFormMascota({ ...formMascota, cliente: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2">
              <option value="">Selecciona dueño</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombres} {c.apellidos}</option>)}
            </select>
            <input required placeholder="Nombre de la mascota" value={formMascota.nombre} onChange={(e) => setFormMascota({ ...formMascota, nombre: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Especie (perro, gato...)" value={formMascota.especie} onChange={(e) => setFormMascota({ ...formMascota, especie: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
              <input placeholder="Raza" value={formMascota.raza} onChange={(e) => setFormMascota({ ...formMascota, raza: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={formMascota.sexo} onChange={(e) => setFormMascota({ ...formMascota, sexo: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2">
                <option value="M">Macho</option>
                <option value="H">Hembra</option>
              </select>
              <input type="date" value={formMascota.fecha_nacimiento} onChange={(e) => setFormMascota({ ...formMascota, fecha_nacimiento: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
            </div>
            <button type="submit" className="w-full bg-vet-primary hover:bg-vet-soft text-white rounded-lg py-2.5 font-medium">Guardar mascota</button>
          </form>
        )}
      </Modal>
    </Layout>
  )
}

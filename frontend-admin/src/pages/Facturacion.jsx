import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import api from '../api/axios.js'

const estados = ['pendiente', 'pagada', 'anulada']

export default function Facturacion() {
  const [facturas, setFacturas] = useState([])
  const [clientes, setClientes] = useState([])
  const [open, setOpen] = useState(false)
  const [filtro, setFiltro] = useState('todas')
  const [form, setForm] = useState({
    cliente: '', tipo_documento: 'boleta', serie: 'B001', numero: '',
    subtotal: '', igv: '', total: '', estado: 'pendiente',
  })

  const cargar = async () => {
    let url = '/facturas/'
    if (filtro === 'hoy') url = '/reportes/facturas/dia/'
    if (filtro === 'anuladas') url = '/reportes/facturas/anuladas/'
    const { data } = await api.get(url)
    setFacturas(data.results || data)
  }

  useEffect(() => { cargar() }, [filtro])
  useEffect(() => { api.get('/clientes/').then((res) => setClientes(res.data.results || res.data)) }, [])

  const guardar = async (e) => {
    e.preventDefault()
    await api.post('/facturas/', form)
    setOpen(false)
    setForm({ cliente: '', tipo_documento: 'boleta', serie: 'B001', numero: '', subtotal: '', igv: '', total: '', estado: 'pendiente' })
    cargar()
  }

  const cambiarEstado = async (id, estado) => {
    await api.patch(`/facturas/${id}/estado/`, { estado })
    cargar()
  }

  return (
    <Layout title="Facturación" subtitle="Emisión y control de facturas y boletas">
      <div className="flex justify-between items-center mb-5">
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="border border-vet-accent rounded-lg px-3 py-2 text-sm">
          <option value="todas">Todas las facturas</option>
          <option value="hoy">Facturas de hoy</option>
          <option value="anuladas">Facturas anuladas</option>
        </select>
        <button onClick={() => setOpen(true)} className="bg-vet-secondary hover:opacity-90 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Registrar factura
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'tipo_documento', label: 'Tipo', render: (r) => <span className="capitalize">{r.tipo_documento}</span> },
          { key: 'serie', label: 'Serie-Número', render: (r) => `${r.serie}-${r.numero}` },
          { key: 'cliente_nombre', label: 'Cliente' },
          { key: 'fecha_emision', label: 'Fecha' },
          { key: 'total', label: 'Total (S/)' },
          { key: 'estado', label: 'Estado', render: (r) => (
            <span className={`px-2 py-1 rounded-full text-xs capitalize ${r.estado === 'pagada' ? 'bg-vet-primary/10 text-vet-primary' : r.estado === 'anulada' ? 'bg-vet-secondary/10 text-vet-secondary' : 'bg-vet-accent text-vet-primary'}`}>{r.estado}</span>
          ) },
        ]}
        rows={facturas}
        actions={(row) => (
          <select
            value={row.estado}
            onChange={(e) => cambiarEstado(row.id, e.target.value)}
            className="text-xs border border-vet-accent rounded px-2 py-1"
          >
            {estados.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        )}
      />

      <Modal open={open} title="Registrar factura / boleta" onClose={() => setOpen(false)}>
        <form onSubmit={guardar} className="space-y-3">
          <select required value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2">
            <option value="">Selecciona cliente</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombres} {c.apellidos}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.tipo_documento} onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2">
              <option value="boleta">Boleta</option>
              <option value="factura">Factura</option>
            </select>
            <input required placeholder="Serie" value={form.serie} onChange={(e) => setForm({ ...form, serie: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
          </div>
          <input required placeholder="Número" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
          <div className="grid grid-cols-3 gap-3">
            <input required type="number" step="0.01" placeholder="Subtotal" value={form.subtotal} onChange={(e) => setForm({ ...form, subtotal: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
            <input required type="number" step="0.01" placeholder="IGV" value={form.igv} onChange={(e) => setForm({ ...form, igv: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
            <input required type="number" step="0.01" placeholder="Total" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
          </div>
          <button type="submit" className="w-full bg-vet-primary hover:bg-vet-soft text-white rounded-lg py-2.5 font-medium">Guardar documento</button>
        </form>
      </Modal>
    </Layout>
  )
}

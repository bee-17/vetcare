import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import api from '../api/axios.js'

export default function Inventario() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [tipo, setTipo] = useState('petshop')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ categoria: '', nombre: '', tipo: 'petshop', precio: '', stock: '', stock_minimo: 5, fecha_vencimiento: '' })

  const cargar = async () => {
    const { data } = await api.get(`/productos/?tipo=${tipo}`)
    setProductos(data.results || data)
  }

  useEffect(() => { cargar() }, [tipo])
  useEffect(() => { api.get('/categorias/').then((res) => setCategorias(res.data.results || res.data)) }, [])

  const guardar = async (e) => {
    e.preventDefault()
    await api.post('/productos/', { ...form, tipo })
    setOpen(false)
    setForm({ categoria: '', nombre: '', tipo, precio: '', stock: '', stock_minimo: 5, fecha_vencimiento: '' })
    cargar()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    await api.delete(`/productos/${id}/`)
    cargar()
  }

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo)

  return (
    <Layout title="Inventario" subtitle="Productos de petshop y medicamentos categorizados">
      <div className="flex justify-between items-center mb-5">
        <div className="flex gap-2">
          <button onClick={() => setTipo('petshop')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tipo === 'petshop' ? 'bg-vet-primary text-white' : 'bg-white text-vet-primary border border-vet-accent'}`}>Petshop</button>
          <button onClick={() => setTipo('medicamento')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tipo === 'medicamento' ? 'bg-vet-primary text-white' : 'bg-white text-vet-primary border border-vet-accent'}`}>Medicamentos</button>
        </div>
        <button onClick={() => setOpen(true)} className="bg-vet-secondary hover:opacity-90 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Registrar producto
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'nombre', label: 'Producto' },
          { key: 'categoria_nombre', label: 'Categoría' },
          { key: 'precio', label: 'Precio (S/)' },
          { key: 'stock', label: 'Stock', render: (r) => (
            <span className={r.stock <= r.stock_minimo ? 'text-vet-secondary font-semibold' : ''}>{r.stock}</span>
          ) },
          ...(tipo === 'medicamento' ? [{ key: 'fecha_vencimiento', label: 'Vencimiento' }] : []),
        ]}
        rows={productos}
        actions={(row) => <button onClick={() => eliminar(row.id)} className="text-vet-secondary text-xs font-medium">Eliminar</button>}
      />

      <Modal open={open} title={`Registrar producto (${tipo})`} onClose={() => setOpen(false)}>
        <form onSubmit={guardar} className="space-y-3">
          <select required value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2">
            <option value="">Selecciona categoría</option>
            {categoriasFiltradas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <input required placeholder="Nombre del producto" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
            <input required type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border border-vet-accent rounded-lg px-3 py-2" />
          </div>
          {tipo === 'medicamento' && (
            <div>
              <label className="text-xs text-vet-primary/60">Fecha de vencimiento</label>
              <input type="date" value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} className="w-full border border-vet-accent rounded-lg px-3 py-2" />
            </div>
          )}
          <button type="submit" className="w-full bg-vet-primary hover:bg-vet-soft text-white rounded-lg py-2.5 font-medium">Guardar producto</button>
        </form>
      </Modal>
    </Layout>
  )
}

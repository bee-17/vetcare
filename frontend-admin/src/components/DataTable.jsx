export default function DataTable({ columns, rows, actions }) {
  return (
    <div className="bg-white rounded-xl border border-vet-accent overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-vet-accent/60 text-vet-primary text-left">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-semibold">{col.label}</th>
            ))}
            {actions && <th className="px-4 py-3 font-semibold text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-vet-primary/50">
                No hay registros todavía.
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-vet-accent hover:bg-vet-bg/60">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-vet-dark">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right space-x-2">{actions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

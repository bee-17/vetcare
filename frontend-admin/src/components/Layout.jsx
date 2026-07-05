import Sidebar from './Sidebar.jsx'

export default function Layout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-vet-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-vet-accent px-8 py-5">
          <h1 className="font-serif text-2xl text-vet-primary">{title}</h1>
          {subtitle && <p className="text-sm text-vet-primary/60 mt-1">{subtitle}</p>}
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerUsuarios } from '../services/usuario'

const AVATAR_GRADIENTS = [
  'from-violet-600 to-fuchsia-500',
  'from-sky-500 to-indigo-600',
  'from-amber-400 to-rose-500',
  'from-emerald-500 to-teal-600',
  'from-pink-500 to-purple-600',
]

function iniciales(usuario) {
  const n = usuario.name?.[0] ?? ''
  const a = usuario.lastName?.[0] ?? ''
  return (n + a).toUpperCase() || '?'
}

function fechaRegistro(createdAt) {
  if (!createdAt) return 'Fecha desconocida'
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(createdAt))
}

function TarjetaCompanero({ usuario, indice }) {
  const gradiente = AVATAR_GRADIENTS[indice % AVATAR_GRADIENTS.length]

  return (
    <article className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className="rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-violet-600 p-[3px]">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${gradiente} text-2xl font-bold text-white ring-4 ring-white`}
        >
          {iniciales(usuario)}
        </div>
      </div>
      <h2 className="mt-4 text-base font-semibold text-neutral-900">
        {usuario.name} {usuario.lastName}
      </h2>
      <p className="mt-1 w-full truncate text-sm text-neutral-500">{usuario.email}</p>
      <span className="mt-3 rounded-full bg-neutral-100 px-3 py-1 font-mono text-xs text-neutral-600">
        {usuario.rut}
      </span>
      <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
        Se unió el {fechaRegistro(usuario.createdAt)}
      </p>
    </article>
  )
}

function MisCompaneros() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    obtenerUsuarios()
      .then(setUsuarios)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return usuarios
    return usuarios.filter((u) =>
      `${u.name} ${u.lastName} ${u.email} ${u.rut}`.toLowerCase().includes(q),
    )
  }, [usuarios, busqueda])

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Mis compañeros
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {cargando
              ? 'Cargando comunidad…'
              : `${usuarios.length} ${usuarios.length === 1 ? 'compañero registrado' : 'compañeros registrados'} en la plataforma`}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <svg
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400"
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, email o RUT…"
            className="w-full rounded-full border border-neutral-300 bg-white py-2.5 pr-4 pl-10 text-sm text-neutral-900 placeholder-neutral-400 transition-colors outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-700">No se pudieron cargar los compañeros</p>
          <p className="mt-1 text-sm text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {cargando && !error && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse flex-col items-center rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <div className="h-20 w-20 rounded-full bg-neutral-200" />
              <div className="mt-4 h-4 w-32 rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-40 rounded bg-neutral-100" />
              <div className="mt-3 h-5 w-24 rounded-full bg-neutral-100" />
            </div>
          ))}
        </div>
      )}

      {!cargando && !error && filtrados.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
          <p className="font-medium text-neutral-700">
            {busqueda
              ? `Nadie coincide con "${busqueda}"`
              : 'Todavía no hay compañeros registrados'}
          </p>
          {!busqueda && (
            <Link
              to="/registrarme"
              className="mt-4 inline-block rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
            >
              Sé el primero en registrarte
            </Link>
          )}
        </div>
      )}

      {!cargando && !error && filtrados.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((u, i) => (
            <TarjetaCompanero key={u.id} usuario={u} indice={i} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MisCompaneros

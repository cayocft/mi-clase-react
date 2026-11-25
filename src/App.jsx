import { useState } from 'react'
import { HashRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Acceso from './pages/Acceso'
import MisCompaneros from './pages/MisCompaneros'
import Publicaciones from './pages/Publicaciones'

const logoCft = `${import.meta.env.BASE_URL}logo_cft.svg`

const linkNav = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
    isActive
      ? 'bg-cft-durazno/40 text-cft-naranja'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-cft-carbon'
  }`

// lee el usuario guardado; si el JSON está corrupto devuelve null
function usuarioGuardado() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

function App() {
  const [usuario, setUsuario] = useState(usuarioGuardado)

  function entrar(datos) {
    localStorage.setItem('token', datos.token)
    localStorage.setItem('user', JSON.stringify(datos.user))
    setUsuario(datos.user)
  }

  function salir() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUsuario(null)
  }

  // sin sesión no se puede ver nada de la app: solo la pantalla de acceso
  if (!usuario || !localStorage.getItem('token')) {
    return <Acceso alEntrar={entrar} />
  }

  return (
    <HashRouter>
      <div className="min-h-svh bg-neutral-50 text-cft-carbon">
        <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
            <NavLink to="/" className="flex shrink-0 items-center gap-2.5">
              <img src={logoCft} alt="Logo CFT" className="h-8 w-auto" />
              <span className="text-lg font-bold tracking-tight">MiCompañero</span>
            </NavLink>
            <div className="flex items-center gap-1 overflow-x-auto">
              <NavLink to="/" className={linkNav} end>
                Mural CFT
              </NavLink>
              <NavLink to="/mis-companeros" className={linkNav}>
                Mis compañeros
              </NavLink>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden items-center gap-2 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cft-naranja to-cft-coral text-xs font-bold text-white">
                  {usuario.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="max-w-32 truncate text-sm font-medium text-cft-carbon">
                  {usuario.name} {usuario.lastName}
                </span>
              </span>
              <button
                type="button"
                onClick={salir}
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-cft-carbon"
              >
                Salir
              </button>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-10">
          <Routes>
            <Route
              path="/"
              element={
                <Publicaciones usuario={usuario} alExpirarSesion={salir} />
              }
            />
            <Route path="/mis-companeros" element={<MisCompaneros />} />
            <Route
              path="/publicaciones"
              element={<Navigate to="/" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}

export default App

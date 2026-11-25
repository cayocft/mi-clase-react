import { useState } from 'react'
import { HashRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Acceso from './pages/Acceso'
import MisCompaneros from './pages/MisCompaneros'
import Publicaciones from './pages/Publicaciones'

const logoCft = `${import.meta.env.BASE_URL}logo_cft.svg`

const linkNav = ({ isActive }) =>
  `inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors sm:flex-none ${
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
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2 sm:h-16 sm:flex-nowrap sm:justify-between sm:gap-4 sm:py-0">
            <NavLink to="/" className="flex shrink-0 items-center gap-2.5">
              <img src={logoCft} alt="Logo CFT" className="h-8 w-auto" />
              <span className="text-lg font-bold tracking-tight">MiCompañero</span>
            </NavLink>

            {/* en móvil las rutas bajan a una segunda fila como pestañas;
                en desktop quedan centradas en la misma fila */}
            <div className="order-3 flex w-full items-center justify-center gap-1 pb-1 sm:order-2 sm:w-auto sm:pb-0">
              <NavLink to="/" className={linkNav} end>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
                Mural CFT
              </NavLink>
              <NavLink to="/mis-companeros" className={linkNav}>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                  />
                </svg>
                Mis compañeros
              </NavLink>
            </div>

            <div className="order-2 ml-auto flex shrink-0 items-center gap-2 sm:order-3 sm:ml-0 sm:gap-3">
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cft-naranja to-cft-coral text-xs font-bold text-white">
                  {usuario.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="hidden max-w-32 truncate text-sm font-medium text-cft-carbon sm:inline">
                  {usuario.name} {usuario.lastName}
                </span>
              </span>
              <button
                type="button"
                onClick={salir}
                aria-label="Cerrar sesión"
                className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-3.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-cft-carbon"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
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

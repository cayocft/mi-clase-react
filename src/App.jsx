import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Inicio from './pages/Inicio'
import MisCompaneros from './pages/MisCompaneros'
import Registrarme from './pages/Registrarme'

const linkNav = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
    isActive
      ? 'bg-violet-100 text-violet-700'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
  }`

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-svh bg-neutral-50 text-neutral-900">
        <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
            <NavLink to="/" className="flex shrink-0 items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 text-white shadow-md shadow-violet-500/25">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
              </span>
              <span className="text-lg font-bold tracking-tight">MiCompañero</span>
            </NavLink>
            <div className="flex items-center gap-1 overflow-x-auto">
              <NavLink to="/" className={linkNav} end>
                Inicio
              </NavLink>
              <NavLink to="/mis-companeros" className={linkNav}>
                Mis compañeros
              </NavLink>
              <NavLink to="/registrarme" className={linkNav}>
                Registrarme
              </NavLink>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-10">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/mis-companeros" element={<MisCompaneros />} />
            <Route path="/registrarme" element={<Registrarme />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App

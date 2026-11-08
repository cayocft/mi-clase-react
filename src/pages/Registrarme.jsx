import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registrarUsuario } from '../services/usuario'

const inputClass =
  'w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20'

const labelClass = 'mb-1.5 block text-sm font-medium text-neutral-700'

function Registrarme() {
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [rut, setRut] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [feedback, setFeedback] = useState('')
  const [registered, setRegistered] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFeedback('')

    try {
      const { user, token } = await registrarUsuario({
        name,
        lastName,
        rut,
        email,
        password,
      })
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setRegistered(true)
    } catch (error) {
      setFeedback(error.message)
    }
  }

  if (registered) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900">
            ¡Bienvenido/a, {name}!
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Tu cuenta fue creada correctamente. Ya formas parte de la comunidad de la clase.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/mis-companeros"
              className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              Conocer a mis compañeros
            </Link>
            <Link
              to="/"
              className="rounded-full px-6 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Únete a{' '}
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
            MiCompañero
          </span>
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Regístrate para preguntar y compartir ideas con tu clase.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className={labelClass}>
              Nombre
            </label>
            <input
              id="name"
              type="text"
              autoComplete="given-name"
              placeholder="Ana"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>
              Apellido
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Pérez"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="rut" className={labelClass}>
            RUT
          </label>
          <input
            id="rut"
            type="text"
            autoComplete="off"
            placeholder="12.345.678-9"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            className={inputClass}
            required
          />
          <p className="mt-1 text-xs text-neutral-400">
            Escríbelo con puntos y guion: 12.345.678-9
          </p>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ana@correo.cl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-opacity hover:opacity-90"
        >
          Crear mi cuenta
        </button>

        {feedback && (
          <p
            aria-live="polite"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700"
          >
            {feedback}
          </p>
        )}
      </form>
    </div>
  )
}

export default Registrarme

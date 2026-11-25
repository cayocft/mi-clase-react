import { useState } from 'react'
import { iniciarSesion, registrarUsuario } from '../services/usuario'

const logoCft = `${import.meta.env.BASE_URL}logo_cft.svg`

const inputClass =
  'w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm text-cft-carbon outline-none transition-colors placeholder:text-neutral-400 focus:border-cft-naranja focus:bg-white focus:ring-2 focus:ring-cft-naranja/20'

const labelClass = 'mb-1.5 block text-sm font-medium text-neutral-700'

// Pantalla de acceso: solo se puede entrar a la app iniciando sesión o registrándose
function Acceso({ alEntrar }) {
  const [vista, setVista] = useState('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [rut, setRut] = useState('')

  const [feedback, setFeedback] = useState('')
  const [enviando, setEnviando] = useState(false)

  function cambiarVista(nuevaVista) {
    setFeedback('')
    setVista(nuevaVista)
  }

  async function enviarLogin(e) {
    e.preventDefault()
    setFeedback('')
    setEnviando(true)

    try {
      const datos = await iniciarSesion({ email, password })
      alEntrar(datos)
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setEnviando(false)
    }
  }

  async function enviarRegistro(e) {
    e.preventDefault()
    setFeedback('')
    setEnviando(true)

    try {
      const datos = await registrarUsuario({
        name,
        lastName,
        rut,
        email,
        password,
      })
      alEntrar(datos)
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-neutral-100 px-4 py-10">
      <div className="grid w-full max-w-4xl items-center gap-10 lg:grid-cols-2">
        <header className="text-center lg:text-left">
          <img
            src={logoCft}
            alt="Logo CFT"
            className="mx-auto h-16 w-auto lg:mx-0"
          />
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-cft-carbon sm:text-5xl">
            MiCompañero
          </h1>
          <p className="mt-4 max-w-md text-lg text-neutral-600 max-lg:mx-auto">
            La red social educativa de tu CFT: pregunta, comparte apuntes y
            aprende junto a tu clase.
          </p>
        </header>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl shadow-neutral-900/5 sm:p-8">
          {vista === 'login' ? (
            <>
              <form onSubmit={enviarLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className={labelClass}>
                    Correo electrónico
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="estudiante@cft.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className={labelClass}>
                    Contraseña
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                {feedback && (
                  <p
                    role="alert"
                    className="rounded-xl border border-cft-coral/50 bg-cft-durazno/20 px-4 py-3 text-center text-sm text-cft-carbon"
                  >
                    {feedback}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full rounded-xl bg-cft-naranja py-3 text-sm font-semibold text-white shadow-md shadow-cft-naranja/25 transition-colors hover:bg-cft-coral disabled:cursor-wait disabled:opacity-60"
                >
                  {enviando ? 'Ingresando…' : 'Iniciar sesión'}
                </button>
              </form>

              <div className="my-5 border-t border-neutral-200" />

              <button
                type="button"
                onClick={() => cambiarVista('registro')}
                className="w-full rounded-xl bg-cft-carbon py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
              >
                Crear cuenta nueva
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold tracking-tight text-cft-carbon">
                Crear cuenta
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Regístrate con tus datos de estudiante.
              </p>

              <form onSubmit={enviarRegistro} className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="registro-nombre" className={labelClass}>
                      Nombre
                    </label>
                    <input
                      id="registro-nombre"
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
                    <label htmlFor="registro-apellido" className={labelClass}>
                      Apellido
                    </label>
                    <input
                      id="registro-apellido"
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
                  <label htmlFor="registro-rut" className={labelClass}>
                    RUT
                  </label>
                  <input
                    id="registro-rut"
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
                  <label htmlFor="registro-email" className={labelClass}>
                    Correo electrónico
                  </label>
                  <input
                    id="registro-email"
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
                  <label htmlFor="registro-password" className={labelClass}>
                    Contraseña
                  </label>
                  <input
                    id="registro-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                {feedback && (
                  <p
                    role="alert"
                    className="rounded-xl border border-cft-coral/50 bg-cft-durazno/20 px-4 py-3 text-center text-sm text-cft-carbon"
                  >
                    {feedback}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full rounded-xl bg-cft-naranja py-3 text-sm font-semibold text-white shadow-md shadow-cft-naranja/25 transition-colors hover:bg-cft-coral disabled:cursor-wait disabled:opacity-60"
                >
                  {enviando ? 'Creando cuenta…' : 'Registrarme'}
                </button>
              </form>

              <div className="my-5 border-t border-neutral-200" />

              <button
                type="button"
                onClick={() => cambiarVista('login')}
                className="w-full rounded-xl border border-neutral-300 py-3 text-sm font-semibold text-cft-carbon transition-colors hover:bg-neutral-50"
              >
                Ya tengo cuenta — iniciar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Acceso

import { useEffect, useState } from 'react'
import { crearPublicacion, obtenerPublicaciones } from '../services/publicacion'

function fechaPublicacion(createdAt) {
  if (!createdAt) return 'Fecha desconocida'

  const fecha = new Date(createdAt)
  if (Number.isNaN(fecha.getTime())) return 'Fecha desconocida'

  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fecha)
}

function inicialAutor(nombre) {
  return nombre?.trim()?.[0]?.toUpperCase() || 'U'
}

function Publicaciones() {
  const [publicaciones, setPublicaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [publicando, setPublicando] = useState(false)
  const [errorCreacion, setErrorCreacion] = useState('')

  useEffect(() => {
    let activa = true

    obtenerPublicaciones()
      .then((datos) => {
        if (activa) setPublicaciones(datos)
      })
      .catch((e) => {
        if (activa) setError(e.message)
      })
      .finally(() => {
        if (activa) setCargando(false)
      })

    return () => {
      activa = false
    }
  }, [intento])

  function reintentar() {
    setCargando(true)
    setError('')
    setIntento((actual) => actual + 1)
  }

  function abrirModal() {
    setErrorCreacion('')
    setModalAbierto(true)
  }

  function cerrarModal() {
    if (!publicando) setModalAbierto(false)
  }

  async function enviarPublicacion(e) {
    e.preventDefault()

    const tituloLimpio = titulo.trim()
    const contenidoLimpio = contenido.trim()
    const tokenLimpio = token.trim()

    if (!tituloLimpio || !contenidoLimpio || !tokenLimpio) {
      setErrorCreacion('Completa el título, el contenido y el token.')
      return
    }

    setPublicando(true)
    setErrorCreacion('')

    try {
      localStorage.setItem('token', tokenLimpio)
      const nuevaPublicacion = await crearPublicacion({
        title: tituloLimpio,
        content: contenidoLimpio,
      })

      setPublicaciones((actuales) => [nuevaPublicacion, ...actuales])
      setTitulo('')
      setContenido('')
      setModalAbierto(false)
    } catch (e) {
      setErrorCreacion(e.message)
    } finally {
      setPublicando(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-violet-600 uppercase">
            Comunidad de la clase
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900">
            Publicaciones
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Ideas, preguntas y recursos compartidos por tus compañeros.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            type="button"
            onClick={abrirModal}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
            </svg>
            Publicar
          </button>
          {!cargando && !error && (
            <span className="inline-flex w-fit items-center rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
              {publicaciones.length}{' '}
              {publicaciones.length === 1 ? 'publicación' : 'publicaciones'}
            </span>
          )}
        </div>
      </header>

      {cargando && (
        <div className="space-y-4" aria-label="Cargando publicaciones">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-neutral-200" />
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded bg-neutral-200" />
                  <div className="h-3 w-20 rounded bg-neutral-100" />
                </div>
              </div>
              <div className="mt-6 h-5 w-2/3 rounded bg-neutral-200" />
              <div className="mt-3 h-3 w-full rounded bg-neutral-100" />
              <div className="mt-2 h-3 w-4/5 rounded bg-neutral-100" />
            </div>
          ))}
        </div>
      )}

      {!cargando && error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
        >
          <p className="font-medium text-red-700">
            No se pudieron cargar las publicaciones
          </p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={reintentar}
            className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && publicaciones.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3.75h5.25M4.5 19.5l1.125-3.375A8.25 8.25 0 1 1 12 20.25c-1.566 0-3.03-.436-4.275-1.194L4.5 19.5Z"
              />
            </svg>
          </div>
          <p className="mt-4 font-semibold text-neutral-800">
            Aún no hay publicaciones
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Cuando tus compañeros compartan algo, aparecerá aquí.
          </p>
        </div>
      )}

      {!cargando && !error && publicaciones.length > 0 && (
        <section className="space-y-4" aria-label="Todas las publicaciones">
          {publicaciones.map((publicacion) => {
            const autor = publicacion.author?.name || 'Usuario'
            const reacciones =
              (publicacion.reactions?.like ?? 0) +
              (publicacion.reactions?.love ?? 0)

            return (
              <article
                key={publicacion.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-base font-semibold text-white">
                    {inicialAutor(autor)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {autor}
                    </p>
                    <time
                      className="text-xs text-neutral-500"
                      dateTime={publicacion.createdAt || undefined}
                    >
                      {fechaPublicacion(publicacion.createdAt)}
                    </time>
                  </div>
                </div>

                <div className="mt-5">
                  <h2 className="text-lg font-semibold leading-snug text-neutral-900">
                    {publicacion.title}
                  </h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                    {publicacion.content}
                  </p>
                </div>

                <footer className="mt-5 flex items-center gap-5 border-t border-neutral-100 pt-4 text-sm text-neutral-500">
                  <span className="inline-flex items-center gap-1.5">
                    <svg
                      className="h-4 w-4 text-violet-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.633 10.25c.806 0 1.533-.446 1.992-1.11l.69-1.001a4.5 4.5 0 0 1 3.704-1.945h.357c.715 0 1.298.583 1.298 1.298 0 .11-.014.219-.041.325l-.557 2.183h3.962a1.75 1.75 0 0 1 1.69 2.206l-1.5 5.5a1.75 1.75 0 0 1-1.69 1.289H9.25a2.25 2.25 0 0 1-2.25-2.25v-6.495ZM4.5 10.25h2.25v8.75H4.5a1.5 1.5 0 0 1-1.5-1.5v-5.75a1.5 1.5 0 0 1 1.5-1.5Z"
                      />
                    </svg>
                    {reacciones}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
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
                        d="M7.5 8.25h9m-9 3.75h5.25M4.5 19.5l1.125-3.375A8.25 8.25 0 1 1 12 20.25c-1.566 0-3.03-.436-4.275-1.194L4.5 19.5Z"
                      />
                    </svg>
                    {publicacion.commentsCount ?? 0}
                  </span>
                </footer>
              </article>
            )
          })}
        </section>
      )}

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-950/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrarModal()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-publicar-titulo"
            className="my-auto w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="modal-publicar-titulo"
                  className="text-xl font-bold tracking-tight text-neutral-900"
                >
                  Crear publicación
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Comparte una idea o pregunta con tu clase.
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarModal}
                disabled={publicando}
                aria-label="Cerrar modal"
                className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <form onSubmit={enviarPublicacion} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="publicacion-titulo"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Título
                </label>
                <input
                  id="publicacion-titulo"
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="¿Qué quieres compartir?"
                  autoFocus
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="publicacion-contenido"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Contenido
                </label>
                <textarea
                  id="publicacion-contenido"
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  placeholder="Escribe aquí tu publicación..."
                  rows={5}
                  required
                  className="w-full resize-y rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm leading-6 text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="publicacion-token"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Token
                </label>
                <input
                  id="publicacion-token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Pega tu token de acceso"
                  autoComplete="off"
                  spellCheck="false"
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 font-mono text-sm text-neutral-900 outline-none transition-colors placeholder:font-sans placeholder:text-neutral-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
                />
                <p className="mt-1.5 text-xs text-neutral-500">
                  Se guardará en este navegador como token y reemplazará el anterior.
                </p>
              </div>

              {errorCreacion && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {errorCreacion}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={publicando}
                  className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={publicando}
                  className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                >
                  {publicando ? 'Publicando…' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Publicaciones

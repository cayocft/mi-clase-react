import { Link } from 'react-router-dom'

const features = [
  {
    titulo: 'Haz preguntas',
    descripcion:
      '¿Algo no quedó claro en clases? Publica tu duda y recibe respuestas de tus compañeros y docentes.',
    icono: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm3.75 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm3.75 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
  },
  {
    titulo: 'Comparte ideas',
    descripcion:
      'Publica apuntes, recursos y soluciones. Lo que aprendes puede ser justo lo que otro compañero necesita.',
    icono: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    titulo: 'Conecta con tu clase',
    descripcion:
      'Encuentra a tus compañeros registrados, conoce quiénes forman parte de la comunidad y colaboren juntos.',
    icono: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
]

function Inicio() {
  return (
    <div className="space-y-16">
      <section className="pt-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-violet-700 uppercase">
          Comunidad de la clase
        </span>
        <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
          Pregunta. Comparte.{' '}
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
            Aprende en comunidad.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-500">
          Esta es una plataforma para preguntar y compartir ideas de la clase.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/registrarme"
            className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-transform hover:scale-[1.03]"
          >
            Únete a la comunidad
          </Link>
          <Link
            to="/mis-companeros"
            className="rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900"
          >
            Ver compañeros
          </Link>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        {features.map((f) => (
          <article
            key={f.titulo}
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              {f.icono}
            </div>
            <h2 className="mt-4 text-base font-semibold text-neutral-900">{f.titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">{f.descripcion}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400 p-[1px]">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            ¿Aún no eres parte?
          </h2>
          <p className="max-w-md text-sm text-neutral-500">
            Regístrate en menos de un minuto y empieza a colaborar con el resto de la clase.
          </p>
          <Link
            to="/registrarme"
            className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
          >
            Crear mi cuenta
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Inicio

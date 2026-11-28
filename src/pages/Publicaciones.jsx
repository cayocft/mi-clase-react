import { useEffect, useRef, useState } from 'react'
import { usePostStream } from '../hooks/usePostStream'
import { crearComentario, obtenerComentarios } from '../services/comentario'
import { crearPublicacion, obtenerPublicaciones } from '../services/publicacion'
import {
  crearReaccion,
  crearReaccionComentario,
  obtenerReacciones,
  obtenerReaccionesComentario,
  quitarReaccion,
  quitarReaccionComentario,
} from '../services/reaccion'

const TIPOS_REACCION = [
  { tipo: 'like', emoji: '👍', nombre: 'Me gusta' },
  { tipo: 'love', emoji: '❤️', nombre: 'Me encanta' },
  { tipo: 'haha', emoji: '😂', nombre: 'Me divierte' },
  { tipo: 'wow', emoji: '😮', nombre: 'Me sorprende' },
  { tipo: 'sad', emoji: '😢', nombre: 'Me entristece' },
  { tipo: 'angry', emoji: '😡', nombre: 'Me enoja' },
]

// muestra la fecha como en Facebook: "hace 5 minutos", "hace 2 horas"...
// y a partir de un día, la fecha con hora de publicación
function fechaPublicacion(createdAt) {
  if (!createdAt) return 'Fecha desconocida'

  const fecha = new Date(createdAt)
  if (Number.isNaN(fecha.getTime())) return 'Fecha desconocida'

  const segundos = Math.floor((Date.now() - fecha.getTime()) / 1000)

  if (segundos < 60) return 'hace un momento'

  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) {
    return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`
  }

  const horas = Math.floor(minutos / 60)
  if (horas < 24) {
    return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`
  }

  // más de un día → "18 de noviembre de 2026, 21:15"
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(fecha)
}

function inicialAutor(nombre) {
  return nombre?.trim()?.[0]?.toUpperCase() || 'U'
}

// pide las reacciones de cada post para saber cuál puso el usuario
// logueado (miReaccion) y actualizar los conteos por tipo
async function conMisReacciones(posts, usuarioId) {
  return Promise.all(
    posts.map(async (p) => {
      try {
        const datos = await obtenerReacciones(p.id)
        const mia = datos.reactions.find((r) => r.user?.id === usuarioId)
        return {
          ...p,
          reactions: datos.counts,
          miReaccion: mia ? { id: mia.id, type: mia.type } : null,
        }
      } catch {
        return { ...p, miReaccion: null }
      }
    }),
  )
}

// igual que conMisReacciones pero para los comentarios que se van
// cargando: pide el detalle de reacciones de cada uno para saber
// cuál tiene activa el usuario logueado
async function conMisReaccionesComentarios(comentarios, usuarioId) {
  return Promise.all(
    comentarios.map(async (c) => {
      try {
        const datos = await obtenerReaccionesComentario(c.id)
        const mia = datos.reactions.find((r) => r.user?.id === usuarioId)
        return {
          ...c,
          reactions: datos.counts,
          miReaccion: mia ? { id: mia.id, type: mia.type } : null,
        }
      } catch {
        return { ...c, miReaccion: null }
      }
    }),
  )
}

function Publicaciones({ usuario, alExpirarSesion }) {
  const [publicaciones, setPublicaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [errorCreacion, setErrorCreacion] = useState('')
  const [contenidosComentario, setContenidosComentario] = useState({})
  const [comentariosEnviando, setComentariosEnviando] = useState({})
  const [erroresComentario, setErroresComentario] = useState({})
  const [mensajesComentario, setMensajesComentario] = useState({})
  const [erroresCargaComentarios, setErroresCargaComentarios] = useState({})
  const [comentariosCargando, setComentariosCargando] = useState({})
  // cuántos comentarios se ven por post: parte en 3 y sube de 3 en 3
  const [comentariosVisibles, setComentariosVisibles] = useState({})
  const [reaccionesEnviando, setReaccionesEnviando] = useState({})
  const [erroresReaccion, setErroresReaccion] = useState({})
  // igual que las de posts pero por comentario (clave = commentId)
  const [reaccionesComentarioEnviando, setReaccionesComentarioEnviando] =
    useState({})
  const [erroresReaccionComentario, setErroresReaccionComentario] = useState({})
  // paginación del feed: nextCursor = id del último post recibido (null = no hay más)
  const [nextCursor, setNextCursor] = useState(null)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [errorCargarMas, setErrorCargarMas] = useState('')
  const sentinelRef = useRef(null)
  // tick que fuerza re-render cada 60s para mantener al día
  // los textos "hace X minutos/horas" de posts y comentarios
  const [, setTick] = useState(0)

  // canal de tiempo real: cada evento actualiza el feed sin polling.
  // si el socket se reconecta tras una caída, se recarga la vista
  // porque pudieron perderse eventos mientras estuvo desconectado
  usePostStream(aplicarEventoStream, reintentar)

  // carga inicial: trae la primera página del feed.
  // cada post ya incluye una vista previa de comentarios y commentsCount,
  // así que no hace falta pedir los comentarios uno por uno
  useEffect(() => {
    let activa = true

    async function cargarPublicaciones() {
      try {
        const datos = await obtenerPublicaciones()
        const postsConReaccion = await conMisReacciones(datos.posts, usuario?.id)
        if (!activa) return
        setPublicaciones(postsConReaccion)
        setNextCursor(datos.nextCursor)
      } catch (e) {
        if (activa) setError(e.message)
      } finally {
        if (activa) setCargando(false)
      }
    }

    cargarPublicaciones()

    return () => {
      activa = false
    }
  }, [intento, usuario?.id])

  // cada 60 segundos actualiza el tick → re-render → se recalculan
  // los "hace X minutos" (la unidad mínima que mostramos es el minuto)
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(timer)
  }, [])

  // scroll infinito: cuando el div sentinel entra en pantalla, pedir la
  // siguiente página de posts (como hace Facebook al llegar al fondo)
  useEffect(() => {
    const nodo = sentinelRef.current
    if (!nodo) return

    const observador = new IntersectionObserver((entradas) => {
      if (entradas[0].isIntersecting) cargarMasPublicaciones()
    })
    observador.observe(nodo)

    return () => observador.disconnect()
  })

  function reintentar() {
    setCargando(true)
    setError('')
    setErrorCargarMas('')
    setNextCursor(null)
    setIntento((actual) => actual + 1)
  }

  // aplica al estado local los eventos que llegan por el socket.
  // las reacciones llegan como conteo final agregado (no un evento por
  // cada una), así que solo se reemplazan los números
  function aplicarEventoStream(msg) {
    switch (msg.type) {
      case 'post:new':
        // deduplicar por id: si el post lo creé yo, ya entró con el refetch
        setPublicaciones((actuales) =>
          actuales.some((p) => p.id === msg.post.id)
            ? actuales
            : [{ ...msg.post, miReaccion: null }, ...actuales],
        )
        break
      case 'post:updated':
        // merge conservando datos locales: miReaccion y los comentarios
        // ya cargados (msg.post no trae esos campos del cliente)
        setPublicaciones((actuales) =>
          actuales.map((p) =>
            p.id === msg.post.id
              ? {
                  ...p,
                  ...msg.post,
                  miReaccion: p.miReaccion,
                  comments: p.comments ?? msg.post.comments,
                  commentsCursor: p.commentsCursor ?? msg.post.commentsCursor,
                }
              : p,
          ),
        )
        break
      case 'post:deleted':
        setPublicaciones((actuales) =>
          actuales.filter((p) => p.id !== msg.postId),
        )
        break
      case 'reaction:changed':
        setPublicaciones((actuales) =>
          actuales.map((p) =>
            p.id === msg.postId ? { ...p, reactions: msg.counts } : p,
          ),
        )
        break
      case 'comment:new':
        // si el comentario ya está (lo acabo de publicar yo) no se
        // duplica ni se vuelve a subir el contador
        setPublicaciones((actuales) =>
          actuales.map((p) => {
            if (p.id !== msg.postId) return p
            if ((p.comments || []).some((c) => c.id === msg.comment.id)) {
              return p
            }
            return {
              ...p,
              commentsCount: (p.commentsCount ?? 0) + 1,
              comments: p.comments
                ? [{ ...msg.comment, miReaccion: null }, ...p.comments]
                : p.comments,
            }
          }),
        )
        break
      case 'comment:deleted':
        setPublicaciones((actuales) =>
          actuales.map((p) =>
            p.id === msg.postId
              ? {
                  ...p,
                  commentsCount: Math.max(0, (p.commentsCount ?? 0) - 1),
                  comments: p.comments?.filter((c) => c.id !== msg.commentId),
                }
              : p,
          ),
        )
        break
      case 'comment-reaction:changed':
        // el backend envía el conteo final agregado, no un evento por
        // reacción: solo se reemplazan los números del comentario
        actualizarComentario(msg.postId, msg.commentId, {
          reactions: msg.counts,
        })
        break
    }
  }

  // pide la página siguiente del feed y la AGREGA al final de la lista
  async function cargarMasPublicaciones() {
    if (!nextCursor || cargandoMas) return

    setCargandoMas(true)
    setErrorCargarMas('')

    try {
      const datos = await obtenerPublicaciones(nextCursor)
      const postsNuevos = await conMisReacciones(datos.posts, usuario?.id)
      setPublicaciones((actuales) => [...actuales, ...postsNuevos])
      setNextCursor(datos.nextCursor)
    } catch (e) {
      // cursor inválido o de un post eliminado → reiniciar desde la página 1
      if (e.status === 400 || e.status === 404) {
        reintentar()
      } else {
        setErrorCargarMas(e.message)
      }
    } finally {
      setCargandoMas(false)
    }
  }

  // "Ver más comentarios": pide la siguiente página de comentarios de un post
  // y la AGREGA a los que ya se muestran (vienen del más reciente al más antiguo)
  async function cargarMasComentarios(postId) {
    if (comentariosCargando[postId]) return

    const publicacion = publicaciones.find((p) => p.id === postId)
    const comentariosActuales = publicacion?.comments || []
    // el cursor es el que devolvió la API, o el id del último comentario visible
    const cursor =
      publicacion?.commentsCursor ?? comentariosActuales.at(-1)?.id

    setComentariosCargando((actuales) => ({ ...actuales, [postId]: true }))
    setErroresCargaComentarios((actuales) => ({ ...actuales, [postId]: '' }))

    try {
      const datos = await obtenerComentarios(postId, cursor)
      const comentariosConReaccion = await conMisReaccionesComentarios(
        datos.comments,
        usuario?.id,
      )
      setPublicaciones((actuales) =>
        actuales.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...(p.comments || []),
                  ...comentariosConReaccion,
                ],
                commentsCursor: datos.nextCursor,
              }
            : p,
        ),
      )
    } catch (e) {
      // cursor inválido → recargar los comentarios desde el principio
      if (e.status === 400 || e.status === 404) {
        try {
          const datos = await obtenerComentarios(postId)
          const comentariosConReaccion = await conMisReaccionesComentarios(
            datos.comments,
            usuario?.id,
          )
          setPublicaciones((actuales) =>
            actuales.map((p) =>
              p.id === postId
                ? { ...p, comments: comentariosConReaccion, commentsCursor: datos.nextCursor }
                : p,
            ),
          )
        } catch (e2) {
          setErroresCargaComentarios((actuales) => ({
            ...actuales,
            [postId]: e2.message,
          }))
        }
      } else {
        setErroresCargaComentarios((actuales) => ({
          ...actuales,
          [postId]: e.message,
        }))
      }
    } finally {
      setComentariosCargando((actuales) => ({ ...actuales, [postId]: false }))
    }
  }

  // clic en un emoji: mismo tipo → la quita; otro tipo → cambia;
  // sin reacción → la crea (como en Facebook)
  async function reaccionar(postId, tipo) {
    if (reaccionesEnviando[postId]) return

    const publicacion = publicaciones.find((p) => p.id === postId)
    const anterior = publicacion?.miReaccion

    setReaccionesEnviando((actuales) => ({ ...actuales, [postId]: true }))
    setErroresReaccion((actuales) => ({ ...actuales, [postId]: '' }))

    try {
      // si ya tenía una reacción hay que quitarla antes (toggle o cambio)
      if (anterior) await quitarReaccion(anterior.id)

      if (anterior?.type === tipo) {
        // mismo emoji otra vez → se quita la reacción
        setPublicaciones((actuales) =>
          actuales.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  miReaccion: null,
                  reactions: {
                    ...p.reactions,
                    [tipo]: Math.max(0, (p.reactions?.[tipo] ?? 1) - 1),
                  },
                }
              : p,
          ),
        )
      } else {
        // sin reacción o cambio de tipo → crear (counts viene actualizado)
        const datos = await crearReaccion(postId, tipo)
        setPublicaciones((actuales) =>
          actuales.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  miReaccion: { id: datos.reaction.id, type: tipo },
                  reactions: datos.counts,
                }
              : p,
          ),
        )
      }
    } catch (e) {
      if (e.status === 401) {
        alExpirarSesion?.()
        return
      }
      setErroresReaccion((actuales) => ({ ...actuales, [postId]: e.message }))
    } finally {
      setReaccionesEnviando((actuales) => ({ ...actuales, [postId]: false }))
    }
  }

  // aplica un cambio a un comentario puntual dentro del post que lo contiene
  function actualizarComentario(postId, comentarioId, cambios) {
    setPublicaciones((actuales) =>
      actuales.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments?.map((c) =>
                c.id === comentarioId
                  ? typeof cambios === 'function'
                    ? cambios(c)
                    : { ...c, ...cambios }
                  : c,
              ),
            }
          : p,
      ),
    )
  }

  // clic en un emoji de un comentario: mismo tipo → la quita; otro tipo →
  // cambia; sin reacción → la crea (misma lógica que las reacciones a posts)
  async function reaccionarComentario(postId, comentarioId, tipo) {
    if (reaccionesComentarioEnviando[comentarioId]) return

    const publicacion = publicaciones.find((p) => p.id === postId)
    const comentario = publicacion?.comments?.find(
      (c) => c.id === comentarioId,
    )
    const anterior = comentario?.miReaccion

    setReaccionesComentarioEnviando((actuales) => ({
      ...actuales,
      [comentarioId]: true,
    }))
    setErroresReaccionComentario((actuales) => ({
      ...actuales,
      [comentarioId]: '',
    }))

    try {
      // si ya tenía una reacción hay que quitarla antes (toggle o cambio)
      if (anterior) await quitarReaccionComentario(anterior.id)

      if (anterior?.type === tipo) {
        // mismo emoji otra vez → se quita la reacción
        actualizarComentario(postId, comentarioId, (c) => ({
          ...c,
          miReaccion: null,
          reactions: {
            ...c.reactions,
            [tipo]: Math.max(0, (c.reactions?.[tipo] ?? 1) - 1),
          },
        }))
      } else {
        // sin reacción o cambio de tipo → crear (counts viene actualizado)
        const datos = await crearReaccionComentario(
          comentarioId,
          tipo,
          usuario?.id,
        )
        actualizarComentario(postId, comentarioId, {
          miReaccion: { id: datos.reaction.id, type: tipo },
          reactions: datos.counts,
        })
      }
    } catch (e) {
      if (e.status === 401) {
        alExpirarSesion?.()
        return
      }
      // 409 = ya había una reacción con ese tipo: se resincroniza el
      // detalle del comentario para recuperar miReaccion y los conteos
      if (e.status === 409) {
        try {
          const datos = await obtenerReaccionesComentario(comentarioId)
          const mia = datos.reactions.find(
            (r) => r.user?.id === usuario?.id,
          )
          actualizarComentario(postId, comentarioId, {
            reactions: datos.counts,
            miReaccion: mia ? { id: mia.id, type: mia.type } : null,
          })
        } catch {
          // si tampoco se pudo leer el detalle, se deja el error abajo
          setErroresReaccionComentario((actuales) => ({
            ...actuales,
            [comentarioId]: e.message,
          }))
        }
      } else {
        setErroresReaccionComentario((actuales) => ({
          ...actuales,
          [comentarioId]: e.message,
        }))
      }
    } finally {
      setReaccionesComentarioEnviando((actuales) => ({
        ...actuales,
        [comentarioId]: false,
      }))
    }
  }

  // botón "Ver más comentarios": revela 3 comentarios más por clic.
  // si los comentarios aún no están descargados (el feed no los trae)
  // o falta página por ver, primero pide a la API
  async function verMasComentarios(postId) {
    if (comentariosCargando[postId]) return

    const publicacion = publicaciones.find((p) => p.id === postId)
    const cargados = publicacion?.comments?.length || 0
    const total = publicacion?.commentsCount ?? cargados
    const visibles = comentariosVisibles[postId] ?? 3

    if (
      visibles + 3 > cargados &&
      cargados < total &&
      publicacion?.commentsCursor !== null
    ) {
      await cargarMasComentarios(postId)
    }

    setComentariosVisibles((actuales) => ({
      ...actuales,
      [postId]: visibles + 3,
    }))
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

    if (!tituloLimpio || !contenidoLimpio) {
      setErrorCreacion('Completa el título y el contenido.')
      return
    }

    setPublicando(true)
    setErrorCreacion('')

    try {
      await crearPublicacion({
        title: tituloLimpio,
        content: contenidoLimpio,
      })

      setTitulo('')
      setContenido('')
      setModalAbierto(false)
      // reinicia el feed desde la página 1 para que el post nuevo salga arriba
      reintentar()
    } catch (e) {
      // 401 = el token expiró: se cierra la sesión y vuelve a la pantalla de acceso
      if (e.status === 401) {
        alExpirarSesion?.()
        return
      }
      setErrorCreacion(e.message)
    } finally {
      setPublicando(false)
    }
  }

  async function enviarComentario(e, postId) {
    e.preventDefault()
    if (comentariosEnviando[postId]) return

    const content = (contenidosComentario[postId] || '').trim()

    if (!content || content.length > 500) {
      setErroresComentario((actuales) => ({
        ...actuales,
        [postId]: 'Escribe un comentario de entre 1 y 500 caracteres.',
      }))
      return
    }

    setComentariosEnviando((actuales) => ({ ...actuales, [postId]: true }))
    setErroresComentario((actuales) => ({ ...actuales, [postId]: '' }))
    setMensajesComentario((actuales) => ({ ...actuales, [postId]: '' }))

    try {
      const comentarioCreado = await crearComentario(postId, {
        content,
        userId: usuario?.id,
      })

      setPublicaciones((actuales) =>
        actuales.map((publicacion) =>
          publicacion.id === postId
            ? {
                ...publicacion,
                commentsCount: (publicacion.commentsCount ?? 0) + 1,
                comments: [
                  { reactions: {}, miReaccion: null, ...comentarioCreado },
                  ...(publicacion.comments || []),
                ],
              }
            : publicacion,
        ),
      )
      setContenidosComentario((actuales) => ({ ...actuales, [postId]: '' }))
      setMensajesComentario((actuales) => ({
        ...actuales,
        [postId]: 'Comentario publicado.',
      }))
    } catch (e) {
      setErroresComentario((actuales) => ({ ...actuales, [postId]: e.message }))
    } finally {
      setComentariosEnviando((actuales) => ({ ...actuales, [postId]: false }))
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-cft-naranja uppercase">
            Comunidad de la clase
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-cft-carbon">
            Mural CFT
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Ideas, preguntas y recursos compartidos por tus compañeros.
          </p>
        </div>
        {!cargando && !error && (
          <span className="inline-flex w-fit items-center self-start rounded-full bg-cft-durazno/20 px-3 py-1 text-sm font-medium text-cft-naranja sm:self-end">
            {publicaciones.length}{' '}
            {publicaciones.length === 1 ? 'publicación' : 'publicaciones'}
          </span>
        )}
      </header>

      <button
        type="button"
        onClick={abrirModal}
        className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cft-naranja to-cft-coral text-sm font-bold text-white">
          {inicialAutor(usuario?.name)}
        </span>
        <span className="min-w-0 flex-1 truncate rounded-full bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-200">
          Escribe que piensas o lo que necesitas. Busca apoyo.
        </span>
      </button>

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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cft-durazno/20 text-cft-naranja">
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
          <p className="mt-4 font-semibold text-cft-carbon">
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
            const comentarios = publicacion.comments || []
            // cuántos comentarios se ven ahora y cuántos hay en total
            const visiblesComentarios = comentariosVisibles[publicacion.id] ?? 3
            const totalComentarios =
              publicacion.commentsCount ?? comentarios.length

            return (
              <article
                key={publicacion.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cft-naranja to-cft-coral text-base font-semibold text-white">
                    {inicialAutor(autor)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-cft-carbon">
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
                  <h2 className="text-lg font-semibold leading-snug text-cft-carbon">
                    {publicacion.title}
                  </h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                    {publicacion.content}
                  </p>
                </div>

                <footer className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3 text-sm text-neutral-500">
                  <div
                    className="flex flex-wrap items-center gap-1"
                    role="group"
                    aria-label="Reacciones"
                  >
                    {TIPOS_REACCION.map(({ tipo, emoji, nombre }) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => reaccionar(publicacion.id, tipo)}
                        disabled={reaccionesEnviando[publicacion.id]}
                        title={nombre}
                        aria-pressed={publicacion.miReaccion?.type === tipo}
                        className={`flex items-center gap-1 rounded-full px-2 py-1.5 transition-all hover:scale-110 hover:bg-cft-durazno/30 disabled:cursor-wait disabled:opacity-60 ${
                          publicacion.miReaccion?.type === tipo
                            ? 'bg-cft-durazno/40 ring-1 ring-cft-naranja'
                            : ''
                        }`}
                      >
                        <span className="text-base leading-none">{emoji}</span>
                        {(publicacion.reactions?.[tipo] ?? 0) > 0 && (
                          <span className="text-xs font-medium text-neutral-600">
                            {publicacion.reactions[tipo]}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
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
                {erroresReaccion[publicacion.id] && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {erroresReaccion[publicacion.id]}
                  </p>
                )}

                <form
                  onSubmit={(e) => enviarComentario(e, publicacion.id)}
                  className="mt-4 border-t border-neutral-100 pt-4"
                >
                  <label
                    htmlFor={`comentario-contenido-${publicacion.id}`}
                    className="sr-only"
                  >
                    Escribe un comentario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`comentario-contenido-${publicacion.id}`}
                      type="text"
                      value={contenidosComentario[publicacion.id] || ''}
                      onChange={(e) =>
                        setContenidosComentario((actuales) => ({
                          ...actuales,
                          [publicacion.id]: e.target.value,
                        }))
                      }
                      placeholder="Escribe un comentario..."
                      maxLength={500}
                      required
                      disabled={comentariosEnviando[publicacion.id]}
                      className="min-w-0 flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-cft-carbon outline-none transition-colors placeholder:text-neutral-400 focus:border-cft-naranja focus:bg-white focus:ring-2 focus:ring-cft-naranja/20 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={comentariosEnviando[publicacion.id]}
                      className="shrink-0 rounded-full bg-gradient-to-r from-cft-naranja to-cft-coral px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                    >
                      {comentariosEnviando[publicacion.id] ? 'Enviando…' : 'Enviar'}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-neutral-400">
                    Presiona Enter para comentar.
                  </p>
                  {erroresComentario[publicacion.id] && (
                    <p
                      role="alert"
                      className="mt-2 text-sm text-red-600"
                    >
                      {erroresComentario[publicacion.id]}
                    </p>
                  )}
                  {mensajesComentario[publicacion.id] && (
                    <p
                      role="status"
                      className="mt-2 text-sm text-emerald-700"
                    >
                      {mensajesComentario[publicacion.id]}
                    </p>
                  )}
                  {comentariosEnviando[publicacion.id] && (
                    <p role="status" className="mt-2 text-sm text-neutral-500">
                      Publicando comentario…
                    </p>
                  )}
                </form>

                <section
                  className="mt-4 border-t border-neutral-100 pt-4"
                  aria-label={`Comentarios de ${publicacion.title}`}
                >
                  {comentarios.length === 0 && totalComentarios === 0 ? (
                    <p className="text-sm text-neutral-500">
                      Aún no hay comentarios.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {comentarios.slice(0, visiblesComentarios).map((comentario) => {
                        const nombreComentario =
                          comentario.author?.name || 'Anónimo'

                        return (
                          <li
                            key={comentario.id}
                            className="flex items-start gap-2.5"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cft-durazno/30 text-xs font-semibold text-cft-naranja">
                              {inicialAutor(nombreComentario)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="inline-block max-w-full rounded-2xl bg-neutral-100 px-4 py-2.5">
                                <p className="text-xs font-semibold text-cft-carbon">
                                  {nombreComentario}
                                </p>
                                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-neutral-700">
                                  {comentario.content}
                                </p>
                              </div>
                              {/* reacciones del comentario: mismos emojis
                                  que los posts pero más compactas, bajo la
                                  burbuja como en Facebook/Instagram */}
                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 px-2">
                                <time
                                  className="text-xs text-neutral-400"
                                  dateTime={comentario.createdAt || undefined}
                                >
                                  {fechaPublicacion(comentario.createdAt)}
                                </time>
                                <div
                                  className="flex flex-wrap items-center"
                                  role="group"
                                  aria-label={`Reacciones al comentario de ${nombreComentario}`}
                                >
                                  {TIPOS_REACCION.map(
                                    ({ tipo, emoji, nombre }) => (
                                      <button
                                        key={tipo}
                                        type="button"
                                        onClick={() =>
                                          reaccionarComentario(
                                            publicacion.id,
                                            comentario.id,
                                            tipo,
                                          )
                                        }
                                        disabled={
                                          reaccionesComentarioEnviando[
                                            comentario.id
                                          ]
                                        }
                                        title={nombre}
                                        aria-pressed={
                                          comentario.miReaccion?.type === tipo
                                        }
                                        className={`flex items-center gap-0.5 rounded-full px-1.5 py-1 transition-all hover:scale-110 hover:bg-cft-durazno/30 disabled:cursor-wait disabled:opacity-60 ${
                                          comentario.miReaccion?.type === tipo
                                            ? 'bg-cft-durazno/40 ring-1 ring-cft-naranja'
                                            : ''
                                        }`}
                                      >
                                        <span className="text-sm leading-none">
                                          {emoji}
                                        </span>
                                        {(comentario.reactions?.[tipo] ?? 0) >
                                          0 && (
                                          <span className="text-xs font-medium text-neutral-600">
                                            {comentario.reactions[tipo]}
                                          </span>
                                        )}
                                      </button>
                                    ),
                                  )}
                                </div>
                              </div>
                              {erroresReaccionComentario[comentario.id] && (
                                <p
                                  role="alert"
                                  className="mt-1 px-2 text-xs text-red-600"
                                >
                                  {erroresReaccionComentario[comentario.id]}
                                </p>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                  {/* se muestra si faltan comentarios por ver o por descargar
                      (el feed no trae los comments: el primer clic los pide) */}
                  {(visiblesComentarios < totalComentarios ||
                    comentarios.length < totalComentarios) && (
                    <button
                      type="button"
                      onClick={() => verMasComentarios(publicacion.id)}
                      disabled={comentariosCargando[publicacion.id]}
                      className="mt-3 text-sm font-semibold text-cft-naranja transition-colors hover:text-cft-coral disabled:cursor-wait disabled:opacity-60"
                    >
                      {comentariosCargando[publicacion.id]
                        ? 'Cargando…'
                        : comentarios.length === 0
                          ? `Ver comentarios (${totalComentarios})`
                          : `Ver más comentarios (${totalComentarios - Math.min(visiblesComentarios, comentarios.length)})`}
                    </button>
                  )}
                  {erroresCargaComentarios[publicacion.id] && (
                    <p role="alert" className="mt-2 text-sm text-red-600">
                      {erroresCargaComentarios[publicacion.id]}
                    </p>
                  )}
                </section>
              </article>
            )
          })}
        </section>
      )}

      {!cargando && !error && publicaciones.length > 0 && (
        <div ref={sentinelRef} className="py-4 text-center text-sm">
          {cargandoMas && (
            <p role="status" className="text-neutral-500">
              Cargando más publicaciones…
            </p>
          )}
          {errorCargarMas && (
            <p role="alert" className="text-red-600">
              {errorCargarMas}{' '}
              <button
                type="button"
                onClick={cargarMasPublicaciones}
                className="font-semibold underline"
              >
                Reintentar
              </button>
            </p>
          )}
          {!nextCursor && !cargandoMas && !errorCargarMas && (
            <p className="text-neutral-400">
              Ya viste todas las publicaciones
            </p>
          )}
        </div>
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
                  className="text-xl font-bold tracking-tight text-cft-carbon"
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
                className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-cft-carbon disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm text-cft-carbon outline-none transition-colors placeholder:text-neutral-400 focus:border-cft-naranja focus:bg-white focus:ring-2 focus:ring-cft-naranja/20"
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
                  className="w-full resize-y rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm leading-6 text-cft-carbon outline-none transition-colors placeholder:text-neutral-400 focus:border-cft-naranja focus:bg-white focus:ring-2 focus:ring-cft-naranja/20"
                />
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
                  className="rounded-full bg-gradient-to-r from-cft-naranja to-cft-coral px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-cft-naranja/20 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
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

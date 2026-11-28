const API_URL = import.meta.env.VITE_API_URL

// el canal de tiempo real cuelga de la misma base que la api rest:
// http → ws y https → wss. el token va en la query porque el navegador
// no permite mandar Authorization en el handshake del websocket
const URL_STREAM = `${API_URL.replace(/^http/, 'ws')}/stream`

const ESPERA_RECONEXION_MS = 5000

// una sola conexión por pestaña: vive en el módulo, fuera de React,
// para que navegar entre páginas no la cierre ni abra duplicados
let socket = null
let activo = false
let conectadoAntes = false
let temporizadorReconexion = null
const oyentesMensaje = new Set()
const oyentesReconexion = new Set()

function abrirSocket() {
  const token = localStorage.getItem('token')
  if (!activo || !token) return
  if (socket && socket.readyState !== WebSocket.CLOSED) return

  socket = new WebSocket(`${URL_STREAM}?token=${encodeURIComponent(token)}`)

  socket.onopen = () => {
    // si ya hubo conexión antes, esta apertura es una reconexión: mientras
    // estuvo caída se pudieron perder eventos → avisar para refetchear
    if (conectadoAntes) {
      oyentesReconexion.forEach((aviso) => aviso())
    }
    conectadoAntes = true
  }

  socket.onmessage = (evento) => {
    let mensaje
    try {
      mensaje = JSON.parse(evento.data)
    } catch {
      return
    }

    // el servidor exige responder a sus ping (~30s) o corta la conexión
    if (mensaje.type === 'ping') {
      socket.send(JSON.stringify({ type: 'pong' }))
      return
    }

    // solo aplica el mural global; los demás scopes se ignoran
    if (mensaje.scope && mensaje.scope !== 'global') return

    oyentesMensaje.forEach((aviso) => aviso(mensaje))
  }

  socket.onclose = () => {
    socket = null
    if (activo) {
      temporizadorReconexion = setTimeout(abrirSocket, ESPERA_RECONEXION_MS)
    }
  }
}

// se llama al iniciar sesión (o al cargar la app con sesión guardada)
export function conectarStream() {
  if (activo) return
  activo = true
  abrirSocket()
}

// se llama al cerrar sesión: corta el socket y frena la reconexión
export function desconectarStream() {
  activo = false
  conectadoAntes = false
  clearTimeout(temporizadorReconexion)
  if (socket) {
    // sin onclose para que el cierre voluntario no dispare una reconexión
    socket.onclose = null
    socket.close()
    socket = null
  }
}

// suscribe a los mensajes del canal (post:new, comment:new, ...).
// devuelve una función para desuscribirse
export function suscribirseMensajes(aviso) {
  oyentesMensaje.add(aviso)
  return () => oyentesMensaje.delete(aviso)
}

// suscribe a las reconexiones del socket (para refetchear la vista activa)
export function suscribirseReconexion(aviso) {
  oyentesReconexion.add(aviso)
  return () => oyentesReconexion.delete(aviso)
}

const API_URL = import.meta.env.VITE_API_URL

// GET /users → devuelve la lista de usuarios registrados
export async function obtenerUsuarios() {
  const respuesta = await fetch(`${API_URL}/users`)
  const datos = await respuesta.json()

  // fetch no lanza error ante un 4xx/5xx: hay que revisar respuesta.ok a mano
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los usuarios')
  }

  return datos.users
}

// POST /auth/login → inicia sesión y devuelve { user, token }
export async function iniciarSesion(credenciales) {
  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credenciales),
  })
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.error || 'No se pudo iniciar sesión')
  }

  return datos
}

// POST /auth/register → crea un usuario y devuelve { user, token }
export async function registrarUsuario(usuario) {
  const respuesta = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // avisamos que enviamos JSON
    body: JSON.stringify(usuario), // el body debe viajar como texto
  })
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.error || 'No se pudo registrar el usuario')
  }

  return datos
}

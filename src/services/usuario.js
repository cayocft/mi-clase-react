const API_URL = import.meta.env.VITE_API_URL

async function manejarRespuesta(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data.error || 'Error inesperado del servidor')
    error.status = res.status
    error.details = data.details || []
    throw error
  }
  return data
}

export async function obtenerUsuarios() {
  const res = await fetch(`${API_URL}/users`)
  const data = await manejarRespuesta(res)
  console.log(data)
  return data.users
}

export async function registrarUsuario(usuario) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario),
  })
  return manejarRespuesta(res)
}

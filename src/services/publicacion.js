const API_URL = import.meta.env.VITE_API_URL

// GET /posts → devuelve la lista de publicaciones registradas
export async function obtenerPublicaciones() {
  const respuesta = await fetch(`${API_URL}/posts`)
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener las publicaciones')
  }

  return datos.posts
}

// POST /posts → crea una publicación y devuelve el post creado
export async function crearPublicacion(publicacion) {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Debes iniciar sesión para crear una publicación')
  }

  const respuesta = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(publicacion),
  })
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.error || 'No se pudo crear la publicación')
  }

  return datos.post
}

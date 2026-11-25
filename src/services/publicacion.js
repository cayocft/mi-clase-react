const API_URL = import.meta.env.VITE_API_URL

// GET /posts?limit=10&cursor=... → devuelve { posts, nextCursor }
// cursor = id del último post cargado; sin cursor trae la primera página
export async function obtenerPublicaciones(cursor) {
  let url = `${API_URL}/posts?limit=10`
  if (cursor) url += `&cursor=${cursor}`

  const respuesta = await fetch(url)
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    const error = new Error(datos.error || 'No se pudieron obtener las publicaciones')
    error.status = respuesta.status
    throw error
  }

  return datos
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
    // guardamos el status para que la app pueda detectar un 401 (sesión expirada)
    const error = new Error(datos.error || 'No se pudo crear la publicación')
    error.status = respuesta.status
    throw error
  }

  return datos.post
}

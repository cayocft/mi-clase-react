const API_URL = import.meta.env.VITE_API_URL

// GET /posts/:postId/comments?limit=3&cursor=... → devuelve { comments, nextCursor }
// cursor = id del último comentario cargado; sin cursor trae la primera página
export async function obtenerComentarios(postId, cursor) {
  let url = `${API_URL}/posts/${postId}/comments?limit=3`
  if (cursor) url += `&cursor=${cursor}`

  const respuesta = await fetch(url)
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    const error = new Error(datos.error || 'No se pudieron obtener los comentarios')
    error.status = respuesta.status
    throw error
  }

  return datos
}

// POST /posts/:postId/comments → crea un comentario en una publicación
export async function crearComentario(postId, comentario) {
  const { content, userId } = comentario

  if (typeof content !== 'string' || content.length < 1 || content.length > 500) {
    throw new Error('El comentario debe tener entre 1 y 500 caracteres')
  }

  const respuesta = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, userId }),
  })
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.error || 'No se pudo crear el comentario')
  }

  return datos.comment
}

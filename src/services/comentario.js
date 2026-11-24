const API_URL = import.meta.env.VITE_API_URL

// GET /posts/:postId/comments → devuelve los comentarios de una publicación
export async function obtenerComentarios(postId) {
  const respuesta = await fetch(`${API_URL}/posts/${postId}/comments`)
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los comentarios')
  }

  return datos.comments
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

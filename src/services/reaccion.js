const API_URL = import.meta.env.VITE_API_URL

// GET /posts/:postId/reactions → devuelve { counts, reactions } de un post
// reactions trae el detalle: sirve para saber si el usuario ya reaccionó
export async function obtenerReacciones(postId) {
  const respuesta = await fetch(`${API_URL}/posts/${postId}/reactions`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    const error = new Error(datos.error || 'No se pudieron obtener las reacciones')
    error.status = respuesta.status
    throw error
  }

  return datos
}

// POST /posts/:postId/reactions → crea una reacción y devuelve { reaction, counts }
// el usuario se toma del token, solo se envía el type
export async function crearReaccion(postId, tipo) {
  const respuesta = await fetch(`${API_URL}/posts/${postId}/reactions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: tipo }),
  })
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    const error = new Error(datos.error || 'No se pudo reaccionar')
    error.status = respuesta.status
    throw error
  }

  return datos
}

// DELETE /reactions/:id → quita una reacción (204 = sin contenido, sin json)
export async function quitarReaccion(reaccionId) {
  const respuesta = await fetch(`${API_URL}/reactions/${reaccionId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })

  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}))
    const error = new Error(datos.error || 'No se pudo quitar la reacción')
    error.status = respuesta.status
    throw error
  }
}

// GET /comments/:commentId/reactions → devuelve { counts, reactions } de un
// comentario. el detalle sirve para saber si el usuario ya reaccionó a él
export async function obtenerReaccionesComentario(comentarioId) {
  const respuesta = await fetch(
    `${API_URL}/comments/${comentarioId}/reactions`,
  )
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    const error = new Error(
      datos.error || 'No se pudieron obtener las reacciones del comentario',
    )
    error.status = respuesta.status
    throw error
  }

  return datos
}

// POST /comments/:commentId/reactions → crea una reacción a un comentario y
// devuelve { reaction, counts }. se envía el token y el userId: el token
// autentica la petición y el userId atribuye la reacción al usuario
export async function crearReaccionComentario(comentarioId, tipo, userId) {
  const respuesta = await fetch(
    `${API_URL}/comments/${comentarioId}/reactions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: tipo, userId }),
    },
  )
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    const error = new Error(
      datos.error || 'No se pudo reaccionar al comentario',
    )
    error.status = respuesta.status
    throw error
  }

  return datos
}

// DELETE /comment-reactions/:id → quita una reacción a comentario
// (204 = sin contenido, sin json)
export async function quitarReaccionComentario(reaccionId) {
  const respuesta = await fetch(
    `${API_URL}/comment-reactions/${reaccionId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    },
  )

  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}))
    const error = new Error(datos.error || 'No se pudo quitar la reacción')
    error.status = respuesta.status
    throw error
  }
}

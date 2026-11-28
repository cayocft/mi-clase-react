import { useEffect, useRef } from 'react'
import {
  conectarStream,
  suscribirseMensajes,
  suscribirseReconexion,
} from '../services/stream'

// suscribe un componente al canal de tiempo real:
// - alRecibirMensaje(msg): cada evento global del servidor
// - alReconectar(): el socket volvió a abrirse tras una caída
//   (pudieron perderse eventos → conviene refetchear la vista)
//
// los callbacks se guardan en refs: cambiar su identidad en cada render
// no vuelve a suscribir ni a abrir el socket
export function usePostStream(alRecibirMensaje, alReconectar) {
  const refMensaje = useRef(alRecibirMensaje)
  const refReconectar = useRef(alReconectar)

  useEffect(() => {
    refMensaje.current = alRecibirMensaje
    refReconectar.current = alReconectar
  })

  useEffect(() => {
    conectarStream()
    const quitarMensaje = suscribirseMensajes((m) => refMensaje.current?.(m))
    const quitarReconexion = suscribirseReconexion(() =>
      refReconectar.current?.(),
    )

    return () => {
      quitarMensaje()
      quitarReconexion()
    }
  }, [])
}

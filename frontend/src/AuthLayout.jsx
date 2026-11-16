import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './Auth'

// Protege las rutas hijas: sin sesion, redirige
export function AuthLayout() {
  const { estaAutenticado, claveSalida } = useAuth()
  const location = useLocation()

  if (!estaAutenticado) {
    // Si el usuario toco "Salir" en esta misma pagina, vuelve al inicio
    if (claveSalida === location.key) {
      return <Navigate to="/" replace />
    }

    // Si no tenia sesion o el token vencio, al login. "desde" permite volver
    // a la pagina pedida despues de iniciar sesion.
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  return <Outlet />
}

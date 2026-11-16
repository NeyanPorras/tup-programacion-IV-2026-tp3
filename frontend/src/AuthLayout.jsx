import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './Auth'

// Protege las rutas hijas: sin sesion, redirige al login
export function AuthLayout() {
  const { estaAutenticado } = useAuth()
  const location = useLocation()

  if (!estaAutenticado) {
    // "desde" permite volver a la pagina pedida despues de iniciar sesion
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  return <Outlet />
}

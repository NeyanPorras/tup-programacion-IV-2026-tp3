import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from './Auth'

export function Layout() {
  const { estaAutenticado, nombre, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Se pasa la clave de la pagina actual: si es protegida, AuthLayout
  // reconoce la salida voluntaria y manda al inicio en lugar del login
  const salir = () => {
    logout(location.key)
    navigate('/')
  }

  return (
    <>
      <header className="encabezado">
        <nav>
          <ul className="menu">
            <li>
              <NavLink to="/" end>
                Inicio
              </NavLink>
            </li>

            {estaAutenticado && (
              <>
                <li>
                  <NavLink to="/vehiculos">Vehículos</NavLink>
                </li>
                <li>
                  <NavLink to="/conductores">Conductores</NavLink>
                </li>
                <li>
                  <NavLink to="/viajes">Viajes</NavLink>
                </li>
              </>
            )}

            {estaAutenticado ? (
              <li className="menu-derecha">
                <span>Hola, {nombre}</span>
                <button type="button" onClick={salir}>
                  Salir
                </button>
              </li>
            ) : (
              <>
                <li className="menu-derecha">
                  <NavLink to="/login">Ingresar</NavLink>
                </li>
                <li>
                  <NavLink to="/registro">Registrarse</NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <main className="contenido">
        <Outlet />
      </main>
    </>
  )
}

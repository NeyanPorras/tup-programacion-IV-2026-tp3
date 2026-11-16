import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from './Auth'

export function Layout() {
  const { estaAutenticado, nombre, logout } = useAuth()
  const navigate = useNavigate()

  const salir = () => {
    logout()
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

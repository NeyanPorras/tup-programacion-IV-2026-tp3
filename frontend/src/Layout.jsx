import { NavLink, Outlet } from 'react-router'

export function Layout() {
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
            <li>
              <NavLink to="/vehiculos">Vehículos</NavLink>
            </li>
            <li>
              <NavLink to="/conductores">Conductores</NavLink>
            </li>
            <li>
              <NavLink to="/viajes">Viajes</NavLink>
            </li>
            <li className="menu-derecha">
              <NavLink to="/login">Ingresar</NavLink>
            </li>
          </ul>
        </nav>
      </header>

      <main className="contenido">
        <Outlet />
      </main>
    </>
  )
}

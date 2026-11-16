import { Link } from 'react-router'

export function Home() {
  return (
    <section>
      <h1>Gestión de vehículos, conductores y viajes</h1>
      <p>
        Registrá los vehículos de la empresa, sus conductores y los viajes que
        realizan. Consultá el historial de cada vehículo o conductor y el total
        de kilómetros recorridos.
      </p>
      <p>
        <Link to="/login">Ingresá</Link> o <Link to="/registro">creá una cuenta</Link>{' '}
        para empezar.
      </p>
    </section>
  )
}

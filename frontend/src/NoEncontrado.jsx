import { Link } from 'react-router'

export function NoEncontrado() {
  return (
    <section>
      <h1>Página no encontrada</h1>
      <p>
        La dirección no existe. <Link to="/">Volver al inicio</Link>.
      </p>
    </section>
  )
}

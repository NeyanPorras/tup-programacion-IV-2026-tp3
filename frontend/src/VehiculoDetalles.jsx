import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from './Auth'
import { mensajesDeError } from './api'
import { formatearNumero } from './formato'
import { TablaViajes } from './TablaViajes'

// Datos del vehiculo, su historial de viajes y el total de kilometros
export function VehiculoDetalles() {
  const { id } = useParams()
  const { fetchAuth } = useAuth()
  const [historial, setHistorial] = useState(null)
  const [error, setError] = useState([])

  useEffect(() => {
    let activo = true

    fetchAuth(`/vehiculos/${id}/viajes`).then(({ ok, datos }) => {
      if (!activo) return

      if (ok) {
        setHistorial(datos)
      } else {
        setError(mensajesDeError(datos))
      }
    })

    return () => {
      activo = false
    }
  }, [id, fetchAuth])

  if (error.length > 0) {
    return (
      <section>
        <div className="aviso-error" role="alert">
          {error.map((mensaje) => (
            <p key={mensaje}>{mensaje}</p>
          ))}
        </div>
        <Link to="/vehiculos">Volver a vehículos</Link>
      </section>
    )
  }

  if (!historial) {
    return <p>Cargando historial…</p>
  }

  const { vehiculo, viajes, totalKilometros } = historial

  return (
    <section>
      <div className="titulo-con-accion">
        <h1>
          {vehiculo.patente} — {vehiculo.marca} {vehiculo.modelo}
        </h1>
        <Link to={`/viajes/nuevo?vehiculoId=${vehiculo.id}`} className="boton">
          Registrar viaje
        </Link>
      </div>

      <dl className="ficha">
        <dt>Año</dt>
        <dd>{vehiculo.anio}</dd>
        <dt>Capacidad de carga</dt>
        <dd>{formatearNumero(vehiculo.capacidadCarga)} kg</dd>
        <dt>Total recorrido</dt>
        <dd>
          <strong>{formatearNumero(totalKilometros)} km</strong> en{' '}
          {viajes.length} {viajes.length === 1 ? 'viaje' : 'viajes'}
        </dd>
      </dl>

      <h2>Historial de viajes</h2>
      <TablaViajes viajes={viajes} ocultar="vehiculo" />

      <p>
        <Link to={`/vehiculos/${vehiculo.id}/editar`}>Editar vehículo</Link> ·{' '}
        <Link to="/vehiculos">Volver a vehículos</Link>
      </p>
    </section>
  )
}

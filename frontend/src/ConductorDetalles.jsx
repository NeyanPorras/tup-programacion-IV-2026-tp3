import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from './Auth'
import { mensajesDeError } from './api'
import { formatearFecha, formatearNumero } from './formato'
import { hoy } from './validacionesForm'
import { TablaViajes } from './TablaViajes'

// Datos del conductor, su historial de viajes y el total de kilometros
export function ConductorDetalles() {
  const { id } = useParams()
  const { fetchAuth } = useAuth()
  const [historial, setHistorial] = useState(null)
  const [error, setError] = useState([])

  useEffect(() => {
    let activo = true

    fetchAuth(`/conductores/${id}/viajes`).then(({ ok, datos }) => {
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
        <Link to="/conductores">Volver a conductores</Link>
      </section>
    )
  }

  if (!historial) {
    return <p>Cargando historial…</p>
  }

  const { conductor, viajes, totalKilometros } = historial
  const vencida = conductor.fechaVencimientoLicencia < hoy()

  return (
    <section>
      <div className="titulo-con-accion">
        <h1>
          {conductor.apellido}, {conductor.nombre}
        </h1>
        <Link to={`/viajes/nuevo?conductorId=${conductor.id}`} className="boton">
          Registrar viaje
        </Link>
      </div>

      <dl className="ficha">
        <dt>Documento</dt>
        <dd>{conductor.documento}</dd>
        <dt>Licencia</dt>
        <dd>{conductor.licencia}</dd>
        <dt>Vigencia</dt>
        <dd>
          {formatearFecha(conductor.fechaAltaLicencia)} al{' '}
          {formatearFecha(conductor.fechaVencimientoLicencia)}
          {vencida && <span className="etiqueta-alerta">Vencida</span>}
        </dd>
        <dt>Total recorrido</dt>
        <dd>
          <strong>{formatearNumero(totalKilometros)} km</strong> en{' '}
          {viajes.length} {viajes.length === 1 ? 'viaje' : 'viajes'}
        </dd>
      </dl>

      <h2>Historial de viajes</h2>
      <TablaViajes viajes={viajes} ocultar="conductor" />

      <p>
        <Link to={`/conductores/${conductor.id}/editar`}>Editar conductor</Link> ·{' '}
        <Link to="/conductores">Volver a conductores</Link>
      </p>
    </section>
  )
}

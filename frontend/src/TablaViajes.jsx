import { Link } from 'react-router'
import { formatearFecha, formatearNumero } from './formato'

// Tabla de viajes reutilizada por el listado y por los historiales.
// ocultar: 'vehiculo' o 'conductor', para no repetir la columna que ya
// se sabe (en el historial de un vehiculo, todos los viajes son de ese vehiculo)
export function TablaViajes({ viajes, ocultar }) {
  if (viajes.length === 0) {
    return <p>No hay viajes registrados.</p>
  }

  return (
    <table className="tabla">
      <thead>
        <tr>
          <th>Salida</th>
          <th>Llegada</th>
          {ocultar !== 'vehiculo' && <th>Vehículo</th>}
          {ocultar !== 'conductor' && <th>Conductor</th>}
          <th>Origen</th>
          <th>Destino</th>
          <th className="numero">Kilómetros</th>
          <th>Observaciones</th>
        </tr>
      </thead>
      <tbody>
        {viajes.map((viaje) => (
          <tr key={viaje.id}>
            <td>{formatearFecha(viaje.fechaSalida)}</td>
            <td>{formatearFecha(viaje.fechaLlegada)}</td>
            {ocultar !== 'vehiculo' && (
              <td>
                <Link to={`/vehiculos/${viaje.vehiculo.id}`}>
                  {viaje.vehiculo.patente}
                </Link>
              </td>
            )}
            {ocultar !== 'conductor' && (
              <td>
                <Link to={`/conductores/${viaje.conductor.id}`}>
                  {viaje.conductor.apellido}, {viaje.conductor.nombre}
                </Link>
              </td>
            )}
            <td>{viaje.origen}</td>
            <td>{viaje.destino}</td>
            <td className="numero">{formatearNumero(viaje.kilometros)}</td>
            <td>{viaje.observaciones ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

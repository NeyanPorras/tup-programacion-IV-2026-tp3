import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from './Auth'
import { mensajesDeError } from './api'

export function Vehiculos() {
  const { fetchAuth } = useAuth()
  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState([])

  useEffect(() => {
    // Si el usuario sale de la pagina antes de que llegue la respuesta,
    // "activo" queda en false y la respuesta se descarta.
    let activo = true

    fetchAuth('/vehiculos').then(({ ok, datos }) => {
      if (!activo) return

      if (ok) {
        setVehiculos(datos)
      } else {
        setError(mensajesDeError(datos))
      }
      setCargando(false)
    })

    return () => {
      activo = false
    }
  }, [fetchAuth])

  const eliminar = async (vehiculo) => {
    const confirmado = window.confirm(
      `¿Eliminar el vehículo ${vehiculo.patente} (${vehiculo.marca} ${vehiculo.modelo})?`
    )
    if (!confirmado) return

    setError([])
    const { ok, datos } = await fetchAuth(`/vehiculos/${vehiculo.id}`, {
      method: 'DELETE'
    })

    if (!ok) {
      setError(mensajesDeError(datos))
      return
    }

    // Se saca de la lista sin volver a pedirla al backend
    setVehiculos((anteriores) => anteriores.filter((v) => v.id !== vehiculo.id))
  }

  return (
    <section>
      <div className="titulo-con-accion">
        <h1>Vehículos</h1>
        <Link to="/vehiculos/nuevo" className="boton">
          Nuevo vehículo
        </Link>
      </div>

      {error.length > 0 && (
        <div className="aviso-error" role="alert">
          {error.map((mensaje) => (
            <p key={mensaje}>{mensaje}</p>
          ))}
        </div>
      )}

      {cargando ? (
        <p>Cargando vehículos…</p>
      ) : vehiculos.length === 0 ? (
        <p>Todavía no hay vehículos cargados.</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Patente</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Año</th>
              <th>Capacidad de carga</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((vehiculo) => (
              <tr key={vehiculo.id}>
                <td>
                  <Link to={`/vehiculos/${vehiculo.id}`}>{vehiculo.patente}</Link>
                </td>
                <td>{vehiculo.marca}</td>
                <td>{vehiculo.modelo}</td>
                <td>{vehiculo.anio}</td>
                <td>{vehiculo.capacidadCarga.toLocaleString('es-AR')} kg</td>
                <td className="acciones">
                  <Link to={`/vehiculos/${vehiculo.id}/editar`}>Editar</Link>
                  <button
                    type="button"
                    className="boton-peligro"
                    onClick={() => eliminar(vehiculo)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

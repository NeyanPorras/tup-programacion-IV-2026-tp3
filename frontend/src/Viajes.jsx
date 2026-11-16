import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from './Auth'
import { mensajesDeError } from './api'
import { formatearNumero } from './formato'
import { VehiculosSelect } from './VehiculosSelect'
import { ConductoresSelect } from './ConductoresSelect'
import { TablaViajes } from './TablaViajes'

export function Viajes() {
  const { fetchAuth } = useAuth()
  const [filtros, setFiltros] = useState({ vehiculoId: '', conductorId: '' })
  const [viajes, setViajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState([])

  // Se vuelve a ejecutar cada vez que cambia un filtro
  useEffect(() => {
    let activo = true

    // URLSearchParams arma "?vehiculoId=1&conductorId=2" solo con los filtros elegidos
    const parametros = new URLSearchParams()
    if (filtros.vehiculoId) parametros.append('vehiculoId', filtros.vehiculoId)
    if (filtros.conductorId) parametros.append('conductorId', filtros.conductorId)
    const consulta = parametros.toString()

    fetchAuth(`/viajes${consulta ? `?${consulta}` : ''}`).then(({ ok, datos }) => {
      if (!activo) return

      if (ok) {
        setViajes(datos)
        setError([])
      } else {
        setError(mensajesDeError(datos))
      }
      setCargando(false)
    })

    return () => {
      activo = false
    }
  }, [filtros, fetchAuth])

  const cambiarFiltro = (campo, valor) =>
    setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }))

  // Total de los viajes que se estan mostrando, con el filtro aplicado
  const totalKilometros = viajes.reduce((total, viaje) => total + viaje.kilometros, 0)

  return (
    <section>
      <div className="titulo-con-accion">
        <h1>Viajes</h1>
        <Link to="/viajes/nuevo" className="boton">
          Registrar viaje
        </Link>
      </div>

      <div className="filtros">
        <div className="campo">
          <label htmlFor="filtroVehiculo">Vehículo</label>
          <VehiculosSelect
            id="filtroVehiculo"
            valor={filtros.vehiculoId}
            onChange={(valor) => cambiarFiltro('vehiculoId', valor)}
            textoVacio="Todos los vehículos"
          />
        </div>

        <div className="campo">
          <label htmlFor="filtroConductor">Conductor</label>
          <ConductoresSelect
            id="filtroConductor"
            valor={filtros.conductorId}
            onChange={(valor) => cambiarFiltro('conductorId', valor)}
            textoVacio="Todos los conductores"
          />
        </div>
      </div>

      {error.length > 0 && (
        <div className="aviso-error" role="alert">
          {error.map((mensaje) => (
            <p key={mensaje}>{mensaje}</p>
          ))}
        </div>
      )}

      {cargando ? (
        <p>Cargando viajes…</p>
      ) : (
        <>
          <p className="total">
            {viajes.length} {viajes.length === 1 ? 'viaje' : 'viajes'} ·{' '}
            <strong>{formatearNumero(totalKilometros)} km</strong> recorridos
          </p>
          <TablaViajes viajes={viajes} />
        </>
      )}
    </section>
  )
}

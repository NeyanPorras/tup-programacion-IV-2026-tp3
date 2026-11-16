import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from './Auth'
import { mensajesDeError } from './api'
import { hoy } from './validacionesForm'
import { formatearFecha } from './formato'

export function Conductores() {
  const { fetchAuth } = useAuth()
  const [conductores, setConductores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState([])

  useEffect(() => {
    let activo = true

    fetchAuth('/conductores').then(({ ok, datos }) => {
      if (!activo) return

      if (ok) {
        setConductores(datos)
      } else {
        setError(mensajesDeError(datos))
      }
      setCargando(false)
    })

    return () => {
      activo = false
    }
  }, [fetchAuth])

  const eliminar = async (conductor) => {
    const confirmado = window.confirm(
      `¿Eliminar al conductor ${conductor.nombre} ${conductor.apellido} (DNI ${conductor.documento})?`
    )
    if (!confirmado) return

    setError([])
    const { ok, datos } = await fetchAuth(`/conductores/${conductor.id}`, {
      method: 'DELETE'
    })

    if (!ok) {
      setError(mensajesDeError(datos))
      return
    }

    setConductores((anteriores) =>
      anteriores.filter((c) => c.id !== conductor.id)
    )
  }

  const fechaDeHoy = hoy()

  return (
    <section>
      <div className="titulo-con-accion">
        <h1>Conductores</h1>
        <Link to="/conductores/nuevo" className="boton">
          Nuevo conductor
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
        <p>Cargando conductores…</p>
      ) : conductores.length === 0 ? (
        <p>Todavía no hay conductores cargados.</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Apellido y nombre</th>
              <th>Documento</th>
              <th>Licencia</th>
              <th>Alta de licencia</th>
              <th>Vencimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conductores.map((conductor) => {
              const vencida = conductor.fechaVencimientoLicencia < fechaDeHoy

              return (
                <tr key={conductor.id}>
                  <td>
                    <Link to={`/conductores/${conductor.id}`}>
                      {conductor.apellido}, {conductor.nombre}
                    </Link>
                  </td>
                  <td>{conductor.documento}</td>
                  <td>{conductor.licencia}</td>
                  <td>{formatearFecha(conductor.fechaAltaLicencia)}</td>
                  <td>
                    {formatearFecha(conductor.fechaVencimientoLicencia)}
                    {vencida && <span className="etiqueta-alerta">Vencida</span>}
                  </td>
                  <td className="acciones">
                    <Link to={`/conductores/${conductor.id}/editar`}>Editar</Link>
                    <button
                      type="button"
                      className="boton-peligro"
                      onClick={() => eliminar(conductor)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}

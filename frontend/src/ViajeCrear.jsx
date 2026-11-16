import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from './Auth'
import { mensajesDeError } from './api'
import { VehiculosSelect } from './VehiculosSelect'
import { ConductoresSelect } from './ConductoresSelect'
import {
  soloErrores,
  validarNumeroPositivo,
  validarTexto
} from './validacionesForm'

// El input datetime-local entrega "AAAA-MM-DDTHH:MM", o "" si esta vacio
const FORMATO_FECHA_HORA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

const validarFechaHora = (valor, campo) => {
  if (!valor) return `${campo} es obligatoria`
  if (!FORMATO_FECHA_HORA.test(valor)) return `${campo} no es válida`
  return null
}

const validarLargoEntre = (valor, campo, minimo, maximo) => {
  const error = validarTexto(valor, campo, maximo)
  if (error) return error
  if (valor.trim().length < minimo) {
    return `${campo} debe tener al menos ${minimo} caracteres`
  }
  return null
}

export function ViajeCrear() {
  const { fetchAuth } = useAuth()
  const navigate = useNavigate()

  // Permite llegar con el vehiculo o el conductor ya elegido:
  // /viajes/nuevo?vehiculoId=2
  const [parametros] = useSearchParams()

  const [datos, setDatos] = useState({
    vehiculoId: parametros.get('vehiculoId') ?? '',
    conductorId: parametros.get('conductorId') ?? '',
    fechaSalida: '',
    fechaLlegada: '',
    origen: '',
    destino: '',
    kilometros: '',
    observaciones: ''
  })
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState([])
  const [enviando, setEnviando] = useState(false)

  const cambiarCampo = (campo, valor) =>
    setDatos((anterior) => ({ ...anterior, [campo]: valor }))

  const cambiar = (e) => cambiarCampo(e.target.name, e.target.value)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorServidor([])

    const errorLlegada =
      validarFechaHora(datos.fechaLlegada, 'La fecha de llegada') ??
      (datos.fechaSalida && datos.fechaLlegada < datos.fechaSalida
        ? 'La llegada no puede ser anterior a la salida'
        : null)

    const nuevosErrores = soloErrores({
      vehiculoId: datos.vehiculoId ? null : 'Elegí un vehículo',
      conductorId: datos.conductorId ? null : 'Elegí un conductor',
      fechaSalida: validarFechaHora(datos.fechaSalida, 'La fecha de salida'),
      fechaLlegada: errorLlegada,
      origen: validarLargoEntre(datos.origen, 'El origen', 2, 100),
      destino: validarLargoEntre(datos.destino, 'El destino', 2, 100),
      kilometros: validarNumeroPositivo(
        datos.kilometros,
        'La cantidad de kilómetros',
        true
      ),
      observaciones:
        datos.observaciones.trim().length > 255
          ? 'Las observaciones no pueden superar los 255 caracteres'
          : null
    })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    const viaje = {
      vehiculoId: Number(datos.vehiculoId),
      conductorId: Number(datos.conductorId),
      fechaSalida: datos.fechaSalida,
      fechaLlegada: datos.fechaLlegada,
      origen: datos.origen.trim(),
      destino: datos.destino.trim(),
      kilometros: Number(datos.kilometros),
      observaciones: datos.observaciones.trim() || null
    }

    setEnviando(true)
    const { ok, datos: respuesta } = await fetchAuth('/viajes', {
      method: 'POST',
      body: JSON.stringify(viaje)
    })
    setEnviando(false)

    if (!ok) {
      setErrorServidor(mensajesDeError(respuesta))
      return
    }

    navigate('/viajes')
  }

  return (
    <section className="formulario-centrado">
      <h1>Registrar viaje</h1>

      <form onSubmit={handleSubmit} noValidate className="formulario">
        <div className="campo">
          <label htmlFor="vehiculoId">Vehículo</label>
          <VehiculosSelect
            valor={datos.vehiculoId}
            onChange={(valor) => cambiarCampo('vehiculoId', valor)}
            invalido={Boolean(errores.vehiculoId)}
          />
          {errores.vehiculoId && (
            <p className="error-campo">{errores.vehiculoId}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="conductorId">Conductor</label>
          <ConductoresSelect
            valor={datos.conductorId}
            onChange={(valor) => cambiarCampo('conductorId', valor)}
            invalido={Boolean(errores.conductorId)}
          />
          {errores.conductorId && (
            <p className="error-campo">{errores.conductorId}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="fechaSalida">Salida</label>
          <input
            id="fechaSalida"
            name="fechaSalida"
            type="datetime-local"
            value={datos.fechaSalida}
            onChange={cambiar}
            aria-invalid={Boolean(errores.fechaSalida)}
          />
          {errores.fechaSalida && (
            <p className="error-campo">{errores.fechaSalida}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="fechaLlegada">Llegada</label>
          <input
            id="fechaLlegada"
            name="fechaLlegada"
            type="datetime-local"
            min={datos.fechaSalida || undefined}
            value={datos.fechaLlegada}
            onChange={cambiar}
            aria-invalid={Boolean(errores.fechaLlegada)}
          />
          {errores.fechaLlegada && (
            <p className="error-campo">{errores.fechaLlegada}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="origen">Origen</label>
          <input
            id="origen"
            name="origen"
            value={datos.origen}
            onChange={cambiar}
            aria-invalid={Boolean(errores.origen)}
          />
          {errores.origen && <p className="error-campo">{errores.origen}</p>}
        </div>

        <div className="campo">
          <label htmlFor="destino">Destino</label>
          <input
            id="destino"
            name="destino"
            value={datos.destino}
            onChange={cambiar}
            aria-invalid={Boolean(errores.destino)}
          />
          {errores.destino && (
            <p className="error-campo">{errores.destino}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="kilometros">Kilómetros</label>
          <input
            id="kilometros"
            name="kilometros"
            type="number"
            min={0}
            step="0.01"
            value={datos.kilometros}
            onChange={cambiar}
            aria-invalid={Boolean(errores.kilometros)}
          />
          {errores.kilometros && (
            <p className="error-campo">{errores.kilometros}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="observaciones">Observaciones (opcional)</label>
          <textarea
            id="observaciones"
            name="observaciones"
            rows={3}
            maxLength={255}
            value={datos.observaciones}
            onChange={cambiar}
            aria-invalid={Boolean(errores.observaciones)}
          />
          {errores.observaciones && (
            <p className="error-campo">{errores.observaciones}</p>
          )}
        </div>

        {errorServidor.length > 0 && (
          <div className="aviso-error" role="alert">
            {errorServidor.map((mensaje) => (
              <p key={mensaje}>{mensaje}</p>
            ))}
          </div>
        )}

        <div className="botones">
          <button type="submit" disabled={enviando}>
            {enviando ? 'Registrando…' : 'Registrar viaje'}
          </button>
          <Link to="/viajes">Cancelar</Link>
        </div>
      </form>
    </section>
  )
}

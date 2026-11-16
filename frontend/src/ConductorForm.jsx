import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from './Auth'
import { mensajesDeError } from './api'
import {
  soloErrores,
  validarDocumento,
  validarFecha,
  validarLicencia,
  validarNombrePersona
} from './validacionesForm'

const VACIO = {
  nombre: '',
  apellido: '',
  documento: '',
  licencia: '',
  fechaAltaLicencia: '',
  fechaVencimientoLicencia: ''
}

// Con :id en la URL edita (PUT), sin :id crea (POST)
export function ConductorForm() {
  const { id } = useParams()
  const esEdicion = id !== undefined
  const { fetchAuth } = useAuth()
  const navigate = useNavigate()

  const [datos, setDatos] = useState(VACIO)
  const [cargando, setCargando] = useState(esEdicion)
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState([])
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!esEdicion) return
    let activo = true

    fetchAuth(`/conductores/${id}`).then(({ ok, datos: conductor }) => {
      if (!activo) return

      if (ok) {
        // La API devuelve las fechas como "AAAA-MM-DD", el formato del input date
        setDatos({
          nombre: conductor.nombre,
          apellido: conductor.apellido,
          documento: conductor.documento,
          licencia: conductor.licencia,
          fechaAltaLicencia: conductor.fechaAltaLicencia,
          fechaVencimientoLicencia: conductor.fechaVencimientoLicencia
        })
      } else {
        setErrorServidor(mensajesDeError(conductor))
      }
      setCargando(false)
    })

    return () => {
      activo = false
    }
  }, [esEdicion, id, fetchAuth])

  const cambiar = (e) => {
    const { name, value } = e.target
    const valor = name === 'licencia' ? value.toUpperCase() : value
    setDatos((anterior) => ({ ...anterior, [name]: valor }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorServidor([])

    const errorVencimiento =
      validarFecha(datos.fechaVencimientoLicencia, 'La fecha de vencimiento') ??
      (datos.fechaAltaLicencia &&
      datos.fechaVencimientoLicencia <= datos.fechaAltaLicencia
        ? 'El vencimiento debe ser posterior a la fecha de alta'
        : null)

    const nuevosErrores = soloErrores({
      nombre: validarNombrePersona(datos.nombre, 'El nombre', true),
      apellido: validarNombrePersona(datos.apellido, 'El apellido', true),
      documento: validarDocumento(datos.documento),
      licencia: validarLicencia(datos.licencia),
      fechaAltaLicencia: validarFecha(datos.fechaAltaLicencia, 'La fecha de alta'),
      fechaVencimientoLicencia: errorVencimiento
    })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    const conductor = {
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      documento: datos.documento.trim(),
      licencia: datos.licencia.trim(),
      fechaAltaLicencia: datos.fechaAltaLicencia,
      fechaVencimientoLicencia: datos.fechaVencimientoLicencia
    }

    setEnviando(true)
    const { ok, datos: respuesta } = await fetchAuth(
      esEdicion ? `/conductores/${id}` : '/conductores',
      {
        method: esEdicion ? 'PUT' : 'POST',
        body: JSON.stringify(conductor)
      }
    )
    setEnviando(false)

    if (!ok) {
      setErrorServidor(mensajesDeError(respuesta))
      return
    }

    navigate('/conductores')
  }

  if (cargando) {
    return <p>Cargando conductor…</p>
  }

  return (
    <section className="formulario-centrado">
      <h1>{esEdicion ? 'Editar conductor' : 'Nuevo conductor'}</h1>

      <form onSubmit={handleSubmit} noValidate className="formulario">
        <div className="campo">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            value={datos.nombre}
            onChange={cambiar}
            aria-invalid={Boolean(errores.nombre)}
          />
          {errores.nombre && <p className="error-campo">{errores.nombre}</p>}
        </div>

        <div className="campo">
          <label htmlFor="apellido">Apellido</label>
          <input
            id="apellido"
            name="apellido"
            value={datos.apellido}
            onChange={cambiar}
            aria-invalid={Boolean(errores.apellido)}
          />
          {errores.apellido && (
            <p className="error-campo">{errores.apellido}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="documento">Documento</label>
          <input
            id="documento"
            name="documento"
            inputMode="numeric"
            maxLength={8}
            placeholder="Sin puntos"
            value={datos.documento}
            onChange={cambiar}
            aria-invalid={Boolean(errores.documento)}
          />
          {errores.documento && (
            <p className="error-campo">{errores.documento}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="licencia">Número de licencia</label>
          <input
            id="licencia"
            name="licencia"
            maxLength={20}
            value={datos.licencia}
            onChange={cambiar}
            aria-invalid={Boolean(errores.licencia)}
          />
          {errores.licencia && (
            <p className="error-campo">{errores.licencia}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="fechaAltaLicencia">Fecha de alta de la licencia</label>
          <input
            id="fechaAltaLicencia"
            name="fechaAltaLicencia"
            type="date"
            value={datos.fechaAltaLicencia}
            onChange={cambiar}
            aria-invalid={Boolean(errores.fechaAltaLicencia)}
          />
          {errores.fechaAltaLicencia && (
            <p className="error-campo">{errores.fechaAltaLicencia}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="fechaVencimientoLicencia">
            Fecha de vencimiento de la licencia
          </label>
          <input
            id="fechaVencimientoLicencia"
            name="fechaVencimientoLicencia"
            type="date"
            min={datos.fechaAltaLicencia || undefined}
            value={datos.fechaVencimientoLicencia}
            onChange={cambiar}
            aria-invalid={Boolean(errores.fechaVencimientoLicencia)}
          />
          {errores.fechaVencimientoLicencia && (
            <p className="error-campo">{errores.fechaVencimientoLicencia}</p>
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
            {enviando ? 'Guardando…' : 'Guardar'}
          </button>
          <Link to="/conductores">Cancelar</Link>
        </div>
      </form>
    </section>
  )
}

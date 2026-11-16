import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from './Auth'
import { mensajesDeError } from './api'
import {
  ANIO_MAXIMO,
  soloErrores,
  validarAnio,
  validarNumeroPositivo,
  validarPatente,
  validarTexto
} from './validacionesForm'

const VACIO = {
  marca: '',
  modelo: '',
  patente: '',
  anio: '',
  capacidadCarga: ''
}

// Un solo formulario para alta y modificacion:
// con :id en la URL edita (PUT), sin :id crea (POST)
export function VehiculoForm() {
  const { id } = useParams()
  const esEdicion = id !== undefined
  const { fetchAuth } = useAuth()
  const navigate = useNavigate()

  const [datos, setDatos] = useState(VACIO)
  const [cargando, setCargando] = useState(esEdicion)
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState([])
  const [enviando, setEnviando] = useState(false)

  // En modo edicion, carga los datos actuales del vehiculo
  useEffect(() => {
    if (!esEdicion) return
    let activo = true

    fetchAuth(`/vehiculos/${id}`).then(({ ok, datos: vehiculo }) => {
      if (!activo) return

      if (ok) {
        // Los inputs trabajan con texto: los numeros se pasan a string
        setDatos({
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          patente: vehiculo.patente,
          anio: String(vehiculo.anio),
          capacidadCarga: String(vehiculo.capacidadCarga)
        })
      } else {
        setErrorServidor(mensajesDeError(vehiculo))
      }
      setCargando(false)
    })

    return () => {
      activo = false
    }
  }, [esEdicion, id, fetchAuth])

  const cambiar = (e) => {
    const { name, value } = e.target
    const valor = name === 'patente' ? value.toUpperCase() : value
    setDatos((anterior) => ({ ...anterior, [name]: valor }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorServidor([])

    const nuevosErrores = soloErrores({
      marca: validarTexto(datos.marca, 'La marca', 50, true),
      modelo: validarTexto(datos.modelo, 'El modelo', 50),
      patente: validarPatente(datos.patente),
      anio: validarAnio(datos.anio),
      capacidadCarga: validarNumeroPositivo(
        datos.capacidadCarga,
        'La capacidad de carga',
        true
      )
    })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    // Al backend se le mandan numeros, no los textos de los inputs
    const vehiculo = {
      marca: datos.marca.trim(),
      modelo: datos.modelo.trim(),
      patente: datos.patente.trim(),
      anio: Number(datos.anio),
      capacidadCarga: Number(datos.capacidadCarga)
    }

    setEnviando(true)
    const { ok, datos: respuesta } = await fetchAuth(
      esEdicion ? `/vehiculos/${id}` : '/vehiculos',
      {
        method: esEdicion ? 'PUT' : 'POST',
        body: JSON.stringify(vehiculo)
      }
    )
    setEnviando(false)

    if (!ok) {
      setErrorServidor(mensajesDeError(respuesta))
      return
    }

    navigate('/vehiculos')
  }

  if (cargando) {
    return <p>Cargando vehículo…</p>
  }

  return (
    <section className="formulario-centrado">
      <h1>{esEdicion ? 'Editar vehículo' : 'Nuevo vehículo'}</h1>

      <form onSubmit={handleSubmit} noValidate className="formulario">
        <div className="campo">
          <label htmlFor="marca">Marca</label>
          <input
            id="marca"
            name="marca"
            value={datos.marca}
            onChange={cambiar}
            aria-invalid={Boolean(errores.marca)}
          />
          {errores.marca && <p className="error-campo">{errores.marca}</p>}
        </div>

        <div className="campo">
          <label htmlFor="modelo">Modelo</label>
          <input
            id="modelo"
            name="modelo"
            value={datos.modelo}
            onChange={cambiar}
            aria-invalid={Boolean(errores.modelo)}
          />
          {errores.modelo && <p className="error-campo">{errores.modelo}</p>}
        </div>

        <div className="campo">
          <label htmlFor="patente">Patente</label>
          <input
            id="patente"
            name="patente"
            value={datos.patente}
            onChange={cambiar}
            maxLength={7}
            placeholder="AA123BB o ABC123"
            aria-invalid={Boolean(errores.patente)}
          />
          {errores.patente && (
            <p className="error-campo">{errores.patente}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="anio">Año</label>
          <input
            id="anio"
            name="anio"
            type="number"
            min={1950}
            max={ANIO_MAXIMO}
            value={datos.anio}
            onChange={cambiar}
            aria-invalid={Boolean(errores.anio)}
          />
          {errores.anio && <p className="error-campo">{errores.anio}</p>}
        </div>

        <div className="campo">
          <label htmlFor="capacidadCarga">Capacidad de carga (kg)</label>
          <input
            id="capacidadCarga"
            name="capacidadCarga"
            type="number"
            min={0}
            step="0.01"
            value={datos.capacidadCarga}
            onChange={cambiar}
            aria-invalid={Boolean(errores.capacidadCarga)}
          />
          {errores.capacidadCarga && (
            <p className="error-campo">{errores.capacidadCarga}</p>
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
          <Link to="/vehiculos">Cancelar</Link>
        </div>
      </form>
    </section>
  )
}

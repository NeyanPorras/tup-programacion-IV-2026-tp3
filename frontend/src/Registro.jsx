import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from './Auth'
import { mensajesDeError } from './api'
import {
  soloErrores,
  validarEmail,
  validarNombrePersona,
  validarPasswordNueva
} from './validacionesForm'

export function Registro() {
  const { registrar } = useAuth()
  const navigate = useNavigate()

  const [datos, setDatos] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmacion: ''
  })
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState([])
  const [enviando, setEnviando] = useState(false)

  // Un solo manejador para todos los inputs: usa el atributo "name"
  const cambiar = (e) => {
    const { name, value } = e.target
    setDatos((anterior) => ({ ...anterior, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorServidor([])

    const nuevosErrores = soloErrores({
      nombre: validarNombrePersona(datos.nombre),
      email: validarEmail(datos.email),
      password: validarPasswordNueva(datos.password),
      confirmacion:
        datos.confirmacion === datos.password
          ? null
          : 'Las contraseñas no coinciden'
    })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    const resultado = await registrar(
      datos.nombre.trim(),
      datos.email.trim(),
      datos.password
    )
    setEnviando(false)

    if (!resultado.ok) {
      setErrorServidor(mensajesDeError(resultado.datos))
      return
    }

    navigate('/login', {
      state: { registrado: true, email: datos.email.trim() }
    })
  }

  return (
    <section className="formulario-centrado">
      <h1>Crear cuenta</h1>

      <form onSubmit={handleSubmit} noValidate className="formulario">
        <div className="campo">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            autoComplete="name"
            value={datos.nombre}
            onChange={cambiar}
            aria-invalid={Boolean(errores.nombre)}
          />
          {errores.nombre && <p className="error-campo">{errores.nombre}</p>}
        </div>

        <div className="campo">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={datos.email}
            onChange={cambiar}
            aria-invalid={Boolean(errores.email)}
          />
          {errores.email && <p className="error-campo">{errores.email}</p>}
        </div>

        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={datos.password}
            onChange={cambiar}
            aria-invalid={Boolean(errores.password)}
          />
          <p className="ayuda-campo">
            Mínimo 8 caracteres, con al menos una minúscula y un número.
          </p>
          {errores.password && (
            <p className="error-campo">{errores.password}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="confirmacion">Repetir contraseña</label>
          <input
            id="confirmacion"
            name="confirmacion"
            type="password"
            autoComplete="new-password"
            value={datos.confirmacion}
            onChange={cambiar}
            aria-invalid={Boolean(errores.confirmacion)}
          />
          {errores.confirmacion && (
            <p className="error-campo">{errores.confirmacion}</p>
          )}
        </div>

        {errorServidor.length > 0 && (
          <div className="aviso-error" role="alert">
            {errorServidor.map((mensaje) => (
              <p key={mensaje}>{mensaje}</p>
            ))}
          </div>
        )}

        <button type="submit" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p>
        ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
      </p>
    </section>
  )
}

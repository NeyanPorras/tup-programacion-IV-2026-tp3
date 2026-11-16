import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from './Auth'
import { mensajesDeError } from './api'
import { soloErrores, validarEmail } from './validacionesForm'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // El registro y AuthLayout pueden mandar datos al navegar hacia aca
  const recienRegistrado = location.state?.registrado
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState([])
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorServidor([])

    const nuevosErrores = soloErrores({
      email: validarEmail(email),
      password: password ? null : 'La contraseña es obligatoria'
    })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    const resultado = await login(email.trim(), password)
    setEnviando(false)

    if (!resultado.ok) {
      setErrorServidor(mensajesDeError(resultado.datos))
      return
    }

    // Vuelve a la pagina que se queria ver antes del login
    navigate(location.state?.desde ?? '/vehiculos', { replace: true })
  }

  return (
    <section className="formulario-centrado">
      <h1>Ingresar</h1>

      {recienRegistrado && (
        <p className="aviso-exito">Cuenta creada. Ya podés ingresar.</p>
      )}

      <form onSubmit={handleSubmit} noValidate className="formulario">
        <div className="campo">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errores.email)}
          />
          {errores.email && <p className="error-campo">{errores.email}</p>}
        </div>

        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errores.password)}
          />
          {errores.password && (
            <p className="error-campo">{errores.password}</p>
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
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <p>
        ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
      </p>
    </section>
  )
}

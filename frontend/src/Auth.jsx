import { createContext, useCallback, useContext, useState } from 'react'
import { API_URL } from './api'

const CLAVE_SESION = 'sesion'

// Contexto para compartir la sesion con toda la aplicacion
const AuthContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

// Lee la sesion guardada y la descarta si el token ya vencio.
// El payload del JWT es JSON en base64: se puede leer sin la clave secreta.
function leerSesionGuardada() {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION))
    if (!sesion?.token) return null

    const payload = JSON.parse(atob(sesion.token.split('.')[1]))
    const vencido = payload.exp * 1000 <= Date.now()
    return vencido ? null : sesion
  } catch {
    return null
  }
}

// Envia un pedido al backend y devuelve { ok, status, datos }
async function pedir(url, opciones = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...opciones.headers }
  })
  const datos = await response.json().catch(() => null)
  return { ok: response.ok, status: response.status, datos }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesionGuardada)
  // Clave (location.key) de la pagina desde la que el usuario toco "Salir".
  // AuthLayout la compara para mandarlo al inicio solo desde esa pagina;
  // cualquier otra pagina protegida, o un token rechazado, va al login.
  const [claveSalida, setClaveSalida] = useState(null)

  const guardarSesion = useCallback((nuevaSesion) => {
    setSesion(nuevaSesion)
    try {
      if (nuevaSesion) {
        localStorage.setItem(CLAVE_SESION, JSON.stringify(nuevaSesion))
      } else {
        localStorage.removeItem(CLAVE_SESION)
      }
    } catch {
      // Sin localStorage la sesion igual funciona hasta recargar la pagina
    }
  }, [])

  const login = useCallback(
    async (email, password) => {
      const { ok, datos } = await pedir('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      if (!ok) {
        return { ok: false, datos }
      }

      guardarSesion({ token: datos.token, nombre: datos.nombre })
      setClaveSalida(null)
      return { ok: true, datos }
    },
    [guardarSesion]
  )

  const registrar = useCallback(async (nombre, email, password) => {
    return pedir('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, password })
    })
  }, [])

  // clave: la location.key de la pagina actual cuando el usuario toca "Salir"
  const logout = useCallback(
    (clave = null) => {
      setClaveSalida(clave)
      guardarSesion(null)
    },
    [guardarSesion]
  )

  // fetch con el token. Si el backend responde 401 (token vencido o invalido)
  // se cierra la sesion, y AuthLayout manda al usuario al login.
  const fetchAuth = useCallback(
    async (url, opciones = {}) => {
      const respuesta = await pedir(url, {
        ...opciones,
        headers: { ...opciones.headers, Authorization: `Bearer ${sesion?.token}` }
      })

      if (respuesta.status === 401) {
        logout()
      }

      return respuesta
    },
    [sesion, logout]
  )

  return (
    <AuthContext.Provider
      value={{
        nombre: sesion?.nombre ?? null,
        estaAutenticado: Boolean(sesion),
        claveSalida,
        login,
        registrar,
        logout,
        fetchAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

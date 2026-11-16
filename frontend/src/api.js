// Direccion del backend. Se define en un solo lugar para no repetirla en cada fetch.
export const API_URL = 'http://localhost:3000'

// Convierte la respuesta de error del backend en una lista de mensajes.
// El backend responde { mensaje } o { mensaje, errores: [{ msg }] }.
export function mensajesDeError(datos) {
  if (datos?.errores?.length) {
    return datos.errores.map((error) => error.msg)
  }
  return [datos?.mensaje ?? 'No se pudo completar la operación']
}

// Validaciones del lado del cliente. Repiten las reglas del backend para
// avisar al usuario antes de enviar; el backend vuelve a validar todo igual.

export const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarEmail(email) {
  if (!email.trim()) return 'El email es obligatorio'
  if (!FORMATO_EMAIL.test(email.trim())) return 'El email no es válido'
  return null
}

export function validarPasswordNueva(password) {
  if (!password) return 'La contraseña es obligatoria'
  if (password.length < 8) return 'Debe tener al menos 8 caracteres'
  if (password.length > 72) return 'No puede superar los 72 caracteres'
  if (!/[a-z]/.test(password)) return 'Debe tener al menos una minúscula'
  if (!/\d/.test(password)) return 'Debe tener al menos un número'
  return null
}

export function validarNombrePersona(nombre, campo = 'El nombre') {
  const limpio = nombre.trim()
  if (!limpio) return `${campo} es obligatorio`
  if (limpio.length < 2 || limpio.length > 50) {
    return `${campo} debe tener entre 2 y 50 caracteres`
  }
  if (!/^[\p{L} ]+$/u.test(limpio)) return `${campo} solo puede contener letras`
  return null
}

// Devuelve solo los campos con error: { email: '...', password: '...' }
export function soloErrores(errores) {
  return Object.fromEntries(
    Object.entries(errores).filter(([, mensaje]) => mensaje)
  )
}

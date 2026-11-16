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

// femenino: true para campos como 'La marca' (es obligatoria)
export function validarTexto(valor, campo, maximo, femenino = false) {
  const limpio = valor.trim()
  if (!limpio) return `${campo} es ${femenino ? 'obligatoria' : 'obligatorio'}`
  if (limpio.length > maximo) return `${campo} no puede superar los ${maximo} caracteres`
  return null
}

// Patente argentina: formato viejo AAA123 o formato Mercosur AA123AA
export function validarPatente(patente) {
  const limpia = patente.trim().toUpperCase()
  if (!limpia) return 'La patente es obligatoria'
  if (!/^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/.test(limpia)) {
    return 'La patente debe tener el formato AAA123 o AA123AA'
  }
  return null
}

export const ANIO_MAXIMO = new Date().getFullYear() + 1

export function validarAnio(anio) {
  if (anio === '') return 'El año es obligatorio'
  const numero = Number(anio)
  if (!Number.isInteger(numero) || numero < 1950 || numero > ANIO_MAXIMO) {
    return `El año debe ser un número entero entre 1950 y ${ANIO_MAXIMO}`
  }
  return null
}

export function validarNumeroPositivo(valor, campo, femenino = false, maximo = 999999.99) {
  if (valor === '') return `${campo} es ${femenino ? 'obligatoria' : 'obligatorio'}`
  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero <= 0) {
    return `${campo} debe ser un número mayor que 0`
  }
  if (numero > maximo) return `${campo} no puede superar ${maximo}`
  return null
}

// Devuelve solo los campos con error: { email: '...', password: '...' }
export function soloErrores(errores) {
  return Object.fromEntries(
    Object.entries(errores).filter(([, mensaje]) => mensaje)
  )
}

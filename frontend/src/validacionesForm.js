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

// conSignos: acepta apostrofos y guiones (apellidos como D'Angelo o Ruiz-Diaz)
export function validarNombrePersona(nombre, campo = 'El nombre', conSignos = false) {
  const limpio = nombre.trim()
  if (!limpio) return `${campo} es obligatorio`
  if (limpio.length < 2 || limpio.length > 50) {
    return `${campo} debe tener entre 2 y 50 caracteres`
  }
  const formato = conSignos ? /^[\p{L} '-]+$/u : /^[\p{L} ]+$/u
  if (!formato.test(limpio)) return `${campo} solo puede contener letras`
  return null
}

export function validarDocumento(documento) {
  const limpio = documento.trim()
  if (!limpio) return 'El documento es obligatorio'
  if (!/^\d{7,8}$/.test(limpio)) return 'El documento debe tener 7 u 8 dígitos, sin puntos'
  return null
}

export function validarLicencia(licencia) {
  const limpia = licencia.trim().toUpperCase()
  if (!limpia) return 'La licencia es obligatoria'
  if (limpia.length < 5 || limpia.length > 20) {
    return 'La licencia debe tener entre 5 y 20 caracteres'
  }
  if (!/^[A-Z0-9-]+$/.test(limpia)) {
    return 'La licencia solo puede contener letras, números y guiones'
  }
  return null
}

// El input type="date" entrega "AAAA-MM-DD", o "" si esta vacio
export function validarFecha(fecha, campo) {
  if (!fecha) return `${campo} es obligatoria`
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return `${campo} no es válida`
  return null
}

// Fecha de hoy como "AAAA-MM-DD" en hora local (toISOString usa UTC y
// despues de las 21 hs en Argentina devolveria el dia siguiente)
export function hoy() {
  const ahora = new Date()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${ahora.getFullYear()}-${mes}-${dia}`
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

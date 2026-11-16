import { body, param, query, validationResult } from 'express-validator'
import passport from 'passport'
import { db } from './db.js'

// Verifica el token con la estrategia jwt de auth.js y responde 401 en JSON
export const validarAutenticacion = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, usuario) => {
    if (error) {
      return next(error)
    }
    if (!usuario) {
      return res
        .status(401)
        .json({ mensaje: 'Token inválido, vencido o ausente' })
    }
    req.user = usuario
    next()
  })(req, res, next)
}

export const verificarValidaciones = (req, res, next) => {
  const resultado = validationResult(req)

  if (!resultado.isEmpty()) {
    return res.status(400).json({
      mensaje: 'Parametros de entrada inválidos',
      errores: resultado.array()
    })
  }
  next()
}

export const validarId = param('id')
  .isInt({ min: 1 })
  .withMessage('El id debe ser un número entero positivo')

// Patente argentina: formato viejo AAA123 o formato Mercosur AA123AA
const FORMATO_PATENTE = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/
const ANIO_MAXIMO = new Date().getFullYear() + 1

export const validarVehiculo = [
  body('marca')
    .isString()
    .withMessage('La marca es obligatoria')
    .bail()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('La marca debe tener entre 1 y 50 caracteres'),

  body('modelo')
    .isString()
    .withMessage('El modelo es obligatorio')
    .bail()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('El modelo debe tener entre 1 y 50 caracteres'),

  body('patente')
    .isString()
    .withMessage('La patente es obligatoria')
    .bail()
    .trim()
    .toUpperCase()
    .matches(FORMATO_PATENTE)
    .withMessage('La patente debe tener el formato AAA123 o AA123AA'),

  body('anio')
    .isInt({ min: 1950, max: ANIO_MAXIMO })
    .withMessage(`El año debe ser un número entero entre 1950 y ${ANIO_MAXIMO}`)
    .toInt(),

  body('capacidadCarga')
    .isFloat({ gt: 0, max: 999999.99 })
    .withMessage('La capacidad de carga debe ser un número mayor que 0')
    .toFloat()
]


const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/

// Valida una fecha YYYY-MM-DD que exista en el calendario (rechaza 2026-02-30)
const reglaFecha = (campo, nombre) =>
  body(campo)
    .isString()
    .withMessage(`La ${nombre} es obligatoria`)
    .bail()
    .matches(FORMATO_FECHA)
    .withMessage(`La ${nombre} debe tener el formato AAAA-MM-DD`)
    .bail()
    .isISO8601({ strict: true })
    .withMessage(`La ${nombre} no es una fecha válida`)

export const validarConductor = [
  body('nombre')
    .isString()
    .withMessage('El nombre es obligatorio')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .bail()
    .isAlpha('es-ES', { ignore: " '-" })
    .withMessage('El nombre solo puede contener letras'),

  body('apellido')
    .isString()
    .withMessage('El apellido es obligatorio')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .bail()
    .isAlpha('es-ES', { ignore: " '-" })
    .withMessage('El apellido solo puede contener letras'),

  body('documento')
    .exists()
    .withMessage('El documento es obligatorio')
    .bail()
    .trim()
    .matches(/^\d{7,8}$/)
    .withMessage('El documento debe tener 7 u 8 dígitos, sin puntos'),

  body('licencia')
    .isString()
    .withMessage('La licencia es obligatoria')
    .bail()
    .trim()
    .toUpperCase()
    .isLength({ min: 5, max: 20 })
    .withMessage('La licencia debe tener entre 5 y 20 caracteres')
    .bail()
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('La licencia solo puede contener letras, números y guiones'),

  reglaFecha('fechaAltaLicencia', 'fecha de alta de la licencia'),

  reglaFecha('fechaVencimientoLicencia', 'fecha de vencimiento de la licencia')
    .bail()
    .custom((vencimiento, { req }) => vencimiento > req.body.fechaAltaLicencia)
    .withMessage(
      'La fecha de vencimiento debe ser posterior a la fecha de alta de la licencia'
    )
]

const FORMATO_FECHA_HORA = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/

// Acepta "2026-10-01T06:00" (lo que manda un input datetime-local) o
// "2026-10-01 06:00:00", y lo deja siempre como "2026-10-01 06:00:00".
const normalizarFechaHora = (valor) => {
  const texto = valor.replace('T', ' ')
  return texto.length === 16 ? `${texto}:00` : texto
}

const reglaFechaHora = (campo, nombre) =>
  body(campo)
    .isString()
    .withMessage(`La ${nombre} es obligatoria`)
    .bail()
    .trim()
    .matches(FORMATO_FECHA_HORA)
    .withMessage(`La ${nombre} debe tener el formato AAAA-MM-DD HH:MM`)
    .bail()
    .customSanitizer(normalizarFechaHora)
    .isISO8601({ strict: true })
    .withMessage(`La ${nombre} no es una fecha y hora válidas`)

export const validarViaje = [
  reglaFechaHora('fechaSalida', 'fecha de salida'),

  reglaFechaHora('fechaLlegada', 'fecha de llegada')
    .bail()
    .custom((llegada, { req }) => llegada >= req.body.fechaSalida)
    .withMessage('La fecha de llegada no puede ser anterior a la de salida'),

  body('origen')
    .isString()
    .withMessage('El origen es obligatorio')
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El origen debe tener entre 2 y 100 caracteres'),

  body('destino')
    .isString()
    .withMessage('El destino es obligatorio')
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El destino debe tener entre 2 y 100 caracteres'),

  body('kilometros')
    .isFloat({ gt: 0, max: 999999.99 })
    .withMessage('Los kilómetros deben ser un número mayor que 0')
    .toFloat(),

  body('observaciones')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Las observaciones deben ser texto')
    .bail()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Las observaciones no pueden superar los 255 caracteres'),

  body('vehiculoId')
    .isInt({ min: 1 })
    .withMessage('El vehiculoId debe ser un número entero positivo')
    .bail()
    .toInt()
    .custom(async (vehiculoId) => {
      const [filas] = await db.execute('SELECT id FROM vehiculos WHERE id = ?', [
        vehiculoId
      ])
      if (filas.length === 0) {
        throw new Error('El vehículo indicado no existe')
      }
    }),

  // Va al final porque compara la licencia con la fecha de salida ya validada
  body('conductorId')
    .isInt({ min: 1 })
    .withMessage('El conductorId debe ser un número entero positivo')
    .bail()
    .toInt()
    .custom(async (conductorId, { req }) => {
      const [filas] = await db.execute(
        'SELECT fecha_alta_licencia, fecha_vencimiento_licencia FROM conductores WHERE id = ?',
        [conductorId]
      )
      if (filas.length === 0) {
        throw new Error('El conductor indicado no existe')
      }

      const diaSalida = String(req.body.fechaSalida).slice(0, 10)
      const { fecha_alta_licencia, fecha_vencimiento_licencia } = filas[0]
      if (
        diaSalida < fecha_alta_licencia ||
        diaSalida > fecha_vencimiento_licencia
      ) {
        throw new Error(
          'La licencia del conductor no está vigente en la fecha de salida'
        )
      }
    })
]

export const validarFiltrosViajes = [
  query('vehiculoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El filtro vehiculoId debe ser un número entero positivo')
    .toInt(),

  query('conductorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El filtro conductorId debe ser un número entero positivo')
    .toInt()
]

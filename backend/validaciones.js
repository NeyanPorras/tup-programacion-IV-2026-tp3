import { body, param, validationResult } from 'express-validator'
import passport from 'passport'

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


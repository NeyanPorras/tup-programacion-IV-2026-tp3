import { param, validationResult } from 'express-validator'
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


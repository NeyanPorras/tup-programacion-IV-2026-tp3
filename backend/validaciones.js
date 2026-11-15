import { param, validationResult } from 'express-validator'

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


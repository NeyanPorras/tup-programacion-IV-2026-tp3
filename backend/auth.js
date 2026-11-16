import express from 'express'
import { body } from 'express-validator'
import bcrypt from 'bcrypt'
import { db } from './db.js'
import { verificarValidaciones } from './validaciones.js'

const router = express.Router()

const reglasDeRegistro = [
  body('nombre')
    .exists()
    .withMessage('El nombre es obligatorio')
    .bail()
    .isString()
    .withMessage('El nombre debe ser texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .bail()
    .isAlpha('es-ES', { ignore: ' ' })
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('email')
    .exists()
    .withMessage('El email es obligatorio')
    .bail()
    .isString()
    .withMessage('El email debe ser texto')
    .bail()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('El email no es válido')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El email no puede superar los 100 caracteres'),

  body('password')
    .exists()
    .withMessage('La contraseña es obligatoria')
    .bail()
    .isString()
    .withMessage('La contraseña debe ser texto')
    .bail()
    .isLength({ max: 72 })
    .withMessage('La contraseña no puede superar los 72 caracteres')
    .bail()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 0,
      minNumbers: 1,
      minSymbols: 0
    })
    .withMessage(
      'La contraseña debe tener al menos 8 caracteres, una minúscula y un número'
    )
]

router.post(
  '/registro',
  reglasDeRegistro,
  verificarValidaciones,
  async (req, res) => {
    const { nombre, email, password } = req.body

    try {
      const hashedPassword = await bcrypt.hash(password, 12)

      const [resultado] = await db.execute(
        'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
        [nombre, email, hashedPassword]
      )

      res.status(201).json({
        mensaje: 'Usuario registrado con éxito',
        id: resultado.insertId,
        nombre,
        email
      })
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ mensaje: 'El email ya está registrado' })
      }
      throw error
    }
  }
)

export default router

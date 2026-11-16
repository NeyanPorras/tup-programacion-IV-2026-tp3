import express from 'express'
import { db } from './db.js'
import {
  validarAutenticacion,
  validarConductor,
  validarId,
  verificarValidaciones
} from './validaciones.js'

const router = express.Router()

const COLUMNAS =
  'id, nombre, apellido, documento, licencia, fecha_alta_licencia, fecha_vencimiento_licencia'

// Traduce una fila de la base (snake_case) a la forma de la API
const aConductor = (fila) => ({
  id: fila.id,
  nombre: fila.nombre,
  apellido: fila.apellido,
  documento: fila.documento,
  licencia: fila.licencia,
  fechaAltaLicencia: fila.fecha_alta_licencia,
  fechaVencimientoLicencia: fila.fecha_vencimiento_licencia
})

// Mensaje para documento o licencia repetidos, segun la clave unica que fallo
const mensajeDuplicado = (error) =>
  error.message.includes('uk_conductores_documento')
    ? 'Ya existe un conductor con ese documento'
    : 'Ya existe un conductor con esa licencia'

// GET para listar los conductores
router.get('/', validarAutenticacion, async (req, res) => {
  const [conductores] = await db.execute(
    `SELECT ${COLUMNAS} FROM conductores ORDER BY apellido, nombre`
  )

  res.json(conductores.map(aConductor))
})

// GET para obtener un conductor por id
router.get(
  '/:id',
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id)

    const [conductores] = await db.execute(
      `SELECT ${COLUMNAS} FROM conductores WHERE id = ?`,
      [id]
    )

    if (conductores.length === 0) {
      return res.status(404).json({ mensaje: 'Conductor no encontrado' })
    }

    res.json(aConductor(conductores[0]))
  }
)

// POST para crear un conductor
router.post(
  '/',
  validarAutenticacion,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    const {
      nombre,
      apellido,
      documento,
      licencia,
      fechaAltaLicencia,
      fechaVencimientoLicencia
    } = req.body

    try {
      const [resultado] = await db.execute(
        'INSERT INTO conductores (nombre, apellido, documento, licencia, fecha_alta_licencia, fecha_vencimiento_licencia) VALUES (?, ?, ?, ?, ?, ?)',
        [
          nombre,
          apellido,
          documento,
          licencia,
          fechaAltaLicencia,
          fechaVencimientoLicencia
        ]
      )

      res.status(201).json({
        id: resultado.insertId,
        nombre,
        apellido,
        documento,
        licencia,
        fechaAltaLicencia,
        fechaVencimientoLicencia
      })
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ mensaje: mensajeDuplicado(error) })
      }
      throw error
    }
  }
)

// PUT para modificar un conductor (reemplaza todos sus datos)
router.put(
  '/:id',
  validarAutenticacion,
  validarId,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id)
    const {
      nombre,
      apellido,
      documento,
      licencia,
      fechaAltaLicencia,
      fechaVencimientoLicencia
    } = req.body

    try {
      const [resultado] = await db.execute(
        'UPDATE conductores SET nombre = ?, apellido = ?, documento = ?, licencia = ?, fecha_alta_licencia = ?, fecha_vencimiento_licencia = ? WHERE id = ?',
        [
          nombre,
          apellido,
          documento,
          licencia,
          fechaAltaLicencia,
          fechaVencimientoLicencia,
          id
        ]
      )

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Conductor no encontrado' })
      }

      res.json({
        id,
        nombre,
        apellido,
        documento,
        licencia,
        fechaAltaLicencia,
        fechaVencimientoLicencia
      })
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ mensaje: mensajeDuplicado(error) })
      }
      throw error
    }
  }
)

// DELETE para eliminar un conductor
router.delete(
  '/:id',
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id)

    try {
      const [resultado] = await db.execute(
        'DELETE FROM conductores WHERE id = ?',
        [id]
      )

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Conductor no encontrado' })
      }

      res.json({ mensaje: 'Conductor eliminado' })
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({
          mensaje: 'No se puede eliminar el conductor porque tiene viajes registrados'
        })
      }
      throw error
    }
  }
)

export default router

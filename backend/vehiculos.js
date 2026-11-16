import express from 'express'
import { db } from './db.js'
import {
  validarAutenticacion,
  validarId,
  validarVehiculo,
  verificarValidaciones
} from './validaciones.js'
import { obtenerHistorial } from './viajes.js'

const router = express.Router()

// Traduce una fila de la base (snake_case, DECIMAL como texto) a la forma de la API
const aVehiculo = (fila) => ({
  id: fila.id,
  marca: fila.marca,
  modelo: fila.modelo,
  patente: fila.patente,
  anio: fila.anio,
  capacidadCarga: Number(fila.capacidad_carga)
})

// GET para listar los vehiculos
router.get('/', validarAutenticacion, async (req, res) => {
  const [vehiculos] = await db.execute(
    'SELECT id, marca, modelo, patente, anio, capacidad_carga FROM vehiculos ORDER BY id'
  )

  res.json(vehiculos.map(aVehiculo))
})

// GET para obtener un vehiculo por id
router.get(
  '/:id',
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id)

    const [vehiculos] = await db.execute(
      'SELECT id, marca, modelo, patente, anio, capacidad_carga FROM vehiculos WHERE id = ?',
      [id]
    )

    if (vehiculos.length === 0) {
      return res.status(404).json({ mensaje: 'Vehículo no encontrado' })
    }

    res.json(aVehiculo(vehiculos[0]))
  }
)

// GET para el historial de viajes del vehiculo y su total de kilometros
router.get(
  '/:id/viajes',
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id)

    const [vehiculos] = await db.execute(
      'SELECT id, marca, modelo, patente, anio, capacidad_carga FROM vehiculos WHERE id = ?',
      [id]
    )

    if (vehiculos.length === 0) {
      return res.status(404).json({ mensaje: 'Vehículo no encontrado' })
    }

    const historial = await obtenerHistorial('vehiculo_id', id)

    res.json({ vehiculo: aVehiculo(vehiculos[0]), ...historial })
  }
)

// POST para crear un vehiculo
router.post(
  '/',
  validarAutenticacion,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    const { marca, modelo, patente, anio, capacidadCarga } = req.body

    try {
      const [resultado] = await db.execute(
        'INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?, ?, ?, ?, ?)',
        [marca, modelo, patente, anio, capacidadCarga]
      )

      res.status(201).json({
        id: resultado.insertId,
        marca,
        modelo,
        patente,
        anio,
        capacidadCarga
      })
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res
          .status(400)
          .json({ mensaje: 'Ya existe un vehículo con esa patente' })
      }
      throw error
    }
  }
)

// PUT para modificar un vehiculo (reemplaza todos sus datos)
router.put(
  '/:id',
  validarAutenticacion,
  validarId,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id)
    const { marca, modelo, patente, anio, capacidadCarga } = req.body

    try {
      const [resultado] = await db.execute(
        'UPDATE vehiculos SET marca = ?, modelo = ?, patente = ?, anio = ?, capacidad_carga = ? WHERE id = ?',
        [marca, modelo, patente, anio, capacidadCarga, id]
      )

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Vehículo no encontrado' })
      }

      res.json({ id, marca, modelo, patente, anio, capacidadCarga })
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res
          .status(400)
          .json({ mensaje: 'Ya existe un vehículo con esa patente' })
      }
      throw error
    }
  }
)

// DELETE para eliminar un vehiculo
router.delete(
  '/:id',
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id)

    try {
      const [resultado] = await db.execute(
        'DELETE FROM vehiculos WHERE id = ?',
        [id]
      )

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Vehículo no encontrado' })
      }

      res.json({ mensaje: 'Vehículo eliminado' })
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({
          mensaje: 'No se puede eliminar el vehículo porque tiene viajes registrados'
        })
      }
      throw error
    }
  }
)

export default router

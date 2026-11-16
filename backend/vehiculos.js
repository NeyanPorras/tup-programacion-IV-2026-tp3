import express from 'express'
import { db } from './db.js'
import {
  validarAutenticacion,
  validarId,
  verificarValidaciones
} from './validaciones.js'

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

export default router

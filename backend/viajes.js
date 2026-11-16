import express from 'express'
import { matchedData } from 'express-validator'
import { db } from './db.js'
import {
  validarAutenticacion,
  validarFiltrosViajes,
  validarId,
  validarViaje,
  verificarValidaciones
} from './validaciones.js'

const router = express.Router()

const SELECCION =
  'SELECT v.id, v.fecha_salida, v.fecha_llegada, v.origen, v.destino, v.kilometros, v.observaciones, ' +
  've.id AS vehiculo_id, ve.patente, ve.marca, ve.modelo, ' +
  'c.id AS conductor_id, c.nombre, c.apellido ' +
  'FROM viajes v ' +
  'JOIN vehiculos ve ON ve.id = v.vehiculo_id ' +
  'JOIN conductores c ON c.id = v.conductor_id'

// Traduce una fila del JOIN a la forma de la API
const aViaje = (fila) => ({
  id: fila.id,
  vehiculo: {
    id: fila.vehiculo_id,
    patente: fila.patente,
    marca: fila.marca,
    modelo: fila.modelo
  },
  conductor: {
    id: fila.conductor_id,
    nombre: fila.nombre,
    apellido: fila.apellido
  },
  fechaSalida: fila.fecha_salida,
  fechaLlegada: fila.fecha_llegada,
  origen: fila.origen,
  destino: fila.destino,
  kilometros: Number(fila.kilometros),
  observaciones: fila.observaciones
})

const buscarViaje = async (id) => {
  const [viajes] = await db.execute(`${SELECCION} WHERE v.id = ?`, [id])
  return viajes[0]
}

// Historial de viajes y total de kilometros de un vehiculo o de un conductor.
// "columna" la elige el codigo (nunca el cliente): vehiculo_id o conductor_id.
export async function obtenerHistorial(columna, id) {
  const [viajes] = await db.execute(
    `${SELECCION} WHERE v.${columna} = ? ORDER BY v.fecha_salida DESC`,
    [id]
  )

  const [totales] = await db.execute(
    `SELECT COALESCE(SUM(kilometros), 0) AS total FROM viajes WHERE ${columna} = ?`,
    [id]
  )

  return {
    viajes: viajes.map(aViaje),
    totalKilometros: Number(totales[0].total)
  }
}

// GET para listar los viajes, con filtros opcionales por vehiculo y conductor
router.get(
  '/',
  validarAutenticacion,
  validarFiltrosViajes,
  verificarValidaciones,
  async (req, res) => {
    // matchedData devuelve los filtros ya convertidos a numero
    const { vehiculoId, conductorId } = matchedData(req, {
      locations: ['query']
    })

    const filtros = []
    const parametros = []

    if (vehiculoId !== undefined) {
      filtros.push('v.vehiculo_id = ?')
      parametros.push(vehiculoId)
    }
    if (conductorId !== undefined) {
      filtros.push('v.conductor_id = ?')
      parametros.push(conductorId)
    }

    let sql = SELECCION
    if (filtros.length > 0) {
      sql += ' WHERE ' + filtros.join(' AND ')
    }
    sql += ' ORDER BY v.fecha_salida DESC'

    const [viajes] = await db.execute(sql, parametros)
    res.json(viajes.map(aViaje))
  }
)

// GET para obtener un viaje por id
router.get(
  '/:id',
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const viaje = await buscarViaje(Number(req.params.id))

    if (!viaje) {
      return res.status(404).json({ mensaje: 'Viaje no encontrado' })
    }

    res.json(aViaje(viaje))
  }
)

// POST para registrar un viaje
router.post(
  '/',
  validarAutenticacion,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    const {
      vehiculoId,
      conductorId,
      fechaSalida,
      fechaLlegada,
      origen,
      destino,
      kilometros,
      observaciones
    } = req.body

    const [resultado] = await db.execute(
      'INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        vehiculoId,
        conductorId,
        fechaSalida,
        fechaLlegada,
        origen,
        destino,
        kilometros,
        observaciones || null
      ]
    )

    res.status(201).json(aViaje(await buscarViaje(resultado.insertId)))
  }
)

export default router

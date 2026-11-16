import express from 'express'
import cors from 'cors'
import { conectarDB } from './db.js'
import authRouter, { authConfig } from './auth.js'
import vehiculosRouter from './vehiculos.js'
import conductoresRouter from './conductores.js'
import viajesRouter from './viajes.js'

conectarDB()
authConfig()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/auth', authRouter)
app.use('/vehiculos', vehiculosRouter)
app.use('/conductores', conductoresRouter)
app.use('/viajes', viajesRouter)

// Ruta inexistente: responde 404 en JSON en lugar de la pagina HTML de Express
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' })
})

// Manejo de errores: Express 5 deriva aca cualquier error lanzado en una ruta,
// incluidos los de funciones async. Tiene 4 parametros: asi lo reconoce Express.
app.use((error, req, res, next) => {
  // JSON mal formado en el cuerpo del pedido (lo detecta express.json)
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo del pedido no es un JSON válido' })
  }

  // Cualquier otro error es del servidor: se registra el detalle y al cliente
  // se le responde un mensaje generico, sin datos internos
  console.error(error)
  res.status(500).json({ mensaje: 'Error interno del servidor' })
})

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`)
})

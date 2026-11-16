import express from 'express'
import cors from 'cors'
import { conectarDB } from './db.js'
import authRouter, { authConfig } from './auth.js'
import vehiculosRouter from './vehiculos.js'
import conductoresRouter from './conductores.js'

conectarDB()
authConfig()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/auth', authRouter)
app.use('/vehiculos', vehiculosRouter)
app.use('/conductores', conductoresRouter)

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`)
})

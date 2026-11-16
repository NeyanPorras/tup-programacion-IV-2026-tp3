import express from 'express'
import cors from 'cors'
import { conectarDB } from './db.js'
import authRouter from './auth.js'

conectarDB()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/auth', authRouter)

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`)
})

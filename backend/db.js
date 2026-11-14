import mysql from 'mysql2/promise'

export let db = null

export async function conectarDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      dateStrings: true, // Asegura que las fechas se devuelvan como cadenas
    })
    console.log('Conexión a la base de datos establecida')
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message)
    process.exit(1)
  }
}

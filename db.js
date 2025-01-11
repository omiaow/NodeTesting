import pg from 'pg'
import dotenv from "dotenv"

dotenv.config()

const pool = new pg.Pool({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
})

export default pool
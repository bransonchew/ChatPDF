import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'


neonConfig.fetchConnectionCache = true

function getDB() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Database URL not found!')
  }
  const sql = neon(process.env.DATABASE_URL)
  return drizzle(sql)
}

export const db = getDB()
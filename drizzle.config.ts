import * as dotenv from 'dotenv'
import type { Config } from 'drizzle-kit'

dotenv.config({ path: '.env' })


export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
import { drizzle } from 'drizzle-orm/better-sqlite3'
 
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const Database = require('better-sqlite3')

const sqlite = new Database('mi-pulperia.db')

export const db = drizzle(sqlite)

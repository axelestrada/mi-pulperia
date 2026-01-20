import { drizzle } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
 
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const Database = require('better-sqlite3')

const databasePath = app.getPath('userData') + '/mi-pulperia.db'

const sqlite = new Database(databasePath)

export const db = drizzle(sqlite)

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
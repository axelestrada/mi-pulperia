import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './index'
import path from 'node:path'
import { app, dialog } from 'electron'

export function runMigrations() {
  const migrationsPath = path.resolve(process.cwd(), 'drizzle')

  try {
    migrate(db, {
      migrationsFolder: migrationsPath,
    })
  } catch (error) {
    console.error('Error running migrations:', error)

    dialog.showErrorBox(
      'Error crítico',
      'No se pudo inicializar la base de datos'
    )

    app.quit()
  }
}

import { app, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as archiver from 'archiver'
import { createWriteStream } from 'fs'

/**
 * Gestor de backups para la aplicación
 * Crea backups completos incluyendo base de datos e imágenes
 */
export class BackupManager {
  private userDataPath: string

  constructor() {
    this.userDataPath = app.getPath('userData')
  }

  /**
   * Crea un backup completo de la aplicación
   * @param destinationPath Ruta donde guardar el backup (opcional, abre diálogo si no se proporciona)
   * @returns Ruta del archivo de backup creado
   */
  async createBackup(destinationPath?: string): Promise<string> {
    let backupPath = destinationPath

    // Si no se proporciona ruta, mostrar diálogo de guardado
    if (!backupPath) {
      const result = await dialog.showSaveDialog({
        title: 'Guardar Backup',
        defaultPath: path.join(
          app.getPath('documents'),
          `mi-pulperia-backup-${this.getDateString()}.zip`
        ),
        filters: [{ name: 'Backup', extensions: ['zip'] }],
      })

      if (result.canceled || !result.filePath) {
        throw new Error('Backup cancelado por el usuario')
      }

      backupPath = result.filePath
    }

    return this.createZipBackup(backupPath)
  }

  /**
   * Crea un backup automático en el directorio de documentos
   * @returns Ruta del archivo de backup creado
   */
  async createAutoBackup(): Promise<string> {
    const backupsDir = path.join(app.getPath('documents'), 'MiPulperiaBackups')

    // Crear directorio de backups si no existe
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }

    const backupPath = path.join(
      backupsDir,
      `backup-${this.getDateString()}.zip`
    )

    return this.createZipBackup(backupPath)
  }

  /**
   * Crea un archivo ZIP con el backup
   */
  private async createZipBackup(outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath)
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Máxima compresión
      })

      output.on('close', () => {
        console.log(`Backup creado: ${archive.pointer()} bytes`)
        resolve(outputPath)
      })

      archive.on('error', err => {
        reject(err)
      })

      archive.pipe(output)

      // Agregar base de datos
      const dbPath = path.join(this.userDataPath, 'mi-pulperia.db')
      if (fs.existsSync(dbPath)) {
        archive.file(dbPath, { name: 'mi-pulperia.db' })
      }

      // Agregar directorio de imágenes completo
      const imagesDir = path.join(this.userDataPath, 'images')
      if (fs.existsSync(imagesDir)) {
        archive.directory(imagesDir, 'images')
      }

      // Agregar archivo de metadatos
      const metadata = {
        backupDate: new Date().toISOString(),
        appVersion: app.getVersion(),
        platform: process.platform,
        databaseIncluded: fs.existsSync(dbPath),
        imagesIncluded: fs.existsSync(imagesDir),
      }

      archive.append(JSON.stringify(metadata, null, 2), {
        name: 'backup-metadata.json',
      })

      archive.finalize()
    })
  }

  /**
   * Restaura un backup desde un archivo ZIP
   * @param backupPath Ruta del archivo de backup
   * @param createBackupBeforeRestore Si es true, crea un backup antes de restaurar
   */
  async restoreBackup(
    backupPath: string,
    createBackupBeforeRestore = true
  ): Promise<void> {
    // Crear backup de seguridad antes de restaurar
    if (createBackupBeforeRestore) {
      try {
        await this.createAutoBackup()
      } catch (error) {
        console.error('Error al crear backup de seguridad:', error)
      }
    }

    // Aquí implementarías la lógica de restauración usando una librería como extract-zip
    // Por ahora dejamos la estructura básica
    throw new Error(
      'La funcionalidad de restauración requiere instalar la dependencia extract-zip'
    )
  }

  /**
   * Lista todos los backups automáticos
   */
  async listAutoBackups(): Promise<
    Array<{ path: string; date: Date; size: number }>
  > {
    const backupsDir = path.join(app.getPath('documents'), 'MiPulperiaBackups')

    if (!fs.existsSync(backupsDir)) {
      return []
    }

    const files = fs.readdirSync(backupsDir)
    const backups = files
      .filter(file => file.endsWith('.zip'))
      .map(file => {
        const filePath = path.join(backupsDir, file)
        const stats = fs.statSync(filePath)

        return {
          path: filePath,
          date: stats.mtime,
          size: stats.size,
        }
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime()) // Más recientes primero

    return backups
  }

  /**
   * Limpia backups automáticos antiguos, manteniendo solo los últimos N
   */
  async cleanOldBackups(keepLast = 10): Promise<number> {
    const backups = await this.listAutoBackups()

    if (backups.length <= keepLast) {
      return 0
    }

    const toDelete = backups.slice(keepLast)
    let deleted = 0

    for (const backup of toDelete) {
      try {
        fs.unlinkSync(backup.path)
        deleted++
      } catch (error) {
        console.error(`Error al eliminar backup ${backup.path}:`, error)
      }
    }

    return deleted
  }

  /**
   * Genera una cadena de fecha para nombres de archivo
   */
  private getDateString(): string {
    const now = new Date()
    return now
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '')
      .replace('T', '_')
  }
}

// Instancia singleton
export const backupManager = new BackupManager()

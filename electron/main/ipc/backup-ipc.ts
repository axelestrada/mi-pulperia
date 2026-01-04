import { ipcMain } from 'electron'
import { backupManager } from '../utils/backup-manager'

/**
 * Registra los handlers IPC para gestión de backups
 */
export function registerBackupIpc() {
  // Crear backup con diálogo
  ipcMain.handle('backup:create', async () => {
    try {
      const backupPath = await backupManager.createBackup()
      return { success: true, path: backupPath }
    } catch (error) {
      console.error('Error al crear backup:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  })

  // Crear backup automático
  ipcMain.handle('backup:createAuto', async () => {
    try {
      const backupPath = await backupManager.createAutoBackup()
      return { success: true, path: backupPath }
    } catch (error) {
      console.error('Error al crear backup automático:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  })

  // Listar backups automáticos
  ipcMain.handle('backup:list', async () => {
    try {
      const backups = await backupManager.listAutoBackups()
      return { success: true, backups }
    } catch (error) {
      console.error('Error al listar backups:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  })

  // Limpiar backups antiguos
  ipcMain.handle('backup:clean', async (_event, keepLast = 10) => {
    try {
      const deleted = await backupManager.cleanOldBackups(keepLast)
      return { success: true, deleted }
    } catch (error) {
      console.error('Error al limpiar backups:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  })

  // Restaurar backup
  ipcMain.handle(
    'backup:restore',
    async (_event, args: { path: string; createBackupBefore?: boolean }) => {
      try {
        await backupManager.restoreBackup(
          args.path,
          args.createBackupBefore ?? true
        )
        return { success: true }
      } catch (error) {
        console.error('Error al restaurar backup:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    }
  )
}

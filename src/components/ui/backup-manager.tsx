import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Database, Download, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Componente para gestionar backups de la aplicación
 */
export function BackupManager() {
  const [open, setOpen] = useState(false)
  const [backups, setBackups] = useState<
    Array<{ path: string; date: Date; size: number }>
  >([])
  const [loading, setLoading] = useState(false)

  const loadBackups = async () => {
    try {
      setLoading(true)
      const result = await window.api.backup.list()

      if (result.success && result.backups) {
        setBackups(result.backups)
      }
    } catch (error) {
      console.error('Error al cargar backups:', error)
      toast.error('Error al cargar backups')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    try {
      setLoading(true)
      toast.loading('Creando backup...')

      const result = await window.api.backup.create()

      if (result.success) {
        toast.success('Backup creado exitosamente')
        await loadBackups()
      } else {
        toast.error(result.error || 'Error al crear backup')
      }
    } catch (error) {
      console.error('Error al crear backup:', error)
      toast.error('Error al crear backup')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAutoBackup = async () => {
    try {
      setLoading(true)
      toast.loading('Creando backup automático...')

      const result = await window.api.backup.createAuto()

      if (result.success) {
        toast.success('Backup automático creado exitosamente')
        await loadBackups()
      } else {
        toast.error(result.error || 'Error al crear backup')
      }
    } catch (error) {
      console.error('Error al crear backup:', error)
      toast.error('Error al crear backup')
    } finally {
      setLoading(false)
    }
  }

  const handleCleanOldBackups = async () => {
    try {
      setLoading(true)
      toast.loading('Limpiando backups antiguos...')

      const result = await window.api.backup.clean(10)

      if (result.success) {
        toast.success(
          `${result.deleted || 0} backups antiguos eliminados`
        )
        await loadBackups()
      } else {
        toast.error(result.error || 'Error al limpiar backups')
      }
    } catch (error) {
      console.error('Error al limpiar backups:', error)
      toast.error('Error al limpiar backups')
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open)
        if (open) {
          loadBackups()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Database className="h-4 w-4 mr-2" />
          Backups
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestión de Backups</DialogTitle>
          <DialogDescription>
            Crea y gestiona copias de seguridad de tu base de datos e imágenes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleCreateBackup}
              disabled={loading}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Crear Backup Manual
            </Button>
            <Button
              onClick={handleCreateAutoBackup}
              variant="outline"
              disabled={loading}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Backup Automático
            </Button>
          </div>

          <div className="border rounded-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">Backups Disponibles</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCleanOldBackups}
                disabled={loading || backups.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Antiguos
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Cargando...
                </div>
              ) : backups.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No hay backups disponibles
                </div>
              ) : (
                <div className="divide-y">
                  {backups.map((backup, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {backup.path.split(/[\\/]/).pop()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(backup.date)} • {formatBytes(backup.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { ipcMain, dialog } from 'electron'
import { imageManager } from '../utils/image-manager'
import * as fs from 'fs'

/**
 * Registra los handlers IPC para gestión de imágenes
 */
export function registerImageIpc() {
  // Subir imagen desde el sistema de archivos
  ipcMain.handle(
    'images:upload',
    async (
      _event,
      args: {
        category: 'products' | 'categories'
        id?: number
      }
    ) => {
      try {
        // Mostrar diálogo para seleccionar imagen
        const result = await dialog.showOpenDialog({
          title: 'Seleccionar Imagen',
          filters: [
            {
              name: 'Imágenes',
              extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
            },
          ],
          properties: ['openFile'],
        })

        if (result.canceled || result.filePaths.length === 0) {
          return { success: false, error: 'Selección cancelada' }
        }

        const filePath = result.filePaths[0]
        const filename = await imageManager.saveImage(
          filePath,
          args.category,
          args.id
        )

        return { success: true, filename }
      } catch (error) {
        console.error('Error al subir imagen:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    }
  )

  // Guardar imagen desde base64
  ipcMain.handle(
    'images:saveBase64',
    async (
      _event,
      args: {
        base64Data: string
        category: 'products' | 'categories'
        id?: number
      }
    ) => {
      try {
        const filename = await imageManager.saveImageFromBase64(
          args.base64Data,
          args.category,
          args.id
        )

        return { success: true, filename }
      } catch (error) {
        console.error('Error al guardar imagen desde base64:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    }
  )

  // Obtener imagen como base64
  ipcMain.handle(
    'images:getBase64',
    async (
      _event,
      args: {
        filename: string
        category: 'products' | 'categories'
      }
    ) => {
      try {
        const base64 = imageManager.getImageAsBase64(
          args.filename,
          args.category
        )

        if (!base64) {
          return { success: false, error: 'Imagen no encontrada' }
        }

        return { success: true, base64 }
      } catch (error) {
        console.error('Error al obtener imagen:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    }
  )

  // Obtener ruta de la imagen
  ipcMain.handle(
    'images:getPath',
    async (
      _event,
      args: {
        filename: string
        category: 'products' | 'categories'
      }
    ) => {
      try {
        const imagePath = imageManager.getImagePath(args.filename, args.category)

        // Verificar que existe
        if (!fs.existsSync(imagePath)) {
          return { success: false, error: 'Imagen no encontrada' }
        }

        return { success: true, path: imagePath }
      } catch (error) {
        console.error('Error al obtener ruta de imagen:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    }
  )

  // Eliminar imagen
  ipcMain.handle(
    'images:delete',
    async (
      _event,
      args: {
        filename: string
        category: 'products' | 'categories'
      }
    ) => {
      try {
        const deleted = imageManager.deleteImage(args.filename, args.category)

        if (!deleted) {
          return { success: false, error: 'Imagen no encontrada' }
        }

        return { success: true }
      } catch (error) {
        console.error('Error al eliminar imagen:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    }
  )

  // Listar imágenes de una categoría
  ipcMain.handle(
    'images:list',
    async (
      _event,
      args: {
        category: 'products' | 'categories'
      }
    ) => {
      try {
        const images = imageManager.listImages(args.category)
        return { success: true, images }
      } catch (error) {
        console.error('Error al listar imágenes:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    }
  )
}

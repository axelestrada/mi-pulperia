import { app, ipcMain, net, protocol } from 'electron'
import path from 'path'
import fs from 'fs/promises'

import { createRequire } from 'module'
import { pathToFileURL } from 'url'
const require = createRequire(import.meta.url)

const sharp = require('sharp')

export const registerImagesHandlers = () => {
  ipcMain.handle('save-product-image', async (_, buffer: Buffer) => {
    const imagesDir = path.join(app.getPath('userData'), 'products')

    await fs.mkdir(imagesDir, { recursive: true })

    const filename = `product-${Date.now()}.webp`
    const filepath = path.join(imagesDir, filename)

    await sharp(buffer)
      .resize(500, 500, { fit: 'cover' })
      .webp({ quality: 100 })
      .toFile(filepath)

    return { filename }
  })

  protocol.handle('myapp', request => {
    const relativePath = request.url.replace('myapp://', '')
    const absolutePath = path.join(app.getPath('userData'), relativePath)

    return net.fetch(pathToFileURL(absolutePath).toString())
  })

  ipcMain.handle('get-product-image-path', async (_, filename: string) => {
    return path.join('products', filename)
  })

  ipcMain.handle('delete-product-image', async (_, filename: string) => {
    if (!filename) throw new Error('No se proporcionó el nombre de la imagen')

    const imagesDir = path.join(app.getPath('userData'), 'products')
    const filepath = path.join(imagesDir, filename)

    try {
      await fs.unlink(filepath)
      return { ok: true }
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err) {
        const nodeErr = err as NodeJS.ErrnoException
        if (nodeErr.code === 'ENOENT') {
          return { ok: true, warning: 'Archivo no existía' }
        }
      }
      throw err
    }
  })
}

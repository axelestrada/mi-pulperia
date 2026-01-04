import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { createHash } from 'crypto'

/**
 * Gestor de imágenes para la aplicación
 * Almacena imágenes en el directorio userData/images
 */
export class ImageManager {
  private imagesDir: string

  constructor() {
    this.imagesDir = path.join(app.getPath('userData'), 'images')
    this.ensureDirectoriesExist()
  }

  /**
   * Crea los directorios necesarios si no existen
   */
  private ensureDirectoriesExist(): void {
    const dirs = [
      this.imagesDir,
      path.join(this.imagesDir, 'products'),
      path.join(this.imagesDir, 'categories'),
      path.join(this.imagesDir, 'temp'),
    ]

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }

  /**
   * Guarda una imagen desde una ruta temporal o un buffer
   * @param sourcePath Ruta del archivo de origen
   * @param category Categoría de la imagen (products, categories, etc.)
   * @param id ID del registro asociado (opcional)
   * @returns Nombre del archivo guardado
   */
  async saveImage(
    sourcePath: string,
    category: 'products' | 'categories',
    id?: number
  ): Promise<string> {
    const buffer = fs.readFileSync(sourcePath)
    return this.saveImageFromBuffer(buffer, category, id)
  }

  /**
   * Guarda una imagen desde un buffer
   * @param buffer Buffer de la imagen
   * @param category Categoría de la imagen
   * @param id ID del registro asociado (opcional)
   * @returns Nombre del archivo guardado
   */
  async saveImageFromBuffer(
    buffer: Buffer,
    category: 'products' | 'categories',
    id?: number
  ): Promise<string> {
    // Generar nombre único usando hash del contenido
    const hash = createHash('md5').update(buffer).digest('hex')
    const ext = this.getImageExtension(buffer)
    const filename = id ? `${id}-${hash}${ext}` : `${hash}${ext}`

    const destPath = path.join(this.imagesDir, category, filename)

    // Guardar el archivo
    fs.writeFileSync(destPath, buffer)

    return filename
  }

  /**
   * Guarda una imagen desde base64
   * @param base64Data String en formato base64 (puede incluir el prefijo data:image/...)
   * @param category Categoría de la imagen
   * @param id ID del registro asociado (opcional)
   * @returns Nombre del archivo guardado
   */
  async saveImageFromBase64(
    base64Data: string,
    category: 'products' | 'categories',
    id?: number
  ): Promise<string> {
    // Remover el prefijo data:image/... si existe
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Clean, 'base64')

    return this.saveImageFromBuffer(buffer, category, id)
  }

  /**
   * Obtiene la ruta completa de una imagen
   * @param filename Nombre del archivo
   * @param category Categoría de la imagen
   * @returns Ruta completa del archivo
   */
  getImagePath(filename: string, category: 'products' | 'categories'): string {
    return path.join(this.imagesDir, category, filename)
  }

  /**
   * Verifica si una imagen existe
   * @param filename Nombre del archivo
   * @param category Categoría de la imagen
   * @returns true si existe, false en caso contrario
   */
  imageExists(filename: string, category: 'products' | 'categories'): boolean {
    const imagePath = this.getImagePath(filename, category)
    return fs.existsSync(imagePath)
  }

  /**
   * Obtiene una imagen como base64
   * @param filename Nombre del archivo
   * @param category Categoría de la imagen
   * @returns String en formato base64 con prefijo data:image
   */
  getImageAsBase64(
    filename: string,
    category: 'products' | 'categories'
  ): string | null {
    const imagePath = this.getImagePath(filename, category)

    if (!fs.existsSync(imagePath)) {
      return null
    }

    const buffer = fs.readFileSync(imagePath)
    const ext = path.extname(filename).toLowerCase()
    const mimeType = this.getMimeType(ext)

    return `data:${mimeType};base64,${buffer.toString('base64')}`
  }

  /**
   * Elimina una imagen
   * @param filename Nombre del archivo
   * @param category Categoría de la imagen
   * @returns true si se eliminó, false si no existía
   */
  deleteImage(filename: string, category: 'products' | 'categories'): boolean {
    const imagePath = this.getImagePath(filename, category)

    if (!fs.existsSync(imagePath)) {
      return false
    }

    fs.unlinkSync(imagePath)
    return true
  }

  /**
   * Detecta la extensión de la imagen desde el buffer
   */
  private getImageExtension(buffer: Buffer): string {
    // Detectar tipo de imagen por los primeros bytes (magic numbers)
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return '.jpg'
    } else if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return '.png'
    } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return '.gif'
    } else if (buffer[0] === 0x42 && buffer[1] === 0x4d && buffer[2] === 0x3e) {
      return '.bmp'
    } else if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return '.webp'
    }

    return '.jpg' // Default
  }

  /**
   * Obtiene el MIME type desde la extensión
   */
  private getMimeType(ext: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
    }

    return mimeTypes[ext.toLowerCase()] || 'image/jpeg'
  }

  /**
   * Obtiene el directorio raíz de imágenes
   */
  getImagesDirectory(): string {
    return this.imagesDir
  }

  /**
   * Lista todas las imágenes de una categoría
   */
  listImages(category: 'products' | 'categories'): string[] {
    const categoryDir = path.join(this.imagesDir, category)

    if (!fs.existsSync(categoryDir)) {
      return []
    }

    return fs.readdirSync(categoryDir).filter(file => {
      return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
    })
  }
}

// Instancia singleton
export const imageManager = new ImageManager()

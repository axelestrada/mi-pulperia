import { app } from 'electron'
import * as path from 'path'

/**
 * Obtiene las rutas principales de la aplicación
 */
export function getAppPaths() {
  const userDataPath = app.getPath('userData')
  const documentsPath = app.getPath('documents')

  return {
    // Base de datos
    database: path.join(userDataPath, 'mi-pulperia.db'),

    // Directorio raíz de userData
    userData: userDataPath,

    // Directorio de imágenes
    images: path.join(userDataPath, 'images'),
    imagesProducts: path.join(userDataPath, 'images', 'products'),
    imagesCategories: path.join(userDataPath, 'images', 'categories'),

    // Directorio de backups
    backups: path.join(documentsPath, 'MiPulperiaBackups'),
  }
}

/**
 * Imprime las rutas de la aplicación en la consola
 */
export function logAppPaths() {
  const paths = getAppPaths()

  console.log('='.repeat(60))
  console.log('📁 RUTAS DE LA APLICACIÓN')
  console.log('='.repeat(60))
  console.log('📊 Base de datos:', paths.database)
  console.log('📂 userData:', paths.userData)
  console.log('🖼️  Imágenes:', paths.images)
  console.log('   └─ Productos:', paths.imagesProducts)
  console.log('   └─ Categorías:', paths.imagesCategories)
  console.log('💾 Backups:', paths.backups)
  console.log('='.repeat(60))

  return paths
}

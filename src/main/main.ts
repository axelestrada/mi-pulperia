import { app, BrowserWindow, protocol } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

import { runMigrations } from './db/migrate'
import { registerCategoriesHandlers } from './ipc/categories-ipc'
import { registerImagesHandlers } from './ipc/images-ipc'
import { registerProductsHandlers } from 'domains/products/products-ipc'
import { registerInventoryIPC } from './domains/inventory/inventory-ipc'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null

autoUpdater.logger = log

autoUpdater.on('checking-for-update', () => {
  log.info('Buscando actualización...')
})

autoUpdater.on('update-available', info => {
  log.info('Actualización disponible', info)
})

autoUpdater.on('update-not-available', info => {
  log.info('No hay actualización', info)
})

autoUpdater.on('error', err => {
  log.error('Error en autoUpdater', err)
})

autoUpdater.on('download-progress', progress => {
  log.info(`Descargando: ${Math.round(progress.percent)}%`)
})

autoUpdater.on('update-downloaded', () => {
  log.info('Actualización descargada, reiniciando...')
  autoUpdater.quitAndInstall()
})

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(__dirname, '../../build/icons/win/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    width: 1280,
    height: 720,
    center: true,
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'axelestrada',
      repo: 'mi-pulperia',
    })

    autoUpdater.checkForUpdatesAndNotify()

    runMigrations()

    registerImagesHandlers()
    registerProductsHandlers()
    registerInventoryIPC()
    registerCategoriesHandlers()

    createWindow()
  }
})

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'myapp',
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
])

app.whenReady().then(async () => {
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'axelestrada',
    repo: 'mi-pulperia',
  })

  autoUpdater.checkForUpdatesAndNotify()

  runMigrations()

  registerImagesHandlers()
  registerProductsHandlers()
  registerInventoryIPC()
  registerCategoriesHandlers()

  createWindow()
})

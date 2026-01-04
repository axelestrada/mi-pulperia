import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { registerProductsHandlers } from './main/ipc/products-ipc'
import { runMigrations } from './main/db/migrate'
import { registerCategoriesHandlers } from './main/ipc/categories-ipc'
import { registerImageIpc } from './main/ipc/images-ipc'
import { registerBackupIpc } from './main/ipc/backup-ipc'

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

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
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
    runMigrations()
    registerProductsHandlers()
    registerCategoriesHandlers()
    registerImageIpc()
    registerBackupIpc()
    createWindow()
  }
})

app.whenReady().then(async () => {
  runMigrations()
  registerProductsHandlers()
  registerCategoriesHandlers()
  registerImageIpc()
  registerBackupIpc()
  createWindow()
})

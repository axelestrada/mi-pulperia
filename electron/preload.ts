import { contextBridge, ipcRenderer } from 'electron'

import { InsertCategory, SelectCategory } from './main/db/schema/categories'

contextBridge.exposeInMainWorld('api', {
  products: {
    list: () => ipcRenderer.invoke('products:list'),
  },
  categories: {
    list: () => ipcRenderer.invoke('categories:list'),
    create: (category: InsertCategory) =>
      ipcRenderer.invoke('categories:create', category),
    update: (id: SelectCategory['id'], category: Partial<SelectCategory>) =>
      ipcRenderer.invoke('categories:update', id, category),
    remove: (id: SelectCategory['id']) =>
      ipcRenderer.invoke('categories:remove', id),
  },
  images: {
    upload: (args: { category: 'products' | 'categories'; id?: number }) =>
      ipcRenderer.invoke('images:upload', args),
    saveBase64: (args: {
      base64Data: string
      category: 'products' | 'categories'
      id?: number
    }) => ipcRenderer.invoke('images:saveBase64', args),
    getBase64: (args: {
      filename: string
      category: 'products' | 'categories'
    }) => ipcRenderer.invoke('images:getBase64', args),
    getPath: (args: {
      filename: string
      category: 'products' | 'categories'
    }) => ipcRenderer.invoke('images:getPath', args),
    delete: (args: { filename: string; category: 'products' | 'categories' }) =>
      ipcRenderer.invoke('images:delete', args),
    list: (args: { category: 'products' | 'categories' }) =>
      ipcRenderer.invoke('images:list', args),
  },
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    createAuto: () => ipcRenderer.invoke('backup:createAuto'),
    list: () => ipcRenderer.invoke('backup:list'),
    clean: (keepLast?: number) => ipcRenderer.invoke('backup:clean', keepLast),
    restore: (args: { path: string; createBackupBefore?: boolean }) =>
      ipcRenderer.invoke('backup:restore', args),
  },
})

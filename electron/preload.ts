import { contextBridge, ipcRenderer } from 'electron'

import { InsertCategory } from './main/db/schema/categories'

contextBridge.exposeInMainWorld('api', {
  products: {
    list: () => ipcRenderer.invoke('products:list'),
  },
  categories: {
    list: () => ipcRenderer.invoke('categories:list'),
    create: (category: InsertCategory) =>
      ipcRenderer.invoke('categories:create', category),
  },
})

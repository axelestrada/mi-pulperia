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
})

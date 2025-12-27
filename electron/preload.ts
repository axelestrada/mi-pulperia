import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  products: {
    list: () => ipcRenderer.invoke('products:list'),
  },
  categories: {
    list: () => ipcRenderer.invoke('categories:list'),
  },
})

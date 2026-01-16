import { contextBridge, ipcRenderer } from 'electron'

import { InsertCategory, SelectCategory } from './db/schema/categories'
import { InsertProduct, SelectProduct } from './db/schema/products'

import {
  AddStockDTO,
  AdjustStockDTO,
  ConsumeProductDTO,
  InventoryBatchFilters,
  InventoryMovementFilters,
} from './domains/inventory/inventory-model'

contextBridge.exposeInMainWorld('api', {
  products: {
    list: () => ipcRenderer.invoke('products:list'),
    create: (product: InsertProduct) =>
      ipcRenderer.invoke('products:create', product),
    update: (id: SelectProduct['id'], product: Partial<SelectProduct>) =>
      ipcRenderer.invoke('products:update', id, product),
    remove: (id: SelectProduct['id']) =>
      ipcRenderer.invoke('products:remove', id),
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
  inventory: {
    addStock: (data: AddStockDTO) =>
      ipcRenderer.invoke('inventory:addStock', data),
    consume: (data: ConsumeProductDTO) =>
      ipcRenderer.invoke('inventory:consume', data),
    adjustStock: (data: AdjustStockDTO) =>
      ipcRenderer.invoke('inventory:adjustStock', data),
    getAvailableStock: (productId: SelectProduct['id']) =>
      ipcRenderer.invoke('inventory:getAvailableStock', productId),
    listBatches: (filters: InventoryBatchFilters) =>
      ipcRenderer.invoke('inventory:batches:list', filters),
    listMovements: (filters: InventoryMovementFilters) =>
      ipcRenderer.invoke('inventory:movements:list', filters),
  },
})

contextBridge.exposeInMainWorld('images', {
  saveProductImage: async (file: File) =>
    ipcRenderer.invoke(
      'save-product-image',
      Buffer.from(
        new Uint8Array(file.arrayBuffer ? await file.arrayBuffer() : [])
      )
    ),
  getProductImagePath: (filename: string) =>
    ipcRenderer.invoke('get-product-image-path', filename),
  deleteProductImage: (filename: string) =>
    ipcRenderer.invoke('delete-product-image', filename),
})

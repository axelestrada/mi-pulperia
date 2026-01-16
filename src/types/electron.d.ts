import { Category } from '@/features/categories/model/category-schema'

import { ProductFormData } from '@/features/products/model/product-form-schema'
import { Product } from '@/features/products/model/product-schema'

import { AddStockDTO, AdjustStockDTO, ConsumeProductDTO, InventoryBatchDTO, InventoryBatchFilters, InventoryMovementDTO, InventoryMovementFilters } from 'main/domains/inventory/inventory-model'
import { ProductDTO } from 'main/domains/products/products-model'

export {}

declare global {
  interface Window {
    api: {
      products: {
        list: () => Promise<ProductDTO[]>
        create: (product: ProductFormData) => Promise<Product>
        update: (
          id: Product['id'],
          product: Partial<Product>
        ) => Promise<Product>
        remove: (id: Product['id']) => Promise<void>
      }
      categories: {
        list: () => Promise<Category[]>
        create: (category: CategoryFormData) => Promise<Category>
        update: (
          id: Category['id'],
          category: Partial<Category>
        ) => Promise<Category>
        remove: (id: Category['id']) => Promise<void>
      }
      inventory: {
        addStock: (data: AddStockDTO) => Promise<void>
        consume: (
          data: ConsumeProductDTO
        ) => Promise<{ ok: boolean; error?: string }>
        adjustStock: (data: AdjustStockDTO) => Promise<void>
        getAvailableStock: (productId: Product['id']) => Promise<number>
        listBatches: (filters: InventoryBatchFilters) => Promise<InventoryBatchDTO[]>
        listMovements: (filters: InventoryMovementFilters) => Promise<InventoryMovementDTO[]>
      }
    }
    images: {
      saveProductImage: (file: File) => Promise<{ filename: string }>
      deleteProductImage: (filename: string) => Promise<void>
      getProductImagePath: (filename: string) => Promise<string>
    }
  }
}

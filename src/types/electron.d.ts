import { Category } from '@/features/categories/model/category-schema'

import { Product } from '@/features/products/model/product-schema'

import {
  AddStockDTO,
  AdjustStockDTO,
  ConsumeProductDTO,
  InventoryBatchDTO,
  InventoryBatchFilters,
  InventoryMovementDTO,
  InventoryMovementFilters,
} from 'main/domains/inventory/inventory-model'
import { NewProductDTO, ProductDTO } from 'main/domains/products/products-model'
import { PaginatedResult } from 'main/domains/common/pagination'
import {
  NewPresentationDTO,
  PresentationDTO,
} from '../main/domains/presentations/presentations-model'
import { PresentationsListFilters } from '../shared/types/presentations'

export {}

declare global {
  interface Window {
    api: {
      products: {
        list: () => Promise<PaginatedResult<ProductDTO>>
        create: (product: NewProductDTO) => Promise<void>
        update: (
          id: Product['id'],
          product: Partial<Product>
        ) => Promise<Product>
        remove: (id: Product['id']) => Promise<void>
      }
      presentations: {
        list: (
          filters: PresentationsListFilters
        ) => Promise<PaginatedResult<PresentationDTO>>
        listByProduct: (productId: Product['id']) => Promise<PresentationDTO[]>
        create: (presentation: NewPresentationDTO) => Promise<PresentationDTO>
        update: (
          id: PresentationDTO['id'],
          presentation: Partial<NewPresentationDTO>
        ) => Promise<PresentationDTO>
        toggle: (id: PresentationDTO['id'], isActive: boolean) => Promise<void>
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
        listBatches: (
          filters: InventoryBatchFilters
        ) => Promise<InventoryBatchDTO[]>
        listMovements: (
          filters: InventoryMovementFilters
        ) => Promise<InventoryMovementDTO[]>
      }
    }
    images: {
      saveProductImage: (file: File) => Promise<{ filename: string }>
      deleteProductImage: (filename: string) => Promise<void>
      getProductImagePath: (filename: string) => Promise<string>
    }
  }
}

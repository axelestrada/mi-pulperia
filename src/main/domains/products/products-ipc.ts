import { ipcMain } from 'electron'
import { ProductsService } from './products-service'
import { SelectProduct } from 'main/db/schema/products'
import { NewProductDTO, UpdateProductDTO } from './products-model'
import { ProductsListFilters } from './products-list-filters'

export const registerProductsHandlers = () => {
  ipcMain.handle('products:list', async (_, filters: ProductsListFilters) => {
    return ProductsService.list(filters)
  })

  ipcMain.handle('products:create', async (_, product: NewProductDTO) => {
    return ProductsService.create(product)
  })

  ipcMain.handle(
    'products:update',
    async (_, id: SelectProduct['id'], product: UpdateProductDTO) => {
      return ProductsService.update(id, product)
    }
  )

  ipcMain.handle('products:toggle', async (_, id: SelectProduct['id']) => {
    return ProductsService.toggle(id)
  })

  ipcMain.handle('products:remove', async (_, id: SelectProduct['id']) => {
    return ProductsService.remove(id)
  })
}

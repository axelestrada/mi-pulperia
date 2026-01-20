import { ipcMain } from 'electron'
import { ProductsService } from './products-service'
import { SelectProduct } from 'main/db/schema/products'
import { NewProductDTO } from './products-model'

export const registerProductsHandlers = () => {
  ipcMain.handle('products:list', async () => {
    return ProductsService.list()
  })

  ipcMain.handle('products:create', async (_, product: NewProductDTO) => {
    return ProductsService.create(product)
  })

  ipcMain.handle(
    'products:update',
    async (_, id: SelectProduct['id'], product: Partial<SelectProduct>) => {
      return ProductsService.update(id, product)
    }
  )

  ipcMain.handle('products:remove', async (_, id: SelectProduct['id']) => {
    return ProductsService.remove(id)
  })
}

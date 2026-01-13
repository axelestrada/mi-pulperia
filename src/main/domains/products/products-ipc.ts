import { ipcMain } from 'electron'
import { ProductsService } from './products-service'
import { InsertProduct, SelectProduct } from 'main/db/schema/products'

export const registerProductsHandlers = () => {
  ipcMain.handle('products:list', async () => {
    return ProductsService.list()
  })

  ipcMain.handle('products:create', async (_, product: InsertProduct) => {
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

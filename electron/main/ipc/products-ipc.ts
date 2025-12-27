import { ipcMain } from 'electron'
import { ProductsService } from '../services/products-service'

export const registerProductsHandlers = () => {
  ipcMain.handle('products:list', async () => await ProductsService.list())
}

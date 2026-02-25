import { ipcMain } from 'electron'
import { TopUpsService } from '../services/top-ups-service'

export function registerTopUpsIpc() {
  ipcMain.handle('topUps:list', async (_, filters) => {
    return TopUpsService.list(filters || {})
  })

  ipcMain.handle('topUps:getVirtualBalance', async () => {
    return TopUpsService.getVirtualBalance()
  })

  ipcMain.handle('topUps:loadBalance', async (_, payload) => {
    return TopUpsService.loadBalance(payload)
  })

  ipcMain.handle('topUps:register', async (_, payload) => {
    return TopUpsService.registerTopUp(payload)
  })

  ipcMain.handle('topUps:getSummary', async (_, payload) => {
    return TopUpsService.getSummary(payload)
  })
}

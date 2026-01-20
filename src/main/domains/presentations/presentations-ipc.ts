import { ipcMain } from 'electron'
import { PresentationsService } from './presentations-service'
import { NewPresentationDTO } from './presentations-model'
import { PresentationsListFilters } from '~/src/shared/types/presentations'

export const registerPresentationsHandlers = () => {
  ipcMain.handle('presentations:list', (_, filters: PresentationsListFilters) =>
    PresentationsService.list(filters)
  )

  ipcMain.handle('presentations:listByProduct', (_, productId: number) =>
    PresentationsService.listByProduct(productId)
  )

  ipcMain.handle('presentations:create', (_, data: NewPresentationDTO) =>
    PresentationsService.create(data)
  )

  ipcMain.handle('presentations:update', (_, id, data) =>
    PresentationsService.update(id, data)
  )

  ipcMain.handle('presentations:toggle', (_, id, isActive) =>
    PresentationsService.toggleActive(id, isActive)
  )
}

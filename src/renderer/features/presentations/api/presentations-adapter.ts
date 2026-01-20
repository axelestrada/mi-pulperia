import { PresentationsListFilters } from "shared/types/presentations"

export const presentationsAdapter = {
  list(filters: PresentationsListFilters) {
    return window.api.presentations.list(filters)
  },

  listByProduct(productId: number) {
    return window.api.presentations.listByProduct(productId)
  },

  create(payload: PresentationFormData) {
    return window.api.presentations.create(payload)
  },

  update(id: number, payload: Partial<PresentationFormData>) {
    return window.api.presentations.update(id, payload)
  },

  toggleActive(id: number, isActive: boolean) {
    return window.api.presentations.toggle(id, isActive)
  },
}

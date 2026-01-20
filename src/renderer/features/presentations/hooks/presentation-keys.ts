import { PresentationsListFilters } from "shared/types/presentations"

export const presentationKeys = {
  all: ['presentations'] as const,

  list: (filters: PresentationsListFilters) =>
    [...presentationKeys.all, 'list', filters] as const,

  byProduct: (productId: number) =>
    [...presentationKeys.all, 'product', productId] as const,
}
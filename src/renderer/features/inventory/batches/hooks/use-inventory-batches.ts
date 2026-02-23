import { keepPreviousData } from '@tanstack/react-query'

export const useInventoryBatches = (filters: InventoryBatchFilters) => {
  return useQuery({
    queryKey: inventoryKeys.batches.list(filters),
    queryFn: () => inventoryService.listBatches(filters),
    placeholderData: keepPreviousData,
  })
}
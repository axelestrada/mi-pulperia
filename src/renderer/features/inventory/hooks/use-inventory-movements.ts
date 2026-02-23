import { keepPreviousData } from '@tanstack/react-query'

export const useInventoryMovements = (filters: InventoryMovementFilters) => {
  return useQuery({
    queryKey: inventoryKeys.movements.list(filters),
    queryFn: () => inventoryService.listMovements(filters),
    placeholderData: keepPreviousData,
  })
}
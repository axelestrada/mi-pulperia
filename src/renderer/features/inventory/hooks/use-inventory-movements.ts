export const useInventoryMovements = (filters: InventoryMovementFilters) => {
  return useQuery({
    queryKey: inventoryKeys.movements.list(filters),
    queryFn: () => inventoryService.listMovements(filters),
  })
}
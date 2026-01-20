import { PresentationsListFilters } from 'shared/types/presentations'

export function usePosPresentations(filters: PresentationsListFilters) {
  return useQuery({
    queryKey: presentationKeys.list(filters),
    queryFn: () => presentationsService.list(filters),
  })
}

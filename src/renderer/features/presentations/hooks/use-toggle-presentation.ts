export function useTogglePresentation(productId: number) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      presentationsService.toggleActive(id, isActive),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: presentationKeys.byProduct(productId),
      })
      qc.invalidateQueries({
        queryKey: presentationKeys.all,
      })
    },
  })
}

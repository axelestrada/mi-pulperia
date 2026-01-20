export function useUpdatePresentation(productId: number) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PresentationFormData }) =>
      presentationsService.update(id, data),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: presentationKeys.byProduct(productId),
      })

      qc.invalidateQueries({
        queryKey: presentationKeys.all,
      })

      qc.invalidateQueries({
        queryKey: productKeys.all,
      })
    },
  })
}

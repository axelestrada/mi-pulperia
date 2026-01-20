export function useCreatePresentation(productId: number) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: PresentationFormData) =>
      presentationsService.create(data),

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

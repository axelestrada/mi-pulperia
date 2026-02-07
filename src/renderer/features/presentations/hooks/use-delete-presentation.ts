export const useDeletePresentation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => presentationsService.delete(id),

    onSuccess: (_, id) => {
      qc.invalidateQueries({
        queryKey: presentationKeys.byProduct(id),
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

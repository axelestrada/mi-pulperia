export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: Category['id']) => categoryService.remove(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      })
    },
  })
}

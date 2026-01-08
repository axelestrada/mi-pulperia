type UpdateCategoryInput = {
  id: Category['id']
  data: CategoryFormData
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateCategoryInput) =>
      categoryService.update(id, data),

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(id),
      })
    },
  })
}
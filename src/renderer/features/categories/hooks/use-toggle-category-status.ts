type ToggleInput = {
  id: Category['id']
  isActive: boolean
}

export const useToggleCategoryStatus = () => {
 const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: ToggleInput) =>
      categoryService.update(id, { isActive }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      })
    },
  })
}
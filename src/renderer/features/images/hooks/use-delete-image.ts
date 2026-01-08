export const useDeleteImage = () => {
  return useMutation({
    mutationFn: imageService.delete,
  })
}
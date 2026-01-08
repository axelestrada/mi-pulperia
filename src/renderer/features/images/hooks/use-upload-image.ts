export const useUploadImage = () => {
  return useMutation({
    mutationFn: imageService.upload,
  })
}
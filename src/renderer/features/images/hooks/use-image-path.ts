export const useImagePath = (filename?: string | null) => {
  return useQuery({
    queryKey: ['image-path', filename],
    queryFn: () => imageService.getPath(filename!),
    enabled: !!filename,
    staleTime: Infinity,
  })
}
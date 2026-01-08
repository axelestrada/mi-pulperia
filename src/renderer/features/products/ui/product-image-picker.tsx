import { useFormContext } from 'react-hook-form'

export const ProductImagePicker = () => {
  const { setValue, watch } = useFormContext<ProductFormData>()

  const { mutate: deleteImage } = useDeleteImage()
  const { mutate: uploadImage, isPending } = useUploadImage()

  const [preview, setPreview] = useState<string | null>(null)

  const imageValue = watch('image')

  const { data: imagePath } = useImagePath(imageValue)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return

    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    uploadImage(file, {
      onSuccess: ({ filename }) => {
        setValue('image', filename, {
          shouldDirty: true,
          shouldTouch: true,
        })
      },
      onError: err => {
        console.error(err)
        URL.revokeObjectURL(previewUrl)
        setPreview(null)
      },
    })
  }

  const handleDelete = () => {
    const filename = imageValue
    if (!filename) return

    deleteImage(filename, {
      onSuccess: () => {
        setValue('image', '', { shouldDirty: true, shouldTouch: true })
        setPreview(null)
      },
      onError: err => {
        console.error(err)
      },
    })
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  return (
    <div
      className="border-dashed border-2 rounded-lg p-4 text-center cursor-pointer"
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
      }}
      onClick={() => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = () => {
          if (input.files?.[0]) handleFile(input.files[0])
        }
        input.click()
      }}
    >
      {preview || imagePath ? (
        <SafeImage
          className="w-32 h-32 object-cover mx-auto rounded"
          src={preview ?? imagePath}
          alt="Imagen del producto"
        />
      ) : isPending ? (
        <p className="text-xs">Procesando…</p>
      ) : (
        <p className="text-sm opacity-70">
          Click o arrastra una imagen para subir
        </p>
      )}

      {(preview || imagePath) && (
        <Button
          className="mt-4"
          size="sm"
          variant="destructive"
          onClick={e => {
            e.stopPropagation()
            handleDelete()
          }}
        >
          <IconLucideX className="size-4" />
          Eliminar imagen
        </Button>
      )}
    </div>
  )
}

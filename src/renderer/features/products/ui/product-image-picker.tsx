import { Image, Button } from '@heroui/react'

import placeholder from '@/assets/images/placeholder.svg'

export const ProductImagePicker = () => {
  const { setValue, watch } = useFormContext<
    ProductFormData | PresentationFormData
  >()

  const { mutate: deleteImage } = useDeleteImage()
  const { mutate: uploadImage, isPending } = useUploadImage()

  const [preview, setPreview] = useState<string | null>(null)

  const imageValue = watch('image')

  const { data: imagePath = '' } = useImagePath(imageValue)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return

    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    uploadImage(file, {
      onSuccess: ({ filename }) => {
        setValue('image', filename)
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
        setValue('image', null)
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
      className="border-dashed border-2 border-default-300 rounded-lg p-4 text-center justify-center items-center flex flex-col cursor-pointer w-full hover:border-default-400 transition-colors"
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
        <Image
          className="w-32 aspect-4/3 object-contain bg-white"
          src={preview ?? imagePath ?? ''}
          fallbackSrc={placeholder}
          isBlurred
          alt="Imagen del producto"
        />
      ) : isPending ? (
        <p className="text-xs text-default-500">Procesando…</p>
      ) : (
        <p className="text-sm text-default-500">
          Click o arrastra una imagen para subir
        </p>
      )}

      {(preview || imagePath) && (
        <Button
          size="sm"
          className="mt-4"
          color="danger"
          onPress={() => {
            handleDelete()
          }}
        >
          <IconSolarTrashBinMinimalisticBoldDuotone className="size-4 text-current" />
          Eliminar imagen
        </Button>
      )}
    </div>
  )
}

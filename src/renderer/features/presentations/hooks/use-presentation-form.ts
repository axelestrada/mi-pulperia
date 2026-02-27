import { ProductDTO } from '~/src/main/domains/products/products-model'

type Params = {
  product: ProductDTO
  presentation: Presentation | null
  onSuccess: () => void
  mode: PresentationFormMode
}

export function usePresentationForm({
  product,
  presentation,
  onSuccess,
  mode,
}: Params) {
  const isEdit = Boolean(presentation)

  const form = useForm<PresentationFormInput, unknown, PresentationFormData>({
    resolver: zodResolver(presentationFormSchema),
    defaultValues: presentation
      ? presentationToForm(presentation)
      : { ...EMPTY_PRESENTATION_FORM, productId: product.id },
  })

  const { mutateAsync: createPresentation, isPending: isCreating } =
    useCreatePresentation(product.id)
  const { mutateAsync: updatePresentation, isPending: isUpdating } =
    useUpdatePresentation(product.id)

  const onSubmit = async (values: PresentationFormData) => {
    try {
      if (mode === 'edit' && presentation) {
        await updatePresentation({
          data: values,
          id: presentation.id,
        })
        toast.success('Presentación actualizada correctamente.')
      } else {
        await createPresentation({
          ...values,
          productId: product.id,
        })
        toast.success('Presentación creada correctamente.')
      }

      onSuccess()
    } catch (error) {
      console.error(error)

      toast.error('Error al guardar la presentación.', {
        description: parseError(error),
      })
    }
  }

  return {
    form,
    onSubmit,
    isEdit,
    isSubmitting: isCreating || isUpdating,
  }
}

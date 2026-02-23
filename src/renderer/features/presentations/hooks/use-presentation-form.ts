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

  const onSubmit = (values: PresentationFormData) => {
    if (mode === 'edit' && presentation) {
      updatePresentation(
        {
          data: values,
          id: presentation.id,
        },
        { onSuccess }
      )
    } else {
      createPresentation(
        {
          ...values,
          productId: product.id,
        },
        { onSuccess }
      )
    }
  }

  return {
    form,
    onSubmit,
    isEdit,
    isSubmitting: isCreating || isUpdating,
  }
}

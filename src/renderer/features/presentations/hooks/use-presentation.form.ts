type Params = {
  product: Product
  presentation?: Presentation
  onSuccess: () => void
}

export function usePresentationForm({
  product,
  presentation,
  onSuccess,
}: Params) {
  const isEdit = Boolean(presentation)

  const form = useForm<PresentationFormInput, unknown, PresentationFormData>({
    resolver: zodResolver(presentationFormSchema),
    defaultValues: presentation
      ? presentationToForm(presentation)
      : EMPTY_PRESENTATION_FORM,
  })

  const { mutateAsync: createPresentation, isPending: isCreating } =
    useCreatePresentation(product.id)
  const { mutateAsync: updatePresentation, isPending: isUpdating } =
    useUpdatePresentation(product.id)

  const onSubmit = form.handleSubmit(values => {
    if (isEdit && presentation) {
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
  })

  return {
    form,
    onSubmit,
    isEdit,
    isSubmitting: isCreating || isUpdating,
  }
}

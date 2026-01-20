type Props = {
  mode: PresentationFormMode
  product: Product
  presentation?: Presentation
  onClose: () => void
}

export function PresentationForm({
  product,
  presentation,
  onClose,
  mode,
}: Props) {
  const { form, onSubmit, isSubmitting } = usePresentationForm({
    product,
    presentation,
    onSuccess: onClose,
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <PresentationFormFields />

          <Field orientation="horizontal" className="justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting
                ? 'Guardando...'
                : mode === 'edit'
                  ? 'Actualizar'
                  : 'Guardar'}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FormProvider>
  )
}

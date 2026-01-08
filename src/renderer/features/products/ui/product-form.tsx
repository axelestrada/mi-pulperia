type Props = {
  product: Product | null
  onClose: () => void
}

export const ProductForm = ({ product, onClose }: Props) => {
  const { form, onSubmit, isEditing } = useProductForm(product, onClose)

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <ProductFormFields />

          <Field orientation="horizontal" className="justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FormProvider>
  )
}

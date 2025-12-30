type Props = {
  category: Category | null
  onClose: () => void
}

export const CategoryForm = ({ category, onClose }: Props) => {
  const { form, onSubmit, isEditing } = useCategoryForm(category, onClose)
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <CategoryFormFields />

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

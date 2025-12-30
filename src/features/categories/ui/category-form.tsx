import { toast } from 'sonner'

type Props = {
  category: Category | null
  onClose: () => void
}

export const CategoryForm = ({ category, onClose }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useCategoryForm(category)

  const onSubmit = async (data: CategoryFormInput) => {
    try {
      setIsSubmitting(true)

      const payload = categoryFormSchema.parse(data)

      await createCategory(payload)

      toast.success(
        category
          ? 'Categoría actualizada correctamente.'
          : 'Categoría creada correctamente.'
      )
      onClose()
    } catch (error) {
      toast.error('Error al guardar la categoría.')
      console.error('Error submitting category form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id="category-form">
        <FieldGroup>
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`category-form-name`}>Nombre</FieldLabel>
                <Input
                  {...field}
                  id={`category-form-name`}
                  aria-invalid={fieldState.invalid}
                  placeholder="Abarrotes"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`category-form-description`}>
                  Descripción
                </FieldLabel>
                <Textarea
                  {...field}
                  id={`category-form-description`}
                  aria-invalid={fieldState.invalid}
                  placeholder="Productos básicos de despensa"
                  autoComplete="off"
                  className="min-h-30 resize-none"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="isActive"
            render={({ field: { value, onChange, ...field }, fieldState }) => (
              <Field data-invalid={fieldState.invalid} orientation="horizontal">
                <Switch
                  {...field}
                  checked={value}
                  onCheckedChange={value => onChange(value)}
                  id={`category-form-is-active`}
                  aria-invalid={fieldState.invalid}
                />
                <FieldLabel
                  htmlFor={`category-form-is-active`}
                  className="max-w-fit"
                >
                  {value ? 'Activo' : 'Inactivo'}
                </FieldLabel>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field orientation="horizontal" className="justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            <Button type="submit" form="category-form" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}

              {isSubmitting
                ? 'Guardando...'
                : category
                ? 'Actualizar'
                : 'Guardar'}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FormProvider>
  )
}

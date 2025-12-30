export const CategoryFormFields = () => {
  const { control } = useFormContext<CategoryFormData>()

  return (
    <>
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Nombre</FieldLabel>
            <Input {...field} placeholder="Abarrotes" />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Descripción</FieldLabel>
            <Textarea
              {...field}
              placeholder="Productos básicos de despensa"
              className="min-h-30 resize-none"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <Field orientation="horizontal">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <FieldLabel>{field.value ? 'Activa' : 'Inactiva'}</FieldLabel>
          </Field>
        )}
      />
    </>
  )
}

export const ProductFormFields = () => {
  const { control } = useFormContext<ProductFormData>()

  return (
    <>
      <ProductImagePicker />

      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Nombre</FieldLabel>
            <Input {...field} placeholder="Arroz Diana 1kg" />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field: { value, ...field }, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Descripción</FieldLabel>
            <Textarea
              {...field}
              value={value ?? ''}
              placeholder="Arroz blanco de grano largo"
              className="min-h-20 resize-none"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="salePrice"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Precio de venta</FieldLabel>
              <Input
                value={field.value}
                onChange={e => {
                  field.onChange(e.target.value)
                }}
                type="number"
                min={0}
                placeholder="45"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="minStock"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Stock mínimo</FieldLabel>
              <Input
                value={field.value}
                onChange={e => {
                  field.onChange(e.target.value)
                }}
                type="number"
                min={0}
                placeholder="5"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="sku"
          control={control}
          render={({ field: { value, ...field }, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>SKU</FieldLabel>
              <Input {...field} value={value ?? ''} placeholder="ARROZ-1KG" />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="barcode"
          control={control}
          render={({ field: { value, ...field }, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Código de barras</FieldLabel>
              <Input
                {...field}
                value={value ?? ''}
                placeholder="7421234567890"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="categoryId"
          control={control}
          render={({ field, fieldState }) => (
            <CategorySelect
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error}
            />
          )}
        />

        <Controller
          name="baseUnit"
          control={control}
          render={({ field: { onChange, ...field }, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Unidad</FieldLabel>
              <Select {...field} onValueChange={onChange}>
                <SelectTrigger>
                  <SelectValue
                    aria-invalid={fieldState.invalid}
                    placeholder="Seleccione una unidad"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit">Unidad</SelectItem>
                  <SelectItem value="lb">Libra</SelectItem>
                  <SelectItem value="liter">Litro</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </>
  )
}

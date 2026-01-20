export const PresentationFormFields = () => {
  const { control, watch } = useFormContext<PresentationFormData>()

  const factorType = watch('factorType')

  return (
    <>
      <ProductImagePicker />

      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Nombre</FieldLabel>
            <Input {...field} placeholder="Docena" />
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
              placeholder="Docena de huevos de gallina"
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
              <InputGroup>
                <InputGroupAddon>L</InputGroupAddon>
                <InputGroupInput
                  {...field}
                  value={field.value}
                  onChange={e => {
                    field.onChange(e.target.value)
                  }}
                  placeholder="45"
                />
              </InputGroup>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="unit"
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

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="factorType"
          control={control}
          render={({ field: { onChange, ...field }, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Tipo de factor</FieldLabel>
              <Select {...field} onValueChange={onChange}>
                <SelectTrigger>
                  <SelectValue
                    aria-invalid={fieldState.invalid}
                    placeholder="Seleccione un tipo"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fijo</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="factor"
          control={control}
          render={({ field: { value, ...field }, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Factor</FieldLabel>
              <InputGroup>
                <InputGroupAddon>x</InputGroupAddon>
                <InputGroupInput
                  {...field}
                  value={value ?? ''}
                  placeholder="12"
                  disabled={factorType === 'variable'}
                />
              </InputGroup>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="sku"
          control={control}
          render={({ field: { value, onChange, ...field }, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>SKU</FieldLabel>
              <Input
                {...field}
                value={value ?? ''}
                onChange={e => {
                  onChange(e.target.value.toUpperCase())
                }}
                placeholder="ARROZ-1KG"
              />
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
    </>
  )
}

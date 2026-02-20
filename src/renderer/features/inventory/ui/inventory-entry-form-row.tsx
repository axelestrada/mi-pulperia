type Props = {
  index: number
  onRemove: () => void
}

export const InventoryEntryFormRow = ({ index, onRemove }: Props) => {
  const { control } = useFormContext<InventoryEntryFormData>()

  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 border rounded-lg p-4 items-start">
      <Controller
        name={`items.${index}.productId`}
        control={control}
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className="max-w-full w-full overflow-hidden"
          >
            <FieldLabel>Producto</FieldLabel>
            <ProductSelect value={field.value} onChange={field.onChange} />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name={`items.${index}.supplierId`}
        control={control}
        render={({ fieldState, field }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Proveedor</FieldLabel>
            <SupplierSelect
              value={field.value ?? undefined}
              onChange={field.onChange}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name={`items.${index}.batchCode`}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Lote</FieldLabel>
            <Input {...field} value={field.value ?? ''} placeholder="L-001" />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name={`items.${index}.quantity`}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Cantidad</FieldLabel>
            <InputGroup>
              <Input
                placeholder="0"
                inputMode="decimal"
                {...field}
                value={field.value ?? ''}
              />
            </InputGroup>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name={`items.${index}.unitCost`}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Costo Unitario</FieldLabel>
           <InputGroup>
           <InputGroupAddon>L</InputGroupAddon>
            <InputGroupInput
              placeholder="0.00"
              inputMode="numeric"
              {...field}
              value={field.value ?? ''}
            />
           </InputGroup>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name={`items.${index}.expirationDate`}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Vencimiento</FieldLabel>
            <DatePickerField onChange={field.onChange} />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="mt-auto">
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <IconLucideTrash className="size-4" />
        </Button>
      </div>
    </div>
  )
}

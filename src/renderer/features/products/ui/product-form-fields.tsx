import {
  Input,
  NumberInput,
  Textarea,
  Select,
  SelectItem,
  Tooltip,
} from '@heroui/react'

export const ProductFormFields = () => {
  const { control, watch } = useFormContext<ProductFormData>()

  const baseUnit = watch('baseUnit')

  const productsUnits = [
    {
      key: 'unit',
      label: 'Unidad',
    },
    {
      key: 'lb',
      label: 'Libra',
    },
    {
      key: 'liter',
      label: 'Litro',
    },
  ]

  return (
    <>
      <ProductImagePicker />

      <Controller
        name="name"
        control={control}
        render={({
          field: { name, value, onChange, onBlur, ref },
          fieldState: { invalid, error },
        }) => (
          <Input
            ref={ref}
            isRequired
            fullWidth
            errorMessage={error?.message}
            validationBehavior="aria"
            isInvalid={invalid}
            label="Nombre"
            labelPlacement="outside-top"
            placeholder="Coca Cola 500 ml"
            name={name}
            value={value}
            onBlur={onBlur}
            onChange={onChange}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({
          field: { name, value, onChange, onBlur, ref },
          fieldState: { invalid, error },
        }) => (
          <Textarea
            ref={ref}
            errorMessage={error?.message}
            disableAnimation
            fullWidth
            disableAutosize
            classNames={{
              input: 'min-h-[60px]',
              inputWrapper: 'py-1.5',
            }}
            validationBehavior="aria"
            isInvalid={invalid}
            label="Descripción"
            labelPlacement="outside-top"
            placeholder="Presentación individual 500 ml"
            name={name}
            value={value ?? ''}
            onBlur={onBlur}
            onChange={onChange}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-4 w-full">
        <Controller
          name="salePrice"
          control={control}
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => (
            <NumberInput
              ref={ref}
              fullWidth
              errorMessage={error?.message}
              validationBehavior="aria"
              isInvalid={invalid}
              label={
                <div className="flex gap-0.5 items-center">
                  <span>Precio</span>
                  <span className="text-danger">*</span>
                  <Tooltip
                    content="Precio de venta de la presentación base"
                    size="sm"
                    classNames={{
                      base: 'sm:max-w-[150px]',
                      content: 'text-center',
                    }}
                  >
                    <IconSolarInfoCircleLinear className="text-default-300 size-4" />
                  </Tooltip>
                </div>
              }
              labelPlacement="outside-top"
              placeholder="22"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">L</span>
                </div>
              }
              name={name}
              value={value}
              onBlur={onBlur}
              onChange={onChange}
            />
          )}
        />

        <Controller
          name="minStock"
          control={control}
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => (
            <NumberInput
              ref={ref}
              isRequired
              errorMessage={error?.message}
              fullWidth
              validationBehavior="aria"
              isInvalid={invalid}
              label="Stock mínimo"
              labelPlacement="outside-top"
              placeholder="5"
              endContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">
                    {UNIT_CONFIG[baseUnit].label}
                  </span>
                </div>
              }
              name={name}
              value={value}
              onBlur={onBlur}
              onChange={onChange}
            />
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 w-full">
        <Controller
          name="sku"
          control={control}
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => (
            <Input
              ref={ref}
              errorMessage={error?.message}
              validationBehavior="aria"
              isInvalid={invalid}
              label={
                <div className="flex gap-0.5 items-center">
                  <span>SKU</span>
                  <Tooltip
                    content="SKU de la presentación base"
                    size="sm"
                    classNames={{
                      base: 'sm:max-w-[150px]',
                      content: 'text-center',
                    }}
                  >
                    <IconSolarInfoCircleLinear className="text-default-300 size-4" />
                  </Tooltip>
                </div>
              }
              labelPlacement="outside-top"
              placeholder="COCA-500"
              fullWidth
              name={name}
              value={value ?? ''}
              onBlur={onBlur}
              onChange={onChange}
            />
          )}
        />

        <Controller
          name="barcode"
          control={control}
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => (
            <Input
              ref={ref}
              errorMessage={error?.message}
              validationBehavior="aria"
              isInvalid={invalid}
              label={
                <div className="flex gap-0.5 items-center">
                  <span>Código de barras</span>
                  <Tooltip
                    content="Código de barras de la presentación base"
                    size="sm"
                    classNames={{
                      base: 'sm:max-w-[150px]',
                      content: 'text-center',
                    }}
                  >
                    <IconSolarInfoCircleLinear className="text-default-300 size-4" />
                  </Tooltip>
                </div>
              }
              labelPlacement="outside-top"
              placeholder="0784562010652"
              name={name}
              fullWidth
              value={value ?? ''}
              onBlur={onBlur}
              onChange={onChange}
            />
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="categoryId"
          control={control}
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => (
            <CategorySelect
              ref={ref}
              errorMessage={error?.message}
              validationBehavior="aria"
              isInvalid={invalid}
              label="Categoría"
              labelPlacement="outside-top"
              placeholder="Seleccione una categoría"
              name={name}
              isRequired
              isClearable={false}
              fullWidth
              onBlur={onBlur}
              defaultSelectedKey={String(value)}
              onSelectionChange={key => onChange(Number(key) ?? undefined)}
            />
          )}
        />

        <Controller
          name="baseUnit"
          control={control}
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => (
            <Select
              ref={ref}
              errorMessage={error?.message}
              validationBehavior="aria"
              isInvalid={invalid}
              label="Unidad base"
              labelPlacement="outside-top"
              placeholder="Seleccione una unidad"
              name={name}
              isRequired
              fullWidth
              selectedKeys={[value]}
              onBlur={onBlur}
              onSelectionChange={keys => onChange(keys.currentKey)}
              disallowEmptySelection
            >
              {productsUnits.map(item => (
                <SelectItem key={item.key}>{item.label}</SelectItem>
              ))}
            </Select>
          )}
        />
      </div>
    </>
  )
}

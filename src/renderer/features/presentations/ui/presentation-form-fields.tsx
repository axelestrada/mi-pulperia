import { ProductDTO } from '~/src/main/domains/products/products-model'

import { Input, Textarea, NumberInput, Select, SelectItem } from '@heroui/react'

type Props = {
  product: ProductDTO
  mode: PresentationFormMode
}

export const PresentationFormFields = ({ product }: Props) => {
  const { control, watch, clearErrors, setValue } =
    useFormContext<PresentationFormInput>()

  const factorType = watch('factorType')

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
            placeholder="Docena"
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
            placeholder="Huevos de gallina por docena"
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
              label="Precio"
              isRequired
              labelPlacement="outside-top"
              placeholder="22"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">L</span>
                </div>
              }
              name={name}
              value={value ? Number(value) : undefined}
              onBlur={onBlur}
              onChange={onChange}
            />
          )}
        />

        <Controller
          name="unit"
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
              label="Unidad"
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

      <div className="grid grid-cols-2 gap-4 w-full">
        <Controller
          name="factorType"
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
              label="Tipo de factor"
              labelPlacement="outside-top"
              placeholder="Seleccione un tipo de factor"
              name={name}
              isRequired
              fullWidth
              selectedKeys={[value]}
              onBlur={onBlur}
              onSelectionChange={keys => {
                const value = keys.currentKey
                onChange(value)

                setValue('factor', '')

                clearErrors('factor')
              }}
              disallowEmptySelection
            >
              <SelectItem key="fixed">Fijo</SelectItem>
              <SelectItem key="variable">Variable</SelectItem>
            </Select>
          )}
        />

        <Controller
          name="factor"
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
              label="Factor"
              isRequired
              labelPlacement="outside-top"
              placeholder={factorType === 'fixed' ? '12' : 'n'}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">x</span>
                </div>
              }
              endContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">
                    {UNIT_CONFIG[product.baseUnit].label}
                  </span>
                </div>
              }
              name={name}
              value={
                factorType === 'fixed'
                  ? value
                    ? Number(value)
                    : undefined
                  : undefined
              }
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
              label="SKU"
              labelPlacement="outside-top"
              placeholder="HUEVOS-DOCE"
              fullWidth
              name={name}
              value={value}
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
              label="Código de barras"
              labelPlacement="outside-top"
              placeholder="0784562010652"
              name={name}
              fullWidth
              value={value}
              onBlur={onBlur}
              onChange={onChange}
            />
          )}
        />
      </div>
    </>
  )
}

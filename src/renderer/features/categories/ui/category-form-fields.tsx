import { Input, Textarea } from '@heroui/react'

export const CategoryFormFields = () => {
  const { control } = useFormContext<CategoryFormData>()

  return (
    <>
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
            placeholder="Abarrotes"
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
            fullWidth
            errorMessage={error?.message}
            disableAnimation
            disableAutosize
            classNames={{
              input: 'min-h-[60px]',
              inputWrapper: 'py-1.5',
            }}
            validationBehavior="aria"
            isInvalid={invalid}
            label="Descripcion"
            labelPlacement="outside-top"
            placeholder="Productos basicos de despensa"
            name={name}
            value={value ?? ''}
            onBlur={onBlur}
            onChange={onChange}
          />
        )}
      />
    </>
  )
}

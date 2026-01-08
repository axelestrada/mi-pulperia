import { type FieldError as FieldErrorType } from 'react-hook-form'

type Props = {
  value?: number
  onChange: (value: number) => void
  error?: FieldErrorType
}

export const CategorySelect = ({ value, onChange, error }: Props) => {
  const { data: categories = [], isLoading } = useCategories()

  return (
    <Field data-invalid={!!error}>
      <FieldLabel>Categoría</FieldLabel>

      <Select
        value={value?.toString() ?? ''}
        onValueChange={value => onChange(Number(value))}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue
            aria-invalid={!!error}
            placeholder="Seleccione una categoría"
          />
        </SelectTrigger>
        <SelectContent>
          {categories.map(category => (
            <SelectItem key={category.id} value={category.id.toString()}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <FieldError errors={[error]} />}
    </Field>
  )
}

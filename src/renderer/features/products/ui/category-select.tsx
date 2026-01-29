import { Autocomplete, AutocompleteItem } from '@heroui/react'

type Props = {
  value?: number
  onChange: (value: number | undefined) => void
}

export const CategorySelect = ({ value, onChange }: Props) => {
  const { data: categories = [] } = useCategories()

  const items = categories.map(category => ({
    key: category.id,
    label: category.name,
  }))

  return (
    <Autocomplete
      className="sm:max-w-64"
      defaultSelectedKey={value}
      defaultItems={items}
      placeholder="Seleccione una categoría"
      onClear={() => onChange(undefined)}
      onSelectionChange={val => {
        console.log(val)
        onChange(Number(val) ?? undefined)
      }}
    >
      {item => (
        <AutocompleteItem key={item.key} onClick={() => onChange(item.key)}>
          {item.label}
        </AutocompleteItem>
      )}
    </Autocomplete>
  )
}

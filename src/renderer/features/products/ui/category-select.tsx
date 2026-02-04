import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteProps,
} from '@heroui/react'

type Props = Pick<
  AutocompleteProps,
  | 'value'
  | 'onChange'
  | 'ref'
  | 'errorMessage'
  | 'validationBehavior'
  | 'isInvalid'
  | 'label'
  | 'labelPlacement'
  | 'placeholder'
  | 'name'
  | 'fullWidth'
  | 'onBlur'
  | 'className'
  | 'isRequired'
  | 'isClearable'
  | 'onSelectionChange'
>

export const CategorySelect = (props: Props) => {
  const { data: categories = [] } = useCategories()

  const items = categories.map(category => ({
    key: category.id,
    label: category.name,
  }))

  return (
    <Autocomplete
      {...props}
      items={items}
    >
      {item => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
    </Autocomplete>
  )
}

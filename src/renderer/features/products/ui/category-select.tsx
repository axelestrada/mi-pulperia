import {
  Autocomplete,
  AutocompleteItem,
  type AutocompleteProps,
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
  | 'selectedKey'
  | 'defaultSelectedKey'
>

export const CategorySelect = (props: Props) => {
  const { data: categoriesResult } = useCategories({
    page: 1,
    pageSize: 1000,
    status: ['active'],
  })
  const categories = categoriesResult?.data ?? []

  const items = categories.map(category => ({
    key: category.id,
    label: category.name,
  }))

  return (
    <Autocomplete {...props} defaultItems={items}>
      {item => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
    </Autocomplete>
  )
}

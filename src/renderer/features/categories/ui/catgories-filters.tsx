import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

export const CategoriesFilters = () => {
  return (
    <InputGroup>
      <InputGroupInput placeholder="Buscar por nombre o descripción..." />

      <InputGroupAddon>
        <IconLucideSearch />
      </InputGroupAddon>
    </InputGroup>
  )
}

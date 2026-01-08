export const ProductsFilters = () => {
  return (
    <>
      <InputGroup>
        <InputGroupInput placeholder="Buscar por nombre, SKU o código de barras..." />

        <InputGroupAddon>
          <IconLucideSearch />
        </InputGroupAddon>
      </InputGroup>
    </>
  )
}

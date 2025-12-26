export const ProductsHeader = () => {
  return (
    <PageHeader
      title="Productos"
      description="Gestione sus productos aquí."
      actions={
        <Button onClick={() => console.log('Nuevo producto')}>
          <IconLucidePlus /> Nuevo Producto
        </Button>
      }
    />
  )
}

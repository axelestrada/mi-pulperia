type Props = {
  onCreate: () => void
}

export const ProductsHeader = ({ onCreate }: Props) => {
  return (
    <PageHeader
      title="Productos"
      description="Gestione sus productos aquí."
      actions={
        <Button onClick={onCreate}>
          <IconLucidePlus /> Nuevo Producto
        </Button>
      }
    />
  )
}

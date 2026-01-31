import { Button } from '@heroui/react'

export const ProductsHeader = () => {
  return (
    <PageHeader
      title="Productos"
      description="Gestione sus productos aquí."
      actions={
        <Button
          startContent={<IconLucidePlus />}
          color="default"
          className="bg-foreground text-background"
        >
          Agregar Producto
        </Button>
      }
    />
  )
}

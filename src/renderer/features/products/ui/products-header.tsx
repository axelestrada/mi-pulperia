import { PageHeader } from '@/components/ui/page-header'

type Props = {
  onCreate: () => void
}

export const ProductsHeader = ({ onCreate }: Props) => {
  return (
    <PageHeader
      title="Productos"
      description="Gestione su catálogo de productos y mantenga la información siempre actualizada."
      actions={
        <Button
          onPress={onCreate}
          startContent={<IconLucidePlus />}
          color="default"
          variant="shadow"
          className="bg-foreground text-background"
        >
          Agregar Producto
        </Button>
      }
    />
  )
}

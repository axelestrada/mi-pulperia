type Props = {
  products: Product[]
  error: Error | null
  onCreate: () => void
  refetch?: () => void
  onEdit: (product: Product) => void
}

export const ProductsTable = ({ onCreate, onEdit, products, error, refetch }: Props) => {
  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon" className="text-red-500 bg-red-100">
            <IconLucideTriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Error al cargar los productos</EmptyTitle>
          <EmptyDescription>
            No se pudieron cargar los productos. Por favor, inténtalo de nuevo.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={refetch}>
            <IconLucideRefreshCw />
            Reintentar
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (products.length === 0) {
    return <ProductsEmptyState onCreate={onCreate} />
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <ProductsTableContent products={products} onEdit={onEdit} />
    </div>
  )
}

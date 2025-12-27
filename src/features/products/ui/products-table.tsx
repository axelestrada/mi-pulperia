export const ProductsTable = () => {
  const { data: products } = useProducts()

  return <div>Products Table {products?.length}</div>
}

export const ProductsTable = () => {
  const { data: products } = useProducts()

  console.log('ProductsTable render', products)

  return <div>Products Table {products?.length}</div>
}

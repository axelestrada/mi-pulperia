import { useDisclosure } from '@heroui/react'

import type { ProductDTO } from '~/src/main/domains/products/products-model'

export const ProductsPage = () => {
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure()

  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(
    null
  )

  const handleCreate = () => {
    setSelectedProduct(null)
    onOpen()
  }

  const handleEdit = (product: ProductDTO) => {
    setSelectedProduct(product)
    onOpen()
  }

  return (
    <div>
      <ProductsHeader onCreate={handleCreate} />

      <ProductsTable onEdit={handleEdit} />

      <ProductFormDialog
        onClose={onClose}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        product={selectedProduct}
      />
    </div>
  )
}

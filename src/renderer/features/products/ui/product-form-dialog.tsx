import { Modal, ModalContent } from '@heroui/react'

import { ProductDTO } from '~/src/main/domains/products/products-model'
import { ProductFormDialogContent } from './product-form-dialog-content'

type Props = {
  isOpen: boolean
  onClose: () => void
  product: ProductDTO | null
  onOpenChange: (open: boolean) => void
}

export const ProductFormDialog = ({ isOpen, product, onOpenChange }: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      className="sm:max-w-xl"
    >
      <ModalContent>
        {onClose => (
          <ProductFormDialogContent onClose={onClose} product={product} />
        )}
      </ModalContent>
    </Modal>
  )
}

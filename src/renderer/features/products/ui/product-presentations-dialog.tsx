import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import { ProductDTO } from '~/src/main/domains/products/products-model'

type Props = {
  product: ProductDTO
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductPresentationsDialog({
  product,
  isOpen,
  onOpenChange,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      className="sm:max-w-4xl"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col">
              Presentaciones de {product.name}
            </ModalHeader>
            <ModalBody>
              <PresentationsTable product={product} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

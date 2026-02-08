import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import { ProductDTO } from '~/src/main/domains/products/products-model'

type Props = {
  mode: PresentationFormMode
  product: ProductDTO
  presentation: Presentation | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function PresentationFormDialog({
  product,
  presentation,
  isOpen,
  onOpenChange,
  mode,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      className="sm:max-w-xl"
    >
      <ModalContent>
        <ModalHeader>
          {mode === 'edit' ? 'Actualizar presentación' : 'Nueva presentación'}
        </ModalHeader>

        <ModalBody>
          <PresentationForm
            product={product}
            presentation={presentation}
            mode={mode}
            onClose={() => onOpenChange(false)}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

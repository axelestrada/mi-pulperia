import { Modal, ModalContent, ModalHeader } from '@heroui/react'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
}

export const CategoryFormDialog = ({ category, open, onOpenChange }: Props) => {
  const isEdit = Boolean(category)

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader>
              {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
            </ModalHeader>

            <CategoryForm category={category} onClose={onClose} />
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

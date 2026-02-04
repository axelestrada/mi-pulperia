import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalContent,
  Button,
  Form,
} from '@heroui/react'

import { ProductDTO } from '~/src/main/domains/products/products-model'

type Props = {
  isOpen: boolean
  onClose: () => void
  product: ProductDTO | null
  onOpenChange: (open: boolean) => void
}

export const ProductFormDialog = ({
  isOpen,
  onClose,
  product,
  onOpenChange,
}: Props) => {
  const { form, isEditing, onSubmit } = useProductForm(product, onClose)

  return (
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      className="sm:max-w-xl"
    >
      <ModalContent>
        {onClose => (
          <FormProvider {...form}>
            <ModalHeader className="flex flex-col gap-1">
              {isEditing ? 'Actualizar Producto' : 'Agregar Producto'}
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={form.handleSubmit(onSubmit)}>
                <ProductForm onSubmit={onSubmit} />

                <div className="flex justify-end gap-2 w-full py-4">
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => {
                      form.reset()
                      onClose()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    color="primary"
                    variant="shadow"
                    isLoading={form.formState.isSubmitting}
                    type="submit"
                  >
                    {isEditing ? 'Actualizar' : 'Agregar'}
                  </Button>
                </div>
              </Form>
            </ModalBody>
          </FormProvider>
        )}
      </ModalContent>
    </Modal>
  )
}

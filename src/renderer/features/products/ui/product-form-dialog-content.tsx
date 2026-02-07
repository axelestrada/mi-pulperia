import { ModalBody, ModalHeader, Form, Button } from '@heroui/react'
import { ProductDTO } from '~/src/main/domains/products/products-model'

type Props = {
  onClose: () => void
  product: ProductDTO | null
}

export const ProductFormDialogContent = ({ onClose, product }: Props) => {
  const { form, isEditing, onSubmit } = useProductForm(product, () => {
    form.reset()
    onClose()
  })

  return (
    <FormProvider {...form}>
      <ModalHeader className="flex flex-col gap-1">
        {isEditing ? 'Actualizar Producto' : 'Agregar Producto'}
      </ModalHeader>
      <ModalBody>
        <Form
          onSubmit={() => {
            console.log(form)
            form.handleSubmit(onSubmit)()
          }}
        >
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
  )
}

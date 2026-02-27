import { Button, Form, ModalBody } from '@heroui/react'

type Props = {
  category: Category | null
  onClose: () => void
}

export const CategoryForm = ({ category, onClose }: Props) => {
  const { form, onSubmit, isEditing } = useCategoryForm(category, onClose)

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  return (
    <FormProvider {...form}>
      <Form
        className="w-full h-auto"
        onSubmit={event => {
          event.preventDefault()
          handleSubmit(onSubmit)()
        }}
      >
        <ModalBody className="gap-4 w-full">
          <CategoryFormFields />

          <div className="flex w-full justify-end gap-2">
            <Button
              color="danger"
              variant="light"
              type="button"
              onPress={onClose}
            >
              Cancelar
            </Button>

            <Button
              color="primary"
              variant="shadow"
              type="submit"
              isLoading={isSubmitting}
            >
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </ModalBody>
      </Form>
    </FormProvider>
  )
}


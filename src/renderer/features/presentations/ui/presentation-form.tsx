import { ProductDTO } from '~/src/main/domains/products/products-model'
import { Form, Button } from '@heroui/react'

type Props = {
  mode: PresentationFormMode
  product: ProductDTO
  presentation: Presentation | null
  onClose: () => void
}

export function PresentationForm({
  product,
  presentation,
  onClose,
  mode,
}: Props) {
  const { form, onSubmit, isSubmitting } = usePresentationForm({
    product,
    presentation,
    onSuccess: onClose,
    mode,
  })

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={e => {
          e.preventDefault()
          form.handleSubmit(onSubmit)()
        }}
      >
        <PresentationFormFields product={product} mode={mode} />

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
            isLoading={isSubmitting}
            type="submit"
          >
            {mode === 'edit' ? 'Actualizar' : 'Agregar'}
          </Button>
        </div>
      </Form>
    </FormProvider>
  )
}

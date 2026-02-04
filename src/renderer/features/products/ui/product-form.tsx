import { Form, Button } from '@heroui/react'

type Props = {
  onSubmit: (data: ProductFormData) => Promise<void>
}

export const ProductForm = ({ onSubmit }: Props) => {
  const form = useFormContext<ProductFormInput, unknown, ProductFormData>()

  const { handleSubmit } = form

  return <ProductFormFields />
}

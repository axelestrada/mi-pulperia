import {
  Button,
  Card,
  CardBody,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
  Textarea,
} from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateSupplier, useUpdateSupplier } from '../hooks/use-suppliers'

const supplierFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  companyName: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  paymentTerms: z
    .number()
    .min(0, 'Los terminos de pago deben ser positivos')
    .default(30),
  creditLimit: z
    .number()
    .min(0, 'El limite de credito debe ser positivo')
    .default(0),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
})

type SupplierFormInput = z.input<typeof supplierFormSchema>
type SupplierFormData = z.infer<typeof supplierFormSchema>

interface SupplierFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier
}

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
}: SupplierFormDialogProps) {
  const isEdit = !!supplier
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()

  const form = useForm<SupplierFormInput, unknown, SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: '',
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      taxId: '',
      paymentTerms: 30,
      creditLimit: 0,
      bankName: '',
      bankAccount: '',
      notes: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (supplier && open) {
      form.reset({
        name: supplier.name,
        companyName: supplier.companyName || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        country: supplier.country || '',
        taxId: supplier.taxId || '',
        paymentTerms: supplier.paymentTerms,
        creditLimit: supplier.creditLimit / 100,
        bankName: supplier.bankName || '',
        bankAccount: supplier.bankAccount || '',
        notes: supplier.notes || '',
        isActive: supplier.isActive,
      })
      return
    }

    if (!supplier && open) {
      form.reset({
        name: '',
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        taxId: '',
        paymentTerms: 30,
        creditLimit: 0,
        bankName: '',
        bankAccount: '',
        notes: '',
        isActive: true,
      })
    }
  }, [supplier, open, form])

  const onSubmit = (data: SupplierFormData) => {
    const formattedData = {
      ...data,
      creditLimit: Math.round(data.creditLimit * 100),
    }

    if (isEdit && supplier) {
      updateSupplier.mutate(
        { id: supplier.id, data: formattedData },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
      return
    }

    createSupplier.mutate(formattedData, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  const isPending = createSupplier.isPending || updateSupplier.isPending

  return (
    <Modal
      isOpen={open}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="outside"
    >
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2>{isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <p className="text-small font-normal text-default-500">
                {isEdit
                  ? 'Modifica la informacion del proveedor.'
                  : 'Completa la informacion para crear un nuevo proveedor.'}
              </p>
            </ModalHeader>

            <Form
              className="h-auto w-full"
              onSubmit={event => {
                event.preventDefault()
                form.handleSubmit(onSubmit)()
              }}
            >
              <ModalBody className="w-full gap-4">
                <Card>
                  <CardBody className="gap-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Controller
                        control={form.control}
                        name="name"
                        render={({
                          field: { value, onChange, onBlur, name, ref },
                          fieldState: { invalid, error },
                        }) => (
                          <Input
                            ref={ref}
                            isRequired
                            name={name}
                            label="Nombre"
                            labelPlacement="outside"
                            placeholder="Nombre del proveedor"
                            value={value}
                            onValueChange={onChange}
                            onBlur={onBlur}
                            isInvalid={invalid}
                            errorMessage={error?.message}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="companyName"
                        render={({
                          field: { value, onChange, onBlur, name, ref },
                        }) => (
                          <Input
                            ref={ref}
                            name={name}
                            label="Nombre de la empresa"
                            labelPlacement="outside"
                            placeholder="Empresa S.A."
                            value={value || ''}
                            onValueChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="contactPerson"
                        render={({
                          field: { value, onChange, onBlur, name, ref },
                        }) => (
                          <Input
                            ref={ref}
                            name={name}
                            label="Persona de contacto"
                            labelPlacement="outside"
                            placeholder="Juan Perez"
                            value={value || ''}
                            onValueChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="email"
                        render={({
                          field: { value, onChange, onBlur, name, ref },
                          fieldState: { invalid, error },
                        }) => (
                          <Input
                            ref={ref}
                            type="email"
                            name={name}
                            label="Email"
                            labelPlacement="outside"
                            placeholder="proveedor@empresa.com"
                            value={value || ''}
                            onValueChange={onChange}
                            onBlur={onBlur}
                            isInvalid={invalid}
                            errorMessage={error?.message}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="phone"
                        render={({
                          field: { value, onChange, onBlur, name, ref },
                        }) => (
                          <Input
                            ref={ref}
                            name={name}
                            label="Telefono"
                            labelPlacement="outside"
                            placeholder="8888-8888"
                            value={value || ''}
                            onValueChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="taxId"
                        render={({
                          field: { value, onChange, onBlur, name, ref },
                        }) => (
                          <Input
                            ref={ref}
                            name={name}
                            label="RUC/Cedula"
                            labelPlacement="outside"
                            placeholder="281-010180-1001K"
                            value={value || ''}
                            onValueChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="city"
                        render={({
                          field: { value, onChange, onBlur, name, ref },
                        }) => (
                          <Input
                            ref={ref}
                            name={name}
                            label="Ciudad"
                            labelPlacement="outside"
                            placeholder="Managua"
                            value={value || ''}
                            onValueChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="country"
                        render={({
                          field: { value, onChange, onBlur, name, ref },
                        }) => (
                          <Input
                            ref={ref}
                            name={name}
                            label="Pais"
                            labelPlacement="outside"
                            placeholder="Nicaragua"
                            value={value || ''}
                            onValueChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="paymentTerms"
                        render={({
                          field: { value, onChange, onBlur, name, ref },
                          fieldState: { invalid, error },
                        }) => (
                          <Input
                            ref={ref}
                            type="number"
                            name={name}
                            label="Terminos de pago (dias)"
                            labelPlacement="outside"
                            min={0}
                            value={String(value ?? 0)}
                            onValueChange={nextValue => {
                              onChange(parseInt(nextValue, 10) || 0)
                            }}
                            onBlur={onBlur}
                            isInvalid={invalid}
                            errorMessage={error?.message}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="creditLimit"
                        render={({
                          field: { value, onChange, onBlur, name, ref },
                          fieldState: { invalid, error },
                        }) => (
                          <Input
                            ref={ref}
                            type="number"
                            name={name}
                            label="Limite de credito (L)"
                            labelPlacement="outside"
                            min={0}
                            step={0.01}
                            value={String(value ?? 0)}
                            onValueChange={nextValue => {
                              onChange(parseFloat(nextValue) || 0)
                            }}
                            onBlur={onBlur}
                            isInvalid={invalid}
                            errorMessage={error?.message}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="bankName"
                        render={({
                          field: { value, onChange, onBlur, name, ref },
                        }) => (
                          <Input
                            ref={ref}
                            name={name}
                            label="Banco"
                            labelPlacement="outside"
                            placeholder="BAC"
                            value={value || ''}
                            onValueChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="bankAccount"
                        render={({
                          field: { value, onChange, onBlur, name, ref },
                        }) => (
                          <Input
                            ref={ref}
                            name={name}
                            label="Numero de cuenta"
                            labelPlacement="outside"
                            placeholder="123456789"
                            value={value || ''}
                            onValueChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />
                    </div>

                    <Controller
                      control={form.control}
                      name="address"
                      render={({
                        field: { value, onChange, onBlur, name, ref },
                      }) => (
                        <Input
                          ref={ref}
                          name={name}
                          label="Direccion"
                          labelPlacement="outside"
                          placeholder="Direccion completa"
                          value={value || ''}
                          onValueChange={onChange}
                          onBlur={onBlur}
                        />
                      )}
                    />

                    <Controller
                      control={form.control}
                      name="notes"
                      render={({
                        field: { value, onChange, onBlur, name, ref },
                      }) => (
                        <Textarea
                          ref={ref}
                          name={name}
                          label="Notas"
                          labelPlacement="outside"
                          placeholder="Notas adicionales sobre el proveedor"
                          value={value || ''}
                          onValueChange={onChange}
                          onBlur={onBlur}
                          minRows={3}
                        />
                      )}
                    />

                    <div className="flex items-center justify-between rounded-large border border-default-200 px-4 py-3">
                      <div>
                        <p className="font-medium">Estado activo</p>
                        <p className="text-sm text-default-500">
                          Determina si el proveedor esta disponible para nuevas
                          ordenes
                        </p>
                      </div>
                      <Controller
                        control={form.control}
                        name="isActive"
                        render={({ field: { value, onChange } }) => (
                          <Switch isSelected={value} onValueChange={onChange} />
                        )}
                      />
                    </div>
                  </CardBody>
                </Card>
              </ModalBody>

              <ModalFooter className="w-full">
                <Button
                  type="button"
                  variant="light"
                  onPress={() => {
                    onClose()
                    onOpenChange(false)
                  }}
                  isDisabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" color="primary" isLoading={isPending}>
                  {isPending ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
                </Button>
              </ModalFooter>
            </Form>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}


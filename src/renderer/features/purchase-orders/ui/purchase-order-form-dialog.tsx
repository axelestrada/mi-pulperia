import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calculator, Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useActiveSuppliers } from '../../suppliers/hooks/use-suppliers'
import {
  useCreatePurchaseOrder,
  useGenerateOrderNumber,
  useUpdatePurchaseOrder,
} from '../hooks/use-purchase-orders'

const purchaseOrderItemSchema = z.object({
  productId: z.number().min(0),
  productName: z.string().min(1, 'Nombre del producto requerido'),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  unitCost: z.number().min(0, 'El costo unitario debe ser positivo'),
  totalCost: z.number().min(0),
  notes: z.string().optional(),
})

const purchaseOrderFormSchema = z.object({
  orderNumber: z.string().min(1, 'El numero de orden es requerido'),
  supplierId: z.number().min(1, 'Seleccione un proveedor'),
  status: z
    .enum(['draft', 'sent', 'partial', 'completed', 'cancelled'])
    .default('draft'),
  expectedDeliveryDate: z.string().optional(),
  items: z
    .array(purchaseOrderItemSchema)
    .min(1, 'Debe agregar al menos un producto'),
  subtotal: z.number().default(0),
  taxAmount: z.number().default(0),
  discountAmount: z.number().default(0),
  shippingAmount: z.number().default(0),
  total: z.number().default(0),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
})

type PurchaseOrderFormInput = z.input<typeof purchaseOrderFormSchema>
type PurchaseOrderFormValues = z.output<typeof purchaseOrderFormSchema>

interface PurchaseOrderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrder?: PurchaseOrder & { items?: PurchaseOrderItem[] }
}

const getCurrentSelectionKey = (keys: 'all' | Set<React.Key>) => {
  if (keys === 'all') return null
  return (keys.values().next().value as string | undefined) ?? null
}

export function PurchaseOrderFormDialog({
  open,
  onOpenChange,
  purchaseOrder,
}: PurchaseOrderFormDialogProps) {
  const isEdit = !!purchaseOrder
  const taxRate = 15

  const { data: suppliers = [] } = useActiveSuppliers()
  const { data: orderNumber } = useGenerateOrderNumber()
  const createPurchaseOrder = useCreatePurchaseOrder()
  const updatePurchaseOrder = useUpdatePurchaseOrder()

  const form = useForm<PurchaseOrderFormInput, unknown, PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      orderNumber: '',
      supplierId: 0,
      status: 'draft',
      expectedDeliveryDate: '',
      items: [
        {
          productId: 0,
          productName: '',
          quantity: 1,
          unitCost: 0,
          totalCost: 0,
          notes: '',
        },
      ],
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      shippingAmount: 0,
      total: 0,
      notes: '',
      internalNotes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const watchedItems = form.watch('items')
  const watchedDiscount = form.watch('discountAmount')
  const watchedShipping = form.watch('shippingAmount')

  useEffect(() => {
    const subtotal = watchedItems.reduce((sum, item, index) => {
      const itemTotal = (item.quantity || 0) * (item.unitCost || 0)
      form.setValue(`items.${index}.totalCost`, itemTotal)
      return sum + itemTotal
    }, 0)

    const discountAmount = watchedDiscount || 0
    const shippingAmount = watchedShipping || 0
    const taxableAmount = subtotal - discountAmount
    const taxAmount = (taxableAmount * taxRate) / 100
    const total = subtotal + taxAmount + shippingAmount - discountAmount

    form.setValue('subtotal', subtotal)
    form.setValue('taxAmount', taxAmount)
    form.setValue('total', total)
  }, [watchedItems, watchedDiscount, watchedShipping, taxRate, form])

  useEffect(() => {
    if (open && !isEdit && orderNumber) {
      form.setValue('orderNumber', orderNumber)
    }
  }, [open, isEdit, orderNumber, form])

  useEffect(() => {
    if (purchaseOrder && open) {
      const deliveryDate = purchaseOrder.expectedDeliveryDate
        ? new Date(purchaseOrder.expectedDeliveryDate).toISOString().split('T')[0]
        : ''

      form.reset({
        orderNumber: purchaseOrder.orderNumber,
        supplierId: purchaseOrder.supplierId,
        status: purchaseOrder.status,
        expectedDeliveryDate: deliveryDate,
        items: purchaseOrder.items?.map(item => ({
          productId: item.productId || 0,
          productName: item.productName || '',
          quantity: item.quantity,
          unitCost: item.unitCost / 100,
          totalCost: (item.quantity * item.unitCost) / 100,
          notes: item.notes || '',
        })) || [
          {
            productId: 0,
            productName: '',
            quantity: 1,
            unitCost: 0,
            totalCost: 0,
            notes: '',
          },
        ],
        subtotal: purchaseOrder.subtotal / 100,
        taxAmount: purchaseOrder.taxAmount / 100,
        discountAmount: purchaseOrder.discountAmount / 100,
        shippingAmount: purchaseOrder.shippingAmount / 100,
        total: purchaseOrder.total / 100,
        notes: purchaseOrder.notes || '',
        internalNotes: purchaseOrder.internalNotes || '',
      })
      return
    }

    if (!purchaseOrder && open) {
      form.reset({
        orderNumber: orderNumber || '',
        supplierId: 0,
        status: 'draft',
        expectedDeliveryDate: '',
        items: [
          {
            productId: 0,
            productName: '',
            quantity: 1,
            unitCost: 0,
            totalCost: 0,
            notes: '',
          },
        ],
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        shippingAmount: 0,
        total: 0,
        notes: '',
        internalNotes: '',
      })
    }
  }, [purchaseOrder, open, form, orderNumber])

  const addItem = () => {
    append({
      productId: 0,
      productName: '',
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
      notes: '',
    })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const onSubmit = (data: PurchaseOrderFormValues) => {
    const formattedData: PurchaseOrderFormData = {
      ...data,
      items: data.items.map(item => ({
        ...item,
        unitCost: Math.round(item.unitCost * 100),
        totalCost: Math.round(item.totalCost * 100),
      })),
      subtotal: Math.round(data.subtotal * 100),
      taxAmount: Math.round(data.taxAmount * 100),
      discountAmount: Math.round(data.discountAmount * 100),
      shippingAmount: Math.round(data.shippingAmount * 100),
      total: Math.round(data.total * 100),
      expectedDeliveryDate: data.expectedDeliveryDate
        ? new Date(data.expectedDeliveryDate)
        : undefined,
    }

    if (isEdit && purchaseOrder) {
      updatePurchaseOrder.mutate(
        { id: purchaseOrder.id, data: formattedData },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
      return
    }

    createPurchaseOrder.mutate(formattedData, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  const isPending = createPurchaseOrder.isPending || updatePurchaseOrder.isPending

  return (
    <Modal
      isOpen={open}
      onOpenChange={onOpenChange}
      size="5xl"
      scrollBehavior="outside"
    >
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2>{isEdit ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}</h2>
              <p className="text-small font-normal text-default-500">
                {isEdit
                  ? 'Modifica la lista de compra para el proveedor.'
                  : 'Crea una lista de compra por proveedor para el siguiente turno.'}
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
                  <CardHeader>
                    <h3 className="font-semibold">Informacion Basica</h3>
                  </CardHeader>
                  <CardBody className="gap-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Controller
                        control={form.control}
                        name="orderNumber"
                        render={({
                          field: { name, value, onChange, onBlur, ref },
                          fieldState: { invalid, error },
                        }) => (
                          <Input
                            ref={ref}
                            isRequired
                            name={name}
                            label="Numero de Orden"
                            labelPlacement="outside"
                            placeholder="PO-001"
                            value={value}
                            onBlur={onBlur}
                            onValueChange={onChange}
                            isInvalid={invalid}
                            errorMessage={error?.message}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="supplierId"
                        render={({
                          field: { value, onChange },
                          fieldState: { invalid, error },
                        }) => (
                          <Select
                            isRequired
                            label="Proveedor"
                            labelPlacement="outside"
                            placeholder="Seleccionar proveedor"
                            selectedKeys={value ? [String(value)] : []}
                            onSelectionChange={keys => {
                              const key = getCurrentSelectionKey(keys)
                              onChange(key ? parseInt(key, 10) : 0)
                            }}
                            isInvalid={invalid}
                            errorMessage={error?.message}
                          >
                            {suppliers.map(supplier => (
                              <SelectItem key={supplier.id.toString()}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="expectedDeliveryDate"
                        render={({
                          field: { name, value, onChange, onBlur, ref },
                          fieldState: { invalid, error },
                        }) => (
                          <Input
                            ref={ref}
                            type="date"
                            name={name}
                            label="Fecha de Entrega Esperada"
                            labelPlacement="outside"
                            value={value || ''}
                            onBlur={onBlur}
                            onValueChange={onChange}
                            isInvalid={invalid}
                            errorMessage={error?.message}
                          />
                        )}
                      />
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <h3 className="font-semibold">Productos</h3>
                    <Button
                      type="button"
                      variant="bordered"
                      size="sm"
                      startContent={<Plus className="h-4 w-4" />}
                      onPress={addItem}
                    >
                      Agregar Producto
                    </Button>
                  </CardHeader>
                  <CardBody className="gap-4">
                    {fields.map((itemField, index) => (
                      <Card key={itemField.id} className="border border-default-100">
                        <CardBody className="gap-4">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-4">
                              <Controller
                                control={form.control}
                                name={`items.${index}.productName`}
                                render={({
                                  field: { name, value, onChange, onBlur, ref },
                                  fieldState: { invalid, error },
                                }) => (
                                  <Input
                                    ref={ref}
                                    isRequired
                                    name={name}
                                    label="Producto"
                                    labelPlacement="outside"
                                    placeholder="Nombre del producto"
                                    value={value}
                                    onBlur={onBlur}
                                    onValueChange={onChange}
                                    isInvalid={invalid}
                                    errorMessage={error?.message}
                                  />
                                )}
                              />
                            </div>

                            <div className="col-span-4 md:col-span-2">
                              <Controller
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({
                                  field: { name, value, onChange, onBlur, ref },
                                  fieldState: { invalid, error },
                                }) => (
                                  <Input
                                    ref={ref}
                                    isRequired
                                    type="number"
                                    min={1}
                                    name={name}
                                    label="Cantidad"
                                    labelPlacement="outside"
                                    value={String(value ?? 1)}
                                    onBlur={onBlur}
                                    onValueChange={nextValue => {
                                      onChange(parseInt(nextValue, 10) || 1)
                                    }}
                                    isInvalid={invalid}
                                    errorMessage={error?.message}
                                  />
                                )}
                              />
                            </div>

                            <div className="col-span-4 md:col-span-2">
                              <Controller
                                control={form.control}
                                name={`items.${index}.unitCost`}
                                render={({
                                  field: { name, value, onChange, onBlur, ref },
                                  fieldState: { invalid, error },
                                }) => (
                                  <Input
                                    ref={ref}
                                    isRequired
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    name={name}
                                    label="Costo Unitario"
                                    labelPlacement="outside"
                                    value={String(value ?? 0)}
                                    onBlur={onBlur}
                                    onValueChange={nextValue => {
                                      onChange(parseFloat(nextValue) || 0)
                                    }}
                                    isInvalid={invalid}
                                    errorMessage={error?.message}
                                  />
                                )}
                              />
                            </div>

                            <div className="col-span-3 md:col-span-2">
                              <Controller
                                control={form.control}
                                name={`items.${index}.totalCost`}
                                render={({ field: { name, value, ref } }) => (
                                  <Input
                                    ref={ref}
                                    type="number"
                                    step={0.01}
                                    name={name}
                                    label="Total"
                                    labelPlacement="outside"
                                    value={String(value ?? 0)}
                                    isReadOnly
                                  />
                                )}
                              />
                            </div>

                            <div className="col-span-1 flex items-end justify-end">
                              <Button
                                type="button"
                                variant="light"
                                color="danger"
                                isIconOnly
                                onPress={() => removeItem(index)}
                                isDisabled={fields.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="col-span-12">
                              <Controller
                                control={form.control}
                                name={`items.${index}.notes`}
                                render={({
                                  field: { name, value, onChange, onBlur, ref },
                                }) => (
                                  <Input
                                    ref={ref}
                                    name={name}
                                    label="Notas"
                                    labelPlacement="outside"
                                    placeholder="Notas del producto (opcional)"
                                    value={value || ''}
                                    onBlur={onBlur}
                                    onValueChange={onChange}
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Calculator className="h-5 w-5" />
                      Totales
                    </h3>
                  </CardHeader>
                  <CardBody className="gap-4">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-default-500">Subtotal</p>
                        <p className="text-2xl font-bold">
                          L {(form.watch('subtotal') || 0).toFixed(2)}
                        </p>
                      </div>

                      <Controller
                        control={form.control}
                        name="discountAmount"
                        render={({
                          field: { name, value, onChange, onBlur, ref },
                          fieldState: { invalid, error },
                        }) => (
                          <Input
                            ref={ref}
                            type="number"
                            min={0}
                            step={0.01}
                            name={name}
                            label="Descuento"
                            labelPlacement="outside"
                            value={String(value ?? 0)}
                            onBlur={onBlur}
                            onValueChange={nextValue => {
                              onChange(parseFloat(nextValue) || 0)
                            }}
                            isInvalid={invalid}
                            errorMessage={error?.message}
                          />
                        )}
                      />

                      <div>
                        <p className="text-sm text-default-500">Impuesto ({taxRate}%)</p>
                        <p className="text-lg font-semibold">
                          L {(form.watch('taxAmount') || 0).toFixed(2)}
                        </p>
                      </div>

                      <Controller
                        control={form.control}
                        name="shippingAmount"
                        render={({
                          field: { name, value, onChange, onBlur, ref },
                          fieldState: { invalid, error },
                        }) => (
                          <Input
                            ref={ref}
                            type="number"
                            min={0}
                            step={0.01}
                            name={name}
                            label="Envio"
                            labelPlacement="outside"
                            value={String(value ?? 0)}
                            onBlur={onBlur}
                            onValueChange={nextValue => {
                              onChange(parseFloat(nextValue) || 0)
                            }}
                            isInvalid={invalid}
                            errorMessage={error?.message}
                          />
                        )}
                      />
                    </div>

                    <Divider />

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        L {(form.watch('total') || 0).toFixed(2)}
                      </span>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Notas</h3>
                  </CardHeader>
                  <CardBody className="gap-4">
                    <Controller
                      control={form.control}
                      name="notes"
                      render={({
                        field: { name, value, onChange, onBlur, ref },
                        fieldState: { invalid, error },
                      }) => (
                        <Textarea
                          ref={ref}
                          name={name}
                          label="Notas para quien compra"
                          labelPlacement="outside"
                          placeholder="Que comprar, prioridades, marcas o cantidades sugeridas."
                          value={value || ''}
                          onBlur={onBlur}
                          onValueChange={onChange}
                          isInvalid={invalid}
                          errorMessage={error?.message}
                          minRows={3}
                        />
                      )}
                    />

                    <Controller
                      control={form.control}
                      name="internalNotes"
                      render={({
                        field: { name, value, onChange, onBlur, ref },
                        fieldState: { invalid, error },
                      }) => (
                        <Textarea
                          ref={ref}
                          name={name}
                          label="Notas de Turno"
                          labelPlacement="outside"
                          placeholder="Indicaciones para la persona que queda en turno."
                          value={value || ''}
                          onBlur={onBlur}
                          onValueChange={onChange}
                          isInvalid={invalid}
                          errorMessage={error?.message}
                          minRows={3}
                        />
                      )}
                    />
                  </CardBody>
                </Card>
              </ModalBody>

              <Divider />

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
                  {isPending ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Orden'}
                </Button>
              </ModalFooter>
            </Form>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
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
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  useAvailableBatches,
  useCreateInventoryAdjustment,
  useGenerateAdjustmentNumber,
  useUpdateInventoryAdjustment,
} from '../hooks/use-adjustments'

const adjustmentReasons = [
  'Conteo fisico',
  'Producto danado',
  'Producto vencido',
  'Producto perdido',
  'Error de sistema',
  'Transferencia interna',
  'Devolucion proveedor',
  'Robo',
  'Otro',
]

const adjustmentItemSchema = z.object({
  batchId: z.number().min(1, 'Seleccione un lote'),
  productId: z.number(),
  productName: z.string(),
  batchNumber: z.string(),
  currentStock: z.number(),
  quantityChange: z
    .number()
    .refine(val => val !== 0, 'El cambio de cantidad no puede ser cero'),
  unitCost: z.number().min(0, 'El costo unitario debe ser positivo'),
  costImpact: z.number(),
  itemReason: z.string().optional(),
  notes: z.string().optional(),
})

const adjustmentFormSchema = z.object({
  adjustmentNumber: z.string().min(1, 'El numero de ajuste es requerido'),
  type: z.enum(['adjustment', 'shrinkage']),
  reason: z.string().min(1, 'La razon es requerida'),
  items: z
    .array(adjustmentItemSchema)
    .min(1, 'Debe agregar al menos un ajuste'),
  totalCostImpact: z.number(),
  totalValueImpact: z.number(),
  notes: z.string().optional(),
})

type InventoryAdjustmentFormData = z.infer<typeof adjustmentFormSchema>

interface AdjustmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  adjustment?: InventoryAdjustment & { items?: InventoryAdjustmentItem[] }
}

const getCurrentSelectionKey = (keys: 'all' | Set<React.Key>) => {
  if (keys === 'all') return null
  return (keys.values().next().value as string | undefined) ?? null
}

export function AdjustmentFormDialog({
  open,
  onOpenChange,
  adjustment,
}: AdjustmentFormDialogProps) {
  const isEdit = !!adjustment
  const [selectedBatches, setSelectedBatches] = useState<{
    [key: number]: InventoryBatch
  }>({})

  const { data: adjustmentNumber } = useGenerateAdjustmentNumber()
  const { data: availableBatches = [] } = useAvailableBatches()
  const createAdjustment = useCreateInventoryAdjustment()
  const updateAdjustment = useUpdateInventoryAdjustment()

  const form = useForm<InventoryAdjustmentFormData>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: {
      adjustmentNumber: '',
      type: 'adjustment',
      reason: '',
      items: [
        {
          batchId: 0,
          productId: 0,
          productName: '',
          batchNumber: '',
          currentStock: 0,
          quantityChange: 0,
          unitCost: 0,
          costImpact: 0,
          itemReason: '',
          notes: '',
        },
      ],
      totalCostImpact: 0,
      totalValueImpact: 0,
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const watchedItems = form.watch('items')
  const watchedType = form.watch('type')

  useEffect(() => {
    const totalCostImpact = watchedItems.reduce((sum, item, index) => {
      const costImpact = (item.quantityChange || 0) * (item.unitCost || 0)
      form.setValue(`items.${index}.costImpact`, costImpact)
      return sum + costImpact
    }, 0)

    form.setValue('totalCostImpact', totalCostImpact)
    form.setValue('totalValueImpact', totalCostImpact)
  }, [watchedItems, form])

  useEffect(() => {
    if (open && !isEdit && adjustmentNumber) {
      form.setValue('adjustmentNumber', adjustmentNumber)
    }
  }, [open, isEdit, adjustmentNumber, form])

  useEffect(() => {
    if (adjustment && open) {
      form.reset({
        adjustmentNumber: adjustment.adjustmentNumber,
        type: adjustment.type,
        reason: adjustment.reason,
        items: adjustment.items?.map(item => ({
          batchId: item.batchId,
          productId: item.productId,
          productName: item.product?.name || '',
          batchNumber: item.batch?.batchNumber || '',
          currentStock: item.batch?.currentStock || 0,
          quantityChange: item.quantityChange,
          unitCost: item.unitCost / 100,
          costImpact: item.costImpact / 100,
          itemReason: item.itemReason || '',
          notes: item.notes || '',
        })) || [
          {
            batchId: 0,
            productId: 0,
            productName: '',
            batchNumber: '',
            currentStock: 0,
            quantityChange: 0,
            unitCost: 0,
            costImpact: 0,
            itemReason: '',
            notes: '',
          },
        ],
        totalCostImpact: adjustment.totalCostImpact / 100,
        totalValueImpact: adjustment.totalValueImpact / 100,
        notes: adjustment.notes || '',
      })
    }

    if (!open) {
      setSelectedBatches({})
    }
  }, [adjustment, open, form])

  const handleBatchChange = (itemIndex: number, batchId: string) => {
    const batch = availableBatches.find(b => b.id.toString() === batchId)
    if (!batch) return

    setSelectedBatches(prev => ({
      ...prev,
      [itemIndex]: batch,
    }))

    form.setValue(`items.${itemIndex}.batchId`, batch.id)
    form.setValue(`items.${itemIndex}.productId`, batch.productId)
    form.setValue(`items.${itemIndex}.productName`, batch.product?.name || '')
    form.setValue(`items.${itemIndex}.batchNumber`, batch.batchNumber)
    form.setValue(`items.${itemIndex}.currentStock`, batch.currentStock)
    form.setValue(`items.${itemIndex}.unitCost`, batch.unitCost / 100)
  }

  const addItem = () => {
    append({
      batchId: 0,
      productId: 0,
      productName: '',
      batchNumber: '',
      currentStock: 0,
      quantityChange: 0,
      unitCost: 0,
      costImpact: 0,
      itemReason: '',
      notes: '',
    })
  }

  const removeItem = (index: number) => {
    if (fields.length <= 1) return

    remove(index)
    setSelectedBatches(prev => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  const onSubmit = (data: InventoryAdjustmentFormData) => {
    const formattedData = {
      ...data,
      items: data.items.map(item => ({
        ...item,
        unitCost: Math.round(item.unitCost * 100),
        costImpact: Math.round(item.costImpact * 100),
      })),
      totalCostImpact: Math.round(data.totalCostImpact * 100),
      totalValueImpact: Math.round(data.totalValueImpact * 100),
    }

    if (isEdit) {
      updateAdjustment.mutate(
        { id: adjustment.id, data: formattedData },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
      return
    }

    createAdjustment.mutate(formattedData, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  const isPending = createAdjustment.isPending || updateAdjustment.isPending
  const hasNegativeImpact = form.watch('totalCostImpact') < 0

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
              <h2>
                {isEdit
                  ? 'Editar Ajuste de Inventario'
                  : 'Nuevo Ajuste de Inventario'}
              </h2>
              <p className="text-small font-normal text-default-500">
                Registra ajustes y mermas por lote con impacto en inventario.
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
                        name="adjustmentNumber"
                        render={({
                          field: { name, value, onChange, onBlur, ref },
                          fieldState: { invalid, error },
                        }) => (
                          <Input
                            ref={ref}
                            isRequired
                            name={name}
                            label="Numero de ajuste"
                            labelPlacement="outside"
                            placeholder="ADJ-001"
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
                        name="type"
                        render={({
                          field: { value, onChange },
                          fieldState: { invalid, error },
                        }) => (
                          <Select
                            isRequired
                            label="Tipo de ajuste"
                            labelPlacement="outside"
                            selectedKeys={value ? [value] : []}
                            onSelectionChange={keys => {
                              const key = getCurrentSelectionKey(keys)
                              if (key === 'adjustment' || key === 'shrinkage') {
                                onChange(key)
                              }
                            }}
                            isInvalid={invalid}
                            errorMessage={error?.message}
                          >
                            <SelectItem key="adjustment">
                              Ajuste (No afecta ganancia)
                            </SelectItem>
                            <SelectItem key="shrinkage">
                              Merma (Afecta ganancia)
                            </SelectItem>
                          </Select>
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="reason"
                        render={({
                          field: { value, onChange },
                          fieldState: { invalid, error },
                        }) => (
                          <Select
                            isRequired
                            label="Razon"
                            labelPlacement="outside"
                            selectedKeys={value ? [value] : []}
                            onSelectionChange={keys => {
                              const key = getCurrentSelectionKey(keys)
                              if (key) onChange(key)
                            }}
                            isInvalid={invalid}
                            errorMessage={error?.message}
                          >
                            {adjustmentReasons.map(reason => (
                              <SelectItem key={reason}>{reason}</SelectItem>
                            ))}
                          </Select>
                        )}
                      />
                    </div>

                    {watchedType === 'shrinkage' && (
                      <div className="rounded-large border border-warning-200 bg-warning-50 p-3 text-sm">
                        <p>
                          <strong>Merma:</strong> Este tipo de ajuste afectara
                          la ganancia del negocio ya que representa una perdida
                          real de producto.
                        </p>
                      </div>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <h3 className="font-semibold">Ajustes por Lote</h3>
                    <Button
                      type="button"
                      variant="bordered"
                      size="sm"
                      startContent={<Plus className="h-4 w-4" />}
                      onPress={addItem}
                    >
                      Agregar Ajuste
                    </Button>
                  </CardHeader>
                  <CardBody className="gap-4">
                    {fields.map((itemField, index) => (
                      <Card
                        key={itemField.id}
                        className="border border-default-100"
                      >
                        <CardBody className="gap-4">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-3">
                              <Controller
                                control={form.control}
                                name={`items.${index}.batchId`}
                                render={({
                                  fieldState: { invalid, error },
                                }) => (
                                  <Select
                                    isRequired
                                    label="Lote"
                                    labelPlacement="outside"
                                    selectedKeys={
                                      form.watch(`items.${index}.batchId`)
                                        ? [
                                            String(
                                              form.watch(
                                                `items.${index}.batchId`
                                              )
                                            ),
                                          ]
                                        : []
                                    }
                                    onSelectionChange={keys => {
                                      const key = getCurrentSelectionKey(keys)
                                      if (key) handleBatchChange(index, key)
                                    }}
                                    isInvalid={invalid}
                                    errorMessage={error?.message}
                                  >
                                    {availableBatches.map(batch => (
                                      <SelectItem key={batch.id.toString()}>
                                        {`${batch.product?.name || 'Sin producto'} - Lote ${batch.batchNumber} - Stock ${batch.currentStock}`}
                                      </SelectItem>
                                    ))}
                                  </Select>
                                )}
                              />
                            </div>

                            <div className="col-span-4 md:col-span-2">
                              <p className="mb-2 text-sm text-default-500">
                                Stock actual
                              </p>
                              <div className="rounded-large bg-default-100 px-3 py-2 text-sm">
                                {form.watch(`items.${index}.currentStock`) || 0}
                              </div>
                            </div>

                            <div className="col-span-4 md:col-span-2">
                              <Controller
                                control={form.control}
                                name={`items.${index}.quantityChange`}
                                render={({
                                  field: { name, value, onChange, onBlur, ref },
                                  fieldState: { invalid, error },
                                }) => (
                                  <Input
                                    ref={ref}
                                    isRequired
                                    name={name}
                                    type="number"
                                    label="Cambio"
                                    labelPlacement="outside"
                                    placeholder="+/- cantidad"
                                    value={String(value ?? 0)}
                                    onBlur={onBlur}
                                    onValueChange={nextValue => {
                                      onChange(parseInt(nextValue, 10) || 0)
                                    }}
                                    isInvalid={invalid}
                                    errorMessage={error?.message}
                                    classNames={{
                                      inputWrapper:
                                        value > 0
                                          ? 'border-success'
                                          : value < 0
                                            ? 'border-danger'
                                            : '',
                                    }}
                                  />
                                )}
                              />
                            </div>

                            <div className="col-span-3 md:col-span-2">
                              <p className="mb-2 text-sm text-default-500">
                                Costo unitario
                              </p>
                              <div className="rounded-large bg-default-100 px-3 py-2 text-sm">
                                L{' '}
                                {(
                                  form.watch(`items.${index}.unitCost`) || 0
                                ).toFixed(2)}
                              </div>
                            </div>

                            <div className="col-span-3 md:col-span-2">
                              <p className="mb-2 text-sm text-default-500">
                                Impacto
                              </p>
                              <div
                                className={`rounded-large bg-default-100 px-3 py-2 text-sm font-medium ${
                                  form.watch(`items.${index}.costImpact`) > 0
                                    ? 'text-success'
                                    : form.watch(`items.${index}.costImpact`) <
                                        0
                                      ? 'text-danger'
                                      : ''
                                }`}
                              >
                                L{' '}
                                {(
                                  form.watch(`items.${index}.costImpact`) || 0
                                ).toFixed(2)}
                              </div>
                            </div>

                            <div className="col-span-1 flex items-end justify-end">
                              <Button
                                type="button"
                                variant="light"
                                isIconOnly
                                color="danger"
                                onPress={() => removeItem(index)}
                                isDisabled={fields.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="col-span-12 md:col-span-6">
                              <Controller
                                control={form.control}
                                name={`items.${index}.itemReason`}
                                render={({
                                  field: { name, value, onChange, onBlur, ref },
                                }) => (
                                  <Input
                                    ref={ref}
                                    name={name}
                                    label="Razon especifica"
                                    labelPlacement="outside"
                                    placeholder="Razon especifica (opcional)"
                                    value={value || ''}
                                    onBlur={onBlur}
                                    onValueChange={onChange}
                                  />
                                )}
                              />
                            </div>

                            <div className="col-span-12 md:col-span-6">
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
                                    placeholder="Notas adicionales (opcional)"
                                    value={value || ''}
                                    onBlur={onBlur}
                                    onValueChange={onChange}
                                  />
                                )}
                              />
                            </div>
                          </div>

                          {selectedBatches[index] && (
                            <div className="rounded-large bg-default-100 p-3 text-sm">
                              <strong>Lote:</strong>{' '}
                              {selectedBatches[index].batchNumber}
                              <span className="mx-2">|</span>
                              <strong>Producto:</strong>{' '}
                              {selectedBatches[index].product?.name}
                              <span className="mx-2">|</span>
                              <strong>Stock:</strong>{' '}
                              {selectedBatches[index].currentStock}
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Calculator className="h-5 w-5" />
                      Resumen del Impacto
                    </h3>
                  </CardHeader>
                  <CardBody className="gap-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-default-500">
                          Impacto total en costo
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            form.watch('totalCostImpact') > 0
                              ? 'text-success'
                              : form.watch('totalCostImpact') < 0
                                ? 'text-danger'
                                : ''
                          }`}
                        >
                          L {(form.watch('totalCostImpact') || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-default-500">
                          {form.watch('totalCostImpact') > 0
                            ? 'Aumento de valor'
                            : 'Disminucion de valor'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-default-500">
                          Tipo de ajuste
                        </p>
                        <Chip
                          color={
                            watchedType === 'shrinkage' ? 'danger' : 'primary'
                          }
                          variant="flat"
                        >
                          {watchedType === 'shrinkage'
                            ? 'Merma (Afecta Ganancia)'
                            : 'Ajuste (No Afecta Ganancia)'}
                        </Chip>
                        <p className="mt-2 text-xs text-default-500">
                          {watchedType === 'shrinkage'
                            ? 'Este ajuste impactara directamente en la ganancia del negocio'
                            : 'Este ajuste no afectara las ganancias reportadas'}
                        </p>
                      </div>
                    </div>

                    {hasNegativeImpact && watchedType === 'shrinkage' && (
                      <div className="rounded-large border border-danger-200 bg-danger-50 p-3 text-sm">
                        <p>
                          <strong>Advertencia:</strong> Esta merma representara
                          una perdida de L{' '}
                          {Math.abs(form.watch('totalCostImpact')).toFixed(2)}{' '}
                          en el valor del inventario.
                        </p>
                      </div>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Notas Generales</h3>
                  </CardHeader>
                  <CardBody>
                    <Controller
                      control={form.control}
                      name="notes"
                      render={({
                        field: { name, value, onChange, onBlur, ref },
                      }) => (
                        <Textarea
                          ref={ref}
                          name={name}
                          label="Notas"
                          labelPlacement="outside"
                          placeholder="Notas adicionales sobre el ajuste de inventario"
                          value={value || ''}
                          onBlur={onBlur}
                          onValueChange={onChange}
                          minRows={4}
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
                  {isPending
                    ? 'Guardando...'
                    : isEdit
                      ? 'Actualizar Ajuste'
                      : 'Crear Ajuste'}
                </Button>
              </ModalFooter>
            </Form>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}


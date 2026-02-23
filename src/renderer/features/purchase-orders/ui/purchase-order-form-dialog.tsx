import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Calculator } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { useActiveSuppliers } from '../../suppliers/hooks/use-suppliers'
import {
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
  useGenerateOrderNumber,
} from '../hooks/use-purchase-orders'

const purchaseOrderItemSchema = z.object({
  presentationId: z.number().min(1, 'Seleccione una presentación'),
  presentationName: z.string().min(1, 'Nombre de la presentación requerido'),
  productName: z.string().min(1, 'Nombre del producto requerido'),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  unitCost: z.number().min(0, 'El costo unitario debe ser positivo'),
  totalCost: z.number().min(0),
  notes: z.string().optional(),
})

const purchaseOrderFormSchema = z.object({
  orderNumber: z.string().min(1, 'El número de orden es requerido'),
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

type PurchaseOrderFormData = z.infer<typeof purchaseOrderFormSchema>

interface PurchaseOrderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrder?: PurchaseOrder & { items?: PurchaseOrderItem[] }
}

export function PurchaseOrderFormDialog({
  open,
  onOpenChange,
  purchaseOrder,
}: PurchaseOrderFormDialogProps) {
  const isEdit = !!purchaseOrder
  const [taxRate, setTaxRate] = useState(15) // Default 15% tax rate

  const { data: suppliers = [] } = useActiveSuppliers()
  const { data: orderNumber } = useGenerateOrderNumber()
  const createPurchaseOrder = useCreatePurchaseOrder()
  const updatePurchaseOrder = useUpdatePurchaseOrder()

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      orderNumber: '',
      supplierId: 0,
      status: 'draft',
      expectedDeliveryDate: '',
      items: [
        {
          presentationId: 0,
          presentationName: '',
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

  // Calculate totals when items change
  useEffect(() => {
    const subtotal = watchedItems.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unitCost || 0)
      form.setValue(`items.${watchedItems.indexOf(item)}.totalCost`, itemTotal)
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

  // Set order number when dialog opens for new orders
  useEffect(() => {
    if (open && !isEdit && orderNumber) {
      form.setValue('orderNumber', orderNumber)
    }
  }, [open, isEdit, orderNumber, form])

  // Load existing order data
  useEffect(() => {
    if (purchaseOrder && open) {
      const deliveryDate = purchaseOrder.expectedDeliveryDate
        ? new Date(purchaseOrder.expectedDeliveryDate)
            .toISOString()
            .split('T')[0]
        : ''

      form.reset({
        orderNumber: purchaseOrder.orderNumber,
        supplierId: purchaseOrder.supplierId,
        status: purchaseOrder.status,
        expectedDeliveryDate: deliveryDate,
        items: purchaseOrder.items?.map(item => ({
          presentationId: item.presentationId || 0,
          presentationName: item.presentationName || '',
          productName: item.productName || '',
          quantity: item.quantity,
          unitCost: item.unitCost / 100, // Convert from cents
          totalCost: (item.quantity * item.unitCost) / 100,
          notes: item.notes || '',
        })) || [
          {
            presentationId: 0,
            presentationName: '',
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
    }
  }, [purchaseOrder, open, form])

  const addItem = () => {
    append({
      presentationId: 0,
      presentationName: '',
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

  const onSubmit = (data: PurchaseOrderFormData) => {
    const formattedData = {
      ...data,
      items: data.items.map(item => ({
        ...item,
        unitCost: Math.round(item.unitCost * 100), // Convert to cents
        totalCost: Math.round(item.totalCost * 100),
      })),
      subtotal: Math.round(data.subtotal * 100),
      taxAmount: Math.round(data.taxAmount * 100),
      discountAmount: Math.round(data.discountAmount * 100),
      shippingAmount: Math.round(data.shippingAmount * 100),
      total: Math.round(data.total * 100),
      expectedDeliveryDate: data.expectedDeliveryDate
        ? new Date(data.expectedDeliveryDate).getTime()
        : undefined,
    }

    if (isEdit) {
      updatePurchaseOrder.mutate(
        { id: purchaseOrder.id, data: formattedData },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
    } else {
      createPurchaseOrder.mutate(formattedData, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }
  }

  const isPending =
    createPurchaseOrder.isPending || updatePurchaseOrder.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los detalles de la orden de compra.'
              : 'Crea una nueva orden de compra para enviar a un proveedor.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="orderNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Orden *</FormLabel>
                        <FormControl>
                          <Input placeholder="PO-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proveedor *</FormLabel>
                        <Select
                          value={field.value?.toString() || ''}
                          onValueChange={value =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar proveedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map(supplier => (
                              <SelectItem
                                key={supplier.id}
                                value={supplier.id.toString()}
                              >
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedDeliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Entrega Esperada</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Productos</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-4 items-end"
                    >
                      <div className="col-span-12 md:col-span-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.presentationName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Presentación *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nombre de la presentación"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-4 md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cantidad *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={e =>
                                    field.onChange(
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-4 md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitCost`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Costo Unitario *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={e =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-3 md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.totalCost`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  readOnly
                                  className="bg-muted"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={fields.length === 1}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="col-span-12">
                        <FormField
                          control={form.control}
                          name={`items.${index}.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Notas de la presentación (opcional)"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Subtotal</label>
                    <div className="text-2xl font-bold">
                      L {form.watch('subtotal')?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="discountAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descuento</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div>
                    <label className="text-sm font-medium">
                      Impuesto ({taxRate}%)
                    </label>
                    <div className="text-lg font-semibold">
                      L {form.watch('taxAmount')?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="shippingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Envío</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    L {form.watch('total')?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas para el Proveedor</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Instrucciones especiales, términos de entrega, etc."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="internalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Internas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notas internas que no verá el proveedor"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'Guardando...'
                  : isEdit
                    ? 'Actualizar'
                    : 'Crear Orden'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

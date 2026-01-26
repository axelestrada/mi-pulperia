import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Trash2,
  Calculator,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

import {
  useCreateInventoryAdjustment,
  useUpdateInventoryAdjustment,
  useGenerateAdjustmentNumber,
  useAvailableBatches,
  useBatchInfo,
} from '../hooks/use-adjustments'

const adjustmentReasons = [
  'Conteo físico',
  'Producto dañado',
  'Producto vencido',
  'Producto perdido',
  'Error de sistema',
  'Transferencia interna',
  'Devolución proveedor',
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
  adjustmentNumber: z.string().min(1, 'El número de ajuste es requerido'),
  type: z.enum(['adjustment', 'shrinkage']),
  reason: z.string().min(1, 'La razón es requerida'),
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

  // Calculate totals when items change
  useEffect(() => {
    const totalCostImpact = watchedItems.reduce((sum, item) => {
      const costImpact = (item.quantityChange || 0) * (item.unitCost || 0)
      const index = watchedItems.indexOf(item)
      form.setValue(`items.${index}.costImpact`, costImpact)
      return sum + costImpact
    }, 0)

    form.setValue('totalCostImpact', totalCostImpact)
    form.setValue('totalValueImpact', totalCostImpact)
  }, [watchedItems, form])

  // Set adjustment number when dialog opens for new adjustments
  useEffect(() => {
    if (open && !isEdit && adjustmentNumber) {
      form.setValue('adjustmentNumber', adjustmentNumber)
    }
  }, [open, isEdit, adjustmentNumber, form])

  // Load existing adjustment data
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
          unitCost: item.unitCost / 100, // Convert from cents
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
  }, [adjustment, open, form])

  const handleBatchChange = (itemIndex: number, batchId: string) => {
    const batch = availableBatches.find(b => b.id.toString() === batchId)
    if (batch) {
      setSelectedBatches(prev => ({
        ...prev,
        [itemIndex]: batch,
      }))

      form.setValue(`items.${itemIndex}.batchId`, batch.id)
      form.setValue(`items.${itemIndex}.productId`, batch.productId)
      form.setValue(`items.${itemIndex}.productName`, batch.product?.name || '')
      form.setValue(`items.${itemIndex}.batchNumber`, batch.batchNumber)
      form.setValue(`items.${itemIndex}.currentStock`, batch.currentStock)
      form.setValue(`items.${itemIndex}.unitCost`, batch.unitCost / 100) // Convert from cents
    }
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
    if (fields.length > 1) {
      remove(index)
      // Remove from selected batches
      setSelectedBatches(prev => {
        const newSelected = { ...prev }
        delete newSelected[index]
        return newSelected
      })
    }
  }

  const onSubmit = (data: InventoryAdjustmentFormData) => {
    const formattedData = {
      ...data,
      items: data.items.map(item => ({
        ...item,
        unitCost: Math.round(item.unitCost * 100), // Convert to cents
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
    } else {
      createAdjustment.mutate(formattedData, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }
  }

  const isPending = createAdjustment.isPending || updateAdjustment.isPending
  const hasNegativeImpact = form.watch('totalCostImpact') < 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? 'Editar Ajuste de Inventario'
              : 'Nuevo Ajuste de Inventario'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los detalles del ajuste de inventario.'
              : 'Registra ajustes y mermas específicos por lote de inventario.'}
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
                    name="adjustmentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Ajuste *</FormLabel>
                        <FormControl>
                          <Input placeholder="ADJ-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Ajuste *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="adjustment">
                              <div className="flex items-center gap-2">
                                <Calculator className="h-4 w-4" />
                                Ajuste (No afecta ganancia)
                              </div>
                            </SelectItem>
                            <SelectItem value="shrinkage">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                Merma (Afecta ganancia)
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar razón" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {adjustmentReasons.map(reason => (
                              <SelectItem key={reason} value={reason}>
                                {reason}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {watchedType === 'shrinkage' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Merma:</strong> Este tipo de ajuste afectará la
                      ganancia del negocio ya que representa una pérdida real de
                      producto.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Adjustment Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ajustes por Lote</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Ajuste
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-12 md:col-span-3">
                          <FormField
                            control={form.control}
                            name={`items.${index}.batchId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lote *</FormLabel>
                                <Select
                                  value={field.value?.toString() || ''}
                                  onValueChange={value =>
                                    handleBatchChange(index, value)
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar lote" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {availableBatches.map(batch => (
                                      <SelectItem
                                        key={batch.id}
                                        value={batch.id.toString()}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {batch.product?.name}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            Lote: {batch.batchNumber} | Stock:{' '}
                                            {batch.currentStock}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-4 md:col-span-2">
                          <FormLabel>Stock Actual</FormLabel>
                          <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                            <span className="text-sm">
                              {form.watch(`items.${index}.currentStock`) || 0}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-4 md:col-span-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantityChange`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cambio de Cantidad *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="+/- cantidad"
                                    {...field}
                                    onChange={e =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className={
                                      field.value > 0
                                        ? 'border-green-500 text-green-600'
                                        : field.value < 0
                                          ? 'border-red-500 text-red-600'
                                          : ''
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-3 md:col-span-2">
                          <FormLabel>Costo Unitario</FormLabel>
                          <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                            <span className="text-sm">
                              L
                              {(
                                form.watch(`items.${index}.unitCost`) || 0
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-3 md:col-span-2">
                          <FormLabel>Impacto</FormLabel>
                          <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                            <span
                              className={`text-sm font-medium ${
                                form.watch(`items.${index}.costImpact`) > 0
                                  ? 'text-green-600'
                                  : form.watch(`items.${index}.costImpact`) < 0
                                    ? 'text-red-600'
                                    : ''
                              }`}
                            >
                              L
                              {(
                                form.watch(`items.${index}.costImpact`) || 0
                              ).toFixed(2)}
                            </span>
                          </div>
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

                        <div className="col-span-12 md:col-span-6">
                          <FormField
                            control={form.control}
                            name={`items.${index}.itemReason`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Razón específica (opcional)"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-12 md:col-span-6">
                          <FormField
                            control={form.control}
                            name={`items.${index}.notes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Notas adicionales (opcional)"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {selectedBatches[index] && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <div className="text-sm">
                            <strong>Lote seleccionado:</strong>{' '}
                            {selectedBatches[index].batchNumber}
                            <span className="mx-2">•</span>
                            <strong>Producto:</strong>{' '}
                            {selectedBatches[index].product?.name}
                            <span className="mx-2">•</span>
                            <strong>Stock disponible:</strong>{' '}
                            {selectedBatches[index].currentStock}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Resumen del Impacto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Impacto Total en Costo
                    </label>
                    <div
                      className={`text-2xl font-bold ${
                        form.watch('totalCostImpact') > 0
                          ? 'text-green-600'
                          : form.watch('totalCostImpact') < 0
                            ? 'text-red-600'
                            : ''
                      }`}
                    >
                      L {(form.watch('totalCostImpact') || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {form.watch('totalCostImpact') > 0
                        ? 'Aumento de valor'
                        : 'Disminución de valor'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tipo de Ajuste
                    </label>
                    <div>
                      <Badge
                        variant={
                          watchedType === 'shrinkage'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {watchedType === 'shrinkage'
                          ? 'Merma (Afecta Ganancia)'
                          : 'Ajuste (No Afecta Ganancia)'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {watchedType === 'shrinkage'
                        ? 'Este ajuste impactará directamente en la ganancia del negocio'
                        : 'Este ajuste no afectará las ganancias reportadas'}
                    </p>
                  </div>
                </div>

                {hasNegativeImpact && watchedType === 'shrinkage' && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Advertencia:</strong> Esta merma representará una
                      pérdida de L
                      {Math.abs(form.watch('totalCostImpact')).toFixed(2)} en el
                      valor del inventario.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notas Generales</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Notas adicionales sobre el ajuste de inventario"
                          className="min-h-[100px]"
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
                    ? 'Actualizar Ajuste'
                    : 'Crear Ajuste'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

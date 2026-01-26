import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Minus,
  ShoppingCart, Search,
  Barcode,
  User, Receipt,
  AlertCircle, X, Grid,
  List
} from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '../../../components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { ScrollArea } from '../../../components/ui/scroll-area'

import {
  useAvailablePresentations,
  usePOSCategories,
  useSearchByCode,
  useCreatePOSSale,
  POSPresentation, CreatePOSSaleInput
} from '../../../hooks/use-pos'
import { useCurrentOpenSession } from '../../../hooks/use-cash-sessions'
import { useActiveCustomersForSelection } from '../../../hooks/use-customers'
import { formatCurrency } from '../../../../shared/utils/formatCurrency'

// Form validation schemas
const saleItemSchema = z.object({
  presentationId: z.number().min(1, 'Required'),
  quantity: z.number().min(0.01, 'Must be at least 0.01'),
  unitPrice: z.number().min(0, 'Cannot be negative'),
  discount: z.number().min(0, 'Cannot be negative').optional(),
  discountType: z.enum(['fixed', 'percentage']).optional(),
  notes: z.string().optional(),
})

const paymentMethodSchema = z.object({
  method: z.enum(['cash', 'credit', 'debit', 'transfer', 'check']),
  amount: z.number().min(0.01, 'Must be at least 0.01'),
  receivedAmount: z.number().min(0, 'Cannot be negative').optional(),
  changeAmount: z.number().min(0, 'Cannot be negative').optional(),
  referenceNumber: z.string().optional(),
  authorizationCode: z.string().optional(),
  details: z.string().optional(),
  notes: z.string().optional(),
})

const posFormSchema = z.object({
  customerId: z.number().optional(),
  items: z.array(saleItemSchema).min(1, 'Must have at least one item'),
  payments: z
    .array(paymentMethodSchema)
    .min(1, 'Must have at least one payment method'),
  notes: z.string().optional(),
})

type POSFormData = z.infer<typeof posFormSchema>

interface POSInterfaceProps {
  onSaleComplete?: (saleId: number) => void
}

export const POSInterface: React.FC<POSInterfaceProps> = ({
  onSaleComplete,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>()
  const [barcodeInput, setBarcodeInput] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  // Queries
  const { data: openSession } = useCurrentOpenSession()
  const { data: presentationsData, isLoading: loadingPresentations } =
    useAvailablePresentations({
      search: searchTerm,
      categoryId: selectedCategory,
      page: 1,
      limit: 50,
    })
  const { data: categories = [] } = usePOSCategories()
  const { data: customers } = useActiveCustomersForSelection()
  const { data: searchResult } = useSearchByCode(barcodeInput)

  // Mutations
  const createSale = useCreatePOSSale()

  // Form
  const form = useForm<POSFormData>({
    resolver: zodResolver(posFormSchema),
    defaultValues: {
      items: [],
      payments: [],
    },
  })

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
    update: updateItem,
  } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control: form.control,
    name: 'payments',
  })

  // Calculate totals
  const items = form.watch('items')
  const payments = form.watch('payments')

  const totals = React.useMemo(() => {
    let subtotal = 0
    let totalItems = 0

    items.forEach(item => {
      let itemTotal = item.quantity * item.unitPrice

      if (item.discount && item.discount > 0) {
        if (item.discountType === 'percentage') {
          itemTotal = itemTotal * (1 - item.discount / 100)
        } else {
          itemTotal = Math.max(0, itemTotal - item.discount)
        }
      }

      subtotal += itemTotal
      totalItems += item.quantity
    })

    const taxAmount = 0 // No tax for now, but can be configured
    const total = subtotal + taxAmount

    const totalPayments = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    )
    const totalCash = payments
      .filter(p => p.method === 'cash')
      .reduce((sum, p) => sum + (p.receivedAmount || 0), 0)
    const totalChange = payments
      .filter(p => p.method === 'cash')
      .reduce((sum, p) => sum + (p.changeAmount || 0), 0)

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      totalItems,
      totalPayments: Math.round(totalPayments * 100) / 100,
      totalCash: Math.round(totalCash * 100) / 100,
      totalChange: Math.round(totalChange * 100) / 100,
      balance: Math.round((total - totalPayments) * 100) / 100,
    }
  }, [items, payments])

  // Add presentation to cart
  const addToCart = (presentation: POSPresentation, quantity: number = 1) => {
    // Check if item already exists
    const existingIndex = itemFields.findIndex(
      field => field.presentationId === presentation.id
    )

    if (existingIndex >= 0) {
      // Update existing item
      const existingItem = itemFields[existingIndex]
      updateItem(existingIndex, {
        ...existingItem,
        quantity: existingItem.quantity + quantity,
      })
    } else {
      // Add new item
      appendItem({
        presentationId: presentation.id,
        quantity,
        unitPrice: presentation.salePrice,
        discount: 0,
        discountType: 'fixed',
        notes: '',
      })
    }
  }

  // Handle barcode search
  useEffect(() => {
    if (searchResult) {
      addToCart(searchResult)
      setBarcodeInput('')
    }
  }, [searchResult])

  // Submit sale
  const onSubmit = async (data: POSFormData) => {
    if (!openSession) {
      alert('No hay una caja abierta')
      return
    }

    if (Math.abs(totals.balance) > 0.01) {
      alert('El total de pagos debe igualar el total de la venta')
      return
    }

    try {
      const saleInput: CreatePOSSaleInput = {
        customerId: data.customerId,
        items: data.items,
        payments: data.payments,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        discountAmount: 0,
        total: totals.total,
        notes: data.notes,
      }

      const result = await createSale.mutateAsync(saleInput)

      // Reset form
      form.reset({
        items: [],
        payments: [],
      })

      alert('Venta realizada exitosamente')
      onSaleComplete?.(result.sale?.id || result.id)
    } catch (error) {
      console.error('Error creating sale:', error)
      alert('Error al procesar la venta: ' + (error as Error).message)
    }
  }

  if (!openSession) {
    return (
      <Card className="m-4">
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No hay una caja abierta. Debe abrir una caja antes de realizar
              ventas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-[2fr_1fr] gap-4 pt-4 max-h-[calc(100dvh-96px)] overflow-hidden">
      <div className="space-y-4 flex-col flex h-[calc(100dvh-112px)]">
        <div className="p-4 border rounded-xl">
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <IconLucideSearch className="size-4 text-foreground/50 absolute left-3 top-1/2 -translate-y-1/2" />

              <Input
                className="w-full pl-10 pr-5"
                placeholder="Buscar producto, SKU o código de barras..."
              />
            </div>

            <Button variant="outline">
              <IconLucideScan className="size-4" />
              Escanear
            </Button>

            <Button variant="outline">
              <IconLucidePlus className="size-4" />
              Manual
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <Button
                key={'pos-category-' + category.id}
                variant={
                  selectedCategory === category.id ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 overflow-y-auto max-h-full">
          {presentationsData?.data?.map((presentation: POSPresentation) => (
            <PosItem
              key={'pos-presentation-' + presentation.id}
              presentation={presentation}
              onClick={addToCart}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4 flex-col flex h-[calc(100dvh-112px)]">
        <div className="border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconLucideShoppingCart className="size-5" />
            <span className="font-semibold">Carrito (2)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm">
              <IconLucideClock />
              Pausadas
            </Button>
            <Button variant="outline" size="icon-sm">
              <IconLucidePause />
            </Button>
          </div>
        </div>

        <div className="border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconLucideCreditCard className="size-5" />
            <span className="font-semibold">Cliente</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm">
              <IconLucideMousePointerClick className="size-5" />
              Seleccionar
            </Button>
          </div>
        </div>

        <div className="rounded-xl border flex-1 overflow-y-auto p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col h-full"
            >
              <ScrollArea className="flex-1 p-4">
                {itemFields.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Carrito vacío</p>
                    <p className="text-sm">Agregue productos para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {itemFields.map((field, index) => {
                      const presentation = presentationsData?.data?.find(
                        p => p.id === field.presentationId
                      )
                      if (!presentation) return null

                      const itemTotal =
                        field.quantity * field.unitPrice - (field.discount || 0)

                      return (
                        <div
                          className="border border-slate-200 rounded-md p-3"
                          key={field.id}
                        >
                          <div className="flex gap-3 items-center">
                            {/* TODO: Agregar la imagen */}
                            <SafeImage
                              className="aspect-square size-14 object-cover"
                              src={presentation.image} // TODO: Reemplazar con item.product.image cuando esté disponible
                              alt={presentation.productName}
                            />

                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold">
                                  {presentation.productName}
                                </span>

                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => removeItem(index)}
                                >
                                  <IconLucideTrash />
                                </Button>
                              </div>

                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (field.quantity > 1) {
                                        updateItem(index, {
                                          ...field,
                                          quantity: field.quantity - 1,
                                        })
                                      }
                                    }}
                                    disabled={field.quantity <= 1}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    render={({ field: quantityField }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            {...quantityField}
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            className="w-20 text-center"
                                            onChange={e =>
                                              quantityField.onChange(
                                                parseFloat(e.target.value) || 0
                                              )
                                            }
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      updateItem(index, {
                                        ...field,
                                        quantity: field.quantity + 1,
                                      })
                                    }}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="text-right">
                                  <p className="font-medium">
                                    {formatLempira(itemTotal / 100)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatLempira(field.unitPrice / 100)} c/u
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>

              <div className="border rounded-xl p-4 space-y-4">
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal / 100)}</span>
                  </div>

                  {totals.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Impuesto:</span>
                      <span>{formatCurrency(totals.taxAmount / 100)}</span>
                    </div>
                  )}

                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total / 100)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Artículos:</span>
                    <span>{totals.totalItems}</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">
                      Métodos de Pago
                    </label>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const remaining = totals.total - totals.totalPayments
                        if (remaining > 0) {
                          appendPayment({
                            method: 'cash',
                            amount: remaining,
                            receivedAmount: remaining,
                            changeAmount: 0,
                          })
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>

                  {paymentFields.map((field, index) => (
                    <Card key={field.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <FormField
                            control={form.control}
                            name={`payments.${index}.method`}
                            render={({ field: methodField }) => (
                              <FormItem className="flex-1">
                                <Select
                                  value={methodField.value}
                                  onValueChange={methodField.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="cash">
                                      Efectivo
                                    </SelectItem>
                                    <SelectItem value="credit">
                                      Tarjeta de Crédito
                                    </SelectItem>
                                    <SelectItem value="debit">
                                      Tarjeta de Débito
                                    </SelectItem>
                                    <SelectItem value="transfer">
                                      Transferencia
                                    </SelectItem>
                                    <SelectItem value="check">
                                      Cheque
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePayment(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name={`payments.${index}.amount`}
                            render={({ field: amountField }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Monto</FormLabel>
                                <FormControl>
                                  <Input
                                    {...amountField}
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    onChange={e =>
                                      amountField.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {field.method === 'cash' && (
                            <FormField
                              control={form.control}
                              name={`payments.${index}.receivedAmount`}
                              render={({ field: receivedField }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">
                                    Recibido
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...receivedField}
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      onChange={e => {
                                        const received =
                                          parseFloat(e.target.value) || 0
                                        receivedField.onChange(received)
                                        const change = Math.max(
                                          0,
                                          received - field.amount
                                        )
                                        form.setValue(
                                          `payments.${index}.changeAmount`,
                                          change
                                        )
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          )}

                          {['credit', 'debit', 'transfer'].includes(
                            field.method
                          ) && (
                            <FormField
                              control={form.control}
                              name={`payments.${index}.referenceNumber`}
                              render={({ field: refField }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">
                                    Referencia
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...refField}
                                      placeholder="Nº referencia"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          )}
                        </div>

                        {field.method === 'cash' &&
                          field.changeAmount !== undefined &&
                          field.changeAmount > 0 && (
                            <div className="text-center p-2 bg-green-50 rounded border">
                              <p className="text-sm font-medium text-green-800">
                                Cambio: {formatCurrency(field.changeAmount)}
                              </p>
                            </div>
                          )}
                      </div>
                    </Card>
                  ))}

                  {totals.balance !== 0 && (
                    <div
                      className={`text-center p-2 rounded border ${
                        totals.balance > 0
                          ? 'bg-red-50 text-red-800'
                          : 'bg-yellow-50 text-yellow-800'
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {totals.balance > 0 ? 'Falta: ' : 'Sobra: '}
                        {formatCurrency(Math.abs(totals.balance / 100))}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      itemFields.length === 0 ||
                      Math.abs(totals.balance / 100) > 0.01 ||
                      createSale.isPending
                    }
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    {createSale.isPending ? 'Procesando...' : 'Procesar Venta'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      form.reset({ items: [], payments: [] })
                    }}
                  >
                    Limpiar Carrito
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col">
        {/* Search and filters */}
        <div className="p-4 bg-white border-b">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar productos por nombre, descripción, código de barras..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select
                value={selectedCategory?.toString() || undefined}
                onValueChange={value =>
                  setSelectedCategory(value ? parseInt(value) : undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories?.map(category => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Barcode input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Escanear código de barras o SKU..."
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    setBarcodeInput(e.currentTarget.value)
                  }
                }}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Products grid/list */}
        <ScrollArea className="flex-1 p-4">
          {loadingPresentations ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-2'
              }
            >
              {presentationsData?.data?.map(presentation => (
                <Card
                  key={presentation.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    viewMode === 'grid' ? 'h-fit' : 'flex-row'
                  }`}
                  onClick={() => addToCart(presentation)}
                >
                  <CardHeader
                    className={
                      viewMode === 'grid' ? 'pb-2' : 'py-3 px-4 flex-shrink-0'
                    }
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium truncate">
                          {presentation.name}
                        </CardTitle>
                        <p className="text-xs text-gray-500 truncate">
                          {presentation.productName}
                        </p>
                      </div>
                      <Badge
                        variant={
                          presentation.availableQuantity > 0
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {presentation.availableQuantity ?? 0}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent
                    className={
                      viewMode === 'grid' ? 'pt-0' : 'py-3 px-4 flex-1'
                    }
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          {formatLempira(presentation.salePrice / 100)}
                        </p>
                        {presentation.barcode && (
                          <p className="text-xs text-gray-400">
                            {presentation.barcode}
                          </p>
                        )}
                      </div>
                      <Button size="sm" className="ml-2">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Panel - Cart and Payment */}
      <div className="w-96 bg-white border-l flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito de Compras
          </h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            {/* Cart Items */}
            <ScrollArea className="flex-1 p-4">
              {itemFields.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Carrito vacío</p>
                  <p className="text-sm">Agregue productos para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {itemFields.map((field, index) => {
                    const presentation = presentationsData?.data?.find(
                      p => p.id === field.presentationId
                    )
                    if (!presentation) return null

                    const itemTotal =
                      field.quantity * field.unitPrice - (field.discount || 0)

                    return (
                      <Card key={field.id} className="p-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm truncate">
                                {presentation.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {presentation.productName}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (field.quantity > 1) {
                                    updateItem(index, {
                                      ...field,
                                      quantity: field.quantity - 1,
                                    })
                                  }
                                }}
                                disabled={field.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field: quantityField }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        {...quantityField}
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        className="w-20 text-center"
                                        onChange={e =>
                                          quantityField.onChange(
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  updateItem(index, {
                                    ...field,
                                    quantity: field.quantity + 1,
                                  })
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {formatCurrency(itemTotal)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatCurrency(field.unitPrice)} c/u
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Customer and Totals */}
            <div className="p-4 border-t space-y-4">
              {/* Customer Selection */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Cliente (Opcional)
                    </FormLabel>
                    <Select
                      value={field.value?.toString() || undefined}
                      onValueChange={value =>
                        field.onChange(value ? parseInt(value) : undefined)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sin cliente</SelectItem>
                        {customers?.map(customer => (
                          <SelectItem
                            key={customer.id}
                            value={customer.id.toString()}
                          >
                            {customer.name}
                            {customer.document && ` - ${customer.document}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Totals */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Impuesto:</span>
                    <span>{formatCurrency(totals.taxAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Artículos:</span>
                  <span>{totals.totalItems}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Métodos de Pago</label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const remaining = totals.total - totals.totalPayments
                      if (remaining > 0) {
                        appendPayment({
                          method: 'cash',
                          amount: remaining,
                          receivedAmount: remaining,
                          changeAmount: 0,
                        })
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>

                {paymentFields.map((field, index) => (
                  <Card key={field.id} className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <FormField
                          control={form.control}
                          name={`payments.${index}.method`}
                          render={({ field: methodField }) => (
                            <FormItem className="flex-1">
                              <Select
                                value={methodField.value}
                                onValueChange={methodField.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="cash">Efectivo</SelectItem>
                                  <SelectItem value="credit">
                                    Tarjeta de Crédito
                                  </SelectItem>
                                  <SelectItem value="debit">
                                    Tarjeta de Débito
                                  </SelectItem>
                                  <SelectItem value="transfer">
                                    Transferencia
                                  </SelectItem>
                                  <SelectItem value="check">Cheque</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePayment(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name={`payments.${index}.amount`}
                          render={({ field: amountField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Monto</FormLabel>
                              <FormControl>
                                <Input
                                  {...amountField}
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  onChange={e =>
                                    amountField.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {field.method === 'cash' && (
                          <FormField
                            control={form.control}
                            name={`payments.${index}.receivedAmount`}
                            render={({ field: receivedField }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Recibido
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...receivedField}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    onChange={e => {
                                      const received =
                                        parseFloat(e.target.value) || 0
                                      receivedField.onChange(received)
                                      const change = Math.max(
                                        0,
                                        received - field.amount
                                      )
                                      form.setValue(
                                        `payments.${index}.changeAmount`,
                                        change
                                      )
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}

                        {['credit', 'debit', 'transfer'].includes(
                          field.method
                        ) && (
                          <FormField
                            control={form.control}
                            name={`payments.${index}.referenceNumber`}
                            render={({ field: refField }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Referencia
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...refField}
                                    placeholder="Nº referencia"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {field.method === 'cash' &&
                        field.changeAmount !== undefined &&
                        field.changeAmount > 0 && (
                          <div className="text-center p-2 bg-green-50 rounded border">
                            <p className="text-sm font-medium text-green-800">
                              Cambio: {formatCurrency(field.changeAmount)}
                            </p>
                          </div>
                        )}
                    </div>
                  </Card>
                ))}

                {totals.balance !== 0 && (
                  <div
                    className={`text-center p-2 rounded border ${
                      totals.balance > 0
                        ? 'bg-red-50 text-red-800'
                        : 'bg-yellow-50 text-yellow-800'
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {totals.balance > 0 ? 'Falta: ' : 'Sobra: '}
                      {formatCurrency(Math.abs(totals.balance))}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    itemFields.length === 0 ||
                    Math.abs(totals.balance) > 0.01 ||
                    createSale.isPending
                  }
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  {createSale.isPending ? 'Procesando...' : 'Procesar Venta'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    form.reset({ items: [], payments: [] })
                  }}
                >
                  Limpiar Carrito
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default POSInterface

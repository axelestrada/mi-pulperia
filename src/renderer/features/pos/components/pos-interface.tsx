import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'

import { Card, CardContent } from '../../../components/ui/card'
import { Alert, AlertDescription } from '../../../components/ui/alert'

import {
  useAvailablePresentations,
  useSearchByCode,
  useCreatePOSSale,
  POSPresentation,
  CreatePOSSaleInput,
} from '../../../hooks/use-pos'
import { useCurrentOpenSession } from '../../../hooks/use-cash-sessions'
import { formatCurrency } from '../../../../shared/utils/formatCurrency'
import { Divider, Input, Button } from '@heroui/react'
import { PosChargeModal } from './pos-charge-modal'

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
  method: z.enum(['cash', 'credit']),
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

export type POSFormData = z.infer<typeof posFormSchema>

interface POSInterfaceProps {
  onSaleComplete?: (saleId: number) => void
}

export const POSInterface: React.FC<POSInterfaceProps> = ({
  onSaleComplete,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>()
  const [barcodeInput, setBarcodeInput] = useState('')

  // Queries
  const { data: openSession } = useCurrentOpenSession()
  const { data: presentationsData } = useAvailablePresentations({
    search: searchTerm,
    categoryId: selectedCategory,
    page: 1,
    limit: 50,
  })

  const { data: searchResult } = useSearchByCode(barcodeInput)

  // Mutations
  const createSale = useCreatePOSSale()

  // Form
  const form = useForm<POSFormData>({
    resolver: zodResolver(posFormSchema),
    defaultValues: {
      items: [],
      payments: [
        {
          method: 'cash',
          amount: 0,
          receivedAmount: 0,
          changeAmount: 0,
        },
      ],
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

    const taxAmount = 0
    const total = subtotal + taxAmount

    const totalPayments = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    )
    const totalCash = payments
      .filter(p => p.method === 'cash')
      .reduce((sum, p) => sum + (p.receivedAmount || 0), 0)

    const totalChange = payments
      .filter(p => p.method !== 'cash')
      .reduce((sum, p) => sum + p.amount, 0)

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
  const onSubmit = async (data: POSFormData, callback?: () => void) => {
    console.log('Submitting sale', data)
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

      callback?.()

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
    <div className="grid grid-cols-[2fr_1fr] gap-6 overflow-visible min-h-full">
      <div className="space-y-4 flex-col flex">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar producto, SKU o código de barras..."
            startContent={<IconSolarMinimalisticMagniferLineDuotone />}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />

          <CategorySelect
            value={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 overflow-y-auto -m-4 p-4">
          {presentationsData?.data?.map((presentation: POSPresentation) => (
            <PosItem
              key={'pos-presentation-' + presentation.id}
              presentation={presentation}
              onClick={addToCart}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4 flex-col flex flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconSolarCartLarge2LineDuotone className="size-7" />
            <span className="font-semibold">Carrito de compras</span>
          </div>

          <div className="flex gap-2">
            <Button variant="bordered">
              <IconSolarPauseCircleLineDuotone className="size-5" />
              Pausadas
            </Button>
            <Button isIconOnly variant="bordered">
              <IconSolarPauseLineDuotone className="size-4" />
            </Button>
          </div>
        </div>

        <Divider />

        <div className="flex-1 flex flex-col">
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(data => {
                onSubmit(data)
              })}
              className="flex flex-col flex-1"
            >
              <div className="flex-1 flex flex-col mb-4">
                {itemFields.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 flex-1 flex items-center justify-center flex-col">
                    <IconSolarCartCrossLineDuotone className="size-12 mb-2" />
                    <b className="text-small">Carrito vacío</b>
                    <p className="text-xs text-default-500">
                      Agregue productos para comenzar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {itemFields.map((field, index) => {
                      const presentation = presentationsData?.data?.find(
                        p => p.id === field.presentationId
                      )
                      if (!presentation) return null

                      const itemTotal =
                        field.quantity * field.unitPrice - (field.discount || 0)

                      const title = presentation.isBase
                        ? presentation.productName
                        : `${presentation.productName} (${presentation.name})`

                      return (
                        <PosCartItem
                          key={field.id}
                          title={title}
                          image={presentation.image}
                          quantity={field.quantity}
                          unitPrice={field.unitPrice}
                          itemTotal={itemTotal}
                          onQuantityChange={value => {
                            updateItem(index, {
                              ...field,
                              quantity: value,
                            })
                          }}
                          onRemove={() => {
                            removeItem(index)
                          }}
                        />
                      )
                    })}
                  </div>
                )}
              </div>

              <Divider />

              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <p>Subtotal:</p>
                    <p className="text-default-500">
                      {formatCurrency(fromCents(totals.subtotal))}
                    </p>
                  </div>

                  <Divider />

                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(fromCents(totals.total))}</span>
                  </div>

                  <div className="flex justify-between text-small text-default-500">
                    <span>Artículos:</span>
                    <span>{totals.totalItems}</span>
                  </div>
                </div>

                <Divider />

                <div className="space-y-3">
                  <PosChargeModal
                    total={totals.total}
                    onSubmit={callback => {
                      console.log(form.formState.errors)

                      form.handleSubmit(data => {
                        onSubmit(data, callback)
                      })
                    }}
                  />

                  <Button
                    variant="light"
                    fullWidth
                    onPress={() => {
                      form.reset({ items: [], payments: [] })
                    }}
                  >
                    Limpiar Carrito
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  )
}

export default POSInterface

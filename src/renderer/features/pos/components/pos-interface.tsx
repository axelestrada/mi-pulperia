import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Form,
  Input,
  Select,
  type SelectedItems,
  SelectItem,
  useDisclosure,
} from '@heroui/react'

import { zodResolver } from '@hookform/resolvers/zod'

import React, { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { AutoSizer, Grid } from 'react-virtualized'
import { z } from 'zod'
import AvatarMale from '@/assets/images/avatar-male.png'
import {
  type Customer,
  useActiveCustomersForSelection,
} from '@/hooks/use-customers'
import { formatCurrency } from '../../../../shared/utils/formatCurrency'
import { useCurrentOpenSession } from '../../../hooks/use-cash-sessions'
import {
  type CreatePOSSaleInput,
  type POSPresentation,
  useAvailablePresentations,
  useCreatePOSSale,
  useSearchByCode,
} from '../../../hooks/use-pos'
import { PosChargeModal } from './pos-charge-modal'

// Form validation schemas
const saleItemSchema = z.object({
  presentationId: z.number().min(1, 'Required'),
  quantity: z.number().min(0.01, 'Must be at least 0.01'),
  image: z.string().optional().nullable(),
  title: z.string().min(1, 'Required'),
  unitPrice: z.number().min(0, 'Cannot be negative'),
  discount: z.number().min(0, 'Cannot be negative').optional(),
  discountType: z.enum(['fixed', 'percentage']).optional(),
  notes: z.string().optional(),
})

const paymentMethodSchema = z.object({
  method: z.enum(['cash', 'credit']),
  amount: z.coerce
    .number({
      error: 'Ingrese un monto válido',
    })
    .transform(v => toCents(v)),
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

export type POSFormInput = z.input<typeof posFormSchema>
export type POSFormData = z.infer<typeof posFormSchema>

interface POSInterfaceProps {
  onSaleComplete?: (saleId: number) => void
}

export const POSInterface: React.FC<POSInterfaceProps> = ({
  onSaleComplete,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const debounceSearchTerm = useDebounce(searchTerm)

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>()

  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const navigate = useNavigate()
  const { data: customers } = useActiveCustomersForSelection()

  const {
    isOpen: isChargeModalOpen,
    onOpen: onOpenChargeModal,
    onClose: onCloseChargeModal,
    onOpenChange: onChargeModalOpenChange,
  } = useDisclosure()

  // Queries
  const { data: openSession } = useCurrentOpenSession()
  const presentationsData = useAvailablePresentations({
    search: debounceSearchTerm,
    categoryId: selectedCategory,
    page: 1,
    limit: 30,
  })

  const createSale = useCreatePOSSale()
  const searchByCode = useSearchByCode()

  // Form
  const form = useForm<POSFormInput, unknown, POSFormData>({
    resolver: zodResolver(posFormSchema),
    defaultValues: {
      items: [],
      payments: [
        {
          method: 'cash',
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
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    )
    const totalCash = payments
      .filter(p => p.method === 'cash')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const totalChange = payments
      .filter(p => p.method !== 'cash')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

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
  const addToCart = useCallback(
    (presentation: POSPresentation, quantity: number = 1) => {
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
        const title = presentation.isBase
          ? presentation.productName
          : `${presentation.productName} (${presentation.name})`

        appendItem({
          presentationId: presentation.id,
          quantity,
          title,
          image: presentation.image,
          unitPrice: presentation.salePrice,
          discount: 0,
          discountType: 'fixed',
          notes: '',
        })
      }
    },
    [appendItem, itemFields, updateItem]
  )

  // Submit sale
  const onSubmit = async (data: POSFormData) => {
    if (createSale.isPending) return

    if (!openSession) {
      toast.error('No hay una caja abierta')
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

      form.reset({
        items: [],
        payments: [],
      })

      onCloseChargeModal()
      toast.success('Venta realizada exitosamente', {
        description: `Venta #${result.sale?.id || result.id}`,
      })
      onSaleComplete?.(result.sale?.id || result.id)
    } catch (error) {
      console.error('Error creating sale:', error)
      toast.error('Error al procesar la venta: ' + (error as Error).message)
    }
  }

  useEffect(() => {
    const onBarcodeScanned = async (code: string) => {
      const presentation = await searchByCode.mutateAsync(code)

      if (presentation) {
        addToCart(presentation)

        toast.success('Producto agregado: ' + presentation.productName)
      } else {
        toast.error('Producto no encontrado para el código de barras: ' + code)
      }
    }

    let buffer = ''
    let lastKeyTime = Date.now()

    const onKeyDown = (e: KeyboardEvent) => {
      const now = Date.now()

      if (now - lastKeyTime > 50) buffer = ''

      lastKeyTime = now

      if (e.key === 'Enter') {
        if (buffer.length > 3) {
          onBarcodeScanned(buffer)
        }
        buffer = ''
        return
      }

      buffer += e.key
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [addToCart, presentationsData, searchByCode])

  useEffect(() => {
    const currentLoadMore = loadMoreRef.current

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && presentationsData?.hasNextPage) {
          presentationsData.fetchNextPage()
        }
      },
      {
        rootMargin: '100px',
      }
    )

    if (currentLoadMore) observer.observe(currentLoadMore)

    return () => {
      if (currentLoadMore) observer.unobserve(currentLoadMore)
    }
  }, [presentationsData])

  if (!openSession) {
    return (
      <div className="grid place-items-center h-[calc(100dvh-84px)]">
        <Card isBlurred className="p-4 pb-0">
          <CardHeader className="flex-col items-center gap-2">
            <IconSolarShieldWarningLineDuotone className="size-12 text-warning" />

            <h2 className="text-lg font-semibold">No hay caja abierta</h2>
          </CardHeader>
          <CardBody className="text-center text-default-500">
            Para comenzar a vender, primero debes abrir una caja.
          </CardBody>
          <CardFooter className="justify-center p-3 pb-7">
            <Button
              onPress={() => navigate('/cash')}
              color="primary"
              variant="shadow"
            >
              Abrir Caja
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[1fr_22rem] gap-6 max-h-[calc(100dvh-84px)]">
      <div className="flex-col flex h-[calc(100dvh-84px)]">
        <div className="grid items-center grid-cols-[1fr_auto] gap-3 mb-4">
          <Input
            placeholder="Buscar producto, SKU o código de barras..."
            startContent={<IconSolarMinimalisticMagniferLineDuotone />}
            value={searchTerm}
            onValueChange={setSearchTerm}
            fullWidth
          />

          <CategorySelect
            fullWidth={false}
            value={selectedCategory}
            placeholder="Todas las categorías"
            onSelectionChange={key => setSelectedCategory(Number(key))}
          />
        </div>

        <div className="flex-1">
          <AutoSizer>
            {({ width, height }) => {
              const allItems =
                presentationsData?.data?.pages.flatMap(p => p.data) ?? []

              const minColumnWidth = 140
              const columnCount = Math.floor(width / minColumnWidth) || 1
              const columnWidth = Math.floor(width / columnCount)

              const rowHeight = (rowIndex: number) => {
                const itemIndex = rowIndex * columnCount
                const item = allItems[itemIndex]
                return item?.customHeight ?? 215
              }

              const rowCount = Math.ceil(allItems.length / columnCount)

              return (
                <Grid
                  width={width}
                  height={height}
                  columnWidth={columnWidth}
                  rowHeight={({ index }) => rowHeight(index)}
                  columnCount={columnCount}
                  rowCount={rowCount}
                  overscanRowCount={3}
                  cellRenderer={({ columnIndex, rowIndex, key, style }) => {
                    const itemIndex = rowIndex * columnCount + columnIndex
                    const item = allItems[itemIndex]
                    if (!item) return null

                    return (
                      <div key={key} style={{ ...style, padding: 8 }}>
                        <PosItem presentation={item} onClick={addToCart} />
                      </div>
                    )
                  }}
                  onSectionRendered={({ rowStopIndex }) => {
                    if (
                      rowStopIndex >= rowCount - 1 &&
                      presentationsData?.hasNextPage
                    ) {
                      presentationsData.fetchNextPage()
                    }
                  }}
                />
              )
            }}
          </AutoSizer>
        </div>
      </div>

      <div className="space-y-4 flex-col flex h-[calc(100dvh-84px)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconSolarCartLarge2LineDuotone className="size-7" />
            <span className="font-semibold">Carrito</span>
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

        <div className="flex items-center justify-between">
          <Select
            classNames={{
              trigger: 'h-12',
            }}
            items={customers}
            placeholder="Seleccionar cliente"
            renderValue={(items: SelectedItems<Customer>) => {
              return items.map(item => (
                <div key={item.key} className="flex items-center gap-2">
                  <Avatar
                    alt={item.data?.name}
                    className="shrink-0"
                    size="sm"
                    src={AvatarMale}
                  />
                  <div className="flex flex-col">
                    <span>{item.data?.name}</span>
                    <span className="text-default-500 text-tiny">
                      {formatCurrency(
                        fromCents(
                          (item.data?.creditLimit || 0) -
                            (item.data?.currentBalance || 0)
                        )
                      )}
                    </span>
                  </div>
                </div>
              ))
            }}
          >
            {user => (
              <SelectItem key={user.id} textValue={user.name}>
                <div className="flex gap-2 items-center">
                  <Avatar
                    alt={user.name}
                    className="shrink-0"
                    size="sm"
                    src={AvatarMale}
                  />
                  <div className="flex flex-col">
                    <span className="text-small">{user.name}</span>
                    <span className="text-tiny text-default-400">
                      {formatCurrency(
                        fromCents(user.creditLimit - (user.currentBalance || 0))
                      )}
                    </span>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>
        </div>

        <Divider />

        <div className="flex-1 flex flex-col w-full">
          <FormProvider {...form}>
            <Form className="flex flex-col h-[calc(100dvh-220px)] w-full">
              <div className="flex flex-col mb-4 flex-1 w-full overflow-y-auto h-full">
                {itemFields.length === 0 ? (
                  <div className="text-center py-8 flex-1 flex items-center justify-center flex-col">
                    <IconSolarCartCrossLineDuotone className="size-12 mb-2" />
                    <b className="text-small">Carrito vacío</b>
                    <p className="text-xs text-default-500">
                      Agregue productos para comenzar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {itemFields.map((field, index) => {
                      const itemTotal =
                        field.quantity * field.unitPrice - (field.discount || 0)

                      return (
                        <PosCartItem
                          key={field.id}
                          title={field.title}
                          image={field.image}
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

              <div className="space-y-4 mt-2 w-full">
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
                    onSubmit={form.handleSubmit(onSubmit)}
                    isOpen={isChargeModalOpen}
                    onClose={onCloseChargeModal}
                    onOpenChange={onChargeModalOpenChange}
                    onOpen={onOpenChargeModal}
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
            </Form>
          </FormProvider>
        </div>
      </div>
    </div>
  )
}

export default POSInterface

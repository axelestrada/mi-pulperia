import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'

import { Card, CardContent } from '../../../components/ui/card'
import { Alert, AlertDescription } from '../../../components/ui/alert'

import {
  useAvailablePresentations,
  useCreatePOSSale,
  POSPresentation,
  CreatePOSSaleInput,
} from '../../../hooks/use-pos'
import { useCurrentOpenSession } from '../../../hooks/use-cash-sessions'
import { formatCurrency } from '../../../../shared/utils/formatCurrency'
import {
  Divider,
  Input,
  Button,
  Select,
  SelectItem,
  SelectedItems,
  Avatar,
  Form,
  useDisclosure,
} from '@heroui/react'
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

export const users = [
  {
    id: 1,
    name: 'Tony Reichert',
    role: 'CEO',
    team: 'Management',
    status: 'active',
    age: '29',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/1.png',
    email: 'tony.reichert@example.com',
  },
  {
    id: 2,
    name: 'Zoey Lang',
    role: 'Tech Lead',
    team: 'Development',
    status: 'paused',
    age: '25',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/1.png',
    email: 'zoey.lang@example.com',
  },
  {
    id: 3,
    name: 'Jane Fisher',
    role: 'Sr. Dev',
    team: 'Development',
    status: 'active',
    age: '22',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/2.png',
    email: 'jane.fisher@example.com',
  },
  {
    id: 4,
    name: 'William Howard',
    role: 'C.M.',
    team: 'Marketing',
    status: 'vacation',
    age: '28',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png',
    email: 'william.howard@example.com',
  },
  {
    id: 5,
    name: 'Kristen Copper',
    role: 'S. Manager',
    team: 'Sales',
    status: 'active',
    age: '24',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/3.png',
    email: 'kristen.cooper@example.com',
  },
  {
    id: 6,
    name: 'Brian Kim',
    role: 'P. Manager',
    team: 'Management',
    age: '29',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/3.png',
    email: 'brian.kim@example.com',
    status: 'active',
  },
  {
    id: 7,
    name: 'Michael Hunt',
    role: 'Designer',
    team: 'Design',
    status: 'paused',
    age: '27',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/4.png',
    email: 'michael.hunt@example.com',
  },
  {
    id: 8,
    name: 'Samantha Brooks',
    role: 'HR Manager',
    team: 'HR',
    status: 'active',
    age: '31',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/4.png',
    email: 'samantha.brooks@example.com',
  },
  {
    id: 9,
    name: 'Frank Harrison',
    role: 'F. Manager',
    team: 'Finance',
    status: 'vacation',
    age: '33',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/5.png',
    email: 'frank.harrison@example.com',
  },
  {
    id: 10,
    name: 'Emma Adams',
    role: 'Ops Manager',
    team: 'Operations',
    status: 'active',
    age: '35',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/5.png',
    email: 'emma.adams@example.com',
  },
  {
    id: 11,
    name: 'Brandon Stevens',
    role: 'Jr. Dev',
    team: 'Development',
    status: 'active',
    age: '22',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/7.png',
    email: 'brandon.stevens@example.com',
  },
  {
    id: 12,
    name: 'Megan Richards',
    role: 'P. Manager',
    team: 'Product',
    status: 'paused',
    age: '28',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/7.png',
    email: 'megan.richards@example.com',
  },
  {
    id: 13,
    name: 'Oliver Scott',
    role: 'S. Manager',
    team: 'Security',
    status: 'active',
    age: '37',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/8.png',
    email: 'oliver.scott@example.com',
  },
  {
    id: 14,
    name: 'Grace Allen',
    role: 'M. Specialist',
    team: 'Marketing',
    status: 'active',
    age: '30',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/8.png',
    email: 'grace.allen@example.com',
  },
  {
    id: 15,
    name: 'Noah Carter',
    role: 'IT Specialist',
    team: 'I. Technology',
    status: 'paused',
    age: '31',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/9.png',
    email: 'noah.carter@example.com',
  },
  {
    id: 16,
    name: 'Ava Perez',
    role: 'Manager',
    team: 'Sales',
    status: 'active',
    age: '29',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/9.png',
    email: 'ava.perez@example.com',
  },
  {
    id: 17,
    name: 'Liam Johnson',
    role: 'Data Analyst',
    team: 'Analysis',
    status: 'active',
    age: '28',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/11.png',
    email: 'liam.johnson@example.com',
  },
  {
    id: 18,
    name: 'Sophia Taylor',
    role: 'QA Analyst',
    team: 'Testing',
    status: 'active',
    age: '27',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/11.png',
    email: 'sophia.taylor@example.com',
  },
  {
    id: 19,
    name: 'Lucas Harris',
    role: 'Administrator',
    team: 'Information Technology',
    status: 'paused',
    age: '32',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/12.png',
    email: 'lucas.harris@example.com',
  },
  {
    id: 20,
    name: 'Mia Robinson',
    role: 'Coordinator',
    team: 'Operations',
    status: 'active',
    age: '26',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/12.png',
    email: 'mia.robinson@example.com',
  },
]

type User = {
  id: number
  name: string
  role: string
  team: string
  status: string
  age: string
  avatar: string
  email: string
}

export const POSInterface: React.FC<POSInterfaceProps> = ({
  onSaleComplete,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>()

  const formRef = React.useRef<HTMLFormElement>(null)

  const {
    isOpen: isChargeModalOpen,
    onOpen: onOpenChargeModal,
    onClose: onCloseChargeModal,
      onOpenChange: onChargeModalOpenChange,
  } = useDisclosure()

  // Queries
  const { data: openSession } = useCurrentOpenSession()
  const { data: presentationsData } = useAvailablePresentations({
    search: searchTerm,
    categoryId: selectedCategory,
    page: 1,
    limit: 50,
  })

  const createSale = useCreatePOSSale()

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
  }

  // Submit sale
  const onSubmit = async (data: POSFormData) => {
    console.log('Submitting sale', data)
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
      onSaleComplete?.(result.sale?.id || result.id)
    } catch (error) {
      console.error('Error creating sale:', error)
      toast.error('Error al procesar la venta: ' + (error as Error).message)
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
    <div className="grid grid-cols-[2fr_1fr] gap-6 max-h-[calc(100dvh-84px)]">
      <div className="space-y-4 flex-col flex h-[calc(100dvh-84px)]">
        <div className="grid items-center grid-cols-[1fr_auto] gap-3">
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

        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 overflow-y-auto -mx-4 px-4 py-2">
          {presentationsData?.data?.map((presentation: POSPresentation) => (
            <PosItem
              key={'pos-presentation-' + presentation.id}
              presentation={presentation}
              onClick={addToCart}
            />
          ))}
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
            items={users}
            placeholder="Seleccionar cliente"
            renderValue={(items: SelectedItems<User>) => {
              return items.map(item => (
                <div key={item.key} className="flex items-center gap-2">
                  <Avatar
                    alt={item.data?.name}
                    className="shrink-0"
                    size="sm"
                    src={item.data?.avatar}
                  />
                  <div className="flex flex-col">
                    <span>{item.data?.name}</span>
                    <span className="text-default-500 text-tiny">
                      ({item.data?.email})
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
                    src={user.avatar}
                  />
                  <div className="flex flex-col">
                    <span className="text-small">{user.name}</span>
                    <span className="text-tiny text-default-400">
                      {user.email}
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
            <Form
              ref={formRef}
              onSubmit={e => {
                e.preventDefault()
                console.log('form', form)
                form.handleSubmit(onSubmit)()
              }}
              className="flex flex-col h-[calc(100dvh-220px)] w-full"
            >
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
                    onSubmit={() => {
                      formRef.current?.requestSubmit()
                    }}
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

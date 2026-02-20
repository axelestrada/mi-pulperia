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
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Select,
  type SelectedItems,
  SelectItem,
  Spinner,
  Textarea,
  useDisclosure,
} from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import useFormPersist from 'react-hook-form-persist'
import { AutoSizer, Grid } from 'react-virtualized'
import { z } from 'zod'
import AvatarMale from '@/assets/images/avatar-male.png'
import {
  type Customer,
  useActiveCustomersForSelection,
} from '@/hooks/use-customers'
import { formatCurrency } from '../../../../shared/utils/formatCurrency'
import {
  fromUnitPrecision,
  toUnitPrecision,
} from '../../../../shared/utils/quantity'
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
  quantity: z
    .number()
    .min(0.000001, 'Must be at least 1')
    .transform(v => Math.max(1, Math.round(v))),
  unitPrecision: z.number().int().min(1, 'Required').catch(1),
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

const calculateItemTotal = (
  quantity: number,
  unitPrecision: number,
  unitPrice: number,
  discount = 0,
  discountType: 'fixed' | 'percentage' = 'fixed'
) => {
  const displayQuantity = fromUnitPrecision(quantity, unitPrecision)
  const baseTotal = displayQuantity * unitPrice
  const normalizedDiscount = Math.max(0, discount || 0)

  let discountedTotal = baseTotal

  if (normalizedDiscount > 0) {
    if (discountType === 'percentage') {
      const percentageDiscount = Math.max(0, Math.min(100, normalizedDiscount))
      discountedTotal = baseTotal * (1 - percentageDiscount / 100)
    } else {
      discountedTotal = Math.max(0, baseTotal - normalizedDiscount)
    }
  }

  return Math.max(
    0,
    toCents(
      unitPrecision === 1
        ? fromCents(discountedTotal)
        : Math.ceil(fromCents(discountedTotal))
    )
  )
}

const normalizeDiscountValue = (
  value: number | undefined,
  discountType: 'fixed' | 'percentage'
) => {
  if (!value || value <= 0) return 0
  return discountType === 'fixed' ? toCents(value) : value
}

const POS_PAUSED_SALES_KEY = 'POS_PAUSED_SALES'

type PausedPOSSale = {
  id: string
  createdAt: string
  customerId?: number
  items: POSFormInput['items']
  payments: POSFormInput['payments']
  notes?: string
  saleDiscount: number
  saleDiscountType: 'fixed' | 'percentage'
}

type ConfirmDialogOptions = {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'primary' | 'danger'
}

type ResumeConflictChoice = 'replace' | 'combine' | 'cancel'

interface POSInterfaceProps {
  onSaleComplete?: (saleId: number) => void
}

export const POSInterface: React.FC<POSInterfaceProps> = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const debounceSearchTerm = useDebounce(searchTerm)

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>()

  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const cartItemsRef = useRef<HTMLDivElement | null>(null)
  const mainRef = useRef<HTMLDivElement | null>(null)
  const previousItemCountRef = useRef(0)
  const hasInitializedCartScrollRef = useRef(false)

  const navigate = useNavigate()
  const { data: customers } = useActiveCustomersForSelection()

  const {
    isOpen: isChargeModalOpen,
    onOpen: onOpenChargeModal,
    onClose: onCloseChargeModal,
    onOpenChange: onChargeModalOpenChange,
  } = useDisclosure()
  const {
    isOpen: isSaleDiscountModalOpen,
    onOpen: onOpenSaleDiscountModal,
    onOpenChange: onSaleDiscountModalOpenChange,
  } = useDisclosure()
  const {
    isOpen: isPausedSalesModalOpen,
    onOpen: onOpenPausedSalesModal,
    onOpenChange: onPausedSalesModalOpenChange,
  } = useDisclosure()
  const {
    isOpen: isSaleNotesModalOpen,
    onOpen: onOpenSaleNotesModal,
    onOpenChange: onSaleNotesModalOpenChange,
  } = useDisclosure()
  const {
    isOpen: isItemDiscountModalOpen,
    onOpen: onOpenItemDiscountModal,
    onClose: onCloseItemDiscountModal,
    onOpenChange: onItemDiscountModalOpenChange,
  } = useDisclosure()
  const {
    isOpen: isItemNotesModalOpen,
    onOpen: onOpenItemNotesModal,
    onClose: onCloseItemNotesModal,
    onOpenChange: onItemNotesModalOpenChange,
  } = useDisclosure()

  const [saleDiscount, setSaleDiscount] = useState(0)
  const [saleDiscountType, setSaleDiscountType] = useState<
    'fixed' | 'percentage'
  >('fixed')
  const [saleNotesDraft, setSaleNotesDraft] = useState('')
  const [pausedSales, setPausedSales] = useState<PausedPOSSale[]>([])
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    confirmColor: 'primary' | 'danger'
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    confirmColor: 'primary',
  })
  const [resumeConflictDialogOpen, setResumeConflictDialogOpen] =
    useState(false)
  const confirmResolverRef = useRef<((confirmed: boolean) => void) | null>(null)
  const resumeConflictResolverRef = useRef<
    ((choice: ResumeConflictChoice) => void) | null
  >(null)

  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    null
  )
  const [itemDiscountDraft, setItemDiscountDraft] = useState(0)
  const [itemDiscountTypeDraft, setItemDiscountTypeDraft] = useState<
    'fixed' | 'percentage'
  >('fixed')
  const [itemNotesDraft, setItemNotesDraft] = useState('')

  // Queries
  const { data: openSession, isLoading } = useCurrentOpenSession()
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

  const persistedForm = useFormPersist('POS_FORM', {
    watch: form.watch,
    setValue: form.setValue,
    storage: window.localStorage,
    exclude: ['payments'],
  })

  const customerId = form.watch('customerId')

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
    update: updateItem,
  } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const persistPausedSales = useCallback((sales: PausedPOSSale[]) => {
    setPausedSales(sales)
    window.localStorage.setItem(POS_PAUSED_SALES_KEY, JSON.stringify(sales))
  }, [])

  useEffect(() => {
    try {
      const rawPausedSales = window.localStorage.getItem(POS_PAUSED_SALES_KEY)
      if (!rawPausedSales) return

      const parsedPausedSales = JSON.parse(rawPausedSales)
      if (!Array.isArray(parsedPausedSales)) return

      const validPausedSales = parsedPausedSales.filter(
        sale =>
          sale && Array.isArray(sale.items) && Array.isArray(sale.payments)
      ) as PausedPOSSale[]

      setPausedSales(validPausedSales)
    } catch (error) {
      console.error('Error reading paused sales:', error)
      window.localStorage.removeItem(POS_PAUSED_SALES_KEY)
    }
  }, [])

  const clearCurrentSale = useCallback(() => {
    form.reset({
      items: [],
      payments: [
        {
          method: 'cash',
          amount: 0,
        },
      ],
    })

    persistedForm.clear()
    setSaleDiscount(0)
    setSaleDiscountType('fixed')
    form.setValue('notes', '')
  }, [form, persistedForm])

  useEffect(() => {
    const currentItemCount = itemFields.length

    if (!hasInitializedCartScrollRef.current) {
      previousItemCountRef.current = currentItemCount
      hasInitializedCartScrollRef.current = true
      return
    }

    if (
      currentItemCount !== previousItemCountRef.current &&
      cartItemsRef.current
    ) {
      cartItemsRef.current.scrollTo({
        top: cartItemsRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }

    previousItemCountRef.current = currentItemCount
  }, [itemFields.length])

  // Calculate totals
  const items = form.watch('items')
  const payments = form.watch('payments')

  const totals = React.useMemo(() => {
    let subtotal = 0
    let itemDiscountAmount = 0
    let totalItems = 0

    items.forEach(item => {
      const displayQuantity = fromUnitPrecision(
        item.quantity,
        item.unitPrecision
      )
      const baseTotal = displayQuantity * item.unitPrice
      const itemTotal = calculateItemTotal(
        item.quantity,
        item.unitPrecision,
        item.unitPrice,
        item.discount,
        item.discountType
      )

      subtotal += itemTotal
      itemDiscountAmount += Math.max(0, baseTotal - itemTotal)
      totalItems += displayQuantity
    })

    const rawGlobalDiscount =
      saleDiscountType === 'percentage'
        ? subtotal * (saleDiscount / 100)
        : saleDiscount
    const globalDiscount = Math.max(0, Math.min(subtotal, rawGlobalDiscount))

    const taxAmount = 0
    const total = Math.max(0, subtotal - globalDiscount + taxAmount)

    const totalPayments = payments.reduce(
      (sum, payment) => sum + toCents(Number(payment.amount || 0)),
      0
    )
    const totalCash = payments
      .filter(p => p.method === 'cash')
      .reduce((sum, p) => sum + toCents(Number(p.amount || 0)), 0)

    const totalChange = payments
      .filter(p => p.method !== 'cash')
      .reduce((sum, p) => sum + toCents(Number(p.amount || 0)), 0)

    return {
      subtotal: Math.round(subtotal),
      discount: Math.round(itemDiscountAmount + globalDiscount),
      globalDiscount: Math.round(globalDiscount),
      taxAmount: Math.round(taxAmount),
      total: Math.round(total),
      totalItems,
      totalPayments: Math.round(totalPayments),
      totalCash: Math.round(totalCash),
      totalChange: Math.round(totalChange),
      balance: Math.round(total - totalPayments),
    }
  }, [items, payments, saleDiscount, saleDiscountType])

  const addToCart = useCallback(
    (presentation: POSPresentation, quantity: number = 1) => {
      const precisionQuantity = toUnitPrecision(
        quantity,
        presentation.unitPrecision
      )

      const existingIndex = itemFields.findIndex(
        field => field.presentationId === presentation.id
      )

      const title = presentation.isBase
        ? presentation.productName
        : `${presentation.productName} (${presentation.name})`

      if (existingIndex >= 0) {
        const existingItem = itemFields[existingIndex]
        updateItem(existingIndex, {
          ...existingItem,
          quantity: existingItem.quantity + precisionQuantity,
        })
      } else {
        appendItem({
          presentationId: presentation.id,
          quantity: precisionQuantity,
          unitPrecision: presentation.unitPrecision,
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

  const calculatePausedSaleTotal = useCallback((sale: PausedPOSSale) => {
    const subtotal = sale.items.reduce((sum, item) => {
      return (
        sum +
        calculateItemTotal(
          item.quantity,
          item.unitPrecision,
          item.unitPrice,
          item.discount,
          item.discountType
        )
      )
    }, 0)

    const rawDiscount =
      sale.saleDiscountType === 'percentage'
        ? subtotal * (sale.saleDiscount / 100)
        : sale.saleDiscount
    const discountAmount = Math.max(0, Math.min(subtotal, rawDiscount))
    return Math.max(0, subtotal - discountAmount)
  }, [])

  const getPausedSaleItemsCount = useCallback((sale: PausedPOSSale) => {
    return sale.items.reduce((sum, item) => {
      return sum + fromUnitPrecision(item.quantity, item.unitPrecision)
    }, 0)
  }, [])

  const getCustomerNameById = useCallback(
    (id?: number) => {
      if (!id) return 'Cliente Final'
      return customers?.find(customer => customer.id === id)?.name || `#${id}`
    },
    [customers]
  )

  const pauseCurrentSale = useCallback(() => {
    const currentItems = form.getValues('items')
    if (!currentItems.length) {
      sileo.error({
        title: 'No hay productos para pausar.',
        description: 'Agrega al menos un producto antes de pausar la venta.',
      })
      return
    }

    const currentSale: PausedPOSSale = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
      customerId: form.getValues('customerId'),
      items: currentItems,
      payments: form.getValues('payments') || [],
      notes: form.getValues('notes') || '',
      saleDiscount,
      saleDiscountType,
    }

    persistPausedSales([currentSale, ...pausedSales])
    clearCurrentSale()

    sileo.success({
      title: 'Venta pausada exitosamente.',
      description: 'La venta fue guardada en la lista de ventas pausadas.',
    })
  }, [
    clearCurrentSale,
    form,
    pausedSales,
    persistPausedSales,
    saleDiscount,
    saleDiscountType,
  ])

  const removePausedSale = useCallback(
    (saleId: string) => {
      const nextPausedSales = pausedSales.filter(sale => sale.id !== saleId)
      persistPausedSales(nextPausedSales)
    },
    [pausedSales, persistPausedSales]
  )

  const confirmAction = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>(resolve => {
      confirmResolverRef.current = resolve
      setConfirmDialog({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        confirmColor: options.confirmColor || 'primary',
      })
    })
  }, [])

  const closeConfirmDialog = useCallback((confirmed: boolean) => {
    setConfirmDialog(previous => ({ ...previous, isOpen: false }))
    confirmResolverRef.current?.(confirmed)
    confirmResolverRef.current = null
  }, [])

  const confirmClearCurrentSale = useCallback(async () => {
    const hasActiveSale = (form.getValues('items') || []).length > 0
    if (!hasActiveSale) {
      clearCurrentSale()
      return
    }

    const confirmed = await confirmAction({
      title: 'Limpiar carrito',
      message:
        'Esta accion eliminara los productos del carrito actual. Deseas continuar?',
      confirmText: 'Si, limpiar',
      cancelText: 'No',
      confirmColor: 'danger',
    })

    if (!confirmed) return
    clearCurrentSale()
  }, [clearCurrentSale, confirmAction, form])

  const confirmRemovePausedSale = useCallback(
    async (saleId: string) => {
      const confirmed = await confirmAction({
        title: 'Eliminar venta pausada',
        message:
          'Esta accion eliminara la venta pausada seleccionada. Deseas continuar?',
        confirmText: 'Si, eliminar',
        cancelText: 'No',
        confirmColor: 'danger',
      })

      if (!confirmed) return
      removePausedSale(saleId)
    },
    [confirmAction, removePausedSale]
  )

  const askResumeConflictChoice = useCallback(() => {
    return new Promise<ResumeConflictChoice>(resolve => {
      resumeConflictResolverRef.current = resolve
      setResumeConflictDialogOpen(true)
    })
  }, [])

  const closeResumeConflictDialog = useCallback(
    (choice: ResumeConflictChoice) => {
      setResumeConflictDialogOpen(false)
      resumeConflictResolverRef.current?.(choice)
      resumeConflictResolverRef.current = null
    },
    []
  )

  const resumePausedSale = useCallback(
    async (saleId: string) => {
      const pausedSale = pausedSales.find(sale => sale.id === saleId)
      if (!pausedSale) return false

      const activeItems = form.getValues('items') || []
      const hasActiveSale = activeItems.length > 0

      let choice: ResumeConflictChoice = 'replace'

      if (hasActiveSale) {
        choice = await askResumeConflictChoice()
        if (choice === 'cancel') return false
      }

      if (choice === 'combine') {
        const currentCustomerId = form.getValues('customerId')
        const currentNotes = form.getValues('notes') || ''
        const mergedNotes = [currentNotes, pausedSale.notes || '']
          .map(note => note.trim())
          .filter(Boolean)
          .join('\n')

        const mergedItems = activeItems.map(item => ({ ...item }))

        pausedSale.items.forEach(pausedItem => {
          const existingIndex = mergedItems.findIndex(
            item => item.presentationId === pausedItem.presentationId
          )

          if (existingIndex < 0) {
            mergedItems.push({ ...pausedItem })
            return
          }

          const existingItem = mergedItems[existingIndex]
          mergedItems[existingIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + pausedItem.quantity,
            notes: [existingItem.notes, pausedItem.notes]
              .map(note => (note || '').trim())
              .filter(Boolean)
              .join(' | '),
          }
        })

        form.reset({
          customerId: currentCustomerId || pausedSale.customerId,
          items: mergedItems,
          payments: [
            {
              method: 'cash',
              amount: 0,
            },
          ],
          notes: mergedNotes,
        })

        if (saleDiscount > 0) {
          setSaleDiscount(saleDiscount)
          setSaleDiscountType(saleDiscountType)
        } else {
          setSaleDiscount(pausedSale.saleDiscount || 0)
          setSaleDiscountType(pausedSale.saleDiscountType || 'fixed')
        }
      } else {
        form.reset({
          customerId: pausedSale.customerId,
          items: pausedSale.items,
          payments:
            pausedSale.payments?.length > 0
              ? pausedSale.payments
              : [
                  {
                    method: 'cash',
                    amount: 0,
                  },
                ],
          notes: pausedSale.notes || '',
        })

        setSaleDiscount(pausedSale.saleDiscount || 0)
        setSaleDiscountType(pausedSale.saleDiscountType || 'fixed')
      }

      const nextPausedSales = pausedSales.filter(sale => sale.id !== saleId)
      persistPausedSales(nextPausedSales)

      sileo.success({
        title: 'Venta reanudada.',
        description:
          choice === 'combine'
            ? 'La venta pausada se combino con la venta actual y fue eliminada de ventas pausadas.'
            : 'La venta fue cargada al carrito y eliminada de ventas pausadas.',
      })
      return true
    },
    [
      askResumeConflictChoice,
      form,
      pausedSales,
      persistPausedSales,
      saleDiscount,
      saleDiscountType,
    ]
  )

  const openItemDiscountModal = (index: number) => {
    const item = form.getValues(`items.${index}`)
    if (!item) return

    setSelectedItemIndex(index)
    setItemDiscountDraft(item.discount || 0)
    setItemDiscountTypeDraft(item.discountType || 'fixed')
    onOpenItemDiscountModal()
  }

  const openItemNotesModal = (index: number) => {
    const item = form.getValues(`items.${index}`)
    if (!item) return

    setSelectedItemIndex(index)
    setItemNotesDraft(item.notes || '')
    onOpenItemNotesModal()
  }

  const saveItemDiscount = () => {
    if (selectedItemIndex === null) return

    const item = form.getValues(`items.${selectedItemIndex}`)
    if (!item) return

    updateItem(selectedItemIndex, {
      ...item,
      discount: Math.max(0, itemDiscountDraft || 0),
      discountType: itemDiscountTypeDraft,
    })

    onCloseItemDiscountModal()
  }

  const saveItemNotes = () => {
    if (selectedItemIndex === null) return

    const item = form.getValues(`items.${selectedItemIndex}`)
    if (!item) return

    updateItem(selectedItemIndex, {
      ...item,
      notes: itemNotesDraft.trim(),
    })

    onCloseItemNotesModal()
  }

  // Submit sale
  const onSubmit = async (data: POSFormData) => {
    if (createSale.isPending) return

    if (!openSession) {
      sileo.error({
        title: 'No hay una caja abierta.',
        description:
          'Por favor, abre una sesión de caja antes de realizar una venta.',
      })
      return
    }

    const customerId = data.customerId || undefined

    const hasCredits = data.payments.some(
      payment => payment.method === 'credit'
    )

    if (hasCredits && !customerId) {
      sileo.error({
        title: 'No se ha seleccionado un cliente.',
        description:
          'Por favor, selecciona un cliente antes de realizar una venta a crédito.',
      })

      throw new Error('No se ha seleccionado un cliente.')
    }

    try {
      const saleInput: CreatePOSSaleInput = {
        customerId: customerId,
        items: data.items.map(item => ({
          presentationId: item.presentationId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          discountType: item.discountType,
          notes: item.notes,
        })),
        payments: data.payments,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        discountAmount: totals.globalDiscount,
        total: totals.total,
        notes: data.notes,
      }

      const result = await createSale.mutateAsync(saleInput)

      clearCurrentSale()

      onCloseChargeModal()

      const saleNumber = result.saleDetails?.saleNumber
      const customerName = result.saleDetails?.customer?.name || 'Cliente Final'

      sileo.success({
        title: 'Venta realizada exitosamente.',
        description: (
          <span>
            Venta <b>#{saleNumber}</b> realizada exitosamente para el cliente{' '}
            <b>{customerName}</b>.
          </span>
        ),
      })
    } catch (error) {
      console.error('Error creating sale:', error)

      sileo.error({
        title: 'No se puede realizar la venta.',
        description: <HtmlMessage html={parseError(error)} />,
      })
    }
  }

  useEffect(() => {
    const onBarcodeScanned = async (code: string) => {
      const presentation = await searchByCode.mutateAsync(code)

      if (presentation) addToCart(presentation)
      else {
        sileo.error({
          title: 'Producto no encontrado',
          description: (
            <span>
              El producto con el código <b>{code}</b> no fue encontrado
            </span>
          ),
        })
      }
    }

    let buffer = ''
    let scanStartTime = 0
    let lastKeyTime = 0
    const ignoredKeys = new Set([
      'Shift',
      'Control',
      'Alt',
      'Meta',
      'CapsLock',
      'NumLock',
      'ScrollLock',
      'Tab',
    ])

    const onKeyDown = (e: KeyboardEvent) => {
      const now = Date.now()
      const delta = now - lastKeyTime

      if (ignoredKeys.has(e.key)) return

      if (delta > 100) {
        buffer = ''
        scanStartTime = 0
      }

      if (e.key.length === 1) {
        if (!scanStartTime) scanStartTime = now
        buffer += e.key
        lastKeyTime = now
        return
      }

      if (e.key === 'Enter') {
        const totalDuration = scanStartTime ? now - scanStartTime : Infinity
        const avgInterval =
          buffer.length > 1
            ? totalDuration / (buffer.length - 1)
            : totalDuration
        const looksLikeScan =
          buffer.length >= 4 && totalDuration <= 1600 && avgInterval <= 120

        if (looksLikeScan) {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation?.()

          const code = buffer
          buffer = ''
          scanStartTime = 0
          lastKeyTime = 0
          void onBarcodeScanned(code)
          return
        }

        buffer = ''
        scanStartTime = 0
        lastKeyTime = 0
        return
      }
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })

    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true })
    }
  }, [addToCart, searchByCode])

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

  if (isLoading) {
    return (
      <div className="grid place-items-center h-[calc(100dvh-84px)]">
        <Spinner />
      </div>
    )
  }

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
    <div
      className="grid grid-cols-[1fr_22rem] gap-6 max-h-[calc(100dvh-84px)]"
      ref={mainRef}
    >
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
              const columnWidth = Math.floor(width / columnCount) - 2

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
            <Button variant="bordered" onPress={onOpenPausedSalesModal}>
              <IconSolarPauseCircleLineDuotone className="size-5" />
              Pausadas ({pausedSales.length})
            </Button>
            <Button
              isIconOnly
              variant="bordered"
              onPress={pauseCurrentSale}
              isDisabled={itemFields.length === 0}
            >
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
            onSelectionChange={key => {
              form.setValue('customerId', Number(key.currentKey))
            }}
            selectedKeys={[String(customerId)]}
            defaultSelectedKeys={[String(form.watch('customerId'))]}
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

        <Divider className="mb-0" />

        <div className="flex-1 flex flex-col w-full">
          <FormProvider {...form}>
            <Form className="flex flex-col h-[calc(100dvh-200px)] w-full gap-0">
              <div
                className="flex flex-col flex-1 w-full overflow-y-auto h-full pb-2"
                ref={cartItemsRef}
              >
                {itemFields.length === 0 ? (
                  <div className="text-center py-8 flex-1 flex items-center justify-center flex-col">
                    <IconSolarCartCrossLineDuotone className="size-12 mb-2" />
                    <b className="text-small">Carrito vacío</b>
                    <p className="text-xs text-default-500">
                      Agregue productos para comenzar
                    </p>
                  </div>
                ) : (
                  <div>
                    {itemFields.map((field, index) => {
                      const currentItem = items[index] ?? field
                      const itemTotal = calculateItemTotal(
                        currentItem.quantity,
                        currentItem.unitPrecision,
                        currentItem.unitPrice,
                        currentItem.discount,
                        currentItem.discountType
                      )

                      const currentItemDiscount =
                        currentItem.discountType === 'percentage'
                          ? `${currentItem.discount}%`
                          : formatCurrency(fromCents(currentItem.discount || 0))

                      return (
                        <PosCartItem
                          key={field.id}
                          title={currentItem.title}
                          image={currentItem.image}
                          quantity={currentItem.quantity}
                          unitPrecision={currentItem.unitPrecision}
                          unitPrice={currentItem.unitPrice}
                          itemTotal={itemTotal}
                          discount={
                            currentItem.discount
                              ? currentItemDiscount
                              : undefined
                          }
                          notes={currentItem.notes}
                          onQuantityChange={value => {
                            updateItem(index, {
                              ...currentItem,
                              quantity: Math.max(1, Math.round(value)),
                            })
                          }}
                          onEditDiscount={() => openItemDiscountModal(index)}
                          onEditNotes={() => openItemNotesModal(index)}
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

                  {totals.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <p>Descuento:</p>
                      <p className="text-default-500">
                        {formatCurrency(fromCents(totals.discount))}
                      </p>
                    </div>
                  )}

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
                    onOpenDiscount={onOpenSaleDiscountModal}
                    onOpenNotes={() => {
                      setSaleNotesDraft(form.getValues('notes') || '')
                      onOpenSaleNotesModal()
                    }}
                    hasDiscount={saleDiscount > 0}
                    hasNotes={Boolean((form.watch('notes') || '').trim())}
                  />

                  <Button
                    variant="light"
                    fullWidth
                    onPress={confirmClearCurrentSale}
                  >
                    Limpiar Carrito
                  </Button>
                </div>

                <Modal
                  isOpen={isPausedSalesModalOpen}
                  onOpenChange={onPausedSalesModalOpenChange}
                  scrollBehavior="inside"
                >
                  <ModalContent>
                    {onClose => (
                      <>
                        <ModalHeader>Ventas pausadas</ModalHeader>
                        <ModalBody>
                          {pausedSales.length === 0 ? (
                            <p className="text-sm text-default-500">
                              No hay ventas pausadas.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {pausedSales.map((pausedSale, index) => (
                                <Card key={pausedSale.id} isBlurred>
                                  <CardBody className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="font-semibold text-sm">
                                          Venta pausada #
                                          {pausedSales.length - index}
                                        </p>
                                        <p className="text-xs text-default-500">
                                          {new Date(
                                            pausedSale.createdAt
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                      <p className="font-semibold text-sm">
                                        {formatCurrency(
                                          fromCents(
                                            calculatePausedSaleTotal(pausedSale)
                                          )
                                        )}
                                      </p>
                                    </div>

                                    <div className="text-xs text-default-500 space-y-1">
                                      <p>
                                        Cliente:{' '}
                                        <span className="text-default-700">
                                          {getCustomerNameById(
                                            pausedSale.customerId
                                          )}
                                        </span>
                                      </p>
                                      <p>
                                        Articulos:{' '}
                                        <span className="text-default-700">
                                          {getPausedSaleItemsCount(pausedSale)}
                                        </span>
                                      </p>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        color="danger"
                                        variant="light"
                                        onPress={() =>
                                          void confirmRemovePausedSale(
                                            pausedSale.id
                                          )
                                        }
                                      >
                                        Eliminar
                                      </Button>
                                      <Button
                                        size="sm"
                                        color="primary"
                                        onPress={async () => {
                                          const resumed = await resumePausedSale(
                                            pausedSale.id
                                          )
                                          if (resumed) onClose()
                                        }}
                                      >
                                        Reanudar
                                      </Button>
                                    </div>
                                  </CardBody>
                                </Card>
                              ))}
                            </div>
                          )}
                        </ModalBody>
                        <ModalFooter>
                          <Button variant="light" onPress={onClose}>
                            Cerrar
                          </Button>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>

                <Modal
                  isOpen={resumeConflictDialogOpen}
                  onOpenChange={open => {
                    if (!open) closeResumeConflictDialog('cancel')
                  }}
                  size="md"
                >
                  <ModalContent>
                    <ModalHeader>Ya hay una venta activa</ModalHeader>
                    <ModalBody>
                      <p className="text-sm text-default-600">
                        Deseas reemplazar la venta actual por la pausada o
                        combinarlas?
                      </p>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        variant="light"
                        onPress={() => closeResumeConflictDialog('cancel')}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="bordered"
                        onPress={() => closeResumeConflictDialog('combine')}
                      >
                        Combinar
                      </Button>
                      <Button
                        color="primary"
                        onPress={() => closeResumeConflictDialog('replace')}
                      >
                        Reemplazar
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>

                <Modal
                  isOpen={confirmDialog.isOpen}
                  onOpenChange={open => {
                    if (!open) closeConfirmDialog(false)
                  }}
                  size="xs"
                >
                  <ModalContent>
                    <ModalHeader>{confirmDialog.title}</ModalHeader>
                    <ModalBody>
                      <p className="text-sm text-default-600">
                        {confirmDialog.message}
                      </p>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        variant="light"
                        onPress={() => closeConfirmDialog(false)}
                      >
                        {confirmDialog.cancelText}
                      </Button>
                      <Button
                        color={confirmDialog.confirmColor}
                        onPress={() => closeConfirmDialog(true)}
                      >
                        {confirmDialog.confirmText}
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>

                <Modal
                  isOpen={isSaleDiscountModalOpen}
                  onOpenChange={onSaleDiscountModalOpenChange}
                >
                  <ModalContent>
                    {onClose => (
                      <>
                        <ModalHeader>Descuento de la venta</ModalHeader>
                        <Form
                          onSubmit={e => {
                            e.preventDefault()
                            onClose()
                          }}
                          className="h-auto w-full"
                        >
                          <ModalBody className="space-y-4 w-full">
                            <Select
                              label="Tipo de descuento"
                              selectedKeys={[saleDiscountType]}
                              onSelectionChange={key => {
                                const value = key.currentKey as
                                  | 'fixed'
                                  | 'percentage'
                                  | null

                                if (value) {
                                  setSaleDiscountType(value)
                                  setSaleDiscount(0)
                                }
                              }}
                            >
                              <SelectItem key="fixed">Monto fijo</SelectItem>
                              <SelectItem key="percentage">
                                Porcentaje
                              </SelectItem>
                            </Select>

                            <NumberInput
                              autoFocus
                              label={
                                saleDiscountType === 'fixed'
                                  ? 'Monto del descuento'
                                  : 'Porcentaje de descuento'
                              }
                              minValue={0}
                              maxValue={
                                saleDiscountType === 'percentage'
                                  ? 100
                                  : fromCents(totals.subtotal)
                              }
                              placeholder={
                                saleDiscountType === 'fixed' ? '0.00' : '0'
                              }
                              value={
                                saleDiscountType === 'fixed'
                                  ? fromCents(saleDiscount)
                                  : saleDiscount
                              }
                              onValueChange={value =>
                                setSaleDiscount(
                                  normalizeDiscountValue(
                                    value,
                                    saleDiscountType
                                  )
                                )
                              }
                              startContent={
                                <span className="text-default-500 text-sm">
                                  {saleDiscountType === 'fixed' ? 'L' : '%'}
                                </span>
                              }
                            />
                          </ModalBody>
                          <ModalFooter className="w-full">
                            <Button
                              color="danger"
                              variant="light"
                              onPress={onClose}
                            >
                              Cancelar
                            </Button>
                            <Button color="primary" type="submit">
                              Aplicar
                            </Button>
                          </ModalFooter>
                        </Form>
                      </>
                    )}
                  </ModalContent>
                </Modal>

                <Modal
                  isOpen={isSaleNotesModalOpen}
                  onOpenChange={onSaleNotesModalOpenChange}
                >
                  <ModalContent>
                    {onClose => (
                      <>
                        <ModalHeader>Nota de la venta</ModalHeader>
                        <Form
                          className="h-auto w-full"
                          onSubmit={e => {
                            e.preventDefault()

                            form.setValue('notes', saleNotesDraft.trim())
                            onClose()
                          }}
                        >
                          <ModalBody className="w-full">
                            <Textarea
                              autoFocus
                              label="Nota"
                              placeholder="Escribe una nota para la venta"
                              value={saleNotesDraft}
                              onValueChange={setSaleNotesDraft}
                              minRows={4}
                            />
                          </ModalBody>
                          <ModalFooter className="w-full">
                            <Button
                              color="danger"
                              variant="light"
                              onPress={onClose}
                            >
                              Cancelar
                            </Button>
                            <Button color="primary" type="submit">
                              Guardar
                            </Button>
                          </ModalFooter>
                        </Form>
                      </>
                    )}
                  </ModalContent>
                </Modal>

                <Modal
                  isOpen={isItemDiscountModalOpen}
                  onOpenChange={onItemDiscountModalOpenChange}
                >
                  <ModalContent>
                    {onClose => (
                      <>
                        <ModalHeader>Descuento del producto</ModalHeader>
                        <Form
                          onSubmit={e => {
                            e.preventDefault()

                            saveItemDiscount()
                            onClose()
                          }}
                          className="h-auto w-full"
                        >
                          <ModalBody className="space-y-4 w-full">
                            <Select
                              label="Tipo de descuento"
                              selectedKeys={[itemDiscountTypeDraft]}
                              onSelectionChange={key => {
                                const value = key.currentKey as
                                  | 'fixed'
                                  | 'percentage'
                                  | null

                                if (value) {
                                  setItemDiscountTypeDraft(value)
                                  setItemDiscountDraft(0)
                                }
                              }}
                            >
                              <SelectItem key="fixed">Monto fijo</SelectItem>
                              <SelectItem key="percentage">
                                Porcentaje
                              </SelectItem>
                            </Select>

                            <NumberInput
                              autoFocus
                              label={
                                itemDiscountTypeDraft === 'fixed'
                                  ? 'Monto del descuento'
                                  : 'Porcentaje de descuento'
                              }
                              minValue={0}
                              maxValue={
                                itemDiscountTypeDraft === 'percentage'
                                  ? 100
                                  : undefined
                              }
                              placeholder={
                                itemDiscountTypeDraft === 'fixed' ? '0.00' : '0'
                              }
                              value={
                                itemDiscountTypeDraft === 'fixed'
                                  ? fromCents(itemDiscountDraft)
                                  : itemDiscountDraft
                              }
                              onValueChange={value =>
                                setItemDiscountDraft(
                                  normalizeDiscountValue(
                                    value,
                                    itemDiscountTypeDraft
                                  )
                                )
                              }
                              startContent={
                                <span className="text-default-500 text-sm">
                                  {itemDiscountTypeDraft === 'fixed'
                                    ? 'L'
                                    : '%'}
                                </span>
                              }
                            />
                          </ModalBody>
                          <ModalFooter className="w-full">
                            <Button
                              color="danger"
                              variant="light"
                              onPress={() => {
                                onClose()
                                onCloseItemDiscountModal()
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button color="primary" type="submit">
                              Guardar
                            </Button>
                          </ModalFooter>
                        </Form>
                      </>
                    )}
                  </ModalContent>
                </Modal>

                <Modal
                  isOpen={isItemNotesModalOpen}
                  onOpenChange={onItemNotesModalOpenChange}
                >
                  <ModalContent>
                    {onClose => (
                      <>
                        <ModalHeader>Nota del producto</ModalHeader>
                        <ModalBody>
                          <Textarea
                            autoFocus
                            label="Nota"
                            placeholder="Escribe una nota para este producto"
                            value={itemNotesDraft}
                            onValueChange={setItemNotesDraft}
                            minRows={4}
                          />
                        </ModalBody>
                        <ModalFooter>
                          <Button
                            color="danger"
                            variant="light"
                            onPress={() => {
                              onClose()
                              onCloseItemNotesModal()
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            color="primary"
                            onPress={() => {
                              saveItemNotes()
                              onClose()
                            }}
                          >
                            Guardar
                          </Button>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
              </div>
            </Form>
          </FormProvider>
        </div>
      </div>
    </div>
  )
}

export default POSInterface

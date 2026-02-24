import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { fromCents } from '../../../../shared/utils/currency'
import { formatCurrency } from '../../../../shared/utils/formatCurrency'
import {
  type ProcessExchangeItem,
  type ProcessReturnItem,
  useProcessReturn,
} from '@/hooks/use-returns'
import { useSale, useSales } from '@/hooks/use-sales'
import { usePosPresentations } from '@/features/presentations/hooks/use-pos-presentations'
import { useInventoryBatches } from '@/features/inventory/batches/hooks/use-inventory-batches'
import { ArrowLeftRight, Plus, RotateCcw, Search, Trash2, AlertTriangle } from 'lucide-react'

const SHRINKAGE_REASONS = [
  'Producto danado',
  'Producto vencido',
  'Producto perdido',
  'Error de sistema',
  'Otro',
]

interface NewReturnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type ReturnRow = {
  saleItemId: number
  selected: boolean
  quantityReturned: number
  condition: 'good' | 'damaged'
  shrinkageReason: string
}

type ExchangeRow = {
  presentationId: number
  presentationName: string
  batchId: number
  batchCode: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export function NewReturnDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewReturnDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [returnType, setReturnType] = useState<'refund' | 'exchange'>('refund')

  const [saleSearch, setSaleSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null)

  const [returnRows, setReturnRows] = useState<ReturnRow[]>([])
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const [selectedPresentationId, setSelectedPresentationId] = useState('')
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [exchangeQty, setExchangeQty] = useState('1')
  const [exchangeRows, setExchangeRows] = useState<ExchangeRow[]>([])

  const processReturn = useProcessReturn()

  const { data: salesSearch, isFetching: isSearchLoading } = useSales({
    search: appliedSearch || undefined,
    status: 'completed',
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const { data: selectedSale, isLoading: isSaleLoading } = useSale(selectedSaleId ?? 0)

  const { data: presentationsResult } = usePosPresentations({
    isActive: true,
    page: 1,
    pageSize: 300,
  })

  const presentations = useMemo(
    () => presentationsResult?.data ?? [],
    [presentationsResult?.data]
  )
  const selectedPresentation = useMemo(
    () => presentations.find(p => p.id === Number(selectedPresentationId)),
    [presentations, selectedPresentationId]
  )

  const { data: batchesResult, isLoading: isBatchesLoading } = useInventoryBatches({
    productId: selectedPresentation?.productId,
    hasStock: true,
    page: 1,
    pageSize: 100,
  })

  const batches = batchesResult?.data ?? []

  const saleItems = selectedSale?.items ?? []

  useEffect(() => {
    if (!open) return

    setStep(1)
    setReturnType('refund')
    setSaleSearch('')
    setAppliedSearch('')
    setSelectedSaleId(null)
    setReturnRows([])
    setReason('')
    setNotes('')
    setSelectedPresentationId('')
    setSelectedBatchId('')
    setExchangeQty('1')
    setExchangeRows([])
  }, [open])

  useEffect(() => {
    if (!selectedSale?.items?.length) return
    if (returnRows.length > 0) return

    setReturnRows(
      selectedSale.items.map(item => ({
        saleItemId: item.id,
        selected: false,
        quantityReturned: item.quantity,
        condition: 'good',
        shrinkageReason: '',
      }))
    )
  }, [selectedSale?.items, returnRows.length])

  useEffect(() => {
    setSelectedBatchId('')
  }, [selectedPresentationId])

  const selectedRows = useMemo(
    () => returnRows.filter(r => r.selected && r.quantityReturned > 0),
    [returnRows]
  )

  const returnTotal = useMemo(() => {
    if (!selectedSale?.items) return 0

    return selectedRows.reduce((sum, row) => {
      const item = selectedSale.items?.find(i => i.id === row.saleItemId)
      if (!item || item.quantity <= 0) return sum

      const proportional = Math.round(
        (item.totalPrice * row.quantityReturned) / item.quantity
      )

      return sum + proportional
    }, 0)
  }, [selectedRows, selectedSale?.items])

  const exchangeTotal = useMemo(
    () => exchangeRows.reduce((sum, row) => sum + row.totalPrice, 0),
    [exchangeRows]
  )

  const difference = returnTotal - exchangeTotal

  const canSubmit =
    !!selectedSaleId &&
    selectedRows.length > 0 &&
    reason.trim().length > 0 &&
    selectedRows.every(
      row => row.condition === 'good' || row.shrinkageReason.trim().length > 0
    ) &&
    !processReturn.isPending

  const executeSearch = () => {
    setAppliedSearch(saleSearch.trim())
  }

  const updateReturnRow = (saleItemId: number, patch: Partial<ReturnRow>) => {
    setReturnRows(prev =>
      prev.map(row => {
        if (row.saleItemId !== saleItemId) return row

        const next = { ...row, ...patch }
        if (next.condition === 'good') {
          next.shrinkageReason = ''
        }

        return next
      })
    )
  }

  const addExchangeProduct = () => {
    if (!selectedPresentation || !selectedBatchId) {
      toast.error('Selecciona presentacion y lote para el cambio')
      return
    }

    const batch = batches.find(b => b.id === Number(selectedBatchId))
    if (!batch) {
      toast.error('El lote seleccionado ya no esta disponible')
      return
    }

    const qty = Math.max(1, Math.floor(Number(exchangeQty) || 1))

    const existing = exchangeRows.find(
      row =>
        row.presentationId === selectedPresentation.id &&
        row.batchId === Number(selectedBatchId)
    )

    const nextQty = (existing?.quantity || 0) + qty

    if (nextQty > batch.quantityAvailable) {
      toast.error(
        `Stock insuficiente. Disponible en lote: ${batch.quantityAvailable}`
      )
      return
    }

    const unitPrice = selectedPresentation.salePrice
    const totalPrice = nextQty * unitPrice

    if (existing) {
      setExchangeRows(prev =>
        prev.map(row =>
          row.presentationId === selectedPresentation.id &&
          row.batchId === Number(selectedBatchId)
            ? { ...row, quantity: nextQty, totalPrice }
            : row
        )
      )
    } else {
      setExchangeRows(prev => [
        ...prev,
        {
          presentationId: selectedPresentation.id,
          presentationName: selectedPresentation.name,
          batchId: Number(selectedBatchId),
          batchCode: batch.batchCode || `Lote #${batch.id}`,
          quantity: qty,
          unitPrice,
          totalPrice: qty * unitPrice,
        },
      ])
    }

    setSelectedPresentationId('')
    setSelectedBatchId('')
    setExchangeQty('1')
  }

  const removeExchangeProduct = (presentationId: number, batchId: number) => {
    setExchangeRows(prev =>
      prev.filter(
        row => !(row.presentationId === presentationId && row.batchId === batchId)
      )
    )
  }

  const handleSubmit = async () => {
    if (!selectedSaleId || !canSubmit) return

    const returnItems: ProcessReturnItem[] = selectedRows.map(row => ({
      saleItemId: row.saleItemId,
      quantityReturned: row.quantityReturned,
      condition: row.condition,
      shrinkageReason:
        row.condition === 'damaged' ? row.shrinkageReason || undefined : undefined,
    }))

    const exchangeItems: ProcessExchangeItem[] =
      returnType === 'exchange'
        ? exchangeRows.map(row => ({
            presentationId: row.presentationId,
            batchId: row.batchId,
            quantity: row.quantity,
            unitPrice: row.unitPrice,
            totalPrice: row.totalPrice,
          }))
        : []

    const finalNotes = [reason.trim(), notes.trim()].filter(Boolean).join(' | ')

    try {
      await processReturn.mutateAsync({
        saleId: selectedSaleId,
        returnItems,
        type: returnType,
        exchangeItems: exchangeItems.length > 0 ? exchangeItems : undefined,
        notes: finalNotes || undefined,
      })

      const message =
        returnType === 'refund'
          ? `Devolucion completada. Reembolso: ${formatCurrency(fromCents(returnTotal))}`
          : difference > 0
            ? `Cambio completado. Vuelto al cliente: ${formatCurrency(fromCents(difference))}`
            : difference < 0
              ? `Cambio completado. Cobrar al cliente: ${formatCurrency(fromCents(Math.abs(difference)))}`
              : 'Cambio completado. Sin diferencia de precio.'

      toast.success(message)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al procesar la devolucion'
      )
    }
  }

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange} scrollBehavior="inside" size="3xl">
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <RotateCcw className="size-5" />
              {step === 1 ? 'Buscar Venta' : 'Procesar Devolucion / Cambio'}
            </ModalHeader>

            <ModalBody>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Buscar por numero de venta</p>
                    <div className="flex gap-2">
                      <Input
                        value={saleSearch}
                        onChange={e => setSaleSearch(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') executeSearch()
                        }}
                        placeholder="Ej: 20260224001"
                      />
                      <Button
                        isIconOnly
                        onPress={executeSearch}
                        isLoading={isSearchLoading}
                        variant="flat"
                      >
                        <Search className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <Table aria-label="Ventas encontradas">
                    <TableHeader>
                      <TableColumn>VENTA</TableColumn>
                      <TableColumn>CLIENTE</TableColumn>
                      <TableColumn>TOTAL</TableColumn>
                      <TableColumn className="text-right">ACCION</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={salesSearch?.data ?? []}
                      loadingContent={<Spinner />}
                      loadingState={isSearchLoading ? 'loading' : 'idle'}
                      emptyContent={
                        appliedSearch
                          ? 'No se encontraron ventas con ese criterio'
                          : 'Ingresa un numero de venta para buscar'
                      }
                    >
                      {sale => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">#{sale.saleNumber}</TableCell>
                          <TableCell>{sale.customerName || 'General'}</TableCell>
                          <TableCell>{formatCurrency(fromCents(sale.total))}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onPress={() => {
                                setSelectedSaleId(sale.id)
                                setStep(2)
                              }}
                            >
                              Seleccionar
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  {isSaleLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : !selectedSale ? (
                    <div className="rounded-large border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
                      No se pudo cargar la venta seleccionada.
                    </div>
                  ) : (
                    <>
                      <div className="rounded-large bg-default-100 p-3 text-sm">
                        <p className="font-semibold">Venta #{selectedSale.saleNumber}</p>
                        <p className="text-default-500">
                          Total original: {formatCurrency(fromCents(selectedSale.total))}
                        </p>
                        <Button
                          variant="light"
                          size="sm"
                          className="px-0"
                          onPress={() => setStep(1)}
                        >
                          Cambiar venta
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Tipo de operacion</p>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant={returnType === 'refund' ? 'solid' : 'flat'}
                            startContent={<RotateCcw className="size-4" />}
                            onPress={() => {
                              setReturnType('refund')
                              setExchangeRows([])
                            }}
                          >
                            Devolucion
                          </Button>
                          <Button
                            variant={returnType === 'exchange' ? 'solid' : 'flat'}
                            startContent={<ArrowLeftRight className="size-4" />}
                            onPress={() => setReturnType('exchange')}
                          >
                            Cambio
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Seleccionar productos a devolver</p>
                        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                          {saleItems.map(item => {
                            const row = returnRows.find(r => r.saleItemId === item.id)
                            if (!row) return null

                            return (
                              <Card key={item.id} className={row.selected ? 'border-primary' : ''}>
                                <CardBody className="space-y-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="font-medium">{item.productName}</p>
                                      <p className="text-small text-default-500">
                                        {item.quantity} x {formatCurrency(fromCents(item.unitPrice))} ={' '}
                                        {formatCurrency(fromCents(item.totalPrice))}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant={row.selected ? 'solid' : 'flat'}
                                      onPress={() =>
                                        updateReturnRow(item.id, {
                                          selected: !row.selected,
                                        })
                                      }
                                    >
                                      {row.selected ? 'Seleccionado' : 'Seleccionar'}
                                    </Button>
                                  </div>

                                  {row.selected && (
                                    <div className="grid gap-3 md:grid-cols-3">
                                      <Input
                                        type="number"
                                        label="Cantidad"
                                        min={1}
                                        max={item.quantity}
                                        value={String(row.quantityReturned)}
                                        onChange={e => {
                                          const next = Math.min(
                                            item.quantity,
                                            Math.max(1, Number(e.target.value) || 1)
                                          )
                                          updateReturnRow(item.id, {
                                            quantityReturned: next,
                                          })
                                        }}
                                      />

                                      <Select
                                        label="Estado"
                                        selectedKeys={[row.condition]}
                                        onSelectionChange={keys => {
                                          const key = String(keys.currentKey ?? 'good') as
                                            | 'good'
                                            | 'damaged'
                                          updateReturnRow(item.id, { condition: key })
                                        }}
                                      >
                                        <SelectItem key="good">Bueno</SelectItem>
                                        <SelectItem key="damaged">Danado</SelectItem>
                                      </Select>

                                      {row.condition === 'damaged' ? (
                                        <Select
                                          label="Motivo merma"
                                          selectedKeys={
                                            row.shrinkageReason
                                              ? [row.shrinkageReason]
                                              : []
                                          }
                                          onSelectionChange={keys =>
                                            updateReturnRow(item.id, {
                                              shrinkageReason: String(
                                                keys.currentKey ?? ''
                                              ),
                                            })
                                          }
                                        >
                                          {SHRINKAGE_REASONS.map(reasonOption => (
                                            <SelectItem key={reasonOption}>
                                              {reasonOption}
                                            </SelectItem>
                                          ))}
                                        </Select>
                                      ) : (
                                        <div className="flex items-center gap-2 text-small text-default-500">
                                          <AlertTriangle className="size-4" />
                                          Producto en buen estado
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </CardBody>
                              </Card>
                            )
                          })}
                        </div>
                      </div>

                      {returnType === 'exchange' && (
                        <div className="space-y-3">
                          <Divider />
                          <p className="text-sm font-medium">Productos para cambio</p>
                          <div className="grid gap-2 md:grid-cols-[1fr_1fr_110px_auto]">
                            <Select
                              label="Presentacion"
                              selectedKeys={selectedPresentationId ? [selectedPresentationId] : []}
                              onSelectionChange={keys =>
                                setSelectedPresentationId(String(keys.currentKey ?? ''))
                              }
                            >
                              {presentations.map(p => (
                                <SelectItem key={String(p.id)}>
                                  {p.name} - {formatCurrency(fromCents(p.salePrice))}
                                </SelectItem>
                              ))}
                            </Select>

                            <Select
                              label="Lote"
                              selectedKeys={selectedBatchId ? [selectedBatchId] : []}
                              isDisabled={!selectedPresentation}
                              onSelectionChange={keys =>
                                setSelectedBatchId(String(keys.currentKey ?? ''))
                              }
                            >
                              {batches.map(batch => (
                                <SelectItem key={String(batch.id)}>
                                  {(batch.batchCode || `Lote #${batch.id}`) +
                                    ` (Stock: ${batch.quantityAvailable})`}
                                </SelectItem>
                              ))}
                            </Select>

                            <Input
                              type="number"
                              label="Cant."
                              min={1}
                              value={exchangeQty}
                              onChange={e => setExchangeQty(e.target.value)}
                            />

                            <Button
                              className="mt-6"
                              startContent={<Plus className="size-4" />}
                              onPress={addExchangeProduct}
                              isLoading={isBatchesLoading}
                            >
                              Agregar
                            </Button>
                          </div>

                          {exchangeRows.length > 0 && (
                            <div className="space-y-2">
                              {exchangeRows.map(row => (
                                <div
                                  key={`${row.presentationId}-${row.batchId}`}
                                  className="flex items-center justify-between rounded-large border border-default-200 p-3"
                                >
                                  <div>
                                    <p className="text-sm font-medium">{row.presentationName}</p>
                                    <p className="text-xs text-default-500">
                                      {row.batchCode} - {row.quantity} x{' '}
                                      {formatCurrency(fromCents(row.unitPrice))}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {formatCurrency(fromCents(row.totalPrice))}
                                    </span>
                                    <Button
                                      isIconOnly
                                      variant="light"
                                      color="danger"
                                      onPress={() =>
                                        removeExchangeProduct(
                                          row.presentationId,
                                          row.batchId
                                        )
                                      }
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Input
                          label="Motivo"
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          placeholder="Motivo principal de la devolucion o cambio"
                          isRequired
                        />
                        <Textarea
                          label="Notas adicionales (opcional)"
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          placeholder="Notas..."
                          minRows={2}
                        />
                      </div>

                      {selectedRows.length > 0 && (
                        <Card className="border-primary">
                          <CardBody className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Valor productos devueltos:</span>
                              <span className="font-medium">
                                {formatCurrency(fromCents(returnTotal))}
                              </span>
                            </div>

                            {returnType === 'exchange' && (
                              <>
                                <div className="flex items-center justify-between text-sm">
                                  <span>Valor productos nuevos:</span>
                                  <span className="font-medium">
                                    {formatCurrency(fromCents(exchangeTotal))}
                                  </span>
                                </div>
                                <Divider />
                                <div className="flex items-center justify-between font-medium">
                                  <span>
                                    {difference > 0
                                      ? 'Vuelto al cliente:'
                                      : difference < 0
                                        ? 'Cobrar al cliente:'
                                        : 'Sin diferencia'}
                                  </span>
                                  <Chip
                                    color={
                                      difference > 0
                                        ? 'success'
                                        : difference < 0
                                          ? 'warning'
                                          : 'default'
                                    }
                                    variant="flat"
                                  >
                                    {formatCurrency(fromCents(Math.abs(difference)))}
                                  </Chip>
                                </div>
                              </>
                            )}

                            {returnType === 'refund' && (
                              <>
                                <Divider />
                                <div className="flex items-center justify-between font-medium">
                                  <span>Total a reembolsar:</span>
                                  <Chip color="danger" variant="flat">
                                    {formatCurrency(fromCents(returnTotal))}
                                  </Chip>
                                </div>
                              </>
                            )}
                          </CardBody>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              {step === 1 ? (
                <>
                  <Button variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    isDisabled={!selectedSaleId}
                    onPress={() => {
                      if (selectedSaleId) setStep(2)
                    }}
                  >
                    Continuar
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="light" onPress={() => setStep(1)}>
                    Atras
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSubmit}
                    isDisabled={!canSubmit}
                    isLoading={processReturn.isPending}
                  >
                    {returnType === 'refund'
                      ? 'Procesar Devolucion'
                      : 'Procesar Cambio'}
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

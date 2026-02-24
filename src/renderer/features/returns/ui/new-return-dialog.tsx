import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  type ProcessExchangeItem,
  type ProcessReturnItem,
  useProcessReturn,
} from '@/hooks/use-returns'
import { useSale, useSales } from '@/hooks/use-sales'
import { fromCents } from '../../../../shared/utils/currency'
import { formatCurrency } from '../../../../shared/utils/formatCurrency'

const SHRINKAGE_REASONS = [
  'Producto dañado',
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

type Step = 'sale' | 'items' | 'type' | 'confirm'

export function NewReturnDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewReturnDialogProps) {
  const [step, setStep] = useState<Step>('sale')
  const [saleSearch, setSaleSearch] = useState('')
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null)
  const [returnRows, setReturnRows] = useState<
    Array<{
      saleItemId: number
      quantityReturned: number
      condition: 'good' | 'damaged'
      shrinkageReason: string
    }>
  >([])
  const [returnType, setReturnType] = useState<'refund' | 'exchange'>('refund')
  const [exchangeRows, setExchangeRows] = useState<
    Array<{
      presentationId: number
      presentationName: string
      batchId: number
      quantity: number
      unitPrice: number
      totalPrice: number
    }>
  >([])
  const [notes, setNotes] = useState('')

  const { data: salesSearch } = useSales({
    search: saleSearch.trim() || undefined,
    status: 'completed',
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const salesOptions = salesSearch?.data ?? []

  const { data: selectedSale } = useSale(selectedSaleId ?? 0)
  const processReturn = useProcessReturn()

  const saleItems = selectedSale?.items ?? []

  const totalReturnedValue = useMemo(() => {
    const items = selectedSale?.items
    if (!items) return 0
    return returnRows.reduce((sum, row) => {
      const item = items.find(i => i.id === row.saleItemId)
      if (!item || item.quantity <= 0) return sum
      const proportional = Math.round(
        (item.totalPrice * row.quantityReturned) / item.quantity
      )
      return sum + proportional
    }, 0)
  }, [selectedSale?.items, returnRows])

  const totalExchangeValue = useMemo(
    () => exchangeRows.reduce((s, r) => s + r.totalPrice, 0),
    [exchangeRows]
  )

  const balanceCents = totalReturnedValue - totalExchangeValue

  const canGoItems =
    selectedSaleId != null &&
    returnRows.length > 0 &&
    returnRows.every(
      r =>
        r.quantityReturned > 0 &&
        (r.condition === 'good' || (r.shrinkageReason?.trim() ?? '').length > 0)
    )

  const canSubmit =
    canGoItems &&
    (returnType === 'refund' || returnType === 'exchange') &&
    !processReturn.isPending

  const handleSelectSale = (saleId: number) => {
    setSelectedSaleId(saleId)
    setSaleSearch('')
  }

  const handleInitReturnRows = () => {
    if (!selectedSale?.items?.length) return
    setReturnRows(
      selectedSale.items.map(item => ({
        saleItemId: item.id,
        quantityReturned: item.quantity,
        condition: 'good' as const,
        shrinkageReason: '',
      }))
    )
    setStep('items')
  }

  useEffect(() => {
    if (
      step === 'items' &&
      selectedSale?.items?.length &&
      returnRows.length === 0
    ) {
      setReturnRows(
        selectedSale.items.map(item => ({
          saleItemId: item.id,
          quantityReturned: item.quantity,
          condition: 'good' as const,
          shrinkageReason: '',
        }))
      )
    }
  }, [step, selectedSale?.items, returnRows.length])

  const updateReturnRow = (
    saleItemId: number,
    upd: Partial<(typeof returnRows)[0]>
  ) => {
    setReturnRows(prev =>
      prev.map(r => (r.saleItemId === saleItemId ? { ...r, ...upd } : r))
    )
  }

  const handleSubmit = async () => {
    if (!selectedSaleId || !canSubmit) return

    const returnItems: ProcessReturnItem[] = returnRows
      .filter(r => r.quantityReturned > 0)
      .map(r => ({
        saleItemId: r.saleItemId,
        quantityReturned: r.quantityReturned,
        condition: r.condition,
        shrinkageReason:
          r.condition === 'damaged'
            ? r.shrinkageReason || undefined
            : undefined,
      }))

    const exchangeItems: ProcessExchangeItem[] =
      returnType === 'exchange'
        ? exchangeRows.map(r => ({
            presentationId: r.presentationId,
            batchId: r.batchId,
            quantity: r.quantity,
            unitPrice: r.unitPrice,
            totalPrice: r.totalPrice,
          }))
        : []

    try {
      await processReturn.mutateAsync({
        saleId: selectedSaleId,
        returnItems,
        type: returnType,
        exchangeItems: exchangeItems.length > 0 ? exchangeItems : undefined,
        notes: notes.trim() || undefined,
      })
      toast.success('Devolución registrada correctamente')
      onSuccess?.()
      onOpenChange(false)
      setStep('sale')
      setSelectedSaleId(null)
      setReturnRows([])
      setExchangeRows([])
      setNotes('')
    } catch (e: unknown) {
      toast.error(
        e instanceof Error ? e.message : 'Error al procesar la devolución'
      )
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep('sale')
      setSelectedSaleId(null)
      setReturnRows([])
      setExchangeRows([])
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'sale' && 'Buscar venta'}
            {step === 'items' && 'Productos a devolver'}
            {step === 'type' && 'Tipo de devolución'}
            {step === 'confirm' && 'Resumen'}
          </DialogTitle>
        </DialogHeader>

        {step === 'sale' && (
          <div className="space-y-4">
            <div>
              <Label>Número o búsqueda de venta</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Ej: 20240224001 o cliente..."
                  value={saleSearch}
                  onChange={e => setSaleSearch(e.target.value)}
                />
              </div>
            </div>
            {salesOptions.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesOptions.map(
                    (s: {
                      id: number
                      saleNumber: string
                      customerName?: string
                      total: number
                    }) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          {s.saleNumber}
                        </TableCell>
                        <TableCell>{s.customerName ?? 'General'}</TableCell>
                        <TableCell>
                          {formatCurrency(fromCents(s.total))}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleSelectSale(s.id)}
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            )}
            {selectedSaleId && (
              <Alert>
                <AlertDescription>
                  Venta #{selectedSale?.saleNumber ?? selectedSaleId}{' '}
                  seleccionada. Continuar para indicar qué productos se
                  devuelven.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'items' && selectedSale && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ajuste cantidades y estado de cada ítem. Si está dañado, elija
              motivo para registrar merma.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Comprado</TableHead>
                  <TableHead>Cant. a devolver</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Motivo merma</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleItems.map(item => {
                  const row = returnRows.find(r => r.saleItemId === item.id)
                  if (!row) return null
                  const maxQty = item.quantity
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.productName} ({item.presentationName})
                      </TableCell>
                      <TableCell>{maxQty}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={maxQty}
                          value={row.quantityReturned}
                          onChange={e =>
                            updateReturnRow(item.id, {
                              quantityReturned: Math.min(
                                maxQty,
                                Math.max(0, Number(e.target.value) || 0)
                              ),
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.condition}
                          onValueChange={(v: 'good' | 'damaged') =>
                            updateReturnRow(item.id, { condition: v })
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="good">Bueno</SelectItem>
                            <SelectItem value="damaged">Dañado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {row.condition === 'damaged' && (
                          <Select
                            value={row.shrinkageReason || ''}
                            onValueChange={v =>
                              updateReturnRow(item.id, {
                                shrinkageReason: v,
                              })
                            }
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Motivo" />
                            </SelectTrigger>
                            <SelectContent>
                              {SHRINKAGE_REASONS.map(r => (
                                <SelectItem key={r} value={r}>
                                  {r}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {step === 'type' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant={returnType === 'refund' ? 'default' : 'outline'}
                onClick={() => {
                  setReturnType('refund')
                  setExchangeRows([])
                }}
              >
                Solo reembolso (devolver dinero)
              </Button>
              <Button
                variant={returnType === 'exchange' ? 'default' : 'outline'}
                onClick={() => setReturnType('exchange')}
              >
                Cambio por otros productos
              </Button>
            </div>
            {returnType === 'exchange' && (
              <Alert>
                <AlertDescription>
                  Para agregar productos a dar a cambio, use la pantalla de
                  punto de venta para obtener presentación y lote, o agregue
                  manualmente los ítems en el siguiente paso. En este asistente
                  puede continuar y el sistema calculará el vuelto según el
                  valor devuelto menos el valor de los productos a cambio.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Valor devuelto (productos)
                </p>
                <p className="text-lg font-semibold">
                  {formatCurrency(fromCents(totalReturnedValue))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Valor a cambio (productos dados)
                </p>
                <p className="text-lg font-semibold">
                  {returnType === 'exchange'
                    ? formatCurrency(fromCents(totalExchangeValue))
                    : '-'}
                </p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Vuelto</p>
              {balanceCents > 0 ? (
                <p className="text-lg font-semibold text-green-600">
                  Se devuelve al cliente:{' '}
                  {formatCurrency(fromCents(balanceCents))}
                </p>
              ) : balanceCents < 0 ? (
                <p className="text-lg font-semibold text-amber-600">
                  El cliente paga:{' '}
                  {formatCurrency(fromCents(Math.abs(balanceCents)))}
                </p>
              ) : (
                <p className="text-lg font-semibold">Sin diferencia</p>
              )}
            </div>
            {returnType === 'exchange' && exchangeRows.length === 0 && (
              <Alert>
                <AlertDescription>
                  No hay productos a cambio. El vuelto será igual al valor
                  devuelto (reembolso total). Puede continuar o volver para
                  agregar productos.
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Label>Notas (opcional)</Label>
              <Input
                className="mt-1"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Motivo o observaciones"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'sale' && (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                disabled={!selectedSaleId}
                onClick={() => {
                  handleInitReturnRows()
                }}
              >
                Siguiente
              </Button>
            </>
          )}
          {step === 'items' && (
            <>
              <Button variant="outline" onClick={() => setStep('sale')}>
                Atrás
              </Button>
              <Button disabled={!canGoItems} onClick={() => setStep('type')}>
                Siguiente
              </Button>
            </>
          )}
          {step === 'type' && (
            <>
              <Button variant="outline" onClick={() => setStep('items')}>
                Atrás
              </Button>
              <Button onClick={() => setStep('confirm')}>Siguiente</Button>
            </>
          )}
          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => setStep('type')}>
                Atrás
              </Button>
              <Button disabled={!canSubmit} onClick={handleSubmit}>
                {processReturn.isPending
                  ? 'Procesando...'
                  : 'Confirmar devolución'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

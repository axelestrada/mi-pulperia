import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '../../shared/utils/formatCurrency'
import { fromCents } from '../../shared/utils/currency'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { useReturns, type SaleReturn } from '../hooks/use-returns'
import { NewReturnDialog } from '../features/returns/ui/new-return-dialog'

export function ReturnsPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<'refund' | 'exchange' | ''>('')
  const [showNewDialog, setShowNewDialog] = useState(false)

  const { data, isLoading } = useReturns({
    page,
    limit: 20,
    type: typeFilter || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const returnsList = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Devoluciones</h1>
          <p className="text-muted-foreground">
            Gestione devoluciones, reembolsos y cambios de productos
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva devolución
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Historial de devoluciones</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={typeFilter === '' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('')}
            >
              Todas
            </Button>
            <Button
              variant={typeFilter === 'refund' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('refund')}
            >
              Reembolsos
            </Button>
            <Button
              variant={typeFilter === 'exchange' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('exchange')}
            >
              Cambios
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : returnsList.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No hay devoluciones registradas
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Venta</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor devuelto</TableHead>
                    <TableHead>Valor cambio</TableHead>
                    <TableHead>Vuelto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnsList.map((r: SaleReturn) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.returnNumber}
                      </TableCell>
                      <TableCell>{r.saleNumber ?? `#${r.saleId}`}</TableCell>
                      <TableCell>
                        {format(new Date(r.createdAt), 'PPp', { locale: es })}
                      </TableCell>
                      <TableCell>
                        {r.type === 'refund' ? 'Reembolso' : 'Cambio'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(fromCents(r.totalReturnedValue))}
                      </TableCell>
                      <TableCell>
                        {r.totalExchangeValue > 0
                          ? formatCurrency(fromCents(r.totalExchangeValue))
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {r.balanceCents > 0 ? (
                          <span className="text-green-600">
                            Devuelve {formatCurrency(fromCents(r.balanceCents))}
                          </span>
                        ) : r.balanceCents < 0 ? (
                          <span className="text-amber-600">
                            Paga {formatCurrency(fromCents(Math.abs(r.balanceCents)))}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {returnsList.length} de {pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrev}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <NewReturnDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={() => setShowNewDialog(false)}
      />
    </div>
  )
}

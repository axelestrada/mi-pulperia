import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeftRight, Plus, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NewReturnDialog } from '../features/returns/ui/new-return-dialog'
import { useReturns, type SaleReturn } from '../hooks/use-returns'
import { fromCents } from '../../shared/utils/currency'
import { formatCurrency } from '../../shared/utils/formatCurrency'

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

  const returnsList = useMemo(() => data?.data ?? [], [data?.data])
  const pagination = data?.pagination

  const stats = useMemo(() => {
    const refunds = returnsList.filter(r => r.type === 'refund').length
    const exchanges = returnsList.filter(r => r.type === 'exchange').length
    const totalRefunded = returnsList.reduce(
      (sum, r) => sum + Math.max(0, r.balanceCents),
      0
    )

    return { refunds, exchanges, totalRefunded }
  }, [returnsList])

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devoluciones y Cambios</h1>
          <p className="text-default-500">
            Gestiona devoluciones de dinero y cambios de producto
          </p>
        </div>
        <Button
          onPress={() => setShowNewDialog(true)}
          startContent={<Plus className="size-4" />}
          className="bg-foreground text-background"
        >
          Nueva Devolucion / Cambio
        </Button>
      </div>

      <Card>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-large border border-default-200 p-4">
            <div className="flex items-center gap-3">
              <RotateCcw className="size-5 text-default-500" />
              <div>
                <p className="text-small text-default-500">Devoluciones</p>
                <p className="text-2xl font-semibold">{stats.refunds}</p>
              </div>
            </div>
          </div>
          <div className="rounded-large border border-default-200 p-4">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="size-5 text-default-500" />
              <div>
                <p className="text-small text-default-500">Cambios</p>
                <p className="text-2xl font-semibold">{stats.exchanges}</p>
              </div>
            </div>
          </div>
          <div className="rounded-large border border-default-200 p-4">
            <p className="text-small text-default-500">Total Reembolsado</p>
            <p className="text-2xl font-semibold text-danger">
              {formatCurrency(fromCents(stats.totalRefunded))}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2 font-semibold">
            <RotateCcw className="size-5" />
            Historial
          </div>
          <div className="flex gap-2">
            <Button
              variant={typeFilter === '' ? 'solid' : 'flat'}
              size="sm"
              onPress={() => setTypeFilter('')}
            >
              Todas
            </Button>
            <Button
              variant={typeFilter === 'refund' ? 'solid' : 'flat'}
              size="sm"
              onPress={() => setTypeFilter('refund')}
            >
              Reembolsos
            </Button>
            <Button
              variant={typeFilter === 'exchange' ? 'solid' : 'flat'}
              size="sm"
              onPress={() => setTypeFilter('exchange')}
            >
              Cambios
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : returnsList.length === 0 ? (
            <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-default-500">
              <RotateCcw className="size-8" />
              <p>No hay devoluciones registradas</p>
            </div>
          ) : (
            <>
              <Table aria-label="Historial de devoluciones">
                <TableHeader>
                  <TableColumn>FECHA</TableColumn>
                  <TableColumn>VENTA</TableColumn>
                  <TableColumn className="text-center">TIPO</TableColumn>
                  <TableColumn>MOTIVO / NOTA</TableColumn>
                  <TableColumn className="text-right">MONTO</TableColumn>
                  <TableColumn className="text-center">ESTADO</TableColumn>
                </TableHeader>
                <TableBody items={returnsList}>
                  {(r: SaleReturn) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        {format(new Date(r.createdAt), 'PPp', { locale: es })}
                      </TableCell>
                      <TableCell className="font-medium">#{r.saleNumber ?? r.saleId}</TableCell>
                      <TableCell className="text-center">
                        <Chip
                          size="sm"
                          color={r.type === 'refund' ? 'danger' : 'primary'}
                          variant="flat"
                        >
                          {r.type === 'refund' ? 'Devolucion' : 'Cambio'}
                        </Chip>
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate">{r.notes || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {r.balanceCents > 0
                          ? `-${formatCurrency(fromCents(r.balanceCents))}`
                          : r.balanceCents < 0
                            ? `+${formatCurrency(fromCents(Math.abs(r.balanceCents)))}`
                            : formatCurrency(0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Chip size="sm" color="success" variant="flat">
                          Completado
                        </Chip>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-small text-default-500">
                    Mostrando {returnsList.length} de {pagination.total}
                  </p>
                  <Pagination
                    page={page}
                    total={pagination.totalPages}
                    showControls
                    onChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <NewReturnDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={() => setShowNewDialog(false)}
      />
    </div>
  )
}

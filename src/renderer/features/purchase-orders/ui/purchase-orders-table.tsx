import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

import {
  useDeletePurchaseOrder,
  useSendOrderToSupplier,
  useMarkOrderAsCompleted,
  useCancelOrder,
} from '../hooks/use-purchase-orders'

interface PurchaseOrdersTableProps {
  purchaseOrders: PurchaseOrder[]
  onEdit: (order: PurchaseOrder) => void
  onView: (order: PurchaseOrder) => void
}

const statusConfig = {
  draft: {
    label: 'Borrador',
    variant: 'secondary' as const,
    color: 'text-gray-600',
  },
  sent: {
    label: 'Enviada',
    variant: 'default' as const,
    color: 'text-blue-600',
  },
  partial: {
    label: 'Parcial',
    variant: 'outline' as const,
    color: 'text-yellow-600',
  },
  completed: {
    label: 'Completada',
    variant: 'success' as const,
    color: 'text-green-600',
  },
  cancelled: {
    label: 'Cancelada',
    variant: 'destructive' as const,
    color: 'text-red-600',
  },
}

export function PurchaseOrdersTable({
  purchaseOrders,
  onEdit,
  onView,
}: PurchaseOrdersTableProps) {
  const deletePurchaseOrder = useDeletePurchaseOrder()
  const sendOrderToSupplier = useSendOrderToSupplier()
  const markOrderAsCompleted = useMarkOrderAsCompleted()
  const cancelOrder = useCancelOrder()

  const handleDelete = (order: PurchaseOrder) => {
    if (confirm(`¿Está seguro de eliminar la orden "${order.orderNumber}"?`)) {
      deletePurchaseOrder.mutate(order.id)
    }
  }

  const handleSendToSupplier = (order: PurchaseOrder) => {
    if (confirm(`¿Enviar la orden "${order.orderNumber}" al proveedor?`)) {
      sendOrderToSupplier.mutate(order.id)
    }
  }

  const handleMarkAsCompleted = (order: PurchaseOrder) => {
    if (confirm(`¿Marcar la orden "${order.orderNumber}" como completada?`)) {
      markOrderAsCompleted.mutate(order.id)
    }
  }

  const handleCancel = (order: PurchaseOrder) => {
    const reason = prompt('Ingrese la razón de la cancelación (opcional):')
    if (confirm(`¿Cancelar la orden "${order.orderNumber}"?`)) {
      cancelOrder.mutate({ id: order.id, reason: reason || undefined })
    }
  }

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'N° Orden',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.orderNumber}</div>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Proveedor',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.supplier?.name || 'N/A'}
          </div>
          {row.original.supplier?.contactPerson && (
            <div className="text-sm text-muted-foreground">
              {row.original.supplier.contactPerson}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.original.status
        const config = statusConfig[status]
        return (
          <Badge variant={config.variant} className={config.color}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'orderDate',
      header: 'Fecha de Orden',
      cell: ({ row }) => {
        const date = new Date(row.original.orderDate)
        return format(date, 'dd/MM/yyyy', { locale: es })
      },
    },
    {
      accessorKey: 'expectedDeliveryDate',
      header: 'Fecha Esperada',
      cell: ({ row }) => {
        if (!row.original.expectedDeliveryDate) return '-'
        const date = new Date(row.original.expectedDeliveryDate)
        return format(date, 'dd/MM/yyyy', { locale: es })
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => (
        <div className="font-medium">
          L {(row.original.total / 100).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'itemCount',
      header: 'Items',
      cell: ({ row }) => {
        const itemCount = row.original.items?.length || 0
        return (
          <div className="text-center">
            <Badge variant="outline">
              {itemCount} producto{itemCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'internalNotes',
      header: 'Nota Turno',
      cell: ({ row }) => (
        <div className="max-w-[280px] truncate text-sm text-muted-foreground">
          {row.original.internalNotes || row.original.notes || '-'}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original
        const canEdit = order.status === 'draft'
        const canSend = order.status === 'draft'
        const canComplete =
          order.status === 'sent' || order.status === 'partial'
        const canCancel =
          order.status !== 'completed' && order.status !== 'cancelled'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(order)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>

              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(order)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}

              {canSend && (
                <DropdownMenuItem onClick={() => handleSendToSupplier(order)}>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar al Proveedor
                </DropdownMenuItem>
              )}

              {canComplete && (
                <DropdownMenuItem onClick={() => handleMarkAsCompleted(order)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marcar como Completada
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {canCancel && (
                <DropdownMenuItem
                  onClick={() => handleCancel(order)}
                  className="text-orange-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar
                </DropdownMenuItem>
              )}

              {order.status === 'draft' && (
                <DropdownMenuItem
                  onClick={() => handleDelete(order)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: purchaseOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No se encontraron órdenes de compra.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

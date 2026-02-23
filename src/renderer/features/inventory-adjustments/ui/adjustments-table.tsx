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
  useDeleteInventoryAdjustment,
  useApproveAdjustment,
  useCancelAdjustment,
} from '../hooks/use-adjustments'

interface AdjustmentsTableProps {
  adjustments: InventoryAdjustment[]
  onEdit: (adjustment: InventoryAdjustment) => void
}

const statusConfig = {
  draft: {
    label: 'Borrador',
    variant: 'secondary' as const,
    color: 'text-gray-600',
  },
  approved: {
    label: 'Aprobado',
    variant: 'default' as const,
    color: 'text-green-600',
  },
  cancelled: {
    label: 'Cancelado',
    variant: 'destructive' as const,
    color: 'text-red-600',
  },
}

const typeConfig = {
  adjustment: {
    label: 'Ajuste',
    variant: 'outline' as const,
    color: 'text-blue-600',
  },
  shrinkage: {
    label: 'Merma',
    variant: 'destructive' as const,
    color: 'text-red-600',
  },
}

export function AdjustmentsTable({
  adjustments,
  onEdit,
}: AdjustmentsTableProps) {
  const deleteAdjustment = useDeleteInventoryAdjustment()
  const approveAdjustment = useApproveAdjustment()
  const cancelAdjustment = useCancelAdjustment()

  const handleDelete = (adjustment: InventoryAdjustment) => {
    if (
      confirm(
        `¿Está seguro de eliminar el ajuste "${adjustment.adjustmentNumber}"?`
      )
    ) {
      deleteAdjustment.mutate(adjustment.id)
    }
  }

  const handleApprove = (adjustment: InventoryAdjustment) => {
    if (
      confirm(
        `¿Aprobar y aplicar el ajuste "${adjustment.adjustmentNumber}"? Esta acción no se puede deshacer.`
      )
    ) {
      approveAdjustment.mutate(adjustment.id)
    }
  }

  const handleCancel = (adjustment: InventoryAdjustment) => {
    if (confirm(`¿Cancelar el ajuste "${adjustment.adjustmentNumber}"?`)) {
      cancelAdjustment.mutate(adjustment.id)
    }
  }

  const columns: ColumnDef<InventoryAdjustment>[] = [
    {
      accessorKey: 'adjustmentNumber',
      header: 'N° Ajuste',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.adjustmentNumber}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }) => {
        const type = row.original.type
        const config = typeConfig[type]
        return (
          <Badge variant={config.variant} className={config.color}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'reason',
      header: 'Razón',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.reason}>
          {row.original.reason}
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
      accessorKey: 'itemCount',
      header: 'Productos',
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
      accessorKey: 'totalCostImpact',
      header: 'Impacto',
      cell: ({ row }) => {
        const impact = row.original.totalCostImpact
        return (
          <div
            className={`font-medium ${
              impact > 0 ? 'text-green-600' : impact < 0 ? 'text-red-600' : ''
            }`}
          >
            {impact > 0 ? '+' : ''}L {(impact / 100).toFixed(2)}
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        return format(date, 'dd/MM/yyyy HH:mm', { locale: es })
      },
    },
    {
      accessorKey: 'createdBy',
      header: 'Creado por',
      cell: ({ row }) => row.original.createdBy,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const adjustment = row.original
        const canEdit = adjustment.status === 'draft'
        const canApprove = adjustment.status === 'draft'
        const canCancel = adjustment.status === 'draft'
        const canDelete = adjustment.status === 'draft'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>

              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(adjustment)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}

              {canApprove && (
                <DropdownMenuItem onClick={() => handleApprove(adjustment)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprobar
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {canCancel && (
                <DropdownMenuItem
                  onClick={() => handleCancel(adjustment)}
                  className="text-orange-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar
                </DropdownMenuItem>
              )}

              {canDelete && (
                <DropdownMenuItem
                  onClick={() => handleDelete(adjustment)}
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
    data: adjustments,
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
                No se encontraron ajustes de inventario.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

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
  CreditCard,
  DollarSign,
} from 'lucide-react'

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

import { useDeleteCustomer } from '../hooks/use-customers'

interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
  document?: string
  address?: string
  city?: string
  creditLimit: number
  currentBalance: number
  isActive: boolean
  createdAt: Date
}

interface CustomersTableProps {
  customers: Customer[]
  onEdit: (customer: Customer) => void
}

export function CustomersTable({ customers, onEdit }: CustomersTableProps) {
  const deleteCustomer = useDeleteCustomer()

  const handleDelete = (customer: Customer) => {
    if (confirm(`¿Está seguro de eliminar al cliente "${customer.name}"?`)) {
      deleteCustomer.mutate(customer.id)
    }
  }

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.email && (
            <div className="text-sm text-muted-foreground">
              {row.original.email}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'document',
      header: 'Documento',
      cell: ({ row }) => row.original.document || '-',
    },
    {
      accessorKey: 'phone',
      header: 'Teléfono',
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      accessorKey: 'city',
      header: 'Ciudad',
      cell: ({ row }) => row.original.city || '-',
    },
    {
      accessorKey: 'creditLimit',
      header: 'Límite de Crédito',
      cell: ({ row }) => (
        <div className="text-right">
          L {(row.original.creditLimit / 100).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'currentBalance',
      header: 'Saldo Actual',
      cell: ({ row }) => {
        const balance = row.original.currentBalance
        return (
          <div className="text-right">
            <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
              L {Math.abs(balance / 100).toFixed(2)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const customer = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(customer)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>

              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Ver Créditos
              </DropdownMenuItem>

              <DropdownMenuItem>
                <DollarSign className="mr-2 h-4 w-4" />
                Ajustar Saldo
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => handleDelete(customer)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: customers,
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
                No se encontraron clientes.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

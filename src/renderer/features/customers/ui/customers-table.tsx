import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import {
  CreditCard,
  DollarSign,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
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
  onAddPayment: (customer: Customer) => void
}

const columns = [
  { key: 'name', label: 'NOMBRE' },
  { key: 'document', label: 'DOCUMENTO' },
  { key: 'phone', label: 'TELEFONO' },
  { key: 'city', label: 'CIUDAD' },
  { key: 'creditLimit', label: 'LIMITE DE CREDITO' },
  { key: 'currentBalance', label: 'SALDO ACTUAL' },
  { key: 'isActive', label: 'ESTADO' },
  { key: 'actions', label: 'ACCIONES' },
] as const

export function CustomersTable({
  customers,
  onEdit,
  onAddPayment,
}: CustomersTableProps) {
  const deleteCustomer = useDeleteCustomer()

  const handleDelete = (customer: Customer) => {
    if (confirm(`Esta seguro de eliminar al cliente "${customer.name}"?`)) {
      deleteCustomer.mutate(customer.id)
    }
  }

  return (
    <Table aria-label="Tabla de clientes">
      <TableHeader columns={columns}>
        {column => (
          <TableColumn
            key={column.key}
            align={column.key === 'actions' ? 'center' : 'start'}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent="No se encontraron clientes." items={customers}>
        {customer => (
          <TableRow key={customer.id}>
            <TableCell>
              <div>
                <div className="font-medium">{customer.name}</div>
                {customer.email ? (
                  <div className="text-sm text-default-500">{customer.email}</div>
                ) : null}
              </div>
            </TableCell>
            <TableCell>{customer.document || '-'}</TableCell>
            <TableCell>{customer.phone || '-'}</TableCell>
            <TableCell>{customer.city || '-'}</TableCell>
            <TableCell>L {(customer.creditLimit / 100).toFixed(2)}</TableCell>
            <TableCell>
              <span
                className={
                  customer.currentBalance > 0 ? 'text-danger' : 'text-success'
                }
              >
                L {Math.abs(customer.currentBalance / 100).toFixed(2)}
              </span>
            </TableCell>
            <TableCell>
              <Chip
                size="sm"
                variant="flat"
                color={customer.isActive ? 'success' : 'default'}
              >
                {customer.isActive ? 'Activo' : 'Inactivo'}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="flex justify-center">
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label={`Acciones de ${customer.name}`}>
                    <DropdownSection showDivider title="Acciones">
                      <DropdownItem
                        key="edit"
                        startContent={<Pencil className="h-4 w-4" />}
                        onPress={() => onEdit(customer)}
                      >
                        Editar
                      </DropdownItem>
                      <DropdownItem
                        key="credits"
                        startContent={<CreditCard className="h-4 w-4" />}
                      >
                        Ver Creditos
                      </DropdownItem>
                      <DropdownItem
                        key="balance"
                        startContent={<DollarSign className="h-4 w-4" />}
                        onPress={() => onAddPayment(customer)}
                        isDisabled={customer.currentBalance <= 0}
                      >
                        Agregar Abono
                      </DropdownItem>
                    </DropdownSection>
                    <DropdownSection title="Zona de Peligro">
                      <DropdownItem
                        key="delete"
                        color="danger"
                        className="text-danger"
                        startContent={<Trash2 className="h-4 w-4" />}
                        onPress={() => handleDelete(customer)}
                      >
                        Eliminar
                      </DropdownItem>
                    </DropdownSection>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

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
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useDeleteSupplier } from '../hooks/use-suppliers'

interface SuppliersTableProps {
  suppliers: Supplier[]
  onEdit: (supplier: Supplier) => void
}

export function SuppliersTable({ suppliers, onEdit }: SuppliersTableProps) {
  const deleteSupplier = useDeleteSupplier()

  const handleDelete = (supplier: Supplier) => {
    if (confirm(`Esta seguro de eliminar el proveedor "${supplier.name}"?`)) {
      deleteSupplier.mutate(supplier.id)
    }
  }

  return (
    <Table aria-label="Tabla de proveedores" selectionMode="none">
      <TableHeader>
        <TableColumn>NOMBRE</TableColumn>
        <TableColumn>CONTACTO</TableColumn>
        <TableColumn>EMAIL</TableColumn>
        <TableColumn>CIUDAD</TableColumn>
        <TableColumn>TERMINOS DE PAGO</TableColumn>
        <TableColumn>SALDO ACTUAL</TableColumn>
        <TableColumn>ESTADO</TableColumn>
        <TableColumn align="center">ACCIONES</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No se encontraron proveedores." items={suppliers}>
        {supplier => (
          <TableRow key={supplier.id}>
            <TableCell>
              <div>
                <div className="font-medium">{supplier.name}</div>
                {supplier.companyName && (
                  <div className="text-sm text-default-500">
                    {supplier.companyName}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div>
                {supplier.contactPerson && (
                  <div className="text-sm">{supplier.contactPerson}</div>
                )}
                {supplier.phone && (
                  <div className="text-xs text-default-500">{supplier.phone}</div>
                )}
              </div>
            </TableCell>
            <TableCell>{supplier.email || '-'}</TableCell>
            <TableCell>{supplier.city || '-'}</TableCell>
            <TableCell>{supplier.paymentTerms} dias</TableCell>
            <TableCell>
              <span
                className={
                  supplier.currentBalance > 0 ? 'text-danger' : 'text-success'
                }
              >
                L {(supplier.currentBalance / 100).toFixed(2)}
              </span>
            </TableCell>
            <TableCell>
              <Chip
                size="sm"
                variant="flat"
                color={supplier.isActive ? 'success' : 'default'}
              >
                {supplier.isActive ? 'Activo' : 'Inactivo'}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="flex justify-center">
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <MoreHorizontal className="h-4 w-4 text-default-500" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Acciones de proveedor">
                    <DropdownSection title="Acciones" showDivider>
                      <DropdownItem
                        key="edit"
                        startContent={<Pencil className="h-4 w-4" />}
                        onPress={() => onEdit(supplier)}
                      >
                        Editar
                      </DropdownItem>
                    </DropdownSection>
                    <DropdownSection title="Zona de peligro">
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<Trash2 className="h-4 w-4" />}
                        onPress={() => handleDelete(supplier)}
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

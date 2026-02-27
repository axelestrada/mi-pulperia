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
  CheckCircle,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  useApproveAdjustment,
  useCancelAdjustment,
  useDeleteInventoryAdjustment,
} from '../hooks/use-adjustments'

interface AdjustmentsTableProps {
  adjustments: InventoryAdjustment[]
  onEdit: (adjustment: InventoryAdjustment) => void
}

const statusConfig: Record<
  InventoryAdjustment['status'],
  { label: string; color: 'default' | 'success' | 'danger' }
> = {
  draft: { label: 'Borrador', color: 'default' },
  approved: { label: 'Aprobado', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'danger' },
}

const typeConfig: Record<
  InventoryAdjustment['type'],
  { label: string; color: 'primary' | 'danger' }
> = {
  adjustment: { label: 'Ajuste', color: 'primary' },
  shrinkage: { label: 'Merma', color: 'danger' },
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
        `Esta seguro de eliminar el ajuste "${adjustment.adjustmentNumber}"?`
      )
    ) {
      deleteAdjustment.mutate(adjustment.id)
    }
  }

  const handleApprove = (adjustment: InventoryAdjustment) => {
    if (
      confirm(
        `Aprobar y aplicar el ajuste "${adjustment.adjustmentNumber}"? Esta accion no se puede deshacer.`
      )
    ) {
      approveAdjustment.mutate(adjustment.id)
    }
  }

  const handleCancel = (adjustment: InventoryAdjustment) => {
    if (confirm(`Cancelar el ajuste "${adjustment.adjustmentNumber}"?`)) {
      cancelAdjustment.mutate(adjustment.id)
    }
  }

  const totalItems = adjustments.length

  return (
    <Table
      aria-label="Ajustes de inventario"
      selectionMode="none"
      isHeaderSticky
      topContent={
        <div className="flex w-full items-center justify-between">
          <span className="text-small text-default-400">
            Total {totalItems} ajuste{totalItems !== 1 ? 's' : ''}
          </span>
        </div>
      }
      topContentPlacement="outside"
      classNames={{
        wrapper: 'max-h-[520px]',
      }}
    >
      <TableHeader>
        <TableColumn>N° AJUSTE</TableColumn>
        <TableColumn>TIPO</TableColumn>
        <TableColumn>RAZON</TableColumn>
        <TableColumn>ESTADO</TableColumn>
        <TableColumn>PRODUCTOS</TableColumn>
        <TableColumn align="end">IMPACTO</TableColumn>
        <TableColumn>FECHA</TableColumn>
        <TableColumn>CREADO POR</TableColumn>
        <TableColumn align="center">ACCIONES</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent="No se encontraron ajustes de inventario."
        items={adjustments}
      >
        {adjustment => {
          const canEdit = adjustment.status === 'draft'
          const canApprove = adjustment.status === 'draft'
          const canCancel = adjustment.status === 'draft'
          const canDelete = adjustment.status === 'draft'
          const itemCount = adjustment.items?.length || 0
          const impact = adjustment.totalCostImpact

          return (
            <TableRow key={adjustment.id} className="hover:bg-default-100">
              <TableCell>
                <span className="font-medium">{adjustment.adjustmentNumber}</span>
              </TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  variant="flat"
                  color={typeConfig[adjustment.type].color}
                >
                  {typeConfig[adjustment.type].label}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="max-w-56 truncate" title={adjustment.reason}>
                  {adjustment.reason}
                </div>
              </TableCell>
              <TableCell>
                <Chip
                  className="rounded-lg border-none bg-default-100"
                  size="sm"
                  variant="dot"
                  color={statusConfig[adjustment.status].color}
                >
                  {statusConfig[adjustment.status].label}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat">
                  {itemCount} producto{itemCount !== 1 ? 's' : ''}
                </Chip>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={`font-medium ${
                    impact > 0
                      ? 'text-success'
                      : impact < 0
                        ? 'text-danger'
                        : ''
                  }`}
                >
                  {impact > 0 ? '+' : ''}L {(impact / 100).toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                {format(new Date(adjustment.createdAt), 'dd/MM/yyyy HH:mm', {
                  locale: es,
                })}
              </TableCell>
              <TableCell>{adjustment.createdBy}</TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <MoreHorizontal className="h-4 w-4 text-default-500" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Acciones de ajuste">
                      <DropdownSection title="Acciones" showDivider>
                        <DropdownItem
                          key="view"
                          startContent={<Eye className="h-4 w-4" />}
                        >
                          Ver Detalles
                        </DropdownItem>

                        {canEdit && (
                          <DropdownItem
                            key="edit"
                            onPress={() => onEdit(adjustment)}
                            startContent={<Pencil className="h-4 w-4" />}
                          >
                            Editar
                          </DropdownItem>
                        )}

                        {canApprove && (
                          <DropdownItem
                            key="approve"
                            onPress={() => handleApprove(adjustment)}
                            startContent={<CheckCircle className="h-4 w-4" />}
                          >
                            Aprobar
                          </DropdownItem>
                        )}

                        {canCancel && (
                          <DropdownItem
                            key="cancel"
                            onPress={() => handleCancel(adjustment)}
                            className="text-warning"
                            startContent={<XCircle className="h-4 w-4" />}
                          >
                            Cancelar
                          </DropdownItem>
                        )}
                      </DropdownSection>

                      {canDelete && (
                        <DropdownSection title="Zona de peligro">
                          <DropdownItem
                            key="delete"
                            onPress={() => handleDelete(adjustment)}
                            color="danger"
                            className="text-danger"
                            startContent={<Trash2 className="h-4 w-4" />}
                          >
                            Eliminar
                          </DropdownItem>
                        </DropdownSection>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </TableCell>
            </TableRow>
          )
        }}
      </TableBody>
    </Table>
  )
}

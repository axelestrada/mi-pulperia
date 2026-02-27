import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CheckCircle,
  Eye,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react'
import {
  useCancelOrder,
  useDeletePurchaseOrder,
  useMarkOrderAsCompleted,
  useSendOrderToSupplier,
} from '../hooks/use-purchase-orders'

interface PurchaseOrdersTableProps {
  purchaseOrders: PurchaseOrder[]
  onEdit: (order: PurchaseOrder) => void
  onView: (order: PurchaseOrder) => void
}

const statusConfig: Record<
  PurchaseOrder['status'],
  {
    label: string
    color: 'default' | 'primary' | 'warning' | 'success' | 'danger'
  }
> = {
  draft: { label: 'Borrador', color: 'default' },
  sent: { label: 'Enviada', color: 'primary' },
  partial: { label: 'Parcial', color: 'warning' },
  completed: { label: 'Completada', color: 'success' },
  cancelled: { label: 'Cancelada', color: 'danger' },
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
    if (confirm(`Esta seguro de eliminar la orden "${order.orderNumber}"?`)) {
      deletePurchaseOrder.mutate(order.id)
    }
  }

  const handleSendToSupplier = (order: PurchaseOrder) => {
    if (confirm(`Enviar la orden "${order.orderNumber}" al proveedor?`)) {
      sendOrderToSupplier.mutate(order.id)
    }
  }

  const handleMarkAsCompleted = (order: PurchaseOrder) => {
    if (confirm(`Marcar la orden "${order.orderNumber}" como completada?`)) {
      markOrderAsCompleted.mutate(order.id)
    }
  }

  const handleCancel = (order: PurchaseOrder) => {
    const reason = prompt('Ingrese la razon de la cancelacion (opcional):')
    if (confirm(`Cancelar la orden "${order.orderNumber}"?`)) {
      cancelOrder.mutate({ id: order.id, reason: reason || undefined })
    }
  }

  return (
    <Table aria-label="Tabla de ordenes de compra" selectionMode="none">
      <TableHeader>
        <TableColumn>N ORDEN</TableColumn>
        <TableColumn>PROVEEDOR</TableColumn>
        <TableColumn>ESTADO</TableColumn>
        <TableColumn>FECHA DE ORDEN</TableColumn>
        <TableColumn>FECHA ESPERADA</TableColumn>
        <TableColumn className="text-right">TOTAL</TableColumn>
        <TableColumn>ITEMS</TableColumn>
        <TableColumn>NOTA TURNO</TableColumn>
        <TableColumn align="center">ACCIONES</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent="No se encontraron ordenes de compra."
        items={purchaseOrders}
      >
        {order => {
          const canEdit = order.status === 'draft'
          const canSend = order.status === 'draft'
          const canComplete = order.status === 'sent' || order.status === 'partial'
          const canCancel =
            order.status !== 'completed' && order.status !== 'cancelled'

          return (
            <TableRow key={order.id}>
              <TableCell>
                <span className="font-medium">{order.orderNumber}</span>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.supplier?.name || 'N/A'}</div>
                  {order.supplier?.contactPerson && (
                    <div className="text-sm text-default-500">
                      {order.supplier.contactPerson}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  variant="flat"
                  color={statusConfig[order.status].color}
                >
                  {statusConfig[order.status].label}
                </Chip>
              </TableCell>
              <TableCell>
                {format(new Date(order.orderDate), 'dd/MM/yyyy', { locale: es })}
              </TableCell>
              <TableCell>
                {order.expectedDeliveryDate
                  ? format(new Date(order.expectedDeliveryDate), 'dd/MM/yyyy', {
                      locale: es,
                    })
                  : '-'}
              </TableCell>
              <TableCell className="text-right font-medium">
                L {(order.total / 100).toFixed(2)}
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat">
                  {(order.items?.length || 0)} producto
                  {(order.items?.length || 0) !== 1 ? 's' : ''}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="max-w-[280px] truncate text-sm text-default-500">
                  {order.internalNotes || order.notes || '-'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label={`Acciones para ${order.orderNumber}`}>
                      <DropdownItem
                        key="view"
                        startContent={<Eye className="h-4 w-4" />}
                        onPress={() => onView(order)}
                      >
                        Ver Detalles
                      </DropdownItem>

                      <DropdownItem
                        key="edit"
                        startContent={<Pencil className="h-4 w-4" />}
                        onPress={() => onEdit(order)}
                        isDisabled={!canEdit}
                      >
                        Editar
                      </DropdownItem>

                      <DropdownItem
                        key="send"
                        startContent={<Send className="h-4 w-4" />}
                        onPress={() => handleSendToSupplier(order)}
                        isDisabled={!canSend}
                      >
                        Enviar al Proveedor
                      </DropdownItem>

                      <DropdownItem
                        key="complete"
                        startContent={<CheckCircle className="h-4 w-4" />}
                        onPress={() => handleMarkAsCompleted(order)}
                        isDisabled={!canComplete}
                      >
                        Marcar como Completada
                      </DropdownItem>

                      <DropdownItem
                        key="cancel"
                        color="warning"
                        startContent={<XCircle className="h-4 w-4" />}
                        onPress={() => handleCancel(order)}
                        isDisabled={!canCancel}
                      >
                        Cancelar
                      </DropdownItem>

                      <DropdownItem
                        key="delete"
                        color="danger"
                        className="text-danger"
                        startContent={<Trash2 className="h-4 w-4" />}
                        onPress={() => handleDelete(order)}
                        isDisabled={order.status !== 'draft'}
                      >
                        Eliminar
                      </DropdownItem>
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

import type { Selection } from '@heroui/react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
  Spinner,
  Textarea,
} from '@heroui/react'
import {
  CheckCircle,
  ClipboardList,
  Clock,
  Plus,
  Search,
  ShoppingCart,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import {
  SHIFT_HANDOVER_UPDATED_EVENT,
  getShiftModuleNote,
  setShiftModuleNote,
} from '@/features/operations/model/shift-handover-storage'
import { usePurchaseOrders } from '../features/purchase-orders/hooks/use-purchase-orders'
import { PurchaseOrderFormDialog } from '../features/purchase-orders/ui/purchase-order-form-dialog'
import { PurchaseOrdersTable } from '../features/purchase-orders/ui/purchase-orders-table'

const getSingleSelectionKey = (keys: Selection, fallback = 'all') => {
  if (keys === 'all') return fallback
  return Array.from(keys)[0]?.toString() ?? fallback
}

export function PurchaseOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | undefined>()
  const [shiftNote, setShiftNote] = useState(() =>
    getShiftModuleNote('purchase-orders')
  )

  const { data: purchaseOrders = [], isLoading, error } = usePurchaseOrders()

  useEffect(() => {
    const refreshShiftNote = () =>
      setShiftNote(getShiftModuleNote('purchase-orders'))

    window.addEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
    return () =>
      window.removeEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
  }, [])

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.supplier?.name.toLowerCase() || '').includes(
        searchTerm.toLowerCase()
      ) ||
      (order.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter(order => order.status === 'draft').length,
    sent: purchaseOrders.filter(order => order.status === 'sent').length,
    completed: purchaseOrders.filter(order => order.status === 'completed').length,
    pendingValue: purchaseOrders
      .filter(order => order.status === 'sent' || order.status === 'partial')
      .reduce((sum, order) => sum + order.total, 0),
  }

  const supplierChecklist = useMemo(() => {
    const pendingOrders = purchaseOrders.filter(
      order => order.status === 'draft' || order.status === 'sent'
    )

    const grouped = new Map<
      string,
      { supplierName: string; orders: number; total: number; notes: string[] }
    >()

    pendingOrders.forEach(order => {
      const supplierName = order.supplier?.name || 'Proveedor no definido'

      if (!grouped.has(supplierName)) {
        grouped.set(supplierName, {
          supplierName,
          orders: 0,
          total: 0,
          notes: [],
        })
      }

      const item = grouped.get(supplierName)
      if (!item) return

      item.orders += 1
      item.total += order.total
      if (order.internalNotes) item.notes.push(order.internalNotes)
      if (order.notes) item.notes.push(order.notes)
    })

    return Array.from(grouped.values()).sort((a, b) => b.total - a.total)
  }, [purchaseOrders])

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order)
    setIsDialogOpen(true)
  }

  const handleView = (order: PurchaseOrder) => {
    sileo.info({
      title: `Orden ${order.orderNumber}`,
      description: 'Usa el menu para editar o cambiar estado.',
    })
  }

  const handleCreate = () => {
    setEditingOrder(undefined)
    setIsDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingOrder(undefined)
    }
  }

  const handleSaveShiftNote = () => {
    setShiftModuleNote('purchase-orders', shiftNote)
    sileo.success({ title: 'Nota de turno guardada en ordenes de compra' })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <Spinner className="mb-4" />
          <p className="text-default-500">Cargando ordenes de compra...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-danger">Error al cargar las ordenes de compra</p>
          <Button onPress={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <PageHeader
        title="Lista de Compra por Proveedor"
        description="Deja al siguiente turno que comprar, cuanto y a quien."
        actions={
          <Button startContent={<Plus className="h-4 w-4" />} onPress={handleCreate}>
            Nueva Orden
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Total Ordenes</h3>
            <ShoppingCart className="h-4 w-4 text-default-500" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-default-500">{stats.draft} borradores</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Pendientes</h3>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold text-warning">{stats.sent}</div>
            <p className="text-xs text-default-500">Enviadas a proveedores</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Completadas</h3>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold text-success">{stats.completed}</div>
            <p className="text-xs text-default-500">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% del total
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium">Valor Pendiente</h3>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">L {(stats.pendingValue / 100).toFixed(2)}</div>
            <p className="text-xs text-default-500">Por recibir</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="flex items-center gap-2 font-semibold">
            <ClipboardList className="h-5 w-5" />
            Checklist para Turno / Proveedor
          </h3>
          <p className="text-sm text-default-500">
            Resumen de ordenes pendientes para facilitar el cambio de turno.
          </p>
        </CardHeader>
        <CardBody className="gap-4">
          {supplierChecklist.length === 0 ? (
            <p className="text-sm text-default-500">
              No hay ordenes pendientes para proveedores.
            </p>
          ) : (
            <div className="space-y-3">
              {supplierChecklist.map(item => (
                <div
                  key={item.supplierName}
                  className="space-y-2 rounded-large border border-default-200 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{item.supplierName}</p>
                    <Chip size="sm" variant="flat">
                      {item.orders} orden{item.orders !== 1 ? 'es' : ''}
                    </Chip>
                  </div>
                  <p className="text-sm text-default-500">
                    Monto pendiente: L {(item.total / 100).toFixed(2)}
                  </p>
                  {item.notes.length > 0 && (
                    <p className="text-sm">
                      Ultima nota: {item.notes[item.notes.length - 1]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Nota de turno (compras)</p>
            <Textarea
              placeholder="Ej. Comprar gaseosas con proveedor X y confirmar precios."
              value={shiftNote}
              onValueChange={setShiftNote}
              minRows={3}
            />
            <Button size="sm" onPress={handleSaveShiftNote}>
              Guardar nota
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Filtros</h3>
          <p className="text-sm text-default-500">Busca y filtra ordenes de compra</p>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input
              placeholder="Buscar por numero, proveedor o notas..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Search className="h-4 w-4 text-default-400" />}
            />
            <Select
              aria-label="Estado de orden"
              selectedKeys={[statusFilter]}
              onSelectionChange={keys =>
                setStatusFilter(getSingleSelectionKey(keys))
              }
              className="w-full md:w-48"
            >
              <SelectItem key="all">Todos</SelectItem>
              <SelectItem key="draft">Borrador</SelectItem>
              <SelectItem key="sent">Enviada</SelectItem>
              <SelectItem key="partial">Parcial</SelectItem>
              <SelectItem key="completed">Completada</SelectItem>
              <SelectItem key="cancelled">Cancelada</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Resultados</h3>
              <p className="text-sm text-default-500">
                {filteredOrders.length} orden
                {filteredOrders.length !== 1 ? 'es' : ''} encontrada
                {filteredOrders.length !== 1 ? 's' : ''}
              </p>
            </div>
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                variant="light"
                size="sm"
                onPress={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {filteredOrders.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-default-500">
                {purchaseOrders.length === 0
                  ? 'No tienes ordenes de compra registradas'
                  : 'No se encontraron ordenes con los filtros aplicados'}
              </p>
              {purchaseOrders.length === 0 && (
                <Button
                  startContent={<Plus className="h-4 w-4" />}
                  onPress={handleCreate}
                >
                  Crear Primera Orden
                </Button>
              )}
            </div>
          ) : (
            <PurchaseOrdersTable
              purchaseOrders={filteredOrders}
              onEdit={handleEdit}
              onView={handleView}
            />
          )}
        </CardBody>
      </Card>

      <PurchaseOrderFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        purchaseOrder={editingOrder}
      />
    </div>
  )
}

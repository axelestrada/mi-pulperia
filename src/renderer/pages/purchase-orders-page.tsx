import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  ShoppingCart,
  Clock,
  CheckCircle,
  ClipboardList,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { usePurchaseOrders } from '../features/purchase-orders/hooks/use-purchase-orders'
import { PurchaseOrdersTable } from '../features/purchase-orders/ui/purchase-orders-table'
import { PurchaseOrderFormDialog } from '../features/purchase-orders/ui/purchase-order-form-dialog'
import {
  SHIFT_HANDOVER_UPDATED_EVENT,
  getShiftModuleNote,
  setShiftModuleNote,
} from '@/features/operations/model/shift-handover-storage'

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

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter(o => o.status === 'draft').length,
    sent: purchaseOrders.filter(o => o.status === 'sent').length,
    completed: purchaseOrders.filter(o => o.status === 'completed').length,
    totalValue: purchaseOrders.reduce((sum, o) => sum + o.total, 0),
    pendingValue: purchaseOrders
      .filter(o => o.status === 'sent' || o.status === 'partial')
      .reduce((sum, o) => sum + o.total, 0),
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
      const item = grouped.get(supplierName)!
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

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingOrder(undefined)
  }

  const handleSaveShiftNote = () => {
    setShiftModuleNote('purchase-orders', shiftNote)
    sileo.success({ title: 'Nota de turno guardada en órdenes de compra' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando órdenes de compra...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error al cargar las órdenes de compra
          </p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Lista de Compra por Proveedor
          </h1>
          <p className="text-muted-foreground">
            Deja al siguiente turno que comprar, cuanto y a quien.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Orden
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.draft} borradores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">
              Enviadas a proveedores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Pendiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              L {(stats.pendingValue / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Por recibir</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Checklist para Turno / Proveedor
          </CardTitle>
          <CardDescription>
            Resumen de órdenes pendientes para facilitar el cambio de turno.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {supplierChecklist.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay órdenes pendientes para proveedores.
            </p>
          ) : (
            <div className="space-y-3">
              {supplierChecklist.map(item => (
                <div
                  key={item.supplierName}
                  className="rounded-lg border p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{item.supplierName}</p>
                    <Badge variant="outline">
                      {item.orders} orden{item.orders !== 1 ? 'es' : ''}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
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
              value={shiftNote}
              onChange={e => setShiftNote(e.target.value)}
              placeholder="Ej. Comprar gaseosas con proveedor X y confirmar precios."
            />
            <Button size="sm" onClick={handleSaveShiftNote}>
              Guardar nota
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra órdenes de compra</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, proveedor o notas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="sent">Enviada</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resultados</CardTitle>
              <CardDescription>
                {filteredOrders.length} orden
                {filteredOrders.length !== 1 ? 'es' : ''} encontrada
                {filteredOrders.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {purchaseOrders.length === 0
                  ? 'No tienes órdenes de compra registradas'
                  : 'No se encontraron órdenes con los filtros aplicados'}
              </p>
              {purchaseOrders.length === 0 && (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
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
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <PurchaseOrderFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        purchaseOrder={editingOrder}
      />
    </div>
  )
}


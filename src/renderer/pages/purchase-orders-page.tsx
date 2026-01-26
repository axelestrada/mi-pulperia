import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  ShoppingCart,
  Clock,
  CheckCircle,
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

import { usePurchaseOrders } from '../features/purchase-orders/hooks/use-purchase-orders'
import { PurchaseOrdersTable } from '../features/purchase-orders/ui/purchase-orders-table'
import { PurchaseOrderFormDialog } from '../features/purchase-orders/ui/purchase-order-form-dialog'

export function PurchaseOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | undefined>()
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | undefined>()

  const { data: purchaseOrders = [], isLoading, error } = usePurchaseOrders()

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

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order)
    setIsDialogOpen(true)
  }

  const handleView = (order: PurchaseOrder) => {
    setViewingOrder(order)
    // Here you could open a view-only dialog or navigate to a details page
  }

  const handleCreate = () => {
    setEditingOrder(undefined)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingOrder(undefined)
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
            Órdenes de Compra
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus listas de compra y órdenes para proveedores
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

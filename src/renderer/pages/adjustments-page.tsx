import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  TrendingDown,
  Calculator,
  AlertTriangle,
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

import { useInventoryAdjustments } from '../features/inventory-adjustments/hooks/use-adjustments'
import { AdjustmentFormDialog } from '../features/inventory-adjustments/ui/adjustment-form-dialog'
import { AdjustmentsTable } from '../features/inventory-adjustments/ui/adjustments-table'

export function AdjustmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAdjustment, setEditingAdjustment] = useState<
    InventoryAdjustment | undefined
  >()

  const { data: adjustments = [], isLoading, error } = useInventoryAdjustments()

  const filteredAdjustments = adjustments.filter(adjustment => {
    const matchesSearch =
      adjustment.adjustmentNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      adjustment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (adjustment.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || adjustment.type === typeFilter

    const matchesStatus =
      statusFilter === 'all' || adjustment.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: adjustments.length,
    adjustments: adjustments.filter(a => a.type === 'adjustment').length,
    shrinkages: adjustments.filter(a => a.type === 'shrinkage').length,
    pending: adjustments.filter(a => a.status === 'draft').length,
    approved: adjustments.filter(a => a.status === 'approved').length,
    totalCostImpact: adjustments
      .filter(a => a.status === 'approved')
      .reduce((sum, a) => sum + a.totalCostImpact, 0),
    shrinkageImpact: adjustments
      .filter(a => a.type === 'shrinkage' && a.status === 'approved')
      .reduce((sum, a) => sum + a.totalCostImpact, 0),
  }

  const handleEdit = (adjustment: InventoryAdjustment) => {
    setEditingAdjustment(adjustment)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingAdjustment(undefined)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingAdjustment(undefined)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Cargando ajustes de inventario...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar los ajustes</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Ajustes y Merma</h1>
          <p className="text-muted-foreground">
            Gestiona ajustes de inventario y mermas por lote específico
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ajuste
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ajustes</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.adjustments} ajustes, {stats.shrinkages} mermas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Por aprobar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impacto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.totalCostImpact >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              L {Math.abs(stats.totalCostImpact / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCostImpact >= 0 ? 'Ganancia' : 'Pérdida'} acumulada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mermas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              L {Math.abs(stats.shrinkageImpact / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Pérdidas por merma</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busca y filtra ajustes de inventario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, razón o notas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="adjustment">Ajustes</SelectItem>
                <SelectItem value="shrinkage">Mermas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
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
                {filteredAdjustments.length} ajuste
                {filteredAdjustments.length !== 1 ? 's' : ''} encontrado
                {filteredAdjustments.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setTypeFilter('all')
                  setStatusFilter('all')
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredAdjustments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {adjustments.length === 0
                  ? 'No tienes ajustes de inventario registrados'
                  : 'No se encontraron ajustes con los filtros aplicados'}
              </p>
              {adjustments.length === 0 && (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primer Ajuste
                </Button>
              )}
            </div>
          ) : (
            <AdjustmentsTable
              adjustments={filteredAdjustments}
              onEdit={handleEdit}
            />
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <AdjustmentFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        adjustment={editingAdjustment}
      />
    </div>
  )
}

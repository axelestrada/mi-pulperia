import type { Selection } from '@heroui/react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Spinner,
} from '@heroui/react'
import {
  AlertTriangle,
  Calculator,
  Plus,
  Search,
  TrendingDown,
} from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { useInventoryAdjustments } from '../features/inventory-adjustments/hooks/use-adjustments'
import { AdjustmentFormDialog } from '../features/inventory-adjustments/ui/adjustment-form-dialog'
import { AdjustmentsTable } from '../features/inventory-adjustments/ui/adjustments-table'

const getSingleSelectionKey = (keys: Selection, fallback = 'all') => {
  if (keys === 'all') return fallback
  return Array.from(keys)[0]?.toString() ?? fallback
}

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

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingAdjustment(undefined)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <Spinner className="mb-4" />
          <p className="text-default-500">Cargando ajustes de inventario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-danger">Error al cargar los ajustes</p>
          <Button onPress={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <PageHeader
        title="Ajustes y Merma"
        description="Gestiona ajustes de inventario y mermas por lote especifico"
        actions={
          <Button startContent={<Plus className="h-4 w-4" />} onPress={handleCreate}>
            Nuevo Ajuste
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Total Ajustes</h3>
            <Calculator className="h-4 w-4 text-default-500" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-default-500">
              {stats.adjustments} ajustes, {stats.shrinkages} mermas
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Pendientes</h3>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <p className="text-xs text-default-500">Por aprobar</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Impacto Total</h3>
          </CardHeader>
          <CardBody>
            <div
              className={`text-2xl font-bold ${
                stats.totalCostImpact >= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              L {Math.abs(stats.totalCostImpact / 100).toFixed(2)}
            </div>
            <p className="text-xs text-default-500">
              {stats.totalCostImpact >= 0 ? 'Ganancia' : 'Perdida'} acumulada
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Mermas</h3>
            <TrendingDown className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold text-danger">
              L {Math.abs(stats.shrinkageImpact / 100).toFixed(2)}
            </div>
            <p className="text-xs text-default-500">Perdidas por merma</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Filtros</h3>
          <p className="text-sm text-default-500">Busca y filtra ajustes de inventario</p>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input
              placeholder="Buscar por numero, razon o notas..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Search className="h-4 w-4 text-default-400" />}
            />
            <Select
              aria-label="Tipo de ajuste"
              selectedKeys={[typeFilter]}
              onSelectionChange={keys => setTypeFilter(getSingleSelectionKey(keys))}
              className="w-full md:w-44"
            >
              <SelectItem key="all">Todos</SelectItem>
              <SelectItem key="adjustment">Ajustes</SelectItem>
              <SelectItem key="shrinkage">Mermas</SelectItem>
            </Select>
            <Select
              aria-label="Estado del ajuste"
              selectedKeys={[statusFilter]}
              onSelectionChange={keys =>
                setStatusFilter(getSingleSelectionKey(keys))
              }
              className="w-full md:w-44"
            >
              <SelectItem key="all">Todos</SelectItem>
              <SelectItem key="draft">Borrador</SelectItem>
              <SelectItem key="approved">Aprobado</SelectItem>
              <SelectItem key="cancelled">Cancelado</SelectItem>
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
                {filteredAdjustments.length} ajuste
                {filteredAdjustments.length !== 1 ? 's' : ''} encontrado
                {filteredAdjustments.length !== 1 ? 's' : ''}
              </p>
            </div>
            {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="light"
                size="sm"
                onPress={() => {
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
        <CardBody>
          {filteredAdjustments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-default-500">
                {adjustments.length === 0
                  ? 'No tienes ajustes de inventario registrados'
                  : 'No se encontraron ajustes con los filtros aplicados'}
              </p>
              {adjustments.length === 0 && (
                <Button startContent={<Plus className="h-4 w-4" />} onPress={handleCreate}>
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
        </CardBody>
      </Card>

      <AdjustmentFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        adjustment={editingAdjustment}
      />
    </div>
  )
}

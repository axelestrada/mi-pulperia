import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'

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

import { useSuppliers } from '../features/suppliers/hooks/use-suppliers'
import { SuppliersTable } from '../features/suppliers/ui/suppliers-table'
import { SupplierFormDialog } from '../features/suppliers/ui/supplier-form-dialog'

export function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>()

  const { data: suppliers = [], isLoading, error } = useSuppliers()

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.companyName?.toLowerCase() || '').includes(
        searchTerm.toLowerCase()
      ) ||
      (supplier.contactPerson?.toLowerCase() || '').includes(
        searchTerm.toLowerCase()
      ) ||
      (supplier.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && supplier.isActive) ||
      (statusFilter === 'inactive' && !supplier.isActive)

    return matchesSearch && matchesStatus
  })

  const activeSuppliers = suppliers.filter(s => s.isActive).length
  const totalBalance = suppliers.reduce((sum, s) => sum + s.currentBalance, 0)

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingSupplier(undefined)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSupplier(undefined)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando proveedores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar los proveedores</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-muted-foreground">
            Gestiona la información de tus proveedores y sus términos
            comerciales
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Proveedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeSuppliers} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Proveedores Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              {suppliers.length > 0
                ? Math.round((activeSuppliers / suppliers.length) * 100)
                : 0}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span
                className={totalBalance > 0 ? 'text-red-600' : 'text-green-600'}
              >
                L {(Math.abs(totalBalance) / 100).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {totalBalance > 0
                ? 'Por pagar'
                : totalBalance < 0
                  ? 'A favor'
                  : 'Sin saldo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra proveedores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, empresa, contacto o email..."
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
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
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
                {filteredSuppliers.length} proveedor
                {filteredSuppliers.length !== 1 ? 'es' : ''} encontrado
                {filteredSuppliers.length !== 1 ? 's' : ''}
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
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {suppliers.length === 0
                  ? 'No tienes proveedores registrados'
                  : 'No se encontraron proveedores con los filtros aplicados'}
              </p>
              {suppliers.length === 0 && (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primer Proveedor
                </Button>
              )}
            </div>
          ) : (
            <SuppliersTable suppliers={filteredSuppliers} onEdit={handleEdit} />
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <SupplierFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        supplier={editingSupplier}
      />
    </div>
  )
}

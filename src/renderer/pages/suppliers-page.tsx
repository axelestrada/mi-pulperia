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
import { Building2, Plus, Search, Wallet } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { useSuppliers } from '../features/suppliers/hooks/use-suppliers'
import { SupplierFormDialog } from '../features/suppliers/ui/supplier-form-dialog'
import { SuppliersTable } from '../features/suppliers/ui/suppliers-table'

const getSingleSelectionKey = (keys: Selection, fallback = 'all') => {
  if (keys === 'all') return fallback
  return Array.from(keys)[0]?.toString() ?? fallback
}

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

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingSupplier(undefined)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <Spinner className="mb-4" />
          <p className="text-default-500">Cargando proveedores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-danger">Error al cargar los proveedores</p>
          <Button onPress={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <PageHeader
        title="Proveedores"
        description="Gestiona la informacion de tus proveedores y sus terminos comerciales"
        actions={
          <Button
            startContent={<Plus className="h-4 w-4" />}
            onPress={handleCreate}
          >
            Nuevo Proveedor
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Total Proveedores</h3>
            <Building2 className="h-4 w-4 text-default-500" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-default-500">{activeSuppliers} activos</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Proveedores Activos</h3>
            <Building2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">{activeSuppliers}</div>
            <p className="text-xs text-default-500">
              {suppliers.length > 0
                ? Math.round((activeSuppliers / suppliers.length) * 100)
                : 0}
              % del total
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Saldo Total</h3>
            <Wallet
              className={`h-4 w-4 ${
                totalBalance > 0 ? 'text-danger' : 'text-success'
              }`}
            />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">
              <span className={totalBalance > 0 ? 'text-danger' : 'text-success'}>
                L {(Math.abs(totalBalance) / 100).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-default-500">
              {totalBalance > 0
                ? 'Por pagar'
                : totalBalance < 0
                  ? 'A favor'
                  : 'Sin saldo'}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Filtros</h3>
          <p className="text-sm text-default-500">Busca y filtra proveedores</p>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input
              placeholder="Buscar por nombre, empresa, contacto o email..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Search className="h-4 w-4 text-default-400" />}
            />
            <Select
              aria-label="Estado de proveedor"
              selectedKeys={[statusFilter]}
              onSelectionChange={keys =>
                setStatusFilter(getSingleSelectionKey(keys))
              }
              className="w-full md:w-44"
            >
              <SelectItem key="all">Todos</SelectItem>
              <SelectItem key="active">Activos</SelectItem>
              <SelectItem key="inactive">Inactivos</SelectItem>
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
                {filteredSuppliers.length} proveedor
                {filteredSuppliers.length !== 1 ? 'es' : ''} encontrado
                {filteredSuppliers.length !== 1 ? 's' : ''}
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
          {filteredSuppliers.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-default-500">
                {suppliers.length === 0
                  ? 'No tienes proveedores registrados'
                  : 'No se encontraron proveedores con los filtros aplicados'}
              </p>
              {suppliers.length === 0 && (
                <Button
                  startContent={<Plus className="h-4 w-4" />}
                  onPress={handleCreate}
                >
                  Crear Primer Proveedor
                </Button>
              )}
            </div>
          ) : (
            <SuppliersTable suppliers={filteredSuppliers} onEdit={handleEdit} />
          )}
        </CardBody>
      </Card>

      <SupplierFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        supplier={editingSupplier}
      />
    </div>
  )
}

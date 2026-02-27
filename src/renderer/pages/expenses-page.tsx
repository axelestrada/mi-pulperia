import type { Selection } from '@heroui/react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from '@heroui/react'
import {
  Calendar,
  DollarSign,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  TrendingDown,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import {
  SHIFT_HANDOVER_UPDATED_EVENT,
  getShiftModuleNote,
  setShiftModuleNote,
} from '@/features/operations/model/shift-handover-storage'

type ExpenseStatusFilter = 'all' | 'pending' | 'paid' | 'cancelled'
type ExpenseStatus = 'pending' | 'paid' | 'cancelled'
type PaymentMethod = 'cash' | 'credit' | 'debit' | 'transfer' | 'check'
type ExpenseFormMode = 'create' | 'edit'

type ExpenseItem = {
  id: number
  expenseNumber: string
  title: string
  totalAmount: number
  expenseDate: string | Date
  status: ExpenseStatus
  categoryName?: string
  supplierName?: string
}

type ExpenseCategoryOption = {
  id: number
  name: string
}

type SupplierOption = {
  id: number
  name: string
}

type ExpenseCategoryApiItem = {
  id: number | string
  name?: string | null
}

type SupplierApiItem = {
  id: number | string
  name?: string | null
}

type ExpenseDetail = {
  id: number
  expenseNumber: string
  categoryId: number
  supplierId?: number | null
  title: string
  description?: string | null
  amount: number
  taxAmount: number
  totalAmount: number
  expenseDate: string | Date
  paymentMethod?: PaymentMethod | null
  referenceNumber?: string | null
  status: ExpenseStatus
  notes?: string | null
}

type ExpenseFormState = {
  expenseNumber: string
  title: string
  categoryId: string
  supplierId: string
  amount: string
  taxAmount: string
  expenseDate: string
  status: ExpenseStatus
  paymentMethod: PaymentMethod
  referenceNumber: string
  description: string
  notes: string
}

const getSingleSelectionKey = (keys: Selection, fallback = 'all') => {
  if (keys === 'all') return fallback
  return Array.from(keys)[0]?.toString() ?? fallback
}

const getTodayISODate = () => new Date().toISOString().slice(0, 10)

const toDateInput = (value: string | Date | undefined | null) => {
  if (!value) return getTodayISODate()
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return getTodayISODate()
  return parsed.toISOString().slice(0, 10)
}

const toAmountInput = (cents: number | undefined | null) => {
  if (!Number.isFinite(cents)) return '0'
  return String((cents as number) / 100)
}

export function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ExpenseStatusFilter>('all')
  const [shiftNote, setShiftNote] = useState(() => getShiftModuleNote('expenses'))
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMode, setFormMode] = useState<ExpenseFormMode>('create')
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null)

  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryOption[]>([])
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])

  const [form, setForm] = useState<ExpenseFormState>({
    expenseNumber: '',
    title: '',
    categoryId: '',
    supplierId: '',
    amount: '',
    taxAmount: '0',
    expenseDate: getTodayISODate(),
    status: 'paid',
    paymentMethod: 'cash',
    referenceNumber: '',
    description: '',
    notes: '',
  })

  const resetForm = useCallback(() => {
    setForm({
      expenseNumber: '',
      title: '',
      categoryId: '',
      supplierId: '',
      amount: '',
      taxAmount: '0',
      expenseDate: getTodayISODate(),
      status: 'paid',
      paymentMethod: 'cash',
      referenceNumber: '',
      description: '',
      notes: '',
    })
    setEditingExpenseId(null)
  }, [])

  const loadExpenses = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const data = await window.api.expenses.list({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      setExpenses(Array.isArray(data) ? (data as ExpenseItem[]) : [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter])

  useEffect(() => {
    void loadExpenses()
  }, [loadExpenses])

  useEffect(() => {
    const refreshShiftNote = () => setShiftNote(getShiftModuleNote('expenses'))
    window.addEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
    return () =>
      window.removeEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
  }, [])

  const stats = useMemo(() => {
    const totalAmount = expenses.reduce(
      (sum: number, expense) => sum + (expense.totalAmount || 0),
      0
    )

    const categoryBreakdown = expenses.reduce(
      (acc: Record<string, number>, expense) => {
        const categoryName = expense.categoryName || 'Sin categoria'
        acc[categoryName] = (acc[categoryName] || 0) + (expense.totalAmount || 0)
        return acc
      },
      {}
    )

    const topCategory =
      Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0] || null

    return {
      total: expenses.length,
      totalAmount,
      average: expenses.length > 0 ? Math.round(totalAmount / expenses.length) : 0,
      topCategory,
    }
  }, [expenses])

  const loadFormOptions = useCallback(async () => {
    const [categoriesData, suppliersData] = await Promise.all([
      window.api.expenseCategories.getActiveForSelection(),
      window.api.suppliers.getActiveSuppliers(),
    ])

    setExpenseCategories(
      Array.isArray(categoriesData)
        ? (categoriesData as ExpenseCategoryApiItem[]).map(category => ({
            id: Number(category.id),
            name: String(category.name ?? 'Sin nombre'),
          }))
        : []
    )

    setSuppliers(
      Array.isArray(suppliersData)
        ? (suppliersData as SupplierApiItem[]).map(supplier => ({
            id: Number(supplier.id),
            name: String(supplier.name ?? 'Sin nombre'),
          }))
        : []
    )
  }, [])

  const openCreateModal = useCallback(async () => {
    resetForm()
    setFormMode('create')
    setIsFormOpen(true)
    setIsFormLoading(true)

    try {
      const expenseNumber = await window.api.expenses.generateExpenseNumber()
      await loadFormOptions()
      setForm(prev => ({ ...prev, expenseNumber: String(expenseNumber || '') }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      sileo.error({ title: 'No se pudo preparar el formulario', description: message })
    } finally {
      setIsFormLoading(false)
    }
  }, [loadFormOptions, resetForm])

  const openEditModal = useCallback(
    async (expenseId: number) => {
      resetForm()
      setFormMode('edit')
      setEditingExpenseId(expenseId)
      setIsFormOpen(true)
      setIsFormLoading(true)

      try {
        const [expenseDetailRaw] = await Promise.all([
          window.api.expenses.getById(expenseId),
          loadFormOptions(),
        ])

        const expenseDetail = expenseDetailRaw as ExpenseDetail | undefined
        if (!expenseDetail) {
          throw new Error('No se encontro el gasto solicitado')
        }

        setForm({
          expenseNumber: String(expenseDetail.expenseNumber || ''),
          title: String(expenseDetail.title || ''),
          categoryId: String(expenseDetail.categoryId || ''),
          supplierId: expenseDetail.supplierId ? String(expenseDetail.supplierId) : '',
          amount: toAmountInput(expenseDetail.amount),
          taxAmount: toAmountInput(expenseDetail.taxAmount),
          expenseDate: toDateInput(expenseDetail.expenseDate),
          status: expenseDetail.status || 'paid',
          paymentMethod: expenseDetail.paymentMethod || 'cash',
          referenceNumber: String(expenseDetail.referenceNumber || ''),
          description: String(expenseDetail.description || ''),
          notes: String(expenseDetail.notes || ''),
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        sileo.error({ title: 'No se pudo cargar el gasto', description: message })
        setIsFormOpen(false)
      } finally {
        setIsFormLoading(false)
      }
    },
    [loadFormOptions, resetForm]
  )

  const handleSaveShiftNote = () => {
    setShiftModuleNote('expenses', shiftNote)
    sileo.success({ title: 'Nota de turno guardada en gastos' })
  }

  const handleSubmitExpense = async () => {
    if (!form.expenseNumber.trim()) {
      sileo.error({ title: 'Falta numero de gasto' })
      return
    }

    if (!form.title.trim()) {
      sileo.error({ title: 'Ingresa el titulo del gasto' })
      return
    }

    if (!form.categoryId) {
      sileo.error({ title: 'Selecciona una categoria' })
      return
    }

    const amount = Math.round(Number(form.amount || 0) * 100)
    const taxAmount = Math.round(Number(form.taxAmount || 0) * 100)

    if (!Number.isFinite(amount) || amount <= 0) {
      sileo.error({ title: 'El monto debe ser mayor a cero' })
      return
    }

    if (!Number.isFinite(taxAmount) || taxAmount < 0) {
      sileo.error({ title: 'El impuesto no puede ser negativo' })
      return
    }

    const expenseDate = form.expenseDate ? new Date(form.expenseDate) : new Date()
    if (Number.isNaN(expenseDate.getTime())) {
      sileo.error({ title: 'Fecha de gasto invalida' })
      return
    }

    const payload = {
      expenseNumber: form.expenseNumber.trim(),
      categoryId: Number(form.categoryId),
      supplierId: form.supplierId ? Number(form.supplierId) : undefined,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      amount,
      taxAmount,
      totalAmount: amount + taxAmount,
      expenseDate,
      paymentMethod: form.paymentMethod,
      referenceNumber: form.referenceNumber.trim() || undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
    }

    try {
      setIsSubmitting(true)

      if (formMode === 'create') {
        await window.api.expenses.create({ ...payload, createdBy: 'system' })
        sileo.success({ title: `Gasto ${form.expenseNumber.trim()} creado` })
      } else {
        if (!editingExpenseId) {
          sileo.error({ title: 'No se pudo identificar el gasto a editar' })
          return
        }
        await window.api.expenses.update(editingExpenseId, payload)
        sileo.success({ title: `Gasto ${form.expenseNumber.trim()} actualizado` })
      }

      setIsFormOpen(false)
      resetForm()
      await loadExpenses()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      sileo.error({
        title:
          formMode === 'create' ? 'No se pudo crear el gasto' : 'No se pudo actualizar el gasto',
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return

    try {
      setIsDeleting(true)
      await window.api.expenses.remove(expenseToDelete.id)
      sileo.success({ title: `Gasto ${expenseToDelete.expenseNumber} eliminado` })
      setExpenseToDelete(null)
      await loadExpenses()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      sileo.error({ title: 'No se pudo eliminar el gasto', description: message })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <Spinner className="mb-4" />
          <p className="text-default-500">Cargando gastos...</p>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-danger">{errorMessage}</p>
          <Button onPress={() => void loadExpenses()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <PageHeader
        title="Gastos"
        description="Control diario de egresos para el personal de turno."
        actions={
          <Button startContent={<Plus className="h-4 w-4" />} onPress={openCreateModal}>
            Nuevo gasto
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Total Gastos</h3>
            <DollarSign className="h-4 w-4 text-default-500" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-default-500">Registros filtrados</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Monto Total</h3>
            <TrendingDown className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold text-danger">
              L {(stats.totalAmount / 100).toFixed(2)}
            </div>
            <p className="text-xs text-default-500">Acumulado</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Promedio</h3>
            <Calendar className="h-4 w-4 text-default-500" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">L {(stats.average / 100).toFixed(2)}</div>
            <p className="text-xs text-default-500">Por gasto</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Mayor Categoria</h3>
            <Tag className="h-4 w-4 text-default-500" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">{stats.topCategory?.[0] || 'N/A'}</div>
            <p className="text-xs text-default-500">
              L {stats.topCategory ? (stats.topCategory[1] / 100).toFixed(2) : '0.00'}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Filtros</h3>
          <p className="text-sm text-default-500">Busca por numero, titulo o proveedor</p>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input
              placeholder="Buscar gasto..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Search className="h-4 w-4 text-default-400" />}
            />
            <Select
              aria-label="Estado del gasto"
              selectedKeys={[statusFilter]}
              onSelectionChange={keys =>
                setStatusFilter(getSingleSelectionKey(keys) as ExpenseStatusFilter)
              }
              className="w-full md:w-48"
            >
              <SelectItem key="all">Todos</SelectItem>
              <SelectItem key="pending">Pendientes</SelectItem>
              <SelectItem key="paid">Pagados</SelectItem>
              <SelectItem key="cancelled">Cancelados</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Nota de Turno</h3>
          <p className="text-sm text-default-500">
            Deja instrucciones sobre gastos pendientes o por aprobar.
          </p>
        </CardHeader>
        <CardBody className="space-y-3">
          <Textarea
            value={shiftNote}
            onValueChange={setShiftNote}
            placeholder="Ej. Revisar gasto EXP202602-010, falta factura."
            minRows={3}
          />
          <Button size="sm" onPress={handleSaveShiftNote}>
            Guardar nota
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Gastos</h3>
              <p className="text-sm text-default-500">
                {expenses.length} gasto{expenses.length !== 1 ? 's' : ''} encontrado
                {expenses.length !== 1 ? 's' : ''}
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
          <Table aria-label="Listado de gastos" removeWrapper>
            <TableHeader>
              <TableColumn>GASTO</TableColumn>
              <TableColumn>CATEGORIA / PROVEEDOR</TableColumn>
              <TableColumn>FECHA</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn className="text-right">MONTO</TableColumn>
              <TableColumn align="center">ACCIONES</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent="No se encontraron gastos con los filtros aplicados."
              items={expenses}
            >
              {expense => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="font-medium">
                      {expense.expenseNumber} - {expense.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-default-500">
                      {expense.categoryName || 'Sin categoria'}
                      {expense.supplierName ? ` | ${expense.supplierName}` : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(expense.expenseDate).toLocaleDateString('es-HN')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        expense.status === 'pending'
                          ? 'warning'
                          : expense.status === 'cancelled'
                            ? 'danger'
                            : 'success'
                      }
                    >
                      {expense.status === 'pending'
                        ? 'Pendiente'
                        : expense.status === 'paid'
                          ? 'Pagado'
                          : 'Cancelado'}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-danger">
                    L {((expense.totalAmount || 0) / 100).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => void openEditModal(expense.id)}
                        isIconOnly
                        aria-label={`Editar gasto ${expense.expenseNumber}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => setExpenseToDelete(expense)}
                        isIconOnly
                        aria-label={`Eliminar gasto ${expense.expenseNumber}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={isFormOpen} onOpenChange={setIsFormOpen} size="2xl">
        <ModalContent>
          <>
            <ModalHeader>
              {formMode === 'create' ? 'Nuevo gasto manual' : 'Editar gasto'}
            </ModalHeader>
            <ModalBody className="space-y-4">
              {isFormLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Numero" value={form.expenseNumber} isReadOnly />
                    <Input
                      type="date"
                      label="Fecha"
                      value={form.expenseDate}
                      onValueChange={value =>
                        setForm(prev => ({ ...prev, expenseDate: value }))
                      }
                    />
                  </div>

                  <Input
                    label="Titulo"
                    placeholder="Ej. Pago de energia electrica"
                    value={form.title}
                    onValueChange={value => setForm(prev => ({ ...prev, title: value }))}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <Select
                      label="Categoria"
                      selectedKeys={form.categoryId ? [form.categoryId] : []}
                      onSelectionChange={keys =>
                        setForm(prev => ({
                          ...prev,
                          categoryId: getSingleSelectionKey(keys, ''),
                        }))
                      }
                    >
                      {expenseCategories.map(category => (
                        <SelectItem key={String(category.id)}>{category.name}</SelectItem>
                      ))}
                    </Select>

                    <Select
                      label="Proveedor (opcional)"
                      selectedKeys={form.supplierId ? [form.supplierId] : []}
                      onSelectionChange={keys =>
                        setForm(prev => ({
                          ...prev,
                          supplierId: getSingleSelectionKey(keys, ''),
                        }))
                      }
                    >
                      {suppliers.map(supplier => (
                        <SelectItem key={String(supplier.id)}>{supplier.name}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      type="number"
                      label="Monto"
                      placeholder="0.00"
                      value={form.amount}
                      onValueChange={value => setForm(prev => ({ ...prev, amount: value }))}
                      startContent={<span className="text-default-500 text-sm">L</span>}
                    />
                    <Input
                      type="number"
                      label="Impuesto"
                      placeholder="0.00"
                      value={form.taxAmount}
                      onValueChange={value =>
                        setForm(prev => ({ ...prev, taxAmount: value }))
                      }
                      startContent={<span className="text-default-500 text-sm">L</span>}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Select
                      label="Estado"
                      selectedKeys={[form.status]}
                      onSelectionChange={keys =>
                        setForm(prev => ({
                          ...prev,
                          status: getSingleSelectionKey(keys, 'paid') as ExpenseStatus,
                        }))
                      }
                    >
                      <SelectItem key="pending">Pendiente</SelectItem>
                      <SelectItem key="paid">Pagado</SelectItem>
                      <SelectItem key="cancelled">Cancelado</SelectItem>
                    </Select>

                    <Select
                      label="Metodo de pago"
                      selectedKeys={[form.paymentMethod]}
                      onSelectionChange={keys =>
                        setForm(prev => ({
                          ...prev,
                          paymentMethod: getSingleSelectionKey(
                            keys,
                            'cash'
                          ) as PaymentMethod,
                        }))
                      }
                    >
                      <SelectItem key="cash">Efectivo</SelectItem>
                      <SelectItem key="credit">Credito</SelectItem>
                      <SelectItem key="debit">Debito</SelectItem>
                      <SelectItem key="transfer">Transferencia</SelectItem>
                      <SelectItem key="check">Cheque</SelectItem>
                    </Select>

                    <Input
                      label="Referencia"
                      placeholder="Factura o recibo"
                      value={form.referenceNumber}
                      onValueChange={value =>
                        setForm(prev => ({ ...prev, referenceNumber: value }))
                      }
                    />
                  </div>

                  <Textarea
                    label="Descripcion"
                    value={form.description}
                    onValueChange={value =>
                      setForm(prev => ({ ...prev, description: value }))
                    }
                    minRows={2}
                  />

                  <Textarea
                    label="Notas"
                    value={form.notes}
                    onValueChange={value => setForm(prev => ({ ...prev, notes: value }))}
                    minRows={2}
                  />
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={() => {
                  setIsFormOpen(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleSubmitExpense}
                isLoading={isSubmitting}
                isDisabled={isFormLoading || isSubmitting || expenseCategories.length === 0}
              >
                {formMode === 'create' ? 'Guardar gasto' : 'Guardar cambios'}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      <Modal isOpen={Boolean(expenseToDelete)} onOpenChange={open => !open && setExpenseToDelete(null)}>
        <ModalContent>
          <>
            <ModalHeader>Eliminar gasto</ModalHeader>
            <ModalBody>
              <p>
                Se eliminara el gasto{' '}
                <strong>{expenseToDelete?.expenseNumber || ''}</strong>. Esta accion no se puede deshacer.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setExpenseToDelete(null)}>
                Cancelar
              </Button>
              <Button color="danger" onPress={handleDeleteExpense} isLoading={isDeleting}>
                Eliminar
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </div>
  )
}

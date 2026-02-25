import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Clock, CreditCard, DollarSign, Search } from 'lucide-react'
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
import { useCredits } from '@/features/credits/hooks/use-credits'
import {
  SHIFT_HANDOVER_UPDATED_EVENT,
  getShiftModuleNote,
  setShiftModuleNote,
} from '@/features/operations/model/shift-handover-storage'

type CreditStatusFilter =
  | 'all'
  | 'active'
  | 'partial'
  | 'overdue'
  | 'paid'
  | 'cancelled'

type CreditItem = {
  id: number
  creditNumber: string
  customerName?: string
  remainingAmount: number
  status: 'active' | 'partial' | 'paid' | 'cancelled'
  dueDate?: string | Date
  isOverdue?: boolean
}

export function CreditsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CreditStatusFilter>('all')
  const [shiftNote, setShiftNote] = useState(() => getShiftModuleNote('credits'))

  const backendStatus =
    statusFilter === 'all' || statusFilter === 'overdue'
      ? undefined
      : statusFilter

  const { data: credits = [], isLoading, error } = useCredits({
    search: searchTerm || undefined,
    status: backendStatus,
  })

  useEffect(() => {
    const refreshShiftNote = () => setShiftNote(getShiftModuleNote('credits'))
    window.addEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
    return () =>
      window.removeEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
  }, [])

  const filteredCredits = useMemo(
    () =>
      (credits as CreditItem[]).filter(credit => {
        if (statusFilter === 'all') return true
        if (statusFilter === 'overdue') return Boolean(credit.isOverdue)
        return credit.status === statusFilter
      }),
    [credits, statusFilter]
  )

  const stats = useMemo(() => {
    const typedCredits = credits as CreditItem[]
    const overdueCredits = typedCredits.filter(credit => credit.isOverdue)
    const totalAmount = credits.reduce(
      (sum: number, credit: CreditItem) => sum + (credit.remainingAmount || 0),
      0
    )
    const overdueAmount = overdueCredits.reduce(
      (sum: number, credit: CreditItem) => sum + (credit.remainingAmount || 0),
      0
    )

    return {
      total: credits.length,
      active: typedCredits.filter(credit => credit.status === 'active').length,
      overdue: overdueCredits.length,
      totalAmount,
      overdueAmount,
    }
  }, [credits])

  const handleSaveShiftNote = () => {
    setShiftModuleNote('credits', shiftNote)
    sileo.success({ title: 'Nota de turno guardada en créditos' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando créditos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar los créditos</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créditos</h1>
          <p className="text-muted-foreground">
            Control del libro de créditos y pendientes por cobrar.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Créditos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.active} activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Requieren seguimiento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              L {(stats.totalAmount / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Por cobrar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Vencido</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              L {(stats.overdueAmount / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Cobro prioritario</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra créditos por estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, documento, número de crédito..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={value => setStatusFilter(value as CreditStatusFilter)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="partial">Parciales</SelectItem>
                <SelectItem value="overdue">Vencidos</SelectItem>
                <SelectItem value="paid">Pagados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nota de Turno</CardTitle>
          <CardDescription>
            Deja indicaciones sobre cobros pendientes para la siguiente persona.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={shiftNote}
            onChange={e => setShiftNote(e.target.value)}
            placeholder="Ej. Cobrar hoy a cliente Juan por crédito CR-202602-001."
          />
          <Button size="sm" onClick={handleSaveShiftNote}>
            Guardar nota
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Créditos</CardTitle>
          <CardDescription>
            {filteredCredits.length} crédito
            {filteredCredits.length !== 1 ? 's' : ''} encontrado
            {filteredCredits.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCredits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No se encontraron créditos con los filtros aplicados.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredCredits.map(credit => (
                <div
                  key={credit.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {credit.customerName || 'Cliente no disponible'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {credit.creditNumber} | Saldo: L{' '}
                      {((credit.remainingAmount || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    {credit.dueDate && (
                      <p className="text-sm text-muted-foreground">
                        Vence: {new Date(credit.dueDate).toLocaleDateString('es-HN')}
                      </p>
                    )}
                    <Badge
                      variant={
                        credit.isOverdue
                          ? 'destructive'
                          : credit.status === 'active'
                            ? 'default'
                            : credit.status === 'partial'
                              ? 'outline'
                              : 'secondary'
                      }
                    >
                      {credit.isOverdue
                        ? 'Vencido'
                        : credit.status === 'active'
                          ? 'Activo'
                          : credit.status === 'partial'
                            ? 'Parcial'
                            : credit.status === 'paid'
                              ? 'Pagado'
                              : 'Cancelado'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

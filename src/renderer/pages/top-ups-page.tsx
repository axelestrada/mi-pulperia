import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CreditCard, Plus, Smartphone, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/../shared/utils/formatCurrency'
import {
  TOP_UPS_UPDATED_EVENT,
  getTopUpRecords,
  getVirtualBalance,
  increaseVirtualBalance,
  registerTopUp,
} from '@/features/top-ups/model/top-ups-storage'
import {
  SHIFT_HANDOVER_UPDATED_EVENT,
  getShiftModuleNote,
  setShiftModuleNote,
} from '@/features/operations/model/shift-handover-storage'

const operators = ['Tigo', 'Claro', 'Hondutel', 'Otro']

export function TopUpsPage() {
  const [records, setRecords] = useState(() => getTopUpRecords())
  const [virtualBalance, setVirtualBalance] = useState(() => getVirtualBalance())
  const [operator, setOperator] = useState('Tigo')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [loadAmount, setLoadAmount] = useState('')
  const [loadNotes, setLoadNotes] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [shiftNote, setShiftNote] = useState(() => getShiftModuleNote('top-ups'))

  useEffect(() => {
    const refresh = () => {
      setRecords(getTopUpRecords())
      setVirtualBalance(getVirtualBalance())
    }
    const refreshShiftNote = () => setShiftNote(getShiftModuleNote('top-ups'))

    window.addEventListener(TOP_UPS_UPDATED_EVENT, refresh)
    window.addEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
    return () => {
      window.removeEventListener(TOP_UPS_UPDATED_EVENT, refresh)
      window.removeEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
    }
  }, [])

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todayRecords = records.filter(
      record => new Date(record.createdAt).toDateString() === today
    )

    const totalCost = todayRecords.reduce((sum, record) => sum + record.cost, 0)
    const totalAmount = todayRecords.reduce(
      (sum, record) => sum + record.amount,
      0
    )

    return {
      todayCount: todayRecords.filter(record => record.cost > 0).length,
      totalCost,
      totalAmount,
      margin: totalAmount - totalCost,
    }
  }, [records])

  const handleCreateTopUp = () => {
    setErrorMessage('')
    try {
      registerTopUp({
        operator,
        phoneNumber,
        amount: Number(amount),
        cost: Number(cost),
        notes,
      })
      setPhoneNumber('')
      setAmount('')
      setCost('')
      setNotes('')
      sileo.success({ title: 'Recarga registrada correctamente' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      setErrorMessage(message)
      sileo.error({ title: 'No se pudo registrar la recarga', description: message })
    }
  }

  const handleLoadBalance = () => {
    setErrorMessage('')
    try {
      increaseVirtualBalance(Number(loadAmount), {
        operator,
        notes: loadNotes,
      })
      setLoadAmount('')
      setLoadNotes('')
      sileo.success({ title: 'Saldo virtual actualizado' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      setErrorMessage(message)
      sileo.error({
        title: 'No se pudo actualizar el saldo virtual',
        description: message,
      })
    }
  }

  const handleShiftNoteSave = () => {
    setShiftModuleNote('top-ups', shiftNote)
    sileo.success({ title: 'Nota de turno guardada' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recargas</h1>
          <p className="text-muted-foreground">
            Registra recargas desde el POS y controla el saldo virtual.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Virtual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(virtualBalance)}</div>
            <p className="text-xs text-muted-foreground">Disponible para recargas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recargas Hoy</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCount}</div>
            <p className="text-xs text-muted-foreground">Operaciones registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo del Día</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
            <p className="text-xs text-muted-foreground">Descontado de saldo virtual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.margin)}</div>
            <p className="text-xs text-muted-foreground">Monto - costo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nueva Recarga</CardTitle>
            <CardDescription>
              Ingrese el monto de la recarga y su costo real para descontar saldo
              virtual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Operador</Label>
              <select
                value={operator}
                onChange={e => setOperator(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {operators.map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Número de teléfono (opcional)</Label>
              <Input
                placeholder="Ej. 9999-9999"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Monto de recarga (L)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Costo real (L)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Referencia, tipo de promo u observación."
              />
            </div>
            {errorMessage && (
              <p className="text-sm font-medium text-destructive">{errorMessage}</p>
            )}
            <Button onClick={handleCreateTopUp} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Recarga
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recargar Saldo Virtual</CardTitle>
            <CardDescription>
              Use este bloque para cargar saldo al monedero de recargas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Monto a agregar (L)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={loadAmount}
                onChange={e => setLoadAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notas de carga</Label>
              <Textarea
                value={loadNotes}
                onChange={e => setLoadNotes(e.target.value)}
                placeholder="Ej. Depósito de saldo para turno tarde."
              />
            </div>
            <Button variant="secondary" onClick={handleLoadBalance} className="w-full">
              Agregar saldo virtual
            </Button>

            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">Nota de turno (recargas)</p>
              <Textarea
                className="mt-2"
                value={shiftNote}
                onChange={e => setShiftNote(e.target.value)}
                placeholder="Deja aquí instrucciones para la siguiente persona de turno."
              />
              <Button size="sm" className="mt-3" onClick={handleShiftNoteSave}>
                Guardar nota
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Recargas</CardTitle>
          <CardDescription>
            Últimas operaciones, ordenadas de la más reciente a la más antigua.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay recargas registradas todavía.
            </p>
          ) : (
            <div className="space-y-3">
              {records.slice(0, 40).map(record => (
                <div
                  key={record.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {record.operator || 'Operador'}{' '}
                      {record.phoneNumber ? `- ${record.phoneNumber}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(record.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: es,
                      })}
                    </p>
                    {record.notes && (
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Monto: {formatCurrency(record.amount)}
                    </Badge>
                    <Badge variant={record.cost > 0 ? 'secondary' : 'default'}>
                      Costo: {formatCurrency(record.cost)}
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

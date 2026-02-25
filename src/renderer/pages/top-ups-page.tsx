import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CreditCard, Plus, Smartphone, Wallet } from 'lucide-react'
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
import { formatCurrency } from '@/../shared/utils/formatCurrency'
import {
  topUpsService,
  TOP_UPS_UPDATED_EVENT,
  type TopUpRecord,
} from '@/features/top-ups/services/top-ups-service'
import {
  SHIFT_HANDOVER_UPDATED_EVENT,
  getShiftModuleNote,
  setShiftModuleNote,
} from '@/features/operations/model/shift-handover-storage'

const operators = ['Tigo', 'Claro', 'Hondutel', 'Otro']

export function TopUpsPage() {
  const [records, setRecords] = useState<TopUpRecord[]>([])
  const [virtualBalance, setVirtualBalance] = useState(0)
  const [operator, setOperator] = useState('Tigo')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [loadAmount, setLoadAmount] = useState('')
  const [loadNotes, setLoadNotes] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [shiftNote, setShiftNoteState] = useState(() => getShiftModuleNote('top-ups'))
  const [isLoading, setIsLoading] = useState(true)

  const refreshData = useCallback(async () => {
    const [items, balance] = await Promise.all([
      topUpsService.list({ limit: 300 }),
      topUpsService.getVirtualBalance(),
    ])
    setRecords(items)
    setVirtualBalance(balance)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        await refreshData()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        sileo.error({ title: 'No se pudo cargar recargas', description: message })
      } finally {
        setIsLoading(false)
      }
    }

    const refreshShiftNote = () => setShiftNoteState(getShiftModuleNote('top-ups'))
    const refresh = () => {
      void refreshData()
    }

    void load()
    window.addEventListener(TOP_UPS_UPDATED_EVENT, refresh)
    window.addEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
    return () => {
      window.removeEventListener(TOP_UPS_UPDATED_EVENT, refresh)
      window.removeEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
    }
  }, [refreshData])

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todayRecords = records.filter(
      record =>
        record.type === 'top_up' &&
        new Date(record.createdAt).toDateString() === today
    )

    const totalCost = todayRecords.reduce((sum, record) => sum + record.cost, 0)
    const totalAmount = todayRecords.reduce((sum, record) => sum + record.amount, 0)

    return {
      todayCount: todayRecords.length,
      totalCost,
      totalAmount,
      margin: totalAmount - totalCost,
    }
  }, [records])

  const handleCreateTopUp = async () => {
    setErrorMessage('')
    try {
      await topUpsService.register({
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

  const handleLoadBalance = async () => {
    setErrorMessage('')
    try {
      await topUpsService.loadBalance({
        amount: Number(loadAmount),
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recargas</h1>
        <p className="text-default-500">
          Registra recargas desde el POS y controla el saldo virtual.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardBody className="py-4">
          <p className="text-sm text-default-500">Saldo Virtual</p>
          <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
            <Wallet className="size-4 text-default-500" />
            {formatCurrency(virtualBalance)}
          </div>
        </CardBody></Card>
        <Card><CardBody className="py-4">
          <p className="text-sm text-default-500">Recargas Hoy</p>
          <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
            <Smartphone className="size-4 text-default-500" />
            {stats.todayCount}
          </div>
        </CardBody></Card>
        <Card><CardBody className="py-4">
          <p className="text-sm text-default-500">Costo del Dia</p>
          <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
            <CreditCard className="size-4 text-default-500" />
            {formatCurrency(stats.totalCost)}
          </div>
        </CardBody></Card>
        <Card><CardBody className="py-4">
          <p className="text-sm text-default-500">Margen del Dia</p>
          <div className="mt-1 text-2xl font-semibold">
            {formatCurrency(stats.margin)}
          </div>
        </CardBody></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <p className="text-lg font-semibold">Nueva Recarga</p>
          </CardHeader>
          <CardBody className="space-y-4">
            <Select
              label="Operador"
              disallowEmptySelection
              selectedKeys={[operator]}
              onSelectionChange={key => setOperator(String(key.currentKey || 'Tigo'))}
            >
              {operators.map(item => (
                <SelectItem key={item}>{item}</SelectItem>
              ))}
            </Select>
            <Input
              label="Numero de telefono (opcional)"
              placeholder="Ej. 9999-9999"
              value={phoneNumber}
              onValueChange={setPhoneNumber}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Monto de recarga (L)"
                type="number"
                min={0}
                step={1}
                value={amount}
                onValueChange={setAmount}
              />
              <Input
                label="Costo real (L)"
                type="number"
                min={0}
                step={1}
                value={cost}
                onValueChange={setCost}
              />
            </div>
            <Textarea
              label="Notas"
              value={notes}
              onValueChange={setNotes}
              placeholder="Referencia, tipo de promo u observacion."
            />
            {errorMessage && (
              <p className="text-sm font-medium text-danger">{errorMessage}</p>
            )}
            <Button onPress={handleCreateTopUp} color="primary">
              <Plus className="mr-2 size-4" />
              Registrar Recarga
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <p className="text-lg font-semibold">Recargar Saldo Virtual</p>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Monto a agregar (L)"
              type="number"
              min={0}
              step={1}
              value={loadAmount}
              onValueChange={setLoadAmount}
            />
            <Textarea
              label="Notas de carga"
              value={loadNotes}
              onValueChange={setLoadNotes}
              placeholder="Ej. Deposito de saldo para turno tarde."
            />
            <Button variant="flat" onPress={handleLoadBalance}>
              Agregar saldo virtual
            </Button>

            <div className="rounded-large border border-default-200 p-3">
              <p className="text-sm font-medium">Nota de turno (recargas)</p>
              <Textarea
                className="mt-2"
                value={shiftNote}
                onValueChange={setShiftNoteState}
                placeholder="Deja aqui instrucciones para la siguiente persona de turno."
              />
              <Button size="sm" className="mt-3" onPress={handleShiftNoteSave}>
                Guardar nota
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <p className="text-lg font-semibold">Historial de Recargas</p>
        </CardHeader>
        <CardBody>
          {records.length === 0 ? (
            <p className="text-sm text-default-500">No hay recargas registradas todavia.</p>
          ) : (
            <div className="space-y-3">
              {records.slice(0, 40).map(record => (
                <div
                  key={record.id}
                  className="flex flex-col gap-2 rounded-large border border-default-200 p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {record.operator || 'Operador'}{' '}
                      {record.phoneNumber ? `- ${record.phoneNumber}` : ''}
                    </p>
                    <p className="text-sm text-default-500">
                      {format(new Date(record.createdAt), "d 'de' MMM yyyy, hh:mm a", {
                        locale: es,
                      })}
                    </p>
                    {record.notes && (
                      <p className="mt-1 text-sm text-default-600">{record.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip variant="flat" color={record.type === 'balance_load' ? 'primary' : 'success'}>
                      {record.type === 'balance_load' ? 'Carga de saldo' : 'Recarga'}
                    </Chip>
                    <Chip variant="flat">Monto: {formatCurrency(record.amount)}</Chip>
                    <Chip variant="flat" color="warning">
                      Costo: {formatCurrency(record.cost)}
                    </Chip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

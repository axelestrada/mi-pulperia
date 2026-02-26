import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  PlusCircle,
  Receipt,
  User,
  XCircle,
} from 'lucide-react'
import type React from 'react'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { formatCurrency } from '../../../../shared/utils/formatCurrency'
import { useActiveCashRegisters } from '../../../hooks/use-cash-registers'
import {
  useCashSessionSummary,
  useCloseCashSession,
  useCurrentOpenSession,
  useOpenCashSession,
  useUpdateSessionNotes,
} from '../../../hooks/use-cash-sessions'

const openSessionSchema = z.object({
  cashRegisterId: z.number().min(1, 'Debe seleccionar una caja'),
  openedBy: z.string().min(1, 'Nombre del usuario es requerido'),
  openingAmount: z.coerce
    .number()
    .min(0, 'El monto inicial no puede ser negativo')
    .transform(value => value * 100),
  notes: z.string().optional(),
})

const closeSessionSchema = z.object({
  closedBy: z.string().min(1, 'Nombre del usuario es requerido'),
  actualAmount: z.coerce
    .number()
    .min(0, 'El monto contado no puede ser negativo')
    .transform(value => value * 100),
  notes: z.string().optional(),
})

const notesSchema = z.object({
  notes: z.string().optional(),
})

type OpenSessionFormInput = z.input<typeof openSessionSchema>
type OpenSessionFormData = z.infer<typeof openSessionSchema>
type CloseSessionFormInput = z.input<typeof closeSessionSchema>
type CloseSessionFormData = z.infer<typeof closeSessionSchema>
type NotesFormData = z.infer<typeof notesSchema>

interface CashSessionManagerProps {
  onSessionChange?: () => void
}

export const CashSessionManager: React.FC<CashSessionManagerProps> = ({
  onSessionChange,
}) => {
  const [showOpenDialog, setShowOpenDialog] = useState(false)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [showNotesDialog, setShowNotesDialog] = useState(false)

  const { data: openSession, refetch: refetchOpenSession } =
    useCurrentOpenSession()
  const { data: sessionSummary } = useCashSessionSummary(openSession?.id || 0)
  const { data: cashRegisters } = useActiveCashRegisters()

  const openSessionMutation = useOpenCashSession()
  const closeSessionMutation = useCloseCashSession()
  const updateNotesMutation = useUpdateSessionNotes()

  const openForm = useForm<OpenSessionFormInput, unknown, OpenSessionFormData>({
    resolver: zodResolver(openSessionSchema),
    defaultValues: {
      openingAmount: 0,
      notes: '',
    },
  })
  const closeForm = useForm<
    CloseSessionFormInput,
    unknown,
    CloseSessionFormData
  >({
    resolver: zodResolver(closeSessionSchema),
    defaultValues: {
      actualAmount: 0,
      notes: '',
    },
  })
  const notesForm = useForm<NotesFormData>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: openSession?.notes || '',
    },
  })

  const expectedAmount = useMemo(() => {
    if (!openSession) return 0
    const sales = Number(sessionSummary?.salesSummary?.totalAmount) || 0
    return Number(openSession.openingAmount) + sales
  }, [openSession, sessionSummary?.salesSummary?.totalAmount])

  const countedAmountInput = Number(closeForm.watch('actualAmount') || 0)
  const differenceInCents = countedAmountInput * 100 - expectedAmount

  const onOpenSession = async (data: OpenSessionFormData) => {
    try {
      await openSessionMutation.mutateAsync(data)
      setShowOpenDialog(false)
      openForm.reset({ openingAmount: 0, notes: '' })
      await refetchOpenSession()
      onSessionChange?.()
    } catch (error) {
      console.error('Error opening session:', error)
      sileo.error({
        title: 'Error al abrir la sesion de caja',
        description:
          error instanceof Error ? error.message : 'No se pudo abrir la caja.',
      })
    }
  }

  const onCloseSession = async (data: CloseSessionFormData) => {
    if (!openSession) return

    try {
      await closeSessionMutation.mutateAsync({
        id: openSession.id,
        input: data,
      })
      setShowCloseDialog(false)
      closeForm.reset({ actualAmount: 0, notes: '' })
      await refetchOpenSession()
      onSessionChange?.()
    } catch (error) {
      console.error('Error closing session:', error)
      sileo.error({
        title: 'Error al cerrar la sesion de caja',
        description:
          error instanceof Error ? error.message : 'No se pudo cerrar la caja.',
      })
    }
  }

  const onUpdateNotes = async (data: NotesFormData) => {
    if (!openSession) return

    try {
      await updateNotesMutation.mutateAsync({
        id: openSession.id,
        notes: data.notes || '',
      })
      setShowNotesDialog(false)
      await refetchOpenSession()
    } catch (error) {
      console.error('Error updating notes:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              {openSession ? (
                <>
                  <CheckCircle className="h-5 w-5 text-success" />
                  Caja Abierta
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-danger" />
                  Caja Cerrada
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-default-500">
              {openSession
                ? `Sesion iniciada el ${format(
                    new Date(openSession.openedAt),
                    'PPpp',
                    {
                      locale: es,
                    }
                  )}`
                : 'No hay una sesion activa'}
            </p>
          </div>
          <Chip color={openSession ? 'success' : 'default'} variant="flat">
            {openSession ? 'Activa' : 'Inactiva'}
          </Chip>
        </CardHeader>

        {openSession && (
          <CardBody className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Monto Inicial"
                value={formatCurrency(Number(openSession.openingAmount) / 100)}
              />
              <StatCard
                label="Ventas"
                value={formatCurrency(
                  (Number(sessionSummary?.salesSummary?.totalAmount) || 0) / 100
                )}
              />
              <StatCard
                label="Transacciones"
                value={String(sessionSummary?.salesSummary?.totalSales || 0)}
              />
              <StatCard
                label="Total Esperado"
                value={formatCurrency(expectedAmount / 100)}
              />
            </div>

            <Divider />

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-1">
                <User className="h-4 w-4" />
                Abierto por: {openSession.openedBy}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Duracion:{' '}
                {Math.round(
                  (Date.now() - new Date(openSession.openedAt).getTime()) /
                    (1000 * 60)
                )}{' '}
                min
              </span>
              {openSession.cashRegisterName && (
                <span className="inline-flex items-center gap-1">
                  <Receipt className="h-4 w-4" />
                  Caja: {openSession.cashRegisterName}
                </span>
              )}
            </div>

            {openSession.notes && (
              <div className="rounded-large border border-default-200 bg-default-50 p-3">
                <p className="text-xs font-medium uppercase text-default-500">
                  Notas
                </p>
                <p className="text-sm">{openSession.notes}</p>
              </div>
            )}
          </CardBody>
        )}
      </Card>

      {openSession &&
        sessionSummary?.paymentBreakdown &&
        sessionSummary.paymentBreakdown.length > 0 && (
          <Card>
            <CardHeader className="flex items-center gap-2 text-base font-semibold">
              <CreditCard className="h-5 w-5" />
              Desglose de Pagos
            </CardHeader>
            <CardBody className="space-y-2">
              {sessionSummary.paymentBreakdown.map((payment, index) => (
                <div
                  key={`${payment.method}-${index}`}
                  className="flex justify-between"
                >
                  <span className="capitalize">{payment.method}</span>
                  <span className="font-medium">
                    {formatCurrency(payment.totalAmount / 100)}
                  </span>
                </div>
              ))}
            </CardBody>
          </Card>
        )}

      <div className="flex flex-wrap gap-2">
        {!openSession ? (
          <Button color="primary" onPress={() => setShowOpenDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Abrir Caja
          </Button>
        ) : (
          <>
            <Button variant="bordered" onPress={() => setShowNotesDialog(true)}>
              Notas
            </Button>
            <Button color="danger" onPress={() => setShowCloseDialog(true)}>
              <XCircle className="mr-2 h-4 w-4" />
              Cerrar Caja
            </Button>
          </>
        )}
      </div>

      {!openSession && (
        <Card className="border-warning/40 bg-warning/10">
          <CardBody className="flex flex-row items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-warning" />
            Debe abrir una caja antes de poder realizar ventas.
          </CardBody>
        </Card>
      )}

      <Modal isOpen={showOpenDialog} onOpenChange={setShowOpenDialog} size="md">
        <ModalContent>
          <ModalHeader>Abrir Caja</ModalHeader>
          <ModalBody className="space-y-4">
            <Controller
              control={openForm.control}
              name="cashRegisterId"
              render={({ field, fieldState }) => (
                <Select
                  label="Caja Registradora *"
                  selectedKeys={field.value ? [String(field.value)] : []}
                  onSelectionChange={keys => {
                    const value = Number(keys.currentKey || 0)
                    field.onChange(value)
                  }}
                  isInvalid={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                >
                  {(cashRegisters || []).map(register => (
                    <SelectItem key={String(register.id)}>
                      {register.name}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              control={openForm.control}
              name="openedBy"
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Usuario *"
                  placeholder="Nombre del usuario"
                  isInvalid={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={openForm.control}
              name="openingAmount"
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  label="Monto Inicial"
                  placeholder="0.00"
                  startContent="L"
                  value={String(field.value ?? '')}
                  onValueChange={value => field.onChange(Number(value || 0))}
                  isInvalid={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={openForm.control}
              name="notes"
              render={({ field }) => (
                <Textarea
                  label="Notas"
                  placeholder="Observaciones..."
                  value={field.value || ''}
                  onValueChange={field.onChange}
                />
              )}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowOpenDialog(false)}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={() => openForm.handleSubmit(onOpenSession)}
              isLoading={openSessionMutation.isPending}
            >
              Abrir Caja
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showNotesDialog}
        onOpenChange={setShowNotesDialog}
        size="md"
      >
        <ModalContent>
          <ModalHeader>Actualizar Notas</ModalHeader>
          <ModalBody>
            <Controller
              control={notesForm.control}
              name="notes"
              render={({ field }) => (
                <Textarea
                  label="Notas"
                  minRows={4}
                  placeholder="Observaciones..."
                  value={field.value || ''}
                  onValueChange={field.onChange}
                />
              )}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowNotesDialog(false)}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={() => notesForm.handleSubmit(onUpdateNotes)}
              isLoading={updateNotesMutation.isPending}
            >
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showCloseDialog}
        onOpenChange={setShowCloseDialog}
        size="md"
      >
        <ModalContent>
          <ModalHeader>Cerrar Caja</ModalHeader>
          <ModalBody className="space-y-4">
            {openSession && (
              <div className="rounded-large border border-default-200 bg-default-50 p-3 text-sm">
                <div className="mb-2 font-medium">Resumen de la Sesion</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Monto inicial:</span>
                    <span>
                      {formatCurrency(openSession.openingAmount / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ventas realizadas:</span>
                    <span>{sessionSummary?.salesSummary?.totalSales || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total en ventas:</span>
                    <span>
                      {formatCurrency(
                        (Number(sessionSummary?.salesSummary?.totalAmount) ||
                          0) / 100
                      )}
                    </span>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total esperado:</span>
                    <span>{formatCurrency(expectedAmount / 100)}</span>
                  </div>
                </div>
              </div>
            )}

            <Controller
              control={closeForm.control}
              name="closedBy"
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Usuario *"
                  placeholder="Nombre del usuario"
                  isInvalid={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={closeForm.control}
              name="actualAmount"
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  label="Monto Contado *"
                  placeholder="0.00"
                  startContent="L"
                  value={String(field.value ?? '')}
                  onValueChange={value => field.onChange(Number(value || 0))}
                  isInvalid={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <div
              className={`rounded-large border p-3 text-sm ${
                Math.abs(differenceInCents) < 1
                  ? 'border-success/40 bg-success/10'
                  : differenceInCents > 0
                    ? 'border-primary/40 bg-primary/10'
                    : 'border-danger/40 bg-danger/10'
              }`}
            >
              {Math.abs(differenceInCents) < 1
                ? 'Cuadra perfecto'
                : differenceInCents > 0
                  ? `Sobrante: ${formatCurrency(differenceInCents / 100)}`
                  : `Faltante: ${formatCurrency(Math.abs(differenceInCents) / 100)}`}
            </div>

            <Controller
              control={closeForm.control}
              name="notes"
              render={({ field }) => (
                <Textarea
                  label="Notas"
                  placeholder="Observaciones del cierre..."
                  value={field.value || ''}
                  onValueChange={field.onChange}
                />
              )}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowCloseDialog(false)}>
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={() => closeForm.handleSubmit(onCloseSession)}
              isLoading={closeSessionMutation.isPending}
            >
              Cerrar Caja
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-large border border-default-200 bg-content1 p-3 text-center">
    <p className="text-xl font-semibold">{value}</p>
    <p className="text-sm text-default-500">{label}</p>
  </div>
)

export default CashSessionManager


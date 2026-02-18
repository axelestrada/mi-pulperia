import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertCircle,
  BarChart3,
  Calculator,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  PlusCircle,
  Receipt,
  User,
  XCircle,
} from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { formatCurrency } from '../../../../shared/utils/formatCurrency'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Separator } from '../../../components/ui/separator'
import { Textarea } from '../../../components/ui/textarea'
import { useActiveCashRegisters } from '../../../hooks/use-cash-registers'
import {
  useCashSessionSummary,
  useCloseCashSession,
  useCurrentOpenSession,
  useOpenCashSession,
  useUpdateSessionNotes,
} from '../../../hooks/use-cash-sessions'

// Form validation schemas
const openSessionSchema = z.object({
  cashRegisterId: z.number().min(1, 'Debe seleccionar una caja'),
  openedBy: z.string().min(1, 'Nombre del usuario es requerido'),
  openingAmount: z.coerce
    .number()
    .min(0, 'El monto inicial no puede ser negativo')
    .transform(val => val * 100),
  notes: z.string().optional(),
})

const closeSessionSchema = z.object({
  closedBy: z.string().min(1, 'Nombre del usuario es requerido'),
  actualAmount: z.coerce
    .number()
    .min(0, 'El monto contado no puede ser negativo')
    .transform(val => val * 100),
  notes: z.string().optional(),
})

const notesSchema = z.object({
  notes: z.string().optional(),
})

type OpenSessionFormData = z.infer<typeof openSessionSchema>
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

  // Queries
  const { data: openSession, refetch: refetchOpenSession } =
    useCurrentOpenSession()
  const { data: sessionSummary } = useCashSessionSummary(openSession?.id || 0)
  const { data: cashRegisters } = useActiveCashRegisters()

  // Mutations
  const openSessionMutation = useOpenCashSession()
  const closeSessionMutation = useCloseCashSession()
  const updateNotesMutation = useUpdateSessionNotes()

  // Forms
  const openForm = useForm<OpenSessionFormData>({
    resolver: zodResolver(openSessionSchema),
    defaultValues: {
      openingAmount: 0,
    },
  })

  const closeForm = useForm<CloseSessionFormData>({
    resolver: zodResolver(closeSessionSchema),
  })

  const notesForm = useForm<NotesFormData>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: openSession?.notes || '',
    },
  })

  // Open session
  const onOpenSession = async (data: OpenSessionFormData) => {
    try {
      await openSessionMutation.mutateAsync(data)
      setShowOpenDialog(false)
      openForm.reset()
      refetchOpenSession()
      onSessionChange?.()
    } catch (error) {
      console.error('Error opening session:', error)

      // Show user-friendly error message
      let errorMessage = 'Error al abrir la sesión de caja'
      if (error instanceof Error) {
        if (error.message.includes('Cash register not found')) {
          errorMessage =
            'No se encontró la caja registradora. Verifique que exista una caja registradora activa.'
        } else if (error.message.includes('already an open session')) {
          errorMessage =
            'Ya existe una sesión abierta para esta caja registradora.'
        } else if (error.message.includes('inactive cash register')) {
          errorMessage =
            'No se puede abrir sesión en una caja registradora inactiva.'
        }
      }

      // You can add toast notification here if you have a toast system
      sileo.error({
        title: 'Error al abrir la sesión de caja',
        description: errorMessage,
      })
    }
  }

  // Close session
  const onCloseSession = async (data: CloseSessionFormData) => {
    if (!openSession) return

    try {
      await closeSessionMutation.mutateAsync({
        id: openSession.id,
        input: data,
      })
      setShowCloseDialog(false)
      closeForm.reset()
      refetchOpenSession()
      onSessionChange?.()
    } catch (error) {
      console.error('Error closing session:', error)
    }
  }

  // Update notes
  const onUpdateNotes = async (data: NotesFormData) => {
    if (!openSession) return

    try {
      await updateNotesMutation.mutateAsync({
        id: openSession.id,
        notes: data.notes || '',
      })
      setShowNotesDialog(false)
      refetchOpenSession()
    } catch (error) {
      console.error('Error updating notes:', error)
    }
  }

  // Calculate expected vs actual difference
  const difference =
    sessionSummary && openSession
      ? (closeForm.watch('actualAmount') * 100 || 0) -
        (Number(openSession.openingAmount) +
          (Number(sessionSummary.salesSummary?.totalAmount) || 0))
      : 0

  return (
    <div className="space-y-6">
      {/* Session Status Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {openSession ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Caja Abierta
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    Caja Cerrada
                  </>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {openSession
                  ? `Sesión iniciada el ${format(
                      new Date(openSession.openedAt),
                      'PPpp',
                      { locale: es }
                    )}`
                  : 'No hay una sesión activa'}
              </p>
            </div>
            <Badge variant={openSession ? 'default' : 'secondary'}>
              {openSession ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
        </CardHeader>

        {openSession && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(openSession.openingAmount / 100)}
                </p>
                <p className="text-sm text-muted-foreground">Monto Inicial</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    (sessionSummary?.salesSummary?.totalAmount || 0) / 100
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Ventas</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {sessionSummary?.salesSummary?.totalSales || 0}
                </p>
                <p className="text-sm text-muted-foreground">Transacciones</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(
                    (Number(openSession.openingAmount) +
                      (Number(sessionSummary?.salesSummary?.totalAmount) ||
                        0)) /
                      100
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total Esperado</p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 text-sm">
                <User className="h-4 w-4" />
                <span>Abierto por: {openSession.openedBy}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  Duración:{' '}
                  {Math.round(
                    (Date.now() - new Date(openSession.openedAt).getTime()) /
                      (1000 * 60)
                  )}{' '}
                  min
                </span>
              </div>
              {openSession.cashRegisterName && (
                <div className="flex items-center gap-1 text-sm">
                  <Receipt className="h-4 w-4" />
                  <span>Caja: {openSession.cashRegisterName}</span>
                </div>
              )}
            </div>

            {openSession.notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-1">Notas:</p>
                <p className="text-sm">{openSession.notes}</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Payment Breakdown */}
      {openSession &&
        sessionSummary?.paymentBreakdown &&
        sessionSummary.paymentBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Desglose de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessionSummary.paymentBreakdown.map((payment, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="capitalize">{payment.method}</span>
                    <span className="font-medium">
                      {formatCurrency(payment.totalAmount / 100)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!openSession ? (
          <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <PlusCircle className="h-4 w-4 mr-2" />
                Abrir Caja
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Abrir Caja</DialogTitle>
              </DialogHeader>
              <Form {...openForm}>
                <form
                  onSubmit={openForm.handleSubmit(onOpenSession)}
                  className="space-y-4"
                >
                  <FormField
                    control={openForm.control}
                    name="cashRegisterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caja Registradora *</FormLabel>
                        <Select
                          value={field.value?.toString() || ''}
                          onValueChange={value =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar caja" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cashRegisters?.map(register => (
                              <SelectItem
                                key={register.id}
                                value={register.id.toString()}
                              >
                                {register.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={openForm.control}
                    name="openedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuario *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nombre del usuario" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={openForm.control}
                    name="openingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto Inicial</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon>L</InputGroupAddon>
                            <InputGroupInput
                              {...field}
                              placeholder="0.00"
                              onChange={e => field.onChange(e.target.value)}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={openForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Observaciones..." />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowOpenDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={openSessionMutation.isPending}
                    >
                      {openSessionMutation.isPending
                        ? 'Abriendo...'
                        : 'Abrir Caja'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        ) : (
          <>
            <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Notas
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Actualizar Notas</DialogTitle>
                </DialogHeader>
                <Form {...notesForm}>
                  <form
                    onSubmit={notesForm.handleSubmit(onUpdateNotes)}
                    className="space-y-4"
                  >
                    <FormField
                      control={notesForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Observaciones..."
                              rows={4}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNotesDialog(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateNotesMutation.isPending}
                      >
                        {updateNotesMutation.isPending
                          ? 'Guardando...'
                          : 'Guardar'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cerrar Caja
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cerrar Caja</DialogTitle>
                </DialogHeader>

                {sessionSummary && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg mb-4">
                    <h4 className="font-medium">Resumen de la Sesión</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Monto inicial:</span>
                        <span>
                          {formatCurrency(openSession.openingAmount / 100)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ventas realizadas:</span>
                        <span>
                          {sessionSummary.salesSummary?.totalSales || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total en ventas:</span>
                        <span>
                          {formatCurrency(
                            (sessionSummary.salesSummary?.totalAmount || 0) /
                              100
                          )}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>Total esperado:</span>
                        <span>
                          {formatCurrency(
                            (Number(openSession.openingAmount) +
                              (Number(
                                sessionSummary.salesSummary?.totalAmount
                              ) || 0)) /
                              100
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Form {...closeForm}>
                  <form
                    onSubmit={closeForm.handleSubmit(onCloseSession)}
                    className="space-y-4"
                  >
                    <FormField
                      control={closeForm.control}
                      name="closedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuario *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nombre del usuario"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={closeForm.control}
                      name="actualAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto Contado *</FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupAddon>L</InputGroupAddon>
                              <InputGroupInput
                                {...field}
                                placeholder="0.00"
                                onChange={e =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </InputGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Difference indicator */}
                    {closeForm.watch('actualAmount') !== undefined && (
                      <div
                        className={`p-3 rounded-lg ${
                          Math.abs(difference) < 0.01
                            ? 'bg-green-50 border border-green-200'
                            : difference > 0
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {Math.abs(difference) < 0.01 ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                          )}
                          <span className="font-medium text-sm">
                            {Math.abs(difference) < 0.01
                              ? 'Cuadra perfecto'
                              : difference > 0
                                ? `Sobrante: ${formatCurrency(difference)}`
                                : `Faltante: ${formatCurrency(
                                    Math.abs(difference)
                                  )}`}
                          </span>
                        </div>
                      </div>
                    )}

                    <FormField
                      control={closeForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Observaciones del cierre..."
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCloseDialog(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={closeSessionMutation.isPending}
                        variant="destructive"
                      >
                        {closeSessionMutation.isPending
                          ? 'Cerrando...'
                          : 'Cerrar Caja'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      {/* Alerts */}
      {!openSession && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Debe abrir una caja antes de poder realizar ventas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default CashSessionManager

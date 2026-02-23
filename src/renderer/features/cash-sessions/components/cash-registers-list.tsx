import React, { useState } from 'react'
import { PlusCircle, Edit, Power, PowerOff, Monitor } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '../../../components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'

import {
  useCashRegisters,
  useActivateCashRegister,
  useDeactivateCashRegister,
  CashRegister,
} from '../../../hooks/use-cash-registers'
import { CashRegisterForm } from './cash-register-form'

export const CashRegistersList = () => {
  const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(
    null
  )
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [registerToToggle, setRegisterToToggle] = useState<CashRegister | null>(
    null
  )

  const { data: registers, isLoading } = useCashRegisters()
  const activateMutation = useActivateCashRegister()
  const deactivateMutation = useDeactivateCashRegister()

  const handleEdit = (register: CashRegister) => {
    setSelectedRegister(register)
    setShowFormDialog(true)
  }

  const handleCreate = () => {
    setSelectedRegister(null)
    setShowFormDialog(true)
  }

  const handleToggleStatusRequest = (register: CashRegister) => {
    setRegisterToToggle(register)
    setShowDeactivateDialog(true)
  }

  const handleConfirmToggleStatus = async () => {
    if (!registerToToggle) return

    try {
      if (registerToToggle.status === 'active') {
        await deactivateMutation.mutateAsync(registerToToggle.id)
      } else {
        await activateMutation.mutateAsync(registerToToggle.id)
      }
    } catch (error) {
      console.error('Error toggling status:', error)
    } finally {
      setShowDeactivateDialog(false)
      setRegisterToToggle(null)
    }
  }

  const handleFormSuccess = () => {
    setShowFormDialog(false)
    setSelectedRegister(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Cajas Registradoras
          </h2>
          <p className="text-muted-foreground">
            Administre los puntos de cobro del establecimiento.
          </p>
        </div>
        <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nueva Caja
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <CashRegisterForm
              cashRegister={selectedRegister || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowFormDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Cajas</CardTitle>
          <CardDescription>
            Mostrando {registers?.length || 0} cajas registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Predeterminada</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Cargando cajas...
                    </TableCell>
                  </TableRow>
                ) : registers && registers.length > 0 ? (
                  registers.map(register => (
                    <TableRow key={register.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-muted-foreground" />
                          {register.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {register.location || (
                          <span className="text-muted-foreground italic">
                            Sin ubicación
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            register.status === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {register.status === 'active' ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {register.isDefault && (
                          <Badge variant="outline">Predeterminada</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(register.createdAt), 'PP', {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(register)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatusRequest(register)}
                            title={
                              register.status === 'active'
                                ? 'Desactivar'
                                : 'Activar'
                            }
                          >
                            {register.status === 'active' ? (
                              <PowerOff className="h-4 w-4 text-red-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No hay cajas registradas. Cree una para comenzar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {registerToToggle?.status === 'active'
                ? '¿Desactivar caja registradora?'
                : '¿Activar caja registradora?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {registerToToggle?.status === 'active'
                ? 'Una caja desactivada no podrá ser utilizada para abrir nuevas sesiones.'
                : 'La caja estará disponible para abrir nuevas sesiones.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmToggleStatus}
              className={
                registerToToggle?.status === 'active'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

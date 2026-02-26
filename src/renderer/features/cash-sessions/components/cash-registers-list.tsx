import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit, Monitor, PlusCircle, Power, PowerOff } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import {
  type CashRegister,
  useActivateCashRegister,
  useCashRegisters,
  useDeactivateCashRegister,
} from '../../../hooks/use-cash-registers'
import { CashRegisterForm } from './cash-register-form'

export const CashRegistersList: React.FC = () => {
  const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(
    null
  )
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [showToggleStatusDialog, setShowToggleStatusDialog] = useState(false)
  const [registerToToggle, setRegisterToToggle] = useState<CashRegister | null>(
    null
  )

  const { data: response, isLoading } = useCashRegisters()
  const registers = response?.data ?? []
  const activateMutation = useActivateCashRegister()
  const deactivateMutation = useDeactivateCashRegister()

  const handleCreate = () => {
    setSelectedRegister(null)
    setShowFormDialog(true)
  }

  const handleEdit = (register: CashRegister) => {
    setSelectedRegister(register)
    setShowFormDialog(true)
  }

  const handleToggleStatusRequest = (register: CashRegister) => {
    setRegisterToToggle(register)
    setShowToggleStatusDialog(true)
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
      setShowToggleStatusDialog(false)
      setRegisterToToggle(null)
    }
  }

  const handleFormSuccess = () => {
    setShowFormDialog(false)
    setSelectedRegister(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Cajas Registradoras
          </h2>
          <p className="text-default-500">
            Administre los puntos de cobro del establecimiento.
          </p>
        </div>
        <Button color="primary" onPress={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Caja
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-start gap-1">
          <h3 className="text-base font-semibold">Listado de Cajas</h3>
          <p className="text-sm text-default-500">
            Mostrando {registers.length} cajas registradas
          </p>
        </CardHeader>
        <CardBody>
          <Table aria-label="Listado de cajas registradoras">
            <TableHeader>
              <TableColumn>NOMBRE</TableColumn>
              <TableColumn>UBICACION</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>PREDETERMINADA</TableColumn>
              <TableColumn>CREADA</TableColumn>
              <TableColumn className="text-right">ACCIONES</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent="No hay cajas registradas. Cree una para comenzar."
              loadingState={isLoading ? 'loading' : 'idle'}
            >
              {(registers || []).map((register: CashRegister) => (
                <TableRow key={register.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <Monitor className="h-4 w-4 text-default-400" />
                      {register.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {register.location || (
                      <span className="italic text-default-400">
                        Sin ubicacion
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        register.status === 'active' ? 'success' : 'default'
                      }
                    >
                      {register.status === 'active' ? 'Activa' : 'Inactiva'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {register.isDefault ? (
                      <Chip size="sm" variant="bordered">
                        Predeterminada
                      </Chip>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(register.createdAt), 'PP', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        isIconOnly
                        variant="light"
                        onPress={() => handleEdit(register)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        isIconOnly
                        variant="light"
                        color={
                          register.status === 'active' ? 'danger' : 'success'
                        }
                        onPress={() => handleToggleStatusRequest(register)}
                      >
                        {register.status === 'active' ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table> 
        </CardBody>
      </Card>

      <Modal isOpen={showFormDialog} onOpenChange={setShowFormDialog} size="md">
        <ModalContent>
          <CashRegisterForm
            cashRegister={selectedRegister || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowFormDialog(false)}
          />
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showToggleStatusDialog}
        onOpenChange={setShowToggleStatusDialog}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>
            {registerToToggle?.status === 'active'
              ? 'Desactivar caja registradora'
              : 'Activar caja registradora'}
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              {registerToToggle?.status === 'active'
                ? 'Una caja desactivada no podra ser utilizada para abrir nuevas sesiones.'
                : 'La caja estara disponible para abrir nuevas sesiones.'}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setShowToggleStatusDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              color={
                registerToToggle?.status === 'active' ? 'danger' : 'success'
              }
              onPress={() => void handleConfirmToggleStatus()}
              isLoading={
                activateMutation.isPending || deactivateMutation.isPending
              }
            >
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}


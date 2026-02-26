import { Button, Card, CardBody, Tab, Tabs, Textarea } from '@heroui/react'
import { CreditCard, History, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getShiftModuleNote,
  SHIFT_HANDOVER_UPDATED_EVENT,
  setShiftModuleNote,
} from '@/features/operations/model/shift-handover-storage'
import {
  TOP_UPS_UPDATED_EVENT,
  topUpsService,
} from '@/features/top-ups/services/top-ups-service'
import { CashRegistersList } from '../features/cash-sessions/components/cash-registers-list'
import { CashSessionManager } from '../features/cash-sessions/components/cash-session-manager'

export const CashPage = () => {
  const [shiftNote, setShiftNote] = useState(() => getShiftModuleNote('cash'))
  const [virtualBalance, setVirtualBalance] = useState(0)

  useEffect(() => {
    const refreshShiftNote = () => setShiftNote(getShiftModuleNote('cash'))
    const refreshTopUps = () => {
      void topUpsService
        .getVirtualBalance()
        .then(setVirtualBalance)
        .catch(() => setVirtualBalance(0))
    }

    refreshTopUps()
    window.addEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
    window.addEventListener(TOP_UPS_UPDATED_EVENT, refreshTopUps)
    return () => {
      window.removeEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
      window.removeEventListener(TOP_UPS_UPDATED_EVENT, refreshTopUps)
    }
  }, [])

  const handleSaveShiftNote = () => {
    setShiftModuleNote('cash', shiftNote)
    sileo.success({ title: 'Nota de turno guardada en caja' })
  }

  return (
    <div className="h-full flex flex-col space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Caja</h2>
          <p className="text-muted-foreground">
            Gestione las sesiones de caja, historial y cajas registradoras.
          </p>
        </div>
      </div>

      <Tabs aria-label="Caja" className="flex-1" variant="underlined">
        <Tab
          key="session"
          title={
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Control de Caja
            </div>
          }
        >
          <div className="space-y-4 pt-4">
            <Card>
              <CardBody className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Saldo virtual de recargas disponible:{' '}
                  <span className="font-semibold text-foreground">
                    L {virtualBalance.toFixed(2)}
                  </span>
                </p>
                <Textarea
                  value={shiftNote}
                  onValueChange={setShiftNote}
                  placeholder="Nota para siguiente turno en caja (entregas, faltantes, observaciones)."
                />
                <Button size="sm" onPress={handleSaveShiftNote}>
                  Guardar nota de turno
                </Button>
              </CardBody>
            </Card>

            <div className="grid gap-4">
              <CashSessionManager />
            </div>
          </div>
        </Tab>

        <Tab
          key="history"
          title={
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historial
            </div>
          }
        >
          <div className="space-y-4 pt-4">
            <Card>
              <CardBody>
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <History className="h-12 w-12 mb-4 opacity-20" />
                  <p>El historial de sesiones estará disponible pronto.</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab
          key="registers"
          title={
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Cajas
            </div>
          }
        >
          <div className="pt-4">
            <CashRegistersList />
          </div>
        </Tab>
      </Tabs>
    </div>
  )
}


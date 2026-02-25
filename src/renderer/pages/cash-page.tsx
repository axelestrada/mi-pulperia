import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { CreditCard, History, Settings } from 'lucide-react'

import { CashSessionManager } from '../features/cash-sessions/components/cash-session-manager'
import { CashRegistersList } from '../features/cash-sessions/components/cash-registers-list'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  SHIFT_HANDOVER_UPDATED_EVENT,
  getShiftModuleNote,
  setShiftModuleNote,
} from '@/features/operations/model/shift-handover-storage'
import { getVirtualBalance, TOP_UPS_UPDATED_EVENT } from '@/features/top-ups/model/top-ups-storage'

export const CashPage = () => {
  const [shiftNote, setShiftNote] = useState(() => getShiftModuleNote('cash'))
  const [virtualBalance, setVirtualBalance] = useState(() => getVirtualBalance())

  useEffect(() => {
    const refreshShiftNote = () => setShiftNote(getShiftModuleNote('cash'))
    const refreshTopUps = () => setVirtualBalance(getVirtualBalance())

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

      <Tabs defaultValue="session" className="flex-1 space-y-4">
        <TabsList>
          <TabsTrigger value="session" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Control de Caja
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="registers" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Cajas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="session" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                Saldo virtual de recargas disponible:{' '}
                <span className="font-semibold text-foreground">
                  L {virtualBalance.toFixed(2)}
                </span>
              </p>
              <Textarea
                value={shiftNote}
                onChange={e => setShiftNote(e.target.value)}
                placeholder="Nota para siguiente turno en caja (entregas, faltantes, observaciones)."
              />
              <Button size="sm" onClick={handleSaveShiftNote}>
                Guardar nota de turno
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <div className="rounded-xl border bg-card text-card-foreground shadow col-span-2 p-6">
              <CashSessionManager />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <History className="h-12 w-12 mb-4 opacity-20" />
                <p>El historial de sesiones estará disponible pronto.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registers" className="space-y-4">
          <CashRegistersList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

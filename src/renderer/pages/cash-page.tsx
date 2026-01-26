import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { CreditCard, History, Settings } from 'lucide-react'

import { CashSessionManager } from '../features/cash-sessions/components/cash-session-manager'
import { CashRegistersList } from '../features/cash-sessions/components/cash-registers-list'
import { Card, CardContent } from '../components/ui/card'

export const CashPage = () => {
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

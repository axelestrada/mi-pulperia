import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingCart, CreditCard, Settings } from 'lucide-react'

import POSInterface from '@/features/pos/components/pos-interface'
import CashSessionManager from '@/features/cash-sessions/components/cash-session-manager'
import { useCurrentOpenSession } from '@/hooks/use-cash-sessions'

export const PosPage = () => {
  const { data: openSession } = useCurrentOpenSession()

  const handleSaleComplete = (saleId: number) => {
    console.log('Sale completed:', saleId)
    // Here you could show a receipt dialog, navigate to receipt page, etc.
  }

  const handleSessionChange = () => {
    console.log('Session changed')
    // Refresh any necessary data
  }

  return (
    <div className="h-full">
      <Tabs defaultValue="sales" className="h-full">
        <div className="px-4 py-2 border-b">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Punto de Venta
            </TabsTrigger>
            <TabsTrigger
              value="cash-session"
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Gestión de Caja
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sales" className="mt-0 h-[calc(100%-60px)]">
          <POSInterface onSaleComplete={handleSaleComplete} />
        </TabsContent>

        <TabsContent
          value="cash-session"
          className="mt-0 h-[calc(100%-60px)] overflow-auto"
        >
          <div className="p-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">
                  Gestión de Caja
                </h1>
                <p className="text-muted-foreground">
                  Administre las sesiones de caja y controle el flujo de
                  efectivo
                </p>
              </div>

              <CashSessionManager onSessionChange={handleSessionChange} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

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
      <POSInterface onSaleComplete={handleSaleComplete} />
    </div>
  )
}

import POSInterface from '@/features/pos/components/pos-interface'

export const PosPage = () => {
  const handleSaleComplete = (saleId: number) => {
    console.log('Sale completed:', saleId)
  }

  return (
    <div className="h-full">
      <POSInterface onSaleComplete={handleSaleComplete} />
    </div>
  )
}

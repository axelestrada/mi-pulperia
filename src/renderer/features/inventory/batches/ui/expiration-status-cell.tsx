import { cn } from '@/lib/utils'
import { differenceInCalendarDays, formatDate, startOfDay } from 'date-fns'

import { es } from 'date-fns/locale'

type Props = {
  expirationDate: Date | null
}

export function ExpirationStatusCell({ expirationDate }: Props) {
  if (!expirationDate) {
    return <span className="text-muted-foreground">—</span>
  }

  const today = startOfDay(new Date())
  const expiration = startOfDay(expirationDate)

  const daysDiff = differenceInCalendarDays(expiration, today)

  const isExpired = daysDiff < 0
  const expiresToday = daysDiff === 0

  return (
    <div
      className={cn(
        'flex gap-1',
        !isExpired && daysDiff <= 15 && 'text-yellow-600',
        isExpired && 'text-red-600'
      )}
    >
      <span>{formatDate(expirationDate, 'dd MMM yyyy', { locale: es })}</span>

      {isExpired ? (
        <Badge variant="destructive" className="w-fit">
          Vencido
        </Badge>
      ) : daysDiff<= 15 ? (
        <Badge variant="outline" className="w-fit border-yellow-600 text-yellow-600">
          {expiresToday ? 'Vence hoy' : `${daysDiff} días`}
        </Badge>
      ) : null}
    </div>
  )
}

import { differenceInCalendarDays, format, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type Props = {
  expirationDate?: Date | null
}

export function ExpirationStatusCell({ expirationDate }: Props) {
  if (!expirationDate) {
    return null
  }

  const today = startOfDay(new Date())
  const expiration = startOfDay(expirationDate)

  const daysDiff = differenceInCalendarDays(expiration, today)

  const isExpired = daysDiff < 0

  const expiringSoon = daysDiff <= 15

  return (
    <div
      className={cn('flex gap-2 whitespace-nowrap', {
        'text-warning-500': expiringSoon && !isExpired,
        'text-danger-500': isExpired,
      })}
    >
      <IconSolarCalendarMinimalisticLinear
        className={cn('size-4 text-default-300', {
          'text-warning-500': expiringSoon && !isExpired,
          'text-danger-500': isExpired,
        })}
      />
      <span>
        {capitalize(
          format(expirationDate, 'MMMM dd, yyyy', {
            locale: es,
          })
        )}
      </span>
    </div>
  )
}

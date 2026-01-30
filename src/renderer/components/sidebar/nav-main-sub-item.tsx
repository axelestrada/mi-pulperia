import { cn } from '@/lib/utils'
import { Button } from '@heroui/react'
import { useMatch } from 'react-router-dom'

type Props = {
  item: INavMainSubItem
}

export const NavMainSubItem = ({ item }: Props) => {
  const isCurrent = useMatch(item.url)

  return (
    <NavLink to={item.url}>
      <Button
        fullWidth
        size="sm"
        variant="light"
        className={cn('justify-start text-default-500', {
          'bg-foreground! text-default-50': isCurrent,
        })}
      >
        {item.icon}
        <p className="font-medium flex-1 text-left">{item.title}</p>
      </Button>
    </NavLink>
  )
}

import { Button, Kbd } from '@heroui/react'
import { useMatch } from 'react-router-dom'
import { cn } from '@/lib/utils'

type Props = {
  item: INavMainSubItem
}

export const NavMainSubItem = ({ item }: Props) => {
  const isCurrent = useMatch(item.url)

  const navigate = useNavigate()

  const handleNavigate = useCallback(() => {
    navigate(item.url)
  }, [item.url, navigate])

  useEffect(() => {
    if (!item.shortcut) return

    const shortcutParts = item.shortcut
      .toLowerCase()
      .split('+')
      .map(part => part.trim())
      .filter(Boolean)

    const key = shortcutParts[shortcutParts.length - 1]

    if (!key) return

    const requiresCtrl =
      shortcutParts.includes('ctrl') || shortcutParts.includes('control')
    const requiresMeta =
      shortcutParts.includes('meta') ||
      shortcutParts.includes('cmd') ||
      shortcutParts.includes('command')
    const requiresAlt =
      shortcutParts.includes('alt') || shortcutParts.includes('option')
    const requiresShift = shortcutParts.includes('shift')

    const handleKeyDown = (event: KeyboardEvent) => {
      const normalizedKey = event.key.toLowerCase()

      if (normalizedKey !== key) return
      if ((requiresCtrl && !event.ctrlKey) || (!requiresCtrl && event.ctrlKey))
        return
      if ((requiresMeta && !event.metaKey) || (!requiresMeta && event.metaKey))
        return
      if ((requiresAlt && !event.altKey) || (!requiresAlt && event.altKey))
        return
      if (
        (requiresShift && !event.shiftKey) ||
        (!requiresShift && event.shiftKey)
      )
        return

      event.preventDefault()
      handleNavigate()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [item.shortcut, handleNavigate])

  return (
    <Button
      fullWidth
      onPress={handleNavigate}
      size="sm"
      variant="light"
      className={cn('justify-start text-default-500', {
        'bg-foreground! text-default-50': isCurrent,
      })}
    >
      {item.icon}
      <p className="font-medium flex-1 text-left">{item.title}</p>
      {item.shortcut && (
        <Kbd
          classNames={{
            content: 'text-xs',
          }}
        >
          {item.shortcut}
        </Kbd>
      )}
    </Button>
  )
}

import { Button, Kbd } from '@heroui/react'
import { cn } from '@/lib/utils'

type Props = {
  item: INavMainItem
}

export const NavMainItem = ({ item }: Props) => {
  const [isOpen, setOpen] = useState(item.isActive)

  const { pathname } = useLocation()

  const items = item.items ?? []

  const isCurrent =
    pathname === item.url ||
    [item.url, ...items.map(i => i.url)].includes(pathname.slice(1))

  return (
    <Collapsible key={item.title} asChild open={isOpen} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <NavLink to={item.url}>
          <Button
            fullWidth
            variant="light"
            className={cn('justify-start text-default-500', {
              'bg-foreground! text-default-50': isCurrent,
            })}
          >
            {item.icon}
            <p className="font-medium flex-1 text-left">{item.title}</p>
            {item.shortcut && <Kbd>{item.shortcut}</Kbd>}
            {items.length > 0 && (
              <CollapsibleTrigger
                asChild
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  setOpen(!isOpen)
                }}
              >
                <Button isIconOnly radius="full" size="sm" variant="light">
                  {isOpen ? (
                    <IconSolarMinusCircleLineDuotone
                      className={cn('size-5 text-default-500', {
                        'text-default-50': isCurrent,
                      })}
                    />
                  ) : (
                    <IconSolarAddCircleLineDuotone
                      className={cn('size-5 text-default-500', {
                        'text-default-50': isCurrent,
                      })}
                    />
                  )}

                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            )}
          </Button>
        </NavLink>
        {item.items?.length ? (
          <CollapsibleContent>
            <div className="pl-4 pt-1">
              {item.items?.map(subItem => (
                <NavMainSubItem key={subItem.title} item={subItem} />
              ))}
            </div>
          </CollapsibleContent>
        ) : null}
      </SidebarMenuItem>
    </Collapsible>
  )
}

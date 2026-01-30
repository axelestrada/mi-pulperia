'use client'
1 
import { ReactElement } from 'react'

export type INavMainSubItem = {
  title: string
  url: string
  icon: ReactElement
}

export type INavMainItem = {
  title: string
  url: string
  shortcut?: string
  icon: ReactElement
  isActive?: boolean
  items?: INavMainSubItem[]
}

export function NavMain({ items }: { items: INavMainItem[] }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map(item => (
          <NavMainItem key={item.url} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

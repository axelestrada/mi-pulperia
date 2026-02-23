'use client'
1

import type { ReactElement } from 'react'
import { SidebarGroup, SidebarMenu } from '../ui/sidebar'
import { NavMainItem } from './nav-main-item'

export type INavMainSubItem = {
  title: string
  url: string
  icon: ReactElement
  shortcut?: string
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

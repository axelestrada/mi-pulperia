import * as React from 'react'

import { Sidebar } from '@/components/ui/sidebar'

const data = {
  user: {
    name: 'Ena Raudales',
    email: 'enaraudales@gmail.com',
    avatar: '/images/avatars/woman.jpg',
  },
  navMain: [
    {
      title: 'Panel Principal',
      url: '/',
      icon: <IconSolarHome2Linear className="size-6" />,
    },
    {
      title: 'Punto de Venta',
      shortcut: 'F2',
      url: 'pos',
      icon: <IconSolarLaptopMinimalisticLinear className="size-6" />,
    },
    {
      title: 'Clientes',
      url: 'customers',
      icon: <IconSolarUsersGroupTwoRoundedLinear className="size-6" />,
    },
    {
      title: 'Productos',
      url: 'products',
      icon: <IconSolarBoxLinear className="size-6" />,
      isActive: true,
      items: [
        {
          title: 'Lista de Productos',
          url: 'products',
          icon: <IconSolarBoxMinimalisticLinear className="size-5" />,
        },
        {
          title: 'Categorías',
          url: 'categories',
          icon: <IconSolarWidget2Outline className="size-5" />,
        },
        {
          title: 'Inventario',
          url: 'inventory',
          icon: <IconSolarChecklistMinimalisticLinear className="size-5" />,
        },
        {
          title: 'Ordenes de Compra',
          url: 'purchase-orders',
          icon: <IconSolarBillListLinear className="size-5" />,
        },
        {
          title: 'Ajustes y Merma',
          url: 'adjustments',
          icon: <IconSolarSettingsMinimalisticLinear className="size-5" />,
        },
        {
          title: 'Proveedores',
          url: 'suppliers',
          icon: <IconSolarScooterLinear className="size-5" />,
        },
      ],
    },
    {
      title: 'Créditos',
      url: 'credits',
      icon: <IconSolarBanknote2Linear className="size-6" />,
    },
    {
      title: 'Gastos',
      url: 'expenses',
      icon: <IconSolarDocumentAddLinear className="size-6" />,
    },
    {
      title: 'Reportes',
      url: 'reports',
      icon: <IconSolarPresentationGraphLinear className="size-6" />,
    },
    {
      title: 'Caja',
      url: 'cash',
      icon: <IconSolarSafe2Linear className="size-6" />,
    },
  ],
  navSecondary: [
    {
      title: 'Ayuda',
      url: 'help',
      icon: <IconSolarHome2Linear className="size-6" />,
    },
    {
      title: 'Configuración',
      url: 'settings',
      icon: <IconSolarHome2Linear className="size-6" />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props} className="bg-default-100">
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  )
}

import type * as React from 'react'

import { Sidebar } from '@/components/ui/sidebar'

const data = {
  user: {
    name: 'Ena Raudales',
    email: 'enaraudales@gmail.com',
    avatar: '/images/avatars/woman.jpg',
  },
  navMain: [
    {
      title: 'Panel principal',
      url: '/',
      icon: <IconSolarHome2Linear className="size-6" />,
    },
    {
      title: 'Punto de venta',
      shortcut: 'F2',
      url: 'pos',
      icon: <IconSolarLaptopMinimalisticLinear className="size-6" />,
    },
    {
      title: 'Ventas',
      url: 'sales',
      icon: <IconSolarWalletMoneyLinear className="size-6" />,
      isActive: true,
      items: [
        {
          title: 'Historial',
          url: 'sales',
          icon: <IconSolarHistoryLinear className="size-5" />,
        },
        {
          title: 'Devoluciones',
          url: 'returns',
          icon: <IconSolarRefreshSquareLinear className="size-5" />,
        },
      ],
    },
    {
      title: 'Catálogo',
      url: 'products',
      icon: <IconSolarClipboardListLinear className="size-6" />,
      items: [
        {
          title: 'Lista de productos',
          url: 'products',
          icon: <IconSolarBoxLinear className="size-5" />,
        },
        {
          title: 'Categorías',
          url: 'categories',
          icon: <IconSolarWidget2Outline className="size-5" />,
        },
        {
          title: 'Promociones',
          url: 'promotions',
          icon: <IconSolarSaleLinear className="size-5" />,
        },
      ],
    },
    {
      title: 'Inventario',
      url: 'inventory',
      icon: <IconSolarDocumentAddLinear className="size-6" />,
      items: [
        {
          title: 'Stock',
          url: 'inventory',
          icon: <IconSolarChecklistMinimalisticLinear className="size-5" />,
        },

        {
          title: 'Ajustes y Merma',
          url: 'adjustments',
          icon: <IconSolarSettingsMinimalisticLinear className="size-5" />,
        },
      ],
    },
    {
      title: 'Compras',
      url: 'purchase-orders',
      icon: <IconSolarMoneyBagLinear className="size-6" />,
      items: [
        {
          title: 'Ordenes de Compra',
          url: 'purchase-orders',
          icon: <IconSolarBillListLinear className="size-5" />,
        },
        {
          title: 'Proveedores',
          url: 'suppliers',
          icon: <IconSolarScooterLinear className="size-5" />,
        },
      ],
    },
    {
      title: 'Finanazas',
      url: 'credits',
      icon: <IconSolarBanknoteLinear className="size-6" />,
      items: [
        {
          title: 'Créditos',
          url: 'credits',
          icon: <IconSolarBanknote2Linear className="size-5" />,
        },
        {
          title: 'Gastos',
          url: 'expenses',
          icon: <IconSolarDocumentAddLinear className="size-5" />,
        },
        {
          title: 'Caja',
          url: 'cash',
          icon: <IconSolarSafe2Linear className="size-5" />,
        },
      ],
    },
    {
      title: 'Clientes',
      url: 'customers',
      icon: <IconSolarUsersGroupTwoRoundedLinear className="size-6" />,
    },
    {
      title: 'Recargas',
      url: 'top-ups',
      icon: <IconSolarSmartphoneUpdateLinear className="size-6" />,
    },
    {
      title: 'Reportes',
      url: 'reports',
      icon: <IconSolarPresentationGraphLinear className="size-6" />,
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

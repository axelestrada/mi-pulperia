import { createBrowserRouter } from 'react-router-dom'

import { PosPage } from '@/pages/pos-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { CustomersPage } from '@/pages/customers-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { ProductsPage } from '@/pages/products-page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    handle: {
      title: 'Panel Principal',
    },
    children: [
      {
        index: true,
        element: <DashboardPage />,
        handle: {
          title: 'Panel Principal',
        },
      },
      {
        path: 'pos',
        element: <PosPage />,
        handle: {
          title: 'Punto de Venta',
        },
      },
      {
        path: 'customers',
        element: <CustomersPage />,
        handle: {
          title: 'Clientes',
        },
      },
      {
        path: 'products',
        element: <ProductsPage />,
        handle: {
          title: 'Productos',
        },
      },
      {
        path: '*',
        element: <NotFoundPage />,
        handle: { title: 'Página no encontrada' },
      },
    ],
  },
])

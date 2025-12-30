import { createBrowserRouter } from "react-router-dom"

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
        path: 'categories',
        element: <CategoriesPage />,
        handle: {
          title: 'Categorías',
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

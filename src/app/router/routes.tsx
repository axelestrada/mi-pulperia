import { PosPage } from "@/pages/pos-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    handle: {
      title: "Panel Principal",
    },
    children: [
      {
        index: true,
        element: <DashboardPage />,
        handle: {
          title: "Panel Principal",
        },
      },
      {
        path: "pos",
        element: <PosPage />,
        handle: {
          title: "Punto de Venta",
        },
      },
    ],
  },
]);

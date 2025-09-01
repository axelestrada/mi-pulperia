import { PosPage } from "@/features/pos/pages/pos-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "pos",
        element: <PosPage />,
      },
    ],
  },
]);

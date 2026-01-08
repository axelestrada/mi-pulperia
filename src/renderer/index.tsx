import ReactDOM from 'react-dom/client'

const queryClient = new QueryClient()

import './index.css'
import { RouterProvider } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <Toaster position="bottom-right" />
  </QueryClientProvider>
)

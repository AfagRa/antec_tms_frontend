import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/hooks/useToast'
import { AcademicProvider } from '@/store/academicStore.tsx'
import { router } from '@/router'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AcademicProvider>
          <RouterProvider router={router} />
        </AcademicProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

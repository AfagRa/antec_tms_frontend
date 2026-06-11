import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import ToastContainer from '@/components/ui/Toast'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function AdminLayout() {
  const { user, isLoading } = useAuth()
  const { toasts, removeToast } = useToast()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-text-base">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

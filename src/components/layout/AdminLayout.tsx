import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import ToastContainer from '@/components/ui/Toast'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function AdminLayout() {
  const { user, isLoading } = useAuth()
  const { toasts, removeToast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(prev => !prev)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="min-w-0 flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

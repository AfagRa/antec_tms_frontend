import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
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
        <div className="mb-4">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="rounded-md p-1.5 text-text-base/50 hover:text-text-base hover:bg-surface-dark/20 transition-colors"
            aria-label="Menyu"
          >
            <Menu size={20} />
          </button>
        </div>
        <Outlet />
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

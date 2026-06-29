import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, User } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import ToastContainer from '@/components/ui/Toast'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function AdminLayout() {
  const { user, isLoading } = useAuth()
  const { toasts, removeToast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

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
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-10 flex h-[64px] items-center justify-end border-b border-surface-dark/20 bg-surface px-6">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="lg:hidden mr-auto p-2 rounded-md text-text-base/50 hover:text-text-base hover:bg-surface-dark/20 transition-colors"
            aria-label="Menyu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Admin
            </span>
            <button
              onClick={() => navigate('/admin/profile')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-0 outline-none text-left"
              aria-label="İstifadəçi profilinə keç"
            >
              <span className="text-sm font-medium text-text-base">
                {user?.name} {user?.surname}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-dark">
                <User size={18} className="text-text-base/50" aria-hidden="true" />
              </div>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

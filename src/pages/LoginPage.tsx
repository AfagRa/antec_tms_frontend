import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [navigate, user])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Zəhmət olmasa bütün sahələri doldurun.')
      return
    }

    setLoading(true)
    try {
      const role = await login({ email, password })
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate(`/${role}/dashboard`, { replace: true })
      }
    } catch {
      setError('Email və ya şifrə yanlışdır.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-neu-lg bg-primary shadow-neu-sm">
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <h1 className="text-xl font-bold tracking-wide text-text-base">Admin Panel</h1>
          <p className="mt-1 text-sm text-text-base/50">Sistemə daxil olun</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            leftIcon={<Mail size={15} />}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
          />
          <Input
            label="Şifrə"
            type="password"
            autoComplete="current-password"
            leftIcon={<Lock size={15} />}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <div role="alert" className="rounded-neu-sm bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Daxil ol
          </Button>
        </form>
      </Card>

      <p className="absolute bottom-6 text-xs font-mono text-text-base/30">Neumorphism Admin</p>
    </div>
  )
}

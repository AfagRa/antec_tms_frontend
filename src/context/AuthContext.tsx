import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '@/api/auth'
import type { AuthResponse, User, UserRole } from '@/types'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (payload: { email: string; password: string }) => Promise<UserRole>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState<boolean>(!!localStorage.getItem('token'))

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    authApi
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const login = useCallback(async (payload: { email: string; password: string }) => {
    const response: AuthResponse = await authApi.login(payload)
    localStorage.setItem('token', response.token)
    setToken(response.token)
    setUser(response.user)
    return response.user.role
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined)
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, token, isLoading, login, logout }), [user, token, isLoading, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return ctx
}

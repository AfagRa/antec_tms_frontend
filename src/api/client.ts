import axios, { type AxiosError } from 'axios'

export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5014/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  paramsSerializer: {
    serialize: (params) => {
      const converted: Record<string, string> = {}
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
          converted[camelKey] = String(value)
        }
      }
      return new URLSearchParams(converted).toString()
    },
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token')
      if (token) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

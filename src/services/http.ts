import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { getStoredLocale, translateMessage } from '@/i18n/messages'
import { useAuthStore } from '@/store/auth'
import type { ApiResponse } from '@/types/api'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse<unknown>
    const locale = getStoredLocale()

    if (typeof data?.code === 'number' && data.code !== 0) {
      const errorMessage = data.message || translateMessage(locale, 'common.requestFailed')
      message.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }

    return response
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const locale = getStoredLocale()
    const responseData = error.response?.data as
      | (ApiResponse<unknown> & { detail?: string })
      | undefined
    const errorMessage =
      responseData?.message ||
      responseData?.detail ||
      error.message ||
      translateMessage(locale, 'common.networkError')
    message.error(errorMessage)
    return Promise.reject(error)
  },
)

export async function request<T = unknown>(config: AxiosRequestConfig) {
  const response = await http.request<ApiResponse<T>>(config)
  return response.data.data
}

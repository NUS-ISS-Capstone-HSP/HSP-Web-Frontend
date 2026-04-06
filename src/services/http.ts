import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import { message } from 'antd'
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

    if (typeof data?.code === 'number' && data.code !== 0) {
      const errorMessage = data.message || '请求失败'
      message.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }

    return response
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const errorMessage =
      error.response?.data?.message || error.message || '网络请求异常'
    message.error(errorMessage)
    return Promise.reject(error)
  },
)

export async function request<T = unknown>(config: AxiosRequestConfig) {
  const response = await http.request<ApiResponse<T>>(config)
  return response.data.data
}

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { BASE_URL, SESSION_KEY } from '../utils/constants'
import { MyTokriError, UnauthorisedError } from './errors'
import type { ApiResponse, SessionData } from '../types/models'

type UnauthorisedHandler = () => void

let onUnauthorised: UnauthorisedHandler | null = null

export function setUnauthorisedHandler(fn: UnauthorisedHandler) {
  onUnauthorised = fn
}

function getToken(): string {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return ''
    const session = JSON.parse(raw) as SessionData
    return session.token || ''
  } catch {
    return ''
  }
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// AuthInterceptor — attach Bearer token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// ErrorInterceptor — convert non-2xx responses to typed exceptions
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status ?? 0

    if (status === 401) {
      if (onUnauthorised) onUnauthorised()
      return Promise.reject(new UnauthorisedError())
    }

    const body = error.response?.data
    const errorCode = body?.error_status ?? status
    const message =
      body?.error_message ||
      error.message ||
      'Something went wrong. Please try again.'

    return Promise.reject(new MyTokriError(status, errorCode ?? status, message))
  },
)

// Helper to unwrap ApiResponse<T> -> T
export async function callApi<T>(
  promise: Promise<{ data: ApiResponse<T> }>,
): Promise<T> {
  const res = await promise
  const body = res.data
  if (body && (body.status >= 200 && body.status < 300)) {
    return body.data as T
  }
  // Treat any non-2xx in payload as error too
  throw new MyTokriError(
    body?.status ?? 0,
    body?.error_status ?? 0,
    body?.error_message || 'Request failed',
  )
}

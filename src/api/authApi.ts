import { apiClient, callApi } from './apiClient'
import type {
  ApiResponse,
  GenerateOtpRequest,
  LoginResponse,
  VerifyOtpRequest,
} from '../types/models'
import { ROLE_ADMIN, ROLE_HUB_MANAGER } from '../utils/constants'

function loginEndpointForRole(role: number): string {
  switch (role) {
    case ROLE_ADMIN:
      return 'auth/admin_login'
    case ROLE_HUB_MANAGER:
      return 'auth/hub_manager_login'
    default:
      throw new Error(`Unsupported role: ${role}`)
  }
}

export const authApi = {
  generateOtp(role: number, body: GenerateOtpRequest) {
    const path = loginEndpointForRole(role)
    return callApi<unknown>(apiClient.post<ApiResponse<unknown>>(path, body))
  },
  verifyOtp(body: VerifyOtpRequest) {
    return callApi<LoginResponse>(
      apiClient.post<ApiResponse<LoginResponse>>('auth/complete_login', body),
    )
  },
  logout() {
    return callApi<unknown>(apiClient.post<ApiResponse<unknown>>('auth/logout'))
  },
}

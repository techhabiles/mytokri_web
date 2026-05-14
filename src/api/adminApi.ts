import { apiClient, callApi } from './apiClient'
import type {
  AddCategoryRequest,
  AddCouponRequest,
  AddHubManagerRequest,
  AddHubRequest,
  AddLocationRequest,
  ApiResponse,
  CouponResponse,
  HubListItem,
  HubManagerResponse,
  HubResponse,
  LocationResponse,
  PlainOtpRequest,
} from '../types/models'

export const adminApi = {
  getPlainOtp(body: PlainOtpRequest) {
    return callApi<string>(
      apiClient.post<ApiResponse<string>>('admin/get_plain_otp', body),
    )
  },

  // Hubs
  addHub(body: AddHubRequest) {
    return callApi<HubResponse>(
      apiClient.post<ApiResponse<HubResponse>>('admin/add_hub', body),
    )
  },
  getHubs() {
    return callApi<HubResponse[]>(
      apiClient.post<ApiResponse<HubResponse[]>>('admin/get_hubs'),
    )
  },
  getHubsList() {
    return callApi<HubListItem[]>(
      apiClient.get<ApiResponse<HubListItem[]>>('admin/get_hubs_list'),
    )
  },

  // Locations
  addLocation(body: AddLocationRequest) {
    return callApi<LocationResponse>(
      apiClient.post<ApiResponse<LocationResponse>>('admin/add_location', body),
    )
  },
  getLocations() {
    return callApi<LocationResponse[]>(
      apiClient.get<ApiResponse<LocationResponse[]>>('admin/get_locations'),
    )
  },
  getLocationsByHub(hubId: number) {
    return callApi<LocationResponse[]>(
      apiClient.get<ApiResponse<LocationResponse[]>>(
        'admin/get_locations_by_hub_id',
        { params: { hub_id: hubId } },
      ),
    )
  },

  // Categories (admin add — list lives in shared)
  addCategory(body: AddCategoryRequest) {
    return callApi<unknown>(
      apiClient.post<ApiResponse<unknown>>('admin/add_category', body),
    )
  },

  // Hub Managers
  addHubManager(body: AddHubManagerRequest) {
    return callApi<HubManagerResponse>(
      apiClient.post<ApiResponse<HubManagerResponse>>(
        'admin/add_hub_manager',
        body,
      ),
    )
  },
  getHubManagers() {
    return callApi<HubManagerResponse[]>(
      apiClient.get<ApiResponse<HubManagerResponse[]>>('admin/get_hub_managers'),
    )
  },
  assignHubManager(hubId: number, userId: number) {
    return callApi<unknown>(
      apiClient.post<ApiResponse<unknown>>(
        `admin/assign_hub_manager_to_hub/${hubId}/${userId}`,
      ),
    )
  },

  // Coupons
  addCoupon(body: AddCouponRequest) {
    return callApi<CouponResponse>(
      apiClient.post<ApiResponse<CouponResponse>>('admin/add_coupon', body),
    )
  },
  getCoupons(hubId: number) {
    return callApi<CouponResponse[]>(
      apiClient.get<ApiResponse<CouponResponse[]>>(`admin/get_coupons/${hubId}`),
    )
  },
  updateCouponLock(id: number) {
    return callApi<unknown>(
      apiClient.post<ApiResponse<unknown>>(`admin/update_coupon_lock/${id}`),
    )
  },
}

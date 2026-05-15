import { apiClient, callApi } from './apiClient'
import type { ApiResponse, DeliveryLocation, OrderListResponse } from '../types/models'

export const hubManagerApi = {
  getOrderList(page: number, size: number) {
    return callApi<OrderListResponse>(
      apiClient.get<ApiResponse<OrderListResponse>>(`hbm/get_order_list/${page}/${size}`),
    )
  },

  getOtherOrders(page: number, size: number) {
    return callApi<OrderListResponse>(
      apiClient.get<ApiResponse<OrderListResponse>>(`hbm/other_orders/${page}/${size}`),
    )
  },

  getDeliveryLocations() {
    return callApi<DeliveryLocation[]>(
      apiClient.get<ApiResponse<DeliveryLocation[]>>('hbm/get_delivery_locations'),
    )
  },
}

import { apiClient, callApi } from './apiClient'
import type {
  AddInventoryRequest,
  AddProductRequest,
  AddSupplierRequest,
  ApiResponse,
  CategoryResponse,
  ProductResponse,
  SupplierResponse,
} from '../types/models'

export const sharedApi = {
  getCategories() {
    return callApi<CategoryResponse[]>(
      apiClient.get<ApiResponse<CategoryResponse[]>>('shared/get_categories'),
    )
  },

  addProduct(body: AddProductRequest) {
    return callApi<ProductResponse>(
      apiClient.post<ApiResponse<ProductResponse>>('shared/add_product', body),
    )
  },
  getProducts(hubId: number, categoryId: number) {
    return callApi<ProductResponse[]>(
      apiClient.get<ApiResponse<ProductResponse[]>>(
        `shared/get_products/${hubId}/${categoryId}`,
      ),
    )
  },

  addSupplier(body: AddSupplierRequest) {
    return callApi<SupplierResponse>(
      apiClient.post<ApiResponse<SupplierResponse>>('shared/add_supplier', body),
    )
  },
  getSuppliers() {
    return callApi<SupplierResponse[]>(
      apiClient.get<ApiResponse<SupplierResponse[]>>('shared/get_suppliers'),
    )
  },

  addInventory(body: AddInventoryRequest) {
    return callApi<unknown>(
      apiClient.post<ApiResponse<unknown>>('shared/add_inventory', body),
    )
  },

  uploadImage(type: string, refId: number, file: File) {
    const form = new FormData()
    form.append('type', type)
    form.append('ref_id', String(refId))
    form.append('file', file)
    return callApi<unknown>(
      apiClient.post<ApiResponse<unknown>>('shared/upload_image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    )
  },
}

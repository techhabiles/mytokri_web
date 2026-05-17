import { apiClient, callApi } from "./apiClient";
import type {
  AddDeliveryPersonRequest,
  AddInventoryRequest,
  AddProductRequest,
  AddSupplierRequest,
  ApiResponse,
  CategoryResponse,
  DeliveryPersonResponse,
  InventoryItem,
  ProductResponse,
  SupplierResponse,
} from "../types/models";

export const sharedApi = {
  getCategories() {
    return callApi<CategoryResponse[]>(
      apiClient.get<ApiResponse<CategoryResponse[]>>("shared/get_categories"),
    );
  },

  addProduct(body: AddProductRequest) {
    return callApi<ProductResponse>(
      apiClient.post<ApiResponse<ProductResponse>>("shared/add_product", body),
    );
  },
  getProducts(hubId: number, categoryId: number) {
    return callApi<ProductResponse[]>(
      apiClient.get<ApiResponse<ProductResponse[]>>(
        `shared/get_products/${hubId}/${categoryId}`,
      ),
    );
  },

  addSupplier(body: AddSupplierRequest) {
    return callApi<SupplierResponse>(
      apiClient.post<ApiResponse<SupplierResponse>>(
        "shared/add_supplier",
        body,
      ),
    );
  },
  getSuppliers() {
    return callApi<SupplierResponse[]>(
      apiClient.get<ApiResponse<SupplierResponse[]>>("shared/get_suppliers"),
    );
  },

  getInventoryList(hubId: number) {
    return callApi<InventoryItem[]>(
      apiClient.get<ApiResponse<InventoryItem[]>>(
        `shared/inventory_list/${hubId}`,
      ),
    );
  },

  addInventory(body: AddInventoryRequest) {
    return callApi<unknown>(
      apiClient.post<ApiResponse<unknown>>("shared/add_inventory", body),
    );
  },

  addDeliveryPerson(body: AddDeliveryPersonRequest) {
    return callApi<unknown>(
      apiClient.post<ApiResponse<unknown>>("shared/add_delivery_person", body),
    );
  },
  getDeliveryPersons() {
    return callApi<DeliveryPersonResponse[]>(
      apiClient.get<ApiResponse<DeliveryPersonResponse[]>>("shared/get_delivery_persons"),
    );
  },

  assignDeliveryLocation(locationId: number, deliveryPersonId: number) {
    return callApi<unknown>(
      apiClient.post<ApiResponse<unknown>>(
        `shared/assign_delivery_location/${locationId}/${deliveryPersonId}`,
      ),
    );
  },

  removeDeliveryLocation(locationId: number, deliveryPersonId: number) {
    return callApi<unknown>(
      apiClient.post<ApiResponse<unknown>>(
        `shared/remove_delivery_location/${locationId}/${deliveryPersonId}`,
      ),
    );
  },

  assignDeliveryPerson(orderIds: number[], deliveryPersonId: number) {
    return callApi<unknown>(
      apiClient.post<ApiResponse<unknown>>('shared/assign_dp', {
        order_ids: orderIds,
        delivery_person_id: deliveryPersonId,
      }),
    );
  },

  updateOrderStatus(orderId: number, status: number) {
    return callApi<unknown>(
      apiClient.post<ApiResponse<unknown>>("shared/update_order_status", {
        order_id: orderId,
        status,
      }),
    );
  },

  uploadImage(type: string, refId: number, file: File) {
    const form = new FormData();
    form.append("type", type);
    form.append("ref_id", String(refId));
    form.append("image", file);
    return callApi<unknown>(
      apiClient.post<ApiResponse<unknown>>("shared/upload_image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
  },
};

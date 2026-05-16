// ===== Generic API Response =====
export interface ApiResponse<T> {
  status: number
  error_status?: number | null
  error_message?: string
  data?: T | null
}

// ===== Auth =====
export interface GenerateOtpRequest {
  phone: string
  uuid: string
}

export interface VerifyOtpRequest {
  phone: string
  otp: string // SHA-256 hashed
  uuid: string
}

export interface LoginResponse {
  role: number
  token: string
  user_name: string
  support_number: string
  hub_id?: number | null
  hub_name?: string | null
}

export interface PlainOtpRequest {
  phone: string
}

// ===== Hub =====
export interface AddHubRequest {
  name: string
  address: string
  phone: string
  email?: string | null
}

export interface HubResponse {
  id?: number
  name: string
  address: string
  phone: string
  email?: string | null
}

export interface HubListItem {
  id: number
  name: string
}

// ===== Location =====
export interface AddLocationRequest {
  hub_id: number
  name: string
  pin: string
  is_village: boolean
}

export interface LocationResponse {
  id?: number
  name: string
  pin: string
  is_village: boolean
  hub_id?: number
  hub_name?: string | null
}

// ===== Category =====
export interface AddCategoryRequest {
  name: string
}

export interface CategoryResponse {
  id?: number
  name: string
  image?: string | null
}

// ===== Hub Manager =====
export interface AddHubManagerRequest {
  hub_id: number
  name: string
  phone: string
}

export interface HubManagerResponse {
  id?: number
  name: string
  phone: string
  hub_name?: string | null
}

// ===== Coupon =====
export interface AddCouponRequest {
  hub_id: number
  code: string
  amount: number
  min_order_value: number
  description: string
}

export interface CouponResponse {
  id?: number
  code: string
  amount: number
  min_order_value: number
  description?: string | null
  hub_id?: number
  hub_name?: string | null
  is_locked?: boolean
}

// ===== Product =====
export interface AddProductRequest {
  hub_id: number
  category_id: number
  name: string
  description: string
  mrp: number
  sp: number
  tags?: string | null
  quantity_tag?: string | null
}

export interface ProductResponse {
  id?: number
  name: string
  description?: string | null
  mrp: number
  sp: number
  image?: string | null
  tags?: string | null
  quantity_tag?: string | null
  category_name?: string | null
}

// ===== Supplier =====
export interface AddSupplierRequest {
  name: string
  phone: string
  description: string
  email?: string | null
}

export interface SupplierResponse {
  id?: number
  name: string
  phone: string
  description?: string | null
  email?: string | null
}

// ===== Delivery Person =====
export interface AddDeliveryPersonRequest {
  name: string
  phone: string
  location_ids: number[]
}

export interface DeliveryPersonResponse {
  id?: number | null
  name: string
  phone: string
  locations?: number[]
}

// ===== Inventory =====
export interface InventoryItem {
  id?: number
  product_id?: number | null
  name?: string
  quantity?: number
  image?: string | null
  category_id?: number | null
  quantity_tag?: string | null
}

export interface AddInventoryRequest {
  hub_id: number
  product_id: number
  supplier_id?: number | null
  quantity: number
  description?: string | null
}

// ===== Delivery Locations =====
export interface DeliveryLocation {
  id: number
  name: string
}

// ===== Orders =====
export interface OrderItem {
  product_name?: string | null
  image?: string | null
  mrp?: number | null
  sp?: number | null
  quantity?: number | null
  quantity_tag?: string | null
}

export interface Order {
  id?: number | null
  date?: string | null
  status?: number | null
  coupon_amount?: number | null
  coupon_code?: string | null
  otp?: number | null
  delivery_time?: string | null
  location_id?: number | null
  user_name?: string | null
  co_name?: string | null
  address?: string | null
  phone?: string | null
  items?: OrderItem[]
}

export interface OrderListResponse {
  total_pages?: number | null
  items?: Order[]
}

// ===== Session =====
export interface SessionData {
  token: string
  role: number
  userName: string
  supportNumber: string
  hubId?: number | null
  hubName?: string | null
}

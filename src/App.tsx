import { Routes, Route, Navigate } from 'react-router-dom'
import LoadingOverlay from './components/LoadingOverlay'
import DialogHost from './components/DialogHost'
import UnauthorisedHandler from './components/UnauthorisedHandler'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import { ROLE_ADMIN, ROLE_HUB_MANAGER } from './utils/constants'

import SplashPage from './pages/auth/SplashPage'
import LoginPage from './pages/auth/LoginPage'
import VerifyOtpPage from './pages/auth/VerifyOtpPage'

import AdminHome from './pages/admin/AdminHome'
import HubList from './pages/admin/HubList'
import AddHub from './pages/admin/AddHub'
import LocationList from './pages/admin/LocationList'
import AddLocation from './pages/admin/AddLocation'
import CategoryList from './pages/admin/CategoryList'
import AddCategory from './pages/admin/AddCategory'
import HubManagerList from './pages/admin/HubManagerList'
import AddHubManager from './pages/admin/AddHubManager'
import AssignHubManager from './pages/admin/AssignHubManager'
import GetUserOtp from './pages/admin/GetUserOtp'
import UploadImage from './pages/admin/UploadImage'
import CouponList from './pages/admin/CouponList'
import AddCoupon from './pages/admin/AddCoupon'
import AdminInventoryList from './pages/admin/InventoryList'

import ProductList from './pages/shared/ProductList'
import AddProduct from './pages/shared/AddProduct'
import SupplierList from './pages/shared/SupplierList'
import AddSupplier from './pages/shared/AddSupplier'

import HubManagerHome from './pages/hubmanager/HubManagerHome'
import InventoryList from './pages/hubmanager/InventoryList'
import AddInventory from './pages/hubmanager/AddInventory'
import OrderList from './pages/hubmanager/OrderList'

const ADMIN_OR_HM = [ROLE_ADMIN, ROLE_HUB_MANAGER]

export default function App() {
  return (
    <>
      <UnauthorisedHandler />

      <Routes>
        {/* Public */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />

        {/* Authenticated shell — sidebar + content */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><AdminHome /></ProtectedRoute>} />
          <Route path="/admin/hubs" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><HubList /></ProtectedRoute>} />
          <Route path="/admin/hubs/add" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><AddHub /></ProtectedRoute>} />
          <Route path="/admin/locations" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><LocationList /></ProtectedRoute>} />
          <Route path="/admin/locations/add" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><AddLocation /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><CategoryList /></ProtectedRoute>} />
          <Route path="/admin/categories/add" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><AddCategory /></ProtectedRoute>} />
          <Route path="/admin/hub-managers" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><HubManagerList /></ProtectedRoute>} />
          <Route path="/admin/hub-managers/add" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><AddHubManager /></ProtectedRoute>} />
          <Route path="/admin/hub-managers/assign" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><AssignHubManager /></ProtectedRoute>} />
          <Route path="/admin/get-user-otp" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><GetUserOtp /></ProtectedRoute>} />
          <Route path="/admin/upload-image" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><UploadImage /></ProtectedRoute>} />
          <Route path="/admin/coupons" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><CouponList /></ProtectedRoute>} />
          <Route path="/admin/coupons/add" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><AddCoupon /></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]}><AdminInventoryList /></ProtectedRoute>} />

          {/* Shared (Admin + Hub Manager) */}
          <Route path="/products" element={<ProtectedRoute allowedRoles={ADMIN_OR_HM}><ProductList /></ProtectedRoute>} />
          <Route path="/products/add" element={<ProtectedRoute allowedRoles={ADMIN_OR_HM}><AddProduct /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute allowedRoles={ADMIN_OR_HM}><SupplierList /></ProtectedRoute>} />
          <Route path="/suppliers/add" element={<ProtectedRoute allowedRoles={ADMIN_OR_HM}><AddSupplier /></ProtectedRoute>} />

          {/* Hub Manager */}
          <Route path="/hub-manager" element={<ProtectedRoute allowedRoles={[ROLE_HUB_MANAGER]}><HubManagerHome /></ProtectedRoute>} />
          <Route path="/hub-manager/inventory" element={<ProtectedRoute allowedRoles={[ROLE_HUB_MANAGER]}><InventoryList /></ProtectedRoute>} />
          <Route path="/hub-manager/inventory/add" element={<ProtectedRoute allowedRoles={[ROLE_HUB_MANAGER]}><AddInventory /></ProtectedRoute>} />
          <Route path="/hub-manager/orders" element={<ProtectedRoute allowedRoles={[ROLE_HUB_MANAGER]}><OrderList /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <DialogHost />
      <LoadingOverlay />
    </>
  )
}

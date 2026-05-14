import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Menu,
  LogOut,
  Building2,
  MapPin,
  Layers,
  UserCog,
  Package,
  Boxes,
  Image as ImageIcon,
  KeySquare,
  ListChecks,
  UserPlus,
  Link as LinkIcon,
  PackagePlus,
  PlusSquare,
  Ticket,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLogout } from '../hooks/useLogout'
import { useSession } from '../context/SessionContext'
import { ROLE_ADMIN, ROLE_HUB_MANAGER } from '../utils/constants'

interface NavItem {
  label: string
  icon: LucideIcon
  to: string
}

interface NavSection {
  heading?: string
  items: NavItem[]
}

const ADMIN_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Get User OTP', icon: KeySquare, to: '/admin/get-user-otp' },
      { label: 'Upload Image', icon: ImageIcon, to: '/admin/upload-image' },
    ],
  },
  {
    heading: 'Hubs',
    items: [
      { label: 'Hub List', icon: Building2, to: '/admin/hubs' },
      { label: 'Add Hub', icon: PlusSquare, to: '/admin/hubs/add' },
    ],
  },
  {
    heading: 'Locations',
    items: [
      { label: 'Location List', icon: MapPin, to: '/admin/locations' },
      { label: 'Add Location', icon: PlusSquare, to: '/admin/locations/add' },
    ],
  },
  {
    heading: 'Categories',
    items: [
      { label: 'Category List', icon: Layers, to: '/admin/categories' },
      { label: 'Add Category', icon: PlusSquare, to: '/admin/categories/add' },
    ],
  },
  {
    heading: 'Hub Managers',
    items: [
      { label: 'Hub Manager List', icon: UserCog, to: '/admin/hub-managers' },
      { label: 'Add Hub Manager', icon: UserPlus, to: '/admin/hub-managers/add' },
      { label: 'Assign Hub Manager', icon: LinkIcon, to: '/admin/hub-managers/assign' },
    ],
  },
  {
    heading: 'Products',
    items: [
      { label: 'Product List', icon: Package, to: '/products' },
      { label: 'Add Product', icon: PackagePlus, to: '/products/add' },
    ],
  },
  {
    heading: 'Suppliers',
    items: [
      { label: 'Supplier List', icon: Boxes, to: '/suppliers' },
      { label: 'Add Supplier', icon: UserPlus, to: '/suppliers/add' },
    ],
  },
  {
    heading: 'Coupons',
    items: [
      { label: 'Coupon List', icon: Ticket, to: '/admin/coupons' },
      { label: 'Add Coupon', icon: PlusSquare, to: '/admin/coupons/add' },
    ],
  },
]

const HUB_MANAGER_SECTIONS: NavSection[] = [
  {
    heading: 'Products',
    items: [
      { label: 'Product List', icon: Package, to: '/products' },
      { label: 'Add Product', icon: PackagePlus, to: '/products/add' },
    ],
  },
  {
    heading: 'Suppliers',
    items: [
      { label: 'Supplier List', icon: Boxes, to: '/suppliers' },
      { label: 'Add Supplier', icon: UserPlus, to: '/suppliers/add' },
    ],
  },
  {
    heading: 'Inventory',
    items: [
      { label: 'Inventory List', icon: Boxes, to: '/hub-manager/inventory' },
      { label: 'Add Inventory', icon: PlusSquare, to: '/hub-manager/inventory/add' },
    ],
  },
  {
    heading: 'Orders',
    items: [
      { label: 'Order List', icon: ListChecks, to: '/hub-manager/orders' },
    ],
  },
]

function getSections(role: number | undefined): NavSection[] {
  if (role === ROLE_ADMIN) return ADMIN_SECTIONS
  if (role === ROLE_HUB_MANAGER) return HUB_MANAGER_SECTIONS
  return []
}

function getRoleLabel(role: number | undefined): string {
  if (role === ROLE_ADMIN) return 'Admin'
  if (role === ROLE_HUB_MANAGER) return 'Hub Manager'
  return ''
}

export default function AppShell() {
  const [open, setOpen] = useState(false)
  const { confirmLogout } = useLogout()
  const { session } = useSession()

  const sections = getSections(session?.role)
  const roleLabel = getRoleLabel(session?.role)

  const sidebar = (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-30
        w-56 flex flex-col bg-navy text-white flex-shrink-0
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}
    >
      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
        <p className="text-base font-bold">My Tokri</p>
        <p className="text-xs text-white/60 mt-0.5">{roleLabel}</p>
        <p className="text-sm text-white/80 font-medium mt-1 truncate">
          {session?.userName || '—'}
        </p>
        {session?.hubName && (
          <p className="text-xs text-white/50 truncate">{session.hubName}</p>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map((section, i) => (
          <div key={i} className={i > 0 ? 'mt-1' : ''}>
            {section.heading && (
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {section.heading}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon size={16} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 flex-shrink-0">
        {session?.supportNumber && (
          <p className="text-xs text-white/40 mb-2">Support: {session.supportNumber}</p>
        )}
        <button
          onClick={confirmLogout}
          className="flex items-center gap-2 text-sm text-white/75 hover:text-white hover:bg-white/10 w-full px-2 py-1.5 rounded transition-colors"
        >
          <LogOut size={15} />
          Log Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {sidebar}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-navy text-white flex-shrink-0 shadow">
          <button
            onClick={() => setOpen(true)}
            className="p-1 rounded hover:bg-white/10"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="text-base font-semibold">My Tokri</span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

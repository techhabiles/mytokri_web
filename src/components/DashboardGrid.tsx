import { useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

export interface DashboardItem {
  label: string
  icon: LucideIcon
  to: string
}

export default function DashboardGrid({ items }: { items: DashboardItem[] }) {
  const navigate = useNavigate()
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {items.map((item) => (
        <button
          key={item.to}
          onClick={() => navigate(item.to)}
          className="card flex flex-col items-center justify-center text-center p-5 hover:shadow-md hover:border-navy transition group"
        >
          <div className="bg-navy-container text-navy-on rounded-full p-3 mb-3 group-hover:bg-navy group-hover:text-white transition">
            <item.icon size={28} />
          </div>
          <span className="text-sm font-medium text-gray-800">{item.label}</span>
        </button>
      ))}
    </div>
  )
}

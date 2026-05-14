import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface ToolbarProps {
  title: string
  onBack?: () => void
  showBack?: boolean
  action?: ReactNode
}

export default function Toolbar({
  title,
  onBack,
  showBack = false,
  action,
}: ToolbarProps) {
  const navigate = useNavigate()
  return (
    <div className="toolbar sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => (onBack ? onBack() : navigate(-1))}
            className="p-1 rounded hover:bg-white/10"
            aria-label="Back"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {action}
    </div>
  )
}

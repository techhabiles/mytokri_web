import { useDialog } from '../context/DialogContext'

export default function LoadingOverlay() {
  const { loading } = useDialog()
  if (!loading) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg px-6 py-5 shadow-lg flex items-center gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        <span className="text-gray-700 font-medium">Loading...</span>
      </div>
    </div>
  )
}

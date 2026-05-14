import { Inbox } from 'lucide-react'

export default function EmptyState({ message = 'No items found' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <Inbox size={48} className="mb-3 opacity-40" />
      <p>{message}</p>
    </div>
  )
}

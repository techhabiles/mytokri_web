import { useSession } from '../../context/SessionContext'

export default function AdminHome() {
  const { session } = useSession()

  return (
    <div className="p-6">
      <div className="card p-6 max-w-lg mx-auto">
        <h2 className="text-xl font-semibold text-navy">
          Welcome, {session?.userName || 'Admin'}
        </h2>
        <p className="text-gray-500 mt-2">
          Select a section from the menu on the left to get started.
        </p>
        {session?.supportNumber && (
          <p className="text-sm text-gray-400 mt-4">Support: {session.supportNumber}</p>
        )}
      </div>
    </div>
  )
}

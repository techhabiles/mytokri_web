import Toolbar from '../../components/Toolbar'
import EmptyState from '../../components/EmptyState'

export default function InventoryList() {
  return (
    <div className="min-h-screen">
      <Toolbar title="Inventory" />
      <EmptyState message="Inventory listing coming soon" />
    </div>
  )
}

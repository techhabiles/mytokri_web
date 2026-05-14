import Toolbar from '../../components/Toolbar'
import EmptyState from '../../components/EmptyState'

export default function OrderList() {
  return (
    <div className="min-h-screen">
      <Toolbar title="Orders" />
      <EmptyState message="Order listing coming soon" />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toolbar from '../../components/Toolbar'
import { InputField, SelectField, TextareaField } from '../../components/FormField'
import { sharedApi } from '../../api/sharedApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'
import { useSession } from '../../context/SessionContext'
import { isPositiveNumber } from '../../utils/validators'
import type {
  CategoryResponse,
  ProductResponse,
  SupplierResponse,
} from '../../types/models'

export default function AddInventory() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const { showSuccess } = useDialog()
  const { session } = useSession()
  const hubId = session?.hubId

  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [productId, setProductId] = useState('')
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    ;(async () => {
      const [c, s] = await Promise.all([
        run(() => sharedApi.getCategories()),
        run(() => sharedApi.getSuppliers()),
      ])
      if (c) setCategories(c)
      if (s) setSuppliers(s)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hubId || !categoryId) {
      setProducts([])
      return
    }
    ;(async () => {
      const data = await run(() => sharedApi.getProducts(Number(hubId), Number(categoryId)))
      if (data) setProducts(data)
      setProductId('')
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hubId, categoryId])

  function validate() {
    const next: Record<string, string> = {}
    if (!productId) next.productId = 'Please select a product'
    if (!isPositiveNumber(quantity)) next.quantity = 'Enter a valid quantity'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return

    const result = await run(() =>
      sharedApi.addInventory({
        hub_id: Number(hubId),
        product_id: Number(productId),
        supplier_id: supplierId ? Number(supplierId) : null,
        quantity: parseFloat(quantity),
        description: description.trim() || null,
      }),
    )
    if (result !== null) {
      showSuccess('Inventory Added', 'Inventory recorded successfully', () => navigate('/hub-manager/inventory'))
    }
  }

  if (!hubId) {
    return (
      <div className="min-h-screen">
        <Toolbar title="Add Inventory" />
        <div className="p-6">
          <div className="card p-5 max-w-md mx-auto border-danger bg-danger-bg">
            <p className="font-semibold text-danger">No hub assigned</p>
            <p className="text-sm text-gray-600 mt-1">
              Hi {session?.userName}, your account is not linked to any hub yet. Please contact the admin.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Add Inventory" />
      <div className="p-4 max-w-xl mx-auto">
        <div className="card p-5 space-y-4">
          <SelectField
            label="Category"
            value={categoryId}
            onChange={setCategoryId}
            options={categories
              .filter((c) => c.id != null)
              .map((c) => ({ value: c.id!, label: c.name }))}
            placeholder="Select Category"
          />
          <SelectField
            label="Product"
            value={productId}
            onChange={setProductId}
            options={products
              .filter((p) => p.id != null)
              .map((p) => ({ value: p.id!, label: p.name }))}
            placeholder="Select Product"
            error={errors.productId}
            disabled={!categoryId}
          />
          <SelectField
            label="Supplier (Optional)"
            value={supplierId}
            onChange={setSupplierId}
            options={suppliers
              .filter((s) => s.id != null)
              .map((s) => ({ value: s.id!, label: s.name }))}
            placeholder="Select Supplier"
          />
          <InputField
            label="Quantity"
            inputMode="decimal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            error={errors.quantity}
            placeholder="0"
          />
          <TextareaField
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes"
          />
          <button className="btn-primary w-full" onClick={handleSubmit}>
            Add Inventory
          </button>
        </div>
      </div>
    </div>
  )
}

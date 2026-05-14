import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toolbar from '../../components/Toolbar'
import { InputField, SelectField, TextareaField } from '../../components/FormField'
import { adminApi } from '../../api/adminApi'
import { sharedApi } from '../../api/sharedApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'
import { useSession } from '../../context/SessionContext'
import { ROLE_HUB_MANAGER } from '../../utils/constants'
import { isPositiveNumber } from '../../utils/validators'
import type { CategoryResponse, HubListItem } from '../../types/models'

export default function AddProduct() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const { showSuccess } = useDialog()
  const { session } = useSession()
  const isHubManager = session?.role === ROLE_HUB_MANAGER

  const [hubs, setHubs] = useState<HubListItem[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [hubId, setHubId] = useState<string>(
    isHubManager && session?.hubId ? String(session.hubId) : '',
  )
  const [categoryId, setCategoryId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [quantityTag, setQuantityTag] = useState('')
  const [mrp, setMrp] = useState('')
  const [sp, setSp] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    ;(async () => {
      const cats = await run(() => sharedApi.getCategories())
      if (cats) setCategories(cats)
      if (!isHubManager) {
        const h = await run(() => adminApi.getHubsList())
        if (h) setHubs(h)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function validate() {
    const next: Record<string, string> = {}
    if (!hubId) next.hubId = 'Please select a hub'
    if (!categoryId) next.categoryId = 'Please select a category'
    if (!name.trim()) next.name = 'Product name is required'
    if (!isPositiveNumber(mrp)) next.mrp = 'Enter a valid MRP'
    if (!isPositiveNumber(sp)) next.sp = 'Enter a valid SP'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    const result = await run(() =>
      sharedApi.addProduct({
        hub_id: Number(hubId),
        category_id: Number(categoryId),
        name: name.trim(),
        description: description.trim(),
        mrp: parseFloat(mrp),
        sp: parseFloat(sp),
        tags: tags.trim() || null,
        quantity_tag: quantityTag.trim() || null,
      }),
    )
    if (result) showSuccess('Product Added', 'Product created successfully', () => navigate('/products'))
  }

  if (isHubManager && !session?.hubId) {
    return (
      <div className="min-h-screen">
        <Toolbar title="Add Product" />
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
      <Toolbar title="Add Product" />
      <div className="p-4 max-w-xl mx-auto">
        <div className="card p-5 space-y-4">
          {!isHubManager && (
            <SelectField
              label="Hub"
              value={hubId}
              onChange={setHubId}
              options={hubs.map((h) => ({ value: h.id, label: h.name }))}
              placeholder="Select Hub"
              error={errors.hubId}
            />
          )}
          <SelectField
            label="Category"
            value={categoryId}
            onChange={setCategoryId}
            options={categories
              .filter((c) => c.id != null)
              .map((c) => ({ value: c.id!, label: c.name }))}
            placeholder="Select Category"
            error={errors.categoryId}
          />
          <InputField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Product name"
          />
          <TextareaField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          <InputField
            label="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="comma,separated,tags"
          />
          <InputField
            label="Quantity Tag (e.g. 1 kg, 500 ml)"
            value={quantityTag}
            onChange={(e) => setQuantityTag(e.target.value)}
            placeholder="1 kg"
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="MRP (₹)"
              inputMode="decimal"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              error={errors.mrp}
              placeholder="0.00"
            />
            <InputField
              label="SP (₹)"
              inputMode="decimal"
              value={sp}
              onChange={(e) => setSp(e.target.value)}
              error={errors.sp}
              placeholder="0.00"
            />
          </div>
          <button className="btn-primary w-full" onClick={handleSubmit}>
            Add Product
          </button>
        </div>
      </div>
    </div>
  )
}

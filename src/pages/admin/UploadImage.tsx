import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toolbar from '../../components/Toolbar'
import { SelectField } from '../../components/FormField'
import { sharedApi } from '../../api/sharedApi'
import { adminApi } from '../../api/adminApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'
import type {
  CategoryResponse,
  HubListItem,
  ProductResponse,
} from '../../types/models'
import { ImageIcon } from 'lucide-react'

type RefType = 'product' | 'category' | 'payment_qr'

export default function UploadImage() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const { showSuccess, showError } = useDialog()

  const [type, setType] = useState<RefType>('product')

  // for products: need a hub + category to load list
  const [hubs, setHubs] = useState<HubListItem[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [hubId, setHubId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [refId, setRefId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const [h, c] = await Promise.all([
        run(() => adminApi.getHubsList()),
        run(() => sharedApi.getCategories()),
      ])
      if (h) setHubs(h)
      if (c) setCategories(c)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (type === 'product' && hubId && categoryId) {
      ;(async () => {
        const data = await run(() => sharedApi.getProducts(Number(hubId), Number(categoryId)))
        if (data) setProducts(data)
      })()
    } else {
      setProducts([])
    }
    setRefId('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hubId, categoryId, type])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    if (f) setPreview(URL.createObjectURL(f))
    else setPreview(null)
  }

  async function handleUpload() {
    if (!file) {
      showError('Validation', 'Please select an image first')
      return
    }
    let id: number
    if (type === 'product') {
      if (!refId) {
        showError('Validation', 'Please select a product')
        return
      }
      id = Number(refId)
    } else if (type === 'category') {
      if (!refId) {
        showError('Validation', 'Please select a category')
        return
      }
      id = Number(refId)
    } else {
      id = 0 // payment_qr
    }

    const result = await run(() => sharedApi.uploadImage(type, id, file))
    if (result !== null) {
      showSuccess('Uploaded', 'Image uploaded successfully', () => navigate('/admin'))
    }
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Upload Image" />
      <div className="p-4 max-w-xl mx-auto">
        <div className="card p-5 space-y-4">
          <div>
            <label className="label">Image Type</label>
            <div className="flex gap-2 flex-wrap">
              {(['product', 'category', 'payment_qr'] as RefType[]).map((t) => (
                <label
                  key={t}
                  className={`px-3 py-2 rounded-md border cursor-pointer ${
                    type === t ? 'border-navy bg-navy-container/40' : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                    className="hidden"
                  />
                  <span className="capitalize">{t.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {type === 'product' && (
            <>
              <SelectField
                label="Hub"
                value={hubId}
                onChange={setHubId}
                options={hubs.map((h) => ({ value: h.id, label: h.name }))}
                placeholder="Select Hub"
              />
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
                value={refId}
                onChange={setRefId}
                options={products
                  .filter((p) => p.id != null)
                  .map((p) => ({ value: p.id!, label: p.name }))}
                placeholder="Select Product"
              />
            </>
          )}

          {type === 'category' && (
            <SelectField
              label="Category"
              value={refId}
              onChange={setRefId}
              options={categories
                .filter((c) => c.id != null)
                .map((c) => ({ value: c.id!, label: c.name }))}
              placeholder="Select Category"
            />
          )}

          <div>
            <label className="label">Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="input"
            />
          </div>

          {preview ? (
            <img src={preview} alt="preview" className="w-full max-h-64 object-contain rounded" />
          ) : (
            <div className="border border-dashed border-gray-300 rounded-md p-8 flex flex-col items-center text-gray-400">
              <ImageIcon size={36} />
              <span className="mt-2 text-sm">Choose an image to preview</span>
            </div>
          )}

          <button className="btn-primary w-full" onClick={handleUpload}>
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toolbar from '../../components/Toolbar'
import { InputField } from '../../components/FormField'
import { adminApi } from '../../api/adminApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'

export default function AddCategory() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const { showSuccess } = useDialog()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Category name is required')
      return
    }
    setError('')
    const result = await run(() => adminApi.addCategory({ name: name.trim() }))
    if (result !== null) {
      showSuccess('Category Added', 'Category created successfully', () =>
        navigate('/admin/categories'),
      )
    }
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Add Category" />
      <div className="p-4 max-w-xl mx-auto">
        <div className="card p-5 space-y-4">
          <InputField
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
            placeholder="e.g. Vegetables"
          />
          <button className="btn-primary w-full" onClick={handleSubmit}>
            Add Category
          </button>
        </div>
      </div>
    </div>
  )
}

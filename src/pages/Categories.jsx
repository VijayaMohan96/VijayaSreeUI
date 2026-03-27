import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await api.get('/categories')
      setCategories(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      flash(e.message, 'err')
    } finally { setLoading(false) }
  }

  const flash = (text, type = 'ok') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 3000)
  }

  const handleCreate = async () => {
    if (!name.trim()) return flash('Category name is required', 'err')
    setSaving(true)
    try {
      await api.post('/categories', { name: name.trim() })
      setName('')
      flash('Category created!')
      fetchAll()
    } catch (e) { flash(e.message, 'err') }
    finally { setSaving(false) }
  }

  const handleUpdate = async (id) => {
    if (!editName.trim()) return flash('Name is required', 'err')
    try {
      await api.put(`/categories/${id}`, { name: editName.trim() })
      setEditId(null)
      flash('Category updated!')
      fetchAll()
    } catch (e) { flash(e.message, 'err') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await api.delete(`/categories/${id}`)
      flash('Category deleted')
      fetchAll()
    } catch (e) { flash(e.message, 'err') }
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <h1 className="page-title" style={{ marginBottom: '20px' }}>🗂️ Categories</h1>

      {msg.text && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px',
          background: msg.type === 'err' ? 'var(--danger-pale)' : 'var(--green-pale)',
          color: msg.type === 'err' ? 'var(--danger)' : 'var(--green-dark)',
          border: `1px solid ${msg.type === 'err' ? '#f5c6c3' : '#b8ddb8'}`
        }}>{msg.text}</div>
      )}

      {/* Add form */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <label className="form-label">Add New Category</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            placeholder="e.g. Pesticides, Seeds, Fertilizers..."
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <button className="btn-primary" onClick={handleCreate} disabled={saving}
            style={{ whiteSpace: 'nowrap' }}>
            {saving ? 'Adding...' : '+ Add'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🗂️</div>
            <div style={{ fontWeight: '600', color: 'var(--gray-600)', marginBottom: '4px' }}>
              No categories yet
            </div>
            <div style={{ fontSize: '13px' }}>
              Add your first category above — e.g. Pesticides, Seeds, Fertilizers
            </div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id}>
                  <td style={{ color: 'var(--gray-400)', width: '40px' }}>{i + 1}</td>
                  <td>
                    {editId === cat.id ? (
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                        autoFocus
                        style={{ width: '200px' }}
                      />
                    ) : (
                      <span style={{ fontWeight: '500' }}>{cat.name}</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--gray-400)', fontSize: '12px' }}>
                    {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {editId === cat.id ? (
                        <>
                          <button className="btn-primary btn-sm" onClick={() => handleUpdate(cat.id)}>Save</button>
                          <button className="btn-secondary btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="btn-secondary btn-sm"
                            onClick={() => { setEditId(cat.id); setEditName(cat.name) }}>
                            Edit
                          </button>
                          <button className="btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
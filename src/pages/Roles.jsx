import { useEffect, useState } from 'react'
import api from '../api/axios'

const ALL_PERMISSIONS = {
  'Products': ['PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_EDIT', 'PRODUCT_DELETE', 'PRODUCT_IMPORT', 'PRODUCT_IMAGE_UPLOAD'],
  'Stock': ['STOCK_VIEW', 'STOCK_ADJUST', 'STOCK_HISTORY', 'STOCK_PURCHASE'],
  'Sales': ['SALES_CHECKOUT', 'SALES_APPLY_DISCOUNT'],
  'Reports': ['REPORTS_DAILY', 'REPORTS_TRANSACTIONS'],
  'Users': ['USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'USER_DEACTIVATE', 'USER_GRANT_PERMISSION'],
}

const PERM_LABELS = {
  PRODUCT_VIEW: 'View products',
  PRODUCT_CREATE: 'Add products',
  PRODUCT_EDIT: 'Edit products',
  PRODUCT_DELETE: 'Delete products',
  PRODUCT_IMPORT: 'Import from Excel',
  PRODUCT_IMAGE_UPLOAD: 'Upload images',
  STOCK_VIEW: 'View stock',
  STOCK_ADJUST: 'Adjust stock',
  STOCK_HISTORY: 'Stock history',
  STOCK_PURCHASE: 'Record purchase',
  SALES_CHECKOUT: 'Process checkout',
  SALES_APPLY_DISCOUNT: 'Apply discount',
  REPORTS_DAILY: 'Daily reports',
  REPORTS_TRANSACTIONS: 'Transaction log',
  USER_VIEW: 'View users',
  USER_CREATE: 'Create users',
  USER_EDIT: 'Edit users',
  USER_DEACTIVATE: 'Deactivate users',
  USER_GRANT_PERMISSION: 'Manage permissions',
}

const empty = { name: '', description: '', permissions: [] }

export default function Roles() {
  const [roles, setRoles] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  useEffect(() => { fetchRoles() }, [])

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const res = await api.get('/roles')
      setRoles(res.data || [])
    } catch {}
    finally { setLoading(false) }
  }

  const flash = (text, type = 'ok') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 3000)
  }

  const togglePerm = (perm) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }))
  }

  const toggleGroup = (group) => {
    const groupPerms = ALL_PERMISSIONS[group]
    const allSelected = groupPerms.every(p => form.permissions.includes(p))
    setForm(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !groupPerms.includes(p))
        : [...new Set([...prev.permissions, ...groupPerms])]
    }))
  }

  const handleSubmit = async () => {
    if (!form.name) return flash('Role name is required', 'err')
    if (form.permissions.length === 0) return flash('Select at least one permission', 'err')
    setSaving(true)
    try {
      if (editId) {
        await api.put(`/roles/${editId}`, form)
        flash('Role updated successfully')
      } else {
        await api.post('/roles', form)
        flash('Role created successfully')
      }
      setForm(empty); setEditId(null); setShowForm(false)
      fetchRoles()
    } catch (e) { flash(e.message, 'err') }
    finally { setSaving(false) }
  }

  const handleEdit = (r) => {
    setForm({ name: r.name, description: r.description || '', permissions: r.permissions || [] })
    setEditId(r.id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete role "${r.name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/roles/${r.id}`)
      flash('Role deleted')
      fetchRoles()
    } catch (e) { flash(e.message, 'err') }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔐 Role Management</h1>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setForm(empty); setEditId(null) }}>
          {showForm ? 'Cancel' : '+ Create Role'}
        </button>
      </div>

      {msg.text && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px',
          background: msg.type === 'err' ? 'var(--danger-pale)' : 'var(--green-pale)',
          color: msg.type === 'err' ? 'var(--danger)' : 'var(--green-dark)',
          border: `1px solid ${msg.type === 'err' ? '#f5c6c3' : '#b8ddb8'}`
        }}>{msg.text}</div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>
            {editId ? 'Edit Role' : 'Create New Role'}
          </h3>
          <div className="grid-2" style={{ marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">Role Name *</label>
              <input placeholder="e.g. Senior Cashier" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input placeholder="What does this role do?" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
            Permissions * — {form.permissions.length} selected
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(ALL_PERMISSIONS).map(([group, perms]) => {
              const allSelected = perms.every(p => form.permissions.includes(p))
              const someSelected = perms.some(p => form.permissions.includes(p))
              return (
                <div key={group} style={{
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)', overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', background: 'var(--gray-100)',
                    borderBottom: '1px solid var(--gray-200)', cursor: 'pointer'
                  }} onClick={() => toggleGroup(group)}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '4px',
                      border: '2px solid var(--green-mid)',
                      background: allSelected ? 'var(--green-mid)' : someSelected ? 'var(--green-pale)' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {allSelected && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                      {someSelected && !allSelected && <span style={{ color: 'var(--green-mid)', fontSize: '12px' }}>−</span>}
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '13px' }}>{group}</span>
                    <span style={{ fontSize: '12px', color: 'var(--gray-400)', marginLeft: 'auto' }}>
                      {perms.filter(p => form.permissions.includes(p)).length}/{perms.length}
                    </span>
                  </div>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1px', background: 'var(--gray-200)'
                  }}>
                    {perms.map(perm => (
                      <div key={perm}
                        onClick={() => togglePerm(perm)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '10px 14px', cursor: 'pointer',
                          background: form.permissions.includes(perm) ? 'var(--green-pale)' : 'var(--white)',
                          transition: 'background 0.1s'
                        }}>
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                          border: '2px solid var(--green-mid)',
                          background: form.permissions.includes(perm) ? 'var(--green-mid)' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {form.permissions.includes(perm) && (
                            <span style={{ color: 'white', fontSize: '10px' }}>✓</span>
                          )}
                        </div>
                        <span style={{ fontSize: '13px' }}>{PERM_LABELS[perm]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editId ? 'Update Role' : 'Create Role'}
            </button>
            <button className="btn-secondary" onClick={() => { setShowForm(false); setForm(empty); setEditId(null) }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Roles list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>Loading roles...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {roles.map(r => (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>{r.name}</span>
                    {r.isSystem && <span className="badge badge-gold">System</span>}
                    <span className="badge badge-gray">{r.userCount} user{r.userCount !== 1 ? 's' : ''}</span>
                  </div>
                  {r.description && (
                    <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '10px' }}>
                      {r.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {Object.entries(ALL_PERMISSIONS).map(([group, perms]) => {
                      const count = perms.filter(p => r.permissions?.includes(p)).length
                      if (count === 0) return null
                      return (
                        <span key={group} style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                          background: 'var(--green-pale)', color: 'var(--green-dark)',
                          fontWeight: '500'
                        }}>
                          {group}: {count}/{perms.length}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button className="btn-secondary btn-sm" onClick={() => handleEdit(r)}>Edit</button>
                  {!r.isSystem && (
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(r)}>Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
import { useEffect, useState } from 'react'
import api from '../api/axios'

const empty = { name: '', username: '', password: '', roleId: '' }

export default function Users() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [selectedUser, setSelectedUser] = useState(null)
  const [userPerms, setUserPerms] = useState(null)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [u, r] = await Promise.all([api.get('/users'), api.get('/roles')])
      setUsers(u.data || [])
      setRoles(r.data || [])
    } catch {}
    finally { setLoading(false) }
  }

  const flash = (text, type = 'ok') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 3000)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.username || !form.roleId)
      return flash('Fill all required fields', 'err')
    if (!editId && !form.password)
      return flash('Password is required', 'err')
    setSaving(true)
    try {
      if (editId) {
        await api.put(`/users/${editId}`, form)
        flash('User updated')
      } else {
        await api.post('/users', form)
        flash('User created')
      }
      setForm(empty); setEditId(null); setShowForm(false)
      fetchAll()
    } catch (e) { flash(e.message, 'err') }
    finally { setSaving(false) }
  }

  const handleEdit = (u) => {
    setForm({ name: u.name, username: u.username, password: '', roleId: u.roleId })
    setEditId(u.id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleToggleActive = async (u) => {
    try {
      if (u.active) {
        await api.patch(`/users/${u.id}/deactivate`)
        flash(`${u.name} deactivated`)
      } else {
        await api.patch(`/users/${u.id}/activate`)
        flash(`${u.name} activated`)
      }
      fetchAll()
    } catch (e) { flash(e.message, 'err') }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name}?\n\nThis cannot be undone.`)) return
    try {
      await api.delete(`/users/${id}`)
      flash('User deleted permanently')
      fetchAll()
    } catch (e) { flash(e.message, 'err') }
  }

  const loadUserPerms = async (u) => {
    if (selectedUser?.id === u.id) {
      setSelectedUser(null); setUserPerms(null); return
    }
    setSelectedUser(u)
    try {
      const res = await api.get(`/permissions/user/${u.id}`)
      setUserPerms(res.data)
    } catch {}
  }

  const initials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const roleColors = ['#2d6a2d', '#c8a84b', '#3d2b1f', '#1a6b8a', '#8b3d3d', '#4a4a8a']

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👥 User Management</h1>
        <button className="btn-primary" onClick={() => {
          setShowForm(!showForm); setForm(empty); setEditId(null)
        }}>
          {showForm ? 'Cancel' : '+ Add User'}
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
            {editId ? 'Edit User' : 'Add New User'}
          </h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input placeholder="e.g. Ravi Kumar" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input placeholder="e.g. ravi.kumar" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">
                {editId ? 'New Password (leave blank to keep)' : 'Password *'}
              </label>
              <input type="password" placeholder="Enter password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select value={form.roleId}
                onChange={e => setForm({ ...form, roleId: e.target.value })}>
                <option value="">Select role</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editId ? 'Update User' : 'Create User'}
            </button>
            <button className="btn-secondary" onClick={() => {
              setShowForm(false); setForm(empty); setEditId(null)
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          border: '2px dashed var(--gray-200)',
          borderRadius: 'var(--radius-lg)', color: 'var(--gray-400)'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>👥</div>
          <div style={{ fontWeight: '600', color: 'var(--gray-600)', marginBottom: '6px' }}>
            No users yet
          </div>
          <div style={{ fontSize: '13px' }}>Add your first staff member above</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {users.map((u, i) => (
            <div key={u.id}>
              <div className="card" style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                opacity: u.active ? 1 : 0.6,
                borderLeft: `4px solid ${roleColors[i % roleColors.length]}`
              }}>
                {/* Avatar */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                  background: roleColors[i % roleColors.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '700', fontSize: '15px'
                }}>
                  {initials(u.name)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '8px', marginBottom: '3px'
                  }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                      {u.name}
                    </span>
                    {!u.active && (
                      <span className="badge badge-red">Inactive</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
                    @{u.username} &nbsp;·&nbsp;
                    <span style={{
                      color: 'var(--green-dark)', fontWeight: '500',
                      background: 'var(--green-pale)', padding: '1px 7px',
                      borderRadius: '10px', fontSize: '11px'
                    }}>{u.roleName}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => loadUserPerms(u)}>
                    {selectedUser?.id === u.id ? 'Hide Perms' : 'Permissions'}
                  </button>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => handleEdit(u)}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(u)}
                    className="btn-sm"
                    style={{
                      background: u.active ? 'var(--warning-pale)' : 'var(--green-pale)',
                      color: u.active ? 'var(--warning)' : 'var(--green-mid)',
                      border: `1px solid ${u.active ? '#f0c674' : '#b8ddb8'}`
                    }}>
                    {u.active ? 'Deactivate' : 'Activate'}
                  </button>
                  {!u.isSystem && (
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      className="btn-sm"
                      style={{
                        background: 'var(--danger-pale)',
                        color: 'var(--danger)',
                        border: '1px solid #f5c6c3'
                      }}>
                      🗑 Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Permissions panel */}
              {selectedUser?.id === u.id && userPerms && (
                <PermissionsPanel
                  user={u}
                  perms={userPerms}
                  onUpdate={() => loadUserPerms(u)}
                  flash={flash}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const ALL_PERMISSIONS = {
  'Products': [
    'PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_EDIT',
    'PRODUCT_DELETE', 'PRODUCT_IMPORT', 'PRODUCT_IMAGE_UPLOAD'
  ],
  'Stock': ['STOCK_VIEW', 'STOCK_ADJUST', 'STOCK_HISTORY', 'STOCK_PURCHASE'],
  'Sales': ['SALES_CHECKOUT', 'SALES_APPLY_DISCOUNT'],
  'Reports': ['REPORTS_DAILY', 'REPORTS_TRANSACTIONS'],
  'Users': [
    'USER_VIEW', 'USER_CREATE', 'USER_EDIT',
    'USER_DEACTIVATE', 'USER_GRANT_PERMISSION'
  ],
}

const PERM_LABELS = {
  PRODUCT_VIEW: 'View products', PRODUCT_CREATE: 'Add products',
  PRODUCT_EDIT: 'Edit products', PRODUCT_DELETE: 'Delete products',
  PRODUCT_IMPORT: 'Import Excel', PRODUCT_IMAGE_UPLOAD: 'Upload images',
  STOCK_VIEW: 'View stock', STOCK_ADJUST: 'Adjust stock',
  STOCK_HISTORY: 'Stock history', STOCK_PURCHASE: 'Record purchase',
  SALES_CHECKOUT: 'Checkout', SALES_APPLY_DISCOUNT: 'Apply discount',
  REPORTS_DAILY: 'Daily reports', REPORTS_TRANSACTIONS: 'Transaction log',
  USER_VIEW: 'View users', USER_CREATE: 'Create users',
  USER_EDIT: 'Edit users', USER_DEACTIVATE: 'Deactivate users',
  USER_GRANT_PERMISSION: 'Manage permissions',
}

function PermissionsPanel({ user, perms, onUpdate, flash }) {
  const adminUser = JSON.parse(localStorage.getItem('user') || '{}')
  const effective = perms.effectivePermissions || []
  const granted = perms.extraGranted || []
  const revoked = perms.explicitlyRevoked || []

  const handleToggle = async (perm) => {
    const isEffective = effective.includes(perm)
    try {
      if (isEffective) {
        await api.post(`/permissions/user/${user.id}/revoke`, {
          permission: perm, adminId: adminUser.id || 1
        })
        flash(`Revoked: ${PERM_LABELS[perm]}`)
      } else {
        await api.post(`/permissions/user/${user.id}/grant`, {
          permission: perm, adminId: adminUser.id || 1
        })
        flash(`Granted: ${PERM_LABELS[perm]}`)
      }
      onUpdate()
    } catch (e) { flash(e.message, 'err') }
  }

  const handleReset = async () => {
    try {
      await api.post(`/permissions/user/${user.id}/reset`)
      flash('Reset to role defaults')
      onUpdate()
    } catch (e) { flash(e.message, 'err') }
  }

  return (
    <div style={{
      margin: '4px 0 0 0',
      border: '1px solid var(--gray-200)',
      borderTop: 'none',
      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      background: 'var(--off-white)',
      padding: '16px'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '14px'
      }}>
        <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
          Effective permissions for <strong>{user.name}</strong>
          {(granted.length > 0 || revoked.length > 0) && (
            <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--warning)' }}>
              · {granted.length} extra granted, {revoked.length} revoked
            </span>
          )}
        </div>
        {(granted.length > 0 || revoked.length > 0) && (
          <button className="btn-secondary btn-sm" onClick={handleReset}>
            Reset to defaults
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {Object.entries(ALL_PERMISSIONS).map(([group, groupPerms]) => (
          <div key={group}>
            <div style={{
              fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
              letterSpacing: '0.5px', color: 'var(--gray-400)', marginBottom: '6px'
            }}>
              {group}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {groupPerms.map(perm => {
                const isOn = effective.includes(perm)
                const isGranted = granted.includes(perm)
                const isRevoked = revoked.includes(perm)
                return (
                  <button key={perm} onClick={() => handleToggle(perm)} style={{
                    padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                    fontWeight: '500', cursor: 'pointer', border: '1px solid',
                    background: isOn
                      ? (isGranted ? '#e8f5e8' : 'var(--green-pale)')
                      : (isRevoked ? 'var(--danger-pale)' : 'var(--white)'),
                    color: isOn
                      ? 'var(--green-dark)'
                      : (isRevoked ? 'var(--danger)' : 'var(--gray-400)'),
                    borderColor: isOn
                      ? 'var(--green-light)'
                      : (isRevoked ? '#f5c6c3' : 'var(--gray-200)'),
                    transition: 'all 0.15s'
                  }}>
                    {isOn ? '✓' : '✗'} {PERM_LABELS[perm]}
                    {isGranted && (
                      <span style={{ marginLeft: '4px', fontSize: '10px' }}>+</span>
                    )}
                    {isRevoked && (
                      <span style={{ marginLeft: '4px', fontSize: '10px' }}>-</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
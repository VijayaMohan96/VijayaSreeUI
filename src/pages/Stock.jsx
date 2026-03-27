import { useEffect, useState } from 'react'
import api from '../api/axios'

const user = JSON.parse(localStorage.getItem('user') || '{}')
const perms = user.permissions || []
const canAdjust = perms.includes('STOCK_ADJUST')

export default function Stock() {
  const [products, setProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [adjusting, setAdjusting] = useState(null)
  const [adjQty, setAdjQty] = useState('')
  const [adjReason, setAdjReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [adjType, setAdjType] = useState('SET')

  useEffect(() => { fetchAll() }, [])

 const fetchAll = async () => {
  setLoading(true)
  try {
    const [all, low] = await Promise.allSettled([
      api.get('/products?page=0&size=1000'),
      api.get('/products/low-stock')
    ])
    if (all.status === 'fulfilled') {
      const data = all.value.data
      setProducts(Array.isArray(data) ? data : (data?.products || []))
    }
    if (low.status === 'fulfilled') {
      setLowStock(Array.isArray(low.value.data) ? low.value.data : [])
    }
  } catch {}
  finally { setLoading(false) }
}

  const flash = (text, type = 'ok') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 3000)
  }

  const handleAdjust = async (p) => {
  if (!adjQty) return flash('Enter quantity', 'err')
  const qty = parseInt(adjQty)
  let newQty
  if (adjType === 'SET') newQty = qty
  else if (adjType === 'ADD') newQty = p.stockQty + qty
  else newQty = Math.max(0, p.stockQty - qty)

  try {
    await api.patch(`/products/${p.id}/stock`, {
      newQty,
      adjustedById: user.id || 1,
      reason: `[${adjType}] ${adjReason || 'Manual adjustment'}`
    })
    flash(`Stock updated for ${p.name}`)
    setAdjusting(null)
    setAdjQty('')
    setAdjReason('')
    setAdjType('SET')
    fetchAll()
  } catch (e) { flash(e.message, 'err') }
}

  const displayed = (tab === 'low' ? lowStock : products)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))

  const outCount = products.filter(p => p.stockQty === 0).length
  const lowCount = lowStock.filter(p => p.stockQty > 0).length
  const totalVal = products.reduce((a, p) => a + parseFloat(p.price) * p.stockQty, 0)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Stock Management</h1>
      </div>

      {/* Metrics */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <div className="metric-card" style={{ borderTop: '3px solid var(--green-mid)' }}>
          <div className="metric-label">Total Products</div>
          <div className="metric-value">{products.length}</div>
          <div className="metric-sub">Active in catalog</div>
        </div>
        <div className="metric-card" style={{ borderTop: '3px solid var(--warning)' }}>
          <div className="metric-label">Low Stock</div>
          <div className="metric-value" style={{ color: 'var(--warning)' }}>{lowCount}</div>
          <div className="metric-sub">Need restocking</div>
        </div>
        <div className="metric-card" style={{ borderTop: '3px solid var(--danger)' }}>
          <div className="metric-label">Out of Stock</div>
          <div className="metric-value" style={{ color: 'var(--danger)' }}>{outCount}</div>
          <div className="metric-sub">Unavailable</div>
        </div>
        <div className="metric-card" style={{ borderTop: '3px solid var(--gold)' }}>
          <div className="metric-label">Stock Value</div>
          <div className="metric-value" style={{ fontSize: '18px' }}>
            ₹{Math.round(totalVal).toLocaleString('en-IN')}
          </div>
          <div className="metric-sub">Total inventory worth</div>
        </div>
      </div>

      {msg.text && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px',
          background: msg.type === 'err' ? 'var(--danger-pale)' : 'var(--green-pale)',
          color: msg.type === 'err' ? 'var(--danger)' : 'var(--green-dark)',
          border: `1px solid ${msg.type === 'err' ? '#f5c6c3' : '#b8ddb8'}`
        }}>{msg.text}</div>
      )}

      <div className="card">
        {/* Tabs + Search */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All (${products.length})` },
            { id: 'low', label: `⚠️ Low & Out (${lowStock.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '7px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px',
              fontWeight: tab === t.id ? '600' : '400',
              background: tab === t.id ? 'var(--green-mid)' : 'var(--gray-100)',
              color: tab === t.id ? 'white' : 'var(--gray-600)',
              border: 'none'
            }}>{t.label}</button>
          ))}
          <input style={{ flex: 1, minWidth: '200px' }}
            placeholder="Search by name or SKU..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
            Loading stock...
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Status</th>
                {canAdjust && <th>Adjust</th>}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                  No products found
                </td></tr>
              )}
              {displayed.map(p => (
                <>
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} loading="lazy" />
                          : <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🌿</div>
                        }
                        <span style={{ fontWeight: '500' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--gray-400)' }}>{p.sku}</td>
                    <td>{p.categoryName}</td>
                    <td style={{ fontWeight: '600' }}>₹{parseFloat(p.price).toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '60px', height: '6px', borderRadius: '3px',
                          background: 'var(--gray-200)', overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%', borderRadius: '3px',
                            width: `${Math.min(100, (p.stockQty / (p.lowStockThreshold * 3)) * 100)}%`,
                            background: p.stockQty === 0 ? 'var(--danger)' : p.stockQty <= p.lowStockThreshold ? 'var(--warning)' : 'var(--green-mid)'
                          }} />
                        </div>
                        <span style={{ fontWeight: '600' }}>{p.stockQty}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-400)' }}>{p.lowStockThreshold}</td>
                    <td>
                      <span className={`badge ${p.stockQty === 0 ? 'badge-red' : p.stockQty <= p.lowStockThreshold ? 'badge-warning' : 'badge-green'}`}>
                        {p.stockQty === 0 ? 'Out of stock' : p.stockQty <= p.lowStockThreshold ? 'Low stock' : 'In stock'}
                      </span>
                    </td>
                    {canAdjust && (
                      <td>
                        <button className="btn-secondary btn-sm"
                          onClick={() => { setAdjusting(p); setAdjQty(p.stockQty); setAdjReason('') }}>
                          Adjust
                        </button>
                      </td>
                    )}
                  </tr>
                  {adjusting?.id === p.id && (
  <tr key={`adj-${p.id}`}>
    <td colSpan={8}>
      <div style={{
        background: 'var(--green-pale)', border: '1px solid var(--green-light)',
        borderRadius: 'var(--radius-sm)', padding: '14px',
        display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap'
      }}>
        {/* Type selector */}
        <div>
          <label className="form-label">Adjustment Type</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['SET', 'ADD', 'REDUCE'].map(type => (
              <button key={type}
                onClick={() => setAdjType(type)}
                style={{
                  padding: '6px 14px', fontSize: '12px', fontWeight: '600',
                  borderRadius: 'var(--radius-sm)', border: '1px solid',
                  background: adjType === type
                    ? type === 'REDUCE' ? 'var(--danger)' : 'var(--green-mid)'
                    : 'var(--white)',
                  color: adjType === type ? 'var(--white)' : 'var(--gray-600)',
                  borderColor: adjType === type
                    ? type === 'REDUCE' ? 'var(--danger)' : 'var(--green-mid)'
                    : 'var(--gray-200)',
                  cursor: 'pointer'
                }}>
                {type === 'SET' ? '= Set to' : type === 'ADD' ? '+ Add' : '- Reduce'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label">
            {adjType === 'SET' ? 'New Quantity' : adjType === 'ADD' ? 'Add Quantity' : 'Reduce Quantity'}
          </label>
          <input type="number" style={{ width: '120px' }} value={adjQty}
            onChange={e => setAdjQty(e.target.value)} min="0" />
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <label className="form-label">Reason</label>
          <input
            placeholder={
              adjType === 'ADD' ? 'e.g. Received new stock...' :
              adjType === 'REDUCE' ? 'e.g. Damaged goods, expired...' :
              'e.g. Stock count correction...'
            }
            value={adjReason} onChange={e => setAdjReason(e.target.value)} />
        </div>

        {/* Preview */}
        {adjQty && (
          <div style={{
            padding: '8px 12px', background: 'var(--white)',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)',
            fontSize: '12px', color: 'var(--gray-600)'
          }}>
            {p.stockQty} →{' '}
            <strong style={{
              color: adjType === 'REDUCE' ? 'var(--danger)' : 'var(--green-mid)'
            }}>
              {adjType === 'SET' ? parseInt(adjQty || 0) :
               adjType === 'ADD' ? p.stockQty + parseInt(adjQty || 0) :
               Math.max(0, p.stockQty - parseInt(adjQty || 0))}
            </strong>
          </div>
        )}

        <button className="btn-primary" onClick={() => handleAdjust(p)}>Save</button>
        <button className="btn-secondary" onClick={() => setAdjusting(null)}>Cancel</button>
      </div>
    </td>
  </tr>
)}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
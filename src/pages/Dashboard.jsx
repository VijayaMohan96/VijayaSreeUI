import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default function Dashboard() {
  const [report, setReport] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const perms = user.permissions || []
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        perms.includes('REPORTS_DAILY')
          ? api.get(`/sales/report/daily?date=${today}`)
          : Promise.resolve({ data: null }),
        perms.includes('STOCK_VIEW')
          ? api.get('/products/low-stock')
          : Promise.resolve({ data: [] }),
      ])
      if (results[0].status === 'fulfilled') setReport(results[0].value.data)
      if (results[1].status === 'fulfilled') setLowStock(results[1].value.data || [])
    } catch {}
    finally { setLoading(false) }
  }

  const fmt = (n) => {
    const num = parseFloat(n || 0)
    return isNaN(num) ? '0' : Math.round(num).toLocaleString('en-IN')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Good {getGreeting()}, {user.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '2px' }}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>
        {perms.includes('SALES_CHECKOUT') && (
          <button className="btn-primary"
            onClick={() => navigate('/checkout')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            🧾 New Sale
          </button>
        )}
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center', padding: '80px',
          color: 'var(--gray-400)', fontSize: '14px'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌱</div>
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* Metrics */}
          {report && (
            <div className="grid-4" style={{ marginBottom: '20px' }}>
              {[
                { label: "Today's Revenue", value: `₹${fmt(report.totalRevenue)}`, sub: 'Total sales today', color: 'var(--green-mid)' },
                { label: 'Orders', value: report.totalOrders ?? 0, sub: 'Completed today', color: 'var(--gold)' },
                { label: 'Items Sold', value: report.totalItemsSold ?? 0, sub: 'Units today', color: 'var(--soil)' },
                {
                  label: 'Avg Order',
                  value: report.totalOrders > 0
                    ? `₹${fmt(parseFloat(report.totalRevenue || 0) / report.totalOrders)}`
                    : '₹0',
                  sub: 'Per transaction',
                  color: 'var(--info)'
                },
              ].map(m => (
                <div key={m.label} className="metric-card" style={{ borderTop: `3px solid ${m.color}` }}>
                  <div className="metric-label">{m.label}</div>
                  <div className="metric-value">{m.value}</div>
                  <div className="metric-sub">{m.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* No data state */}
          {!report && !perms.includes('REPORTS_DAILY') && (
            <div style={{
              background: 'var(--green-pale)', border: '1px solid var(--green-light)',
              borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌾</div>
              <div style={{ fontWeight: '600', color: 'var(--green-dark)', marginBottom: '4px' }}>
                Welcome to VijayaSreeTraders
              </div>
              <div style={{ fontSize: '13px', color: 'var(--green-mid)' }}>
                Use the navigation above to get started
              </div>
            </div>
          )}

          {report && !report.totalOrders && (
            <div style={{
              background: 'var(--gold-pale)', border: '1px solid var(--gold)',
              borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>☀️</span>
              <div>
                <div style={{ fontWeight: '600', color: 'var(--brown)' }}>No sales yet today</div>
                <div style={{ fontSize: '13px', color: 'var(--brown-mid)' }}>
                  Sales will appear here once checkout is done
                </div>
              </div>
              {perms.includes('SALES_CHECKOUT') && (
                <button className="btn-primary" style={{ marginLeft: 'auto' }}
                  onClick={() => navigate('/checkout')}>
                  Start Selling
                </button>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Recent transactions */}
            {report && (report.transactions || []).length > 0 && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Recent Sales</h3>
                  <button className="btn-secondary btn-sm" onClick={() => navigate('/reports')}>View all</button>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Items</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.transactions || []).slice(0, 5).map(t => (
                      <tr key={t.id}>
                        <td>
                          <div style={{ fontWeight: '500' }}>{t.customerName || 'Walk-in'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                            {new Date(t.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td style={{ color: 'var(--gray-400)' }}>
                          {(t.items || []).length} item{(t.items || []).length !== 1 ? 's' : ''}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--green-mid)' }}>
                          ₹{fmt(t.grandTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Low stock */}
            {lowStock.length > 0 && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700' }}>
                    ⚠️ Low Stock
                    <span className="badge badge-red" style={{ marginLeft: '8px' }}>{lowStock.length}</span>
                  </h3>
                  <button className="btn-secondary btn-sm" onClick={() => navigate('/stock')}>View stock</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {lowStock.slice(0, 6).map(p => (
                    <div key={p.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                      background: p.stockQty === 0 ? 'var(--danger-pale)' : 'var(--warning-pale)',
                      borderLeft: `3px solid ${p.stockQty === 0 ? 'var(--danger)' : 'var(--warning)'}`
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{p.sku}</div>
                      </div>
                      <span className={`badge ${p.stockQty === 0 ? 'badge-red' : 'badge-warning'}`}>
                        {p.stockQty === 0 ? 'Out' : `${p.stockQty} left`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="card">
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { perm: 'SALES_CHECKOUT', path: '/checkout', icon: '🧾', label: 'New Sale', bg: 'var(--green-pale)', color: 'var(--green-dark)', border: 'var(--green-light)' },
                  { perm: 'PRODUCT_CREATE', path: '/products', icon: '📦', label: 'Add Product', bg: 'var(--gold-pale)', color: 'var(--brown)', border: 'var(--gold)' },
                  { perm: 'REPORTS_DAILY', path: '/reports', icon: '📈', label: 'View Report', bg: 'var(--info-pale)', color: 'var(--info)', border: '#a0c8d8' },
                  { perm: 'STOCK_VIEW', path: '/stock', icon: '📊', label: 'Check Stock', bg: 'var(--gray-100)', color: 'var(--gray-600)', border: 'var(--gray-200)' },
                ].filter(a => perms.includes(a.perm)).map(a => (
                  <button key={a.path} onClick={() => navigate(a.path)} style={{
                    padding: '14px', background: a.bg, color: a.color,
                    border: `1px solid ${a.border}`, borderRadius: 'var(--radius-md)',
                    fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                  }}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
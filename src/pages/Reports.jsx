import { useEffect, useState } from 'react'
import api from '../api/axios'

const fmt = (n) => {
  const num = parseFloat(n || 0)
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

const fmtInt = (n) => {
  const num = parseFloat(n || 0)
  return isNaN(num) ? '0' : Math.round(num).toLocaleString('en-IN')
}

export default function Reports() {
  const [report, setReport] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [viewingSale, setViewingSale] = useState(null)
  const [loadingSale, setLoadingSale] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => { fetchReport() }, [])

  const fetchReport = async () => {
    setLoading(true); setError(''); setReport(null)
    try {
      const res = await api.get(`/sales/report/daily?date=${date}`)
      setReport(res.data || null)
    } catch (e) { setError(e.message || 'Failed to load report') }
    finally { setLoading(false) }
  }

  const viewBill = async (saleId) => {
    setLoadingSale(true)
    try {
      const res = await api.get(`/sales/${saleId}`)
      setViewingSale(res.data)
    } catch (e) { alert('Failed to load bill: ' + e.message) }
    finally { setLoadingSale(false) }
  }

  const printBill = (sale) => {
    if (!sale) return
    const items = (sale.items || []).map(i =>
      `<tr>
        <td>${i.productName}</td>
        <td style="text-align:center">x${i.quantity}</td>
        <td style="text-align:right">Rs.${parseFloat(i.lineTotal).toFixed(2)}</td>
      </tr>
      <tr><td colspan="3" style="font-size:10px;color:#666;padding-bottom:4px">
        @ Rs.${parseFloat(i.unitPrice).toFixed(2)} each
      </td></tr>`
    ).join('')

    const disc = sale.discountValue
      ? `<tr><td colspan="2">Discount</td>
         <td style="text-align:right">-Rs.${parseFloat(sale.discountValue).toFixed(2)}</td></tr>`
      : ''

    const w = window.open('', '_blank', 'width=360,height=720')
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Courier New',monospace;width:80mm;padding:4mm;font-size:12px;color:#000}
      @media print{@page{width:80mm;margin:0}body{padding:2mm}.no-print{display:none}}
      .c{text-align:center}.b{font-weight:bold}.s{font-size:11px;color:#555}
      .div{border-top:1px dashed #000;margin:6px 0}
      table{width:100%;border-collapse:collapse}
      .tot td{font-weight:bold;font-size:14px;padding-top:4px}
      .btn{display:block;width:100%;padding:10px;margin-top:12px;background:#2d6a2d;
           color:white;border:none;border-radius:6px;font-size:14px;cursor:pointer;
           font-family:sans-serif}
    </style></head><body>
    <div class="c b" style="font-size:15px">VIJAYASREE STORES</div>
    <div class="c s">Pesticides & Seeds</div>
    <div class="div"></div>
    <div class="s">Receipt : <b>${sale.receiptNo}</b></div>
    <div class="s">Date    : ${new Date(sale.createdAt).toLocaleString('en-IN')}</div>
    <div class="s">Customer: ${sale.customerName || 'Walk-in'}${sale.customerVillage ? ` (${sale.customerVillage})` : ''}</div>
    ${sale.customerPhone ? `<div class="s">Phone   : ${sale.customerPhone}</div>` : ''}
    <div class="s">Cashier : ${sale.soldBy || currentUser.name || 'Staff'}</div>
    <div class="s">Payment : ${sale.paymentMethod || 'CASH'}${sale.isCredit ? ' (CREDIT)' : ''}</div>
    <div class="div"></div>
    <table>
      <thead>
        <tr>
          <th style="text-align:left;font-size:11px">Item</th>
          <th style="text-align:center;font-size:11px">Qty</th>
          <th style="text-align:right;font-size:11px">Amt</th>
        </tr>
      </thead>
      <tbody>${items}</tbody>
    </table>
    <div class="div"></div>
    <table>
      <tr><td colspan="2">Subtotal</td>
          <td style="text-align:right">Rs.${parseFloat(sale.subtotal).toFixed(2)}</td></tr>
      ${disc}
      <tr class="tot">
        <td colspan="2">TOTAL</td>
        <td style="text-align:right">Rs.${parseFloat(sale.grandTotal).toFixed(2)}</td>
      </tr>
    </table>
    <div class="div"></div>
    <div class="c s">Thank you for your purchase!</div>
    <div class="c s">** GST Invoice on Request **</div>
    <button class="btn no-print" onclick="window.print();window.close()">Print Receipt</button>
    </body></html>`)
    w.document.close(); w.focus()
  }

  const transactions = report?.transactions || []
  const revenue = parseFloat(report?.totalRevenue || 0)
  const orders = report?.totalOrders || 0
  const items = report?.totalItemsSold || 0

  return (
    <div style={{ maxWidth: '960px' }}>
      <h1 className="page-title" style={{ marginBottom: '20px' }}>📈 Daily Sales Report</h1>

      {/* Date picker */}
      <div className="card" style={{
        marginBottom: '20px', display: 'flex',
        alignItems: 'center', gap: '12px', flexWrap: 'wrap'
      }}>
        <label className="form-label" style={{ margin: 0 }}>Select Date</label>
        <input type="date" value={date}
          onChange={e => setDate(e.target.value)}
          style={{ width: '180px' }} />
        <button className="btn-primary" onClick={fetchReport} disabled={loading}>
          {loading ? 'Loading...' : 'Load Report'}
        </button>
        <button className="btn-secondary" onClick={() => {
          const today = new Date().toISOString().split('T')[0]
          setDate(today)
          setTimeout(fetchReport, 0)
        }}>Today</button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', background: 'var(--danger-pale)',
          color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '16px'
        }}>{error}</div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>📊</div>
          Loading report...
        </div>
      )}

      {!loading && report && (
        <>
          {/* Metrics */}
          <div className="grid-4" style={{ marginBottom: '20px' }}>
            {[
              { label: 'Revenue', value: `₹${fmtInt(revenue)}`, sub: `for ${date}`, color: 'var(--green-mid)' },
              { label: 'Orders', value: orders, sub: 'completed', color: 'var(--gold)' },
              { label: 'Items Sold', value: items, sub: 'units', color: 'var(--soil)' },
              { label: 'Avg Order', value: orders > 0 ? `₹${fmtInt(revenue / orders)}` : '₹0', sub: 'per transaction', color: 'var(--info)' },
            ].map(m => (
              <div key={m.label} className="metric-card" style={{ borderTop: `3px solid ${m.color}` }}>
                <div className="metric-label">{m.label}</div>
                <div className="metric-value">{m.value}</div>
                <div className="metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* No sales */}
          {transactions.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '60px',
              border: '2px dashed var(--gray-200)',
              borderRadius: 'var(--radius-lg)', color: 'var(--gray-400)'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
              <div style={{ fontWeight: '600', color: 'var(--gray-600)', marginBottom: '6px' }}>
                No sales on {date}
              </div>
            </div>
          )}

          {/* Transaction table */}
          {transactions.length > 0 && (
            <div className="card">
              <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '14px' }}>
                Transaction Log — {transactions.length} sale{transactions.length !== 1 ? 's' : ''}
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Customer</th>
                    <th>Sold By</th>
                    <th>Payment</th>
                    <th>Items</th>
                    <th>Discount</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th>Time</th>
                    <th>Bill</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--gray-400)' }}>
                        {t.receiptNo}
                      </td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{t.customerName || 'Walk-in'}</div>
                        {t.customerVillage && (
                          <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                            {t.customerVillage}
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--gray-400)', fontSize: '12px' }}>
                        {t.soldBy || '—'}
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
                          fontWeight: '600',
                          background: t.isCredit ? 'var(--danger-pale)' : 'var(--green-pale)',
                          color: t.isCredit ? 'var(--danger)' : 'var(--green-dark)'
                        }}>
                          {t.isCredit ? 'CREDIT' : (t.paymentMethod || 'CASH')}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gray-400)' }}>
                        {(t.items || []).length} item{(t.items || []).length !== 1 ? 's' : ''}
                      </td>
                      <td style={{ color: t.discountValue ? 'var(--danger)' : 'var(--gray-400)' }}>
                        {t.discountValue ? `-₹${fmt(t.discountValue)}` : '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--green-mid)' }}>
                        ₹{fmt(t.grandTotal)}
                      </td>
                      <td style={{ color: 'var(--gray-400)', fontSize: '12px' }}>
                        {new Date(t.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <button
                          onClick={() => viewBill(t.id)}
                          disabled={loadingSale}
                          className="btn-secondary btn-sm">
                          🧾 View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Bill viewer modal */}
      {viewingSale && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setViewingSale(null)}>
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--radius-lg)',
            padding: '24px', width: '100%', maxWidth: '480px',
            maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>

            {/* Bill header */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>🌾 VIJAYASREE STORES</div>
              <div style={{ fontSize: '13px', color: 'var(--gray-400)' }}>Pesticides & Seeds</div>
            </div>

            <div style={{
              borderTop: '1px dashed var(--gray-200)',
              borderBottom: '1px dashed var(--gray-200)',
              padding: '10px 0', marginBottom: '12px',
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--gray-400)' }}>Receipt</span>
                <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                  {viewingSale.receiptNo}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--gray-400)' }}>Date</span>
                <span>{new Date(viewingSale.createdAt).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--gray-400)' }}>Customer</span>
                <span style={{ fontWeight: '500' }}>
                  {viewingSale.customerName || 'Walk-in'}
                  {viewingSale.customerVillage ? ` (${viewingSale.customerVillage})` : ''}
                </span>
              </div>
              {viewingSale.customerPhone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--gray-400)' }}>Phone</span>
                  <span>{viewingSale.customerPhone}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--gray-400)' }}>Cashier</span>
                <span>{viewingSale.soldBy || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-400)' }}>Payment</span>
                <span style={{
                  fontWeight: '600',
                  color: viewingSale.isCredit ? 'var(--danger)' : 'var(--green-mid)'
                }}>
                  {viewingSale.isCredit ? 'CREDIT' : (viewingSale.paymentMethod || 'CASH')}
                </span>
              </div>
            </div>

            {/* Items */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 0', fontSize: '12px', color: 'var(--gray-400)' }}>
                    Item
                  </th>
                  <th style={{ textAlign: 'center', padding: '6px 0', fontSize: '12px', color: 'var(--gray-400)' }}>
                    Qty
                  </th>
                  <th style={{ textAlign: 'right', padding: '6px 0', fontSize: '12px', color: 'var(--gray-400)' }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {(viewingSale.items || []).map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '8px 0' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>
                        {item.productName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                        ₹{fmt(item.unitPrice)} each
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '13px', fontWeight: '600' }}>
                      x{item.quantity}
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>
                      ₹{fmt(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{
              borderTop: '1px dashed var(--gray-200)',
              paddingTop: '10px', marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '13px', color: 'var(--gray-400)', marginBottom: '4px'
              }}>
                <span>Subtotal</span>
                <span>₹{fmt(viewingSale.subtotal)}</span>
              </div>
              {viewingSale.discountValue && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '13px', color: 'var(--danger)', marginBottom: '4px'
                }}>
                  <span>Discount</span>
                  <span>-₹{fmt(viewingSale.discountValue)}</span>
                </div>
              )}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '17px', fontWeight: '700',
                paddingTop: '8px', borderTop: '1px solid var(--gray-200)'
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--green-mid)' }}>
                  ₹{fmt(viewingSale.grandTotal)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => printBill(viewingSale)}
                className="btn-primary"
                style={{ flex: 1, padding: '10px' }}>
                🖨 Reprint Receipt
              </button>
              <button
                onClick={() => setViewingSale(null)}
                className="btn-secondary"
                style={{ flex: 1, padding: '10px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
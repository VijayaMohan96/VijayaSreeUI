import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [creditCustomers, setCreditCustomers] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [payAmount, setPayAmount] = useState('')
  const [payNote, setPayNote] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [viewingSale, setViewingSale] = useState(null)
  const [loadingSale, setLoadingSale] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [all, credit] = await Promise.allSettled([
        api.get('/customers'),
        api.get('/customers/credit')
      ])
      if (all.status === 'fulfilled')
        setCustomers(Array.isArray(all.value.data) ? all.value.data : [])
      if (credit.status === 'fulfilled')
        setCreditCustomers(Array.isArray(credit.value.data) ? credit.value.data : [])
    } catch {}
    finally { setLoading(false) }
  }

  const flash = (text, type = 'ok') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 3000)
  }

  const loadDetail = async (c) => {
    if (selected?.id === c.id) {
      setSelected(null)
      setDetail(null)
      return
    }
    setSelected(c)
    try {
      const res = await api.get(`/customers/${c.id}`)
      setDetail(res.data)
    } catch {}
  }

  const viewBill = async (saleId) => {
    setLoadingSale(true)
    try {
      const res = await api.get(`/sales/${saleId}`)
      setViewingSale(res.data)
    } catch (e) {
      flash('Failed to load bill: ' + e.message, 'err')
    } finally { setLoadingSale(false) }
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
    <div class="s">Payment : ${sale.isCredit ? 'CREDIT' : (sale.paymentMethod || 'CASH')}</div>
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
    <button class="btn no-print" onclick="window.print();window.close()">
      Print Receipt
    </button>
    </body></html>`)
    w.document.close()
    w.focus()
  }

  const handleCreditPayment = async (customerId) => {
    if (!payAmount) return flash('Enter payment amount', 'err')
    try {
      await api.post(`/customers/${customerId}/credit-payment`, {
        amount: parseFloat(payAmount),
        note: payNote,
        receivedById: user.id || 1
      })
      flash('Payment recorded!')
      setPayAmount('')
      setPayNote('')
      fetchAll()
      loadDetail({ id: customerId })
    } catch (e) { flash(e.message, 'err') }
  }

  const handleSearch = async (q) => {
    setSearch(q)
    if (!q.trim()) { fetchAll(); return }
    try {
      const res = await api.get(`/customers/search?query=${q}`)
      setCustomers(Array.isArray(res.data) ? res.data : [])
    } catch {}
  }

  const displayed = tab === 'credit' ? creditCustomers : customers
  const totalCredit = creditCustomers.reduce(
    (a, c) => a + parseFloat(c.creditBalance || 0), 0)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👤 Customers</h1>
      </div>

      {msg.text && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px',
          background: msg.type === 'err' ? 'var(--danger-pale)' : 'var(--green-pale)',
          color: msg.type === 'err' ? 'var(--danger)' : 'var(--green-dark)',
          border: `1px solid ${msg.type === 'err' ? '#f5c6c3' : '#b8ddb8'}`
        }}>{msg.text}</div>
      )}

      {/* Metrics */}
      <div className="grid-3" style={{ marginBottom: '20px' }}>
        <div className="metric-card" style={{ borderTop: '3px solid var(--green-mid)' }}>
          <div className="metric-label">Total Customers</div>
          <div className="metric-value">{customers.length}</div>
          <div className="metric-sub">Registered in system</div>
        </div>
        <div className="metric-card" style={{ borderTop: '3px solid var(--warning)' }}>
          <div className="metric-label">Credit Customers</div>
          <div className="metric-value" style={{ color: 'var(--warning)' }}>
            {creditCustomers.length}
          </div>
          <div className="metric-sub">Have outstanding balance</div>
        </div>
        <div className="metric-card" style={{ borderTop: '3px solid var(--danger)' }}>
          <div className="metric-label">Total Credit Due</div>
          <div className="metric-value" style={{ color: 'var(--danger)', fontSize: '20px' }}>
            ₹{Math.round(totalCredit).toLocaleString('en-IN')}
          </div>
          <div className="metric-sub">Outstanding amount</div>
        </div>
      </div>

      {/* Tabs + search */}
      <div style={{
        display: 'flex', gap: '10px',
        marginBottom: '14px', flexWrap: 'wrap'
      }}>
        {[
          { id: 'all', label: `All (${customers.length})` },
          { id: 'credit', label: `⚠️ Credit Due (${creditCustomers.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '7px 16px', borderRadius: 'var(--radius-sm)',
            fontSize: '13px', fontWeight: tab === t.id ? '600' : '400',
            background: tab === t.id ? 'var(--green-mid)' : 'var(--gray-100)',
            color: tab === t.id ? 'white' : 'var(--gray-600)',
            border: 'none', cursor: 'pointer'
          }}>{t.label}</button>
        ))}
        <input
          style={{ flex: 1, minWidth: '200px' }}
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center', padding: '60px', color: 'var(--gray-400)'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>👤</div>
          Loading customers...
        </div>
      ) : displayed.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          border: '2px dashed var(--gray-200)',
          borderRadius: 'var(--radius-lg)', color: 'var(--gray-400)'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>👤</div>
          <div style={{ fontWeight: '600', color: 'var(--gray-600)', marginBottom: '6px' }}>
            {tab === 'credit' ? 'No credit customers' : 'No customers yet'}
          </div>
          <div style={{ fontSize: '13px' }}>
            {tab === 'credit'
              ? 'No outstanding credit balances'
              : 'Customers are created automatically when phone number is entered at checkout'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayed.map(c => (
            <div key={c.id}>
              <div className="card" style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                flexWrap: 'wrap',
                borderLeft: `4px solid ${parseFloat(c.creditBalance || 0) > 0
                  ? 'var(--danger)' : 'var(--green-mid)'}`
              }}>
                {/* Avatar */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: parseFloat(c.creditBalance || 0) > 0
                    ? 'var(--danger-pale)' : 'var(--green-pale)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '16px', flexShrink: 0,
                  color: parseFloat(c.creditBalance || 0) > 0
                    ? 'var(--danger)' : 'var(--green-dark)'
                }}>
                  {c.name?.charAt(0)?.toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{
                    fontWeight: '600', fontSize: '14px', marginBottom: '2px'
                  }}>
                    {c.name}
                    {c.village && (
                      <span style={{
                        fontSize: '12px', fontWeight: '400',
                        color: 'var(--gray-400)', marginLeft: '8px'
                      }}>
                        ({c.village})
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
                    {c.phone || 'No phone'} &nbsp;·&nbsp;
                    {c.totalOrders} order{c.totalOrders !== 1 ? 's' : ''} &nbsp;·&nbsp;
                    ₹{parseFloat(c.totalSpent || 0).toFixed(0)} spent
                    {c.lastVisit && (
                      <span>
                        &nbsp;·&nbsp; Last: {new Date(c.lastVisit).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {parseFloat(c.creditBalance || 0) > 0 && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: '12px', color: 'var(--danger)', fontWeight: '600'
                    }}>
                      Credit Due
                    </div>
                    <div style={{
                      fontSize: '16px', fontWeight: '700', color: 'var(--danger)'
                    }}>
                      ₹{parseFloat(c.creditBalance).toFixed(2)}
                    </div>
                  </div>
                )}

                <button
                  className="btn-secondary btn-sm"
                  onClick={() => loadDetail(c)}
                  style={{ flexShrink: 0 }}>
                  {selected?.id === c.id ? 'Hide' : 'View History'}
                </button>
              </div>

              {/* Detail panel */}
              {selected?.id === c.id && detail && (
                <div style={{
                  border: '1px solid var(--gray-200)', borderTop: 'none',
                  borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                  background: 'var(--off-white)', padding: '16px'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'var(--cust-cols, 1fr 1fr)',
                    gap: '16px'
                  }}>

                    {/* Purchase history */}
                    <div>
                      <div style={{
                        fontSize: '12px', fontWeight: '700',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        color: 'var(--gray-400)', marginBottom: '10px'
                      }}>
                        Purchase History ({(detail.recentSales || []).length} bills)
                      </div>

                      {(detail.recentSales || []).length === 0 ? (
                        <div style={{
                          fontSize: '13px', color: 'var(--gray-400)',
                          padding: '20px', textAlign: 'center',
                          border: '2px dashed var(--gray-200)',
                          borderRadius: 'var(--radius-md)'
                        }}>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧾</div>
                          No purchases yet
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex', flexDirection: 'column', gap: '6px'
                        }}>
                          {(detail.recentSales || []).map(s => (
                            <div
                              key={s.id}
                              onClick={() => viewBill(s.id)}
                              style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', padding: '10px 14px',
                                background: 'var(--white)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--gray-200)',
                                cursor: 'pointer', transition: 'border-color 0.15s'
                              }}
                              onMouseEnter={e =>
                                e.currentTarget.style.borderColor = 'var(--green-light)'}
                              onMouseLeave={e =>
                                e.currentTarget.style.borderColor = 'var(--gray-200)'}
                            >
                              <div>
                                <div style={{
                                  fontSize: '12px', fontFamily: 'monospace',
                                  color: 'var(--gray-400)', marginBottom: '2px'
                                }}>
                                  {s.receiptNo}
                                </div>
                                <div style={{
                                  fontSize: '11px', color: 'var(--gray-400)'
                                }}>
                                  {s.createdAt
                                    ? new Date(s.createdAt).toLocaleDateString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                      })
                                    : '—'}
                                  {s.paymentMethod && (
                                    <span style={{
                                      marginLeft: '6px', padding: '1px 6px',
                                      borderRadius: '8px', fontSize: '10px',
                                      background: s.isCredit
                                        ? 'var(--danger-pale)' : 'var(--green-pale)',
                                      color: s.isCredit
                                        ? 'var(--danger)' : 'var(--green-dark)'
                                    }}>
                                      {s.isCredit ? 'CREDIT' : s.paymentMethod}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{
                                  fontWeight: '700', color: 'var(--green-mid)',
                                  fontSize: '14px'
                                }}>
                                  ₹{parseFloat(s.grandTotal || 0).toFixed(2)}
                                </div>
                                <div style={{
                                  fontSize: '10px', color: 'var(--green-mid)'
                                }}>
                                  tap to view
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Credit section */}
                    <div>
                      <div style={{
                        fontSize: '12px', fontWeight: '700',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        color: 'var(--gray-400)', marginBottom: '10px'
                      }}>
                        Credit Account
                      </div>

                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        gap: '8px', marginBottom: '12px'
                      }}>
                        <div style={{
                          padding: '10px 12px', background: 'var(--white)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--gray-200)'
                        }}>
                          <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                            Credit Limit
                          </div>
                          <div style={{ fontWeight: '700', fontSize: '15px' }}>
                            ₹{parseFloat(detail.creditLimit || 0).toFixed(0)}
                          </div>
                        </div>
                        <div style={{
                          padding: '10px 12px',
                          background: parseFloat(detail.creditBalance || 0) > 0
                            ? 'var(--danger-pale)' : 'var(--white)',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${parseFloat(detail.creditBalance || 0) > 0
                            ? '#f5c6c3' : 'var(--gray-200)'}`
                        }}>
                          <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                            Balance Due
                          </div>
                          <div style={{
                            fontWeight: '700', fontSize: '15px',
                            color: parseFloat(detail.creditBalance || 0) > 0
                              ? 'var(--danger)' : 'var(--green-mid)'
                          }}>
                            ₹{parseFloat(detail.creditBalance || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {parseFloat(detail.creditBalance || 0) > 0 && (
                        <div style={{
                          padding: '12px', background: 'var(--white)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--gray-200)', marginBottom: '10px'
                        }}>
                          <div style={{
                            fontSize: '12px', fontWeight: '600',
                            marginBottom: '8px', color: 'var(--gray-800)'
                          }}>
                            Record Payment
                          </div>
                          <div style={{
                            display: 'flex', gap: '6px', marginBottom: '6px'
                          }}>
                            <input
                              type="number" placeholder="Amount ₹"
                              value={payAmount}
                              onChange={e => setPayAmount(e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <button
                              className="btn-primary"
                              onClick={() => handleCreditPayment(c.id)}>
                              Record
                            </button>
                          </div>
                          <input
                            placeholder="Note (optional)"
                            value={payNote}
                            onChange={e => setPayNote(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Payment history */}
                      {(detail.creditPayments || []).length > 0 && (
                        <div>
                          <div style={{
                            fontSize: '11px', fontWeight: '600',
                            color: 'var(--gray-400)', marginBottom: '6px',
                            textTransform: 'uppercase'
                          }}>
                            Payment History
                          </div>
                          {(detail.creditPayments || []).map(p => (
                            <div key={p.id} style={{
                              display: 'flex', justifyContent: 'space-between',
                              padding: '6px 10px', fontSize: '12px',
                              background: 'var(--green-pale)', borderRadius: '4px',
                              marginBottom: '4px'
                            }}>
                              <span style={{ color: 'var(--gray-600)' }}>
                                {new Date(p.createdAt).toLocaleDateString('en-IN')}
                                {p.note && ` · ${p.note}`}
                              </span>
                              <span style={{
                                fontWeight: '700', color: 'var(--green-dark)'
                              }}>
                                +₹{parseFloat(p.amount).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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
            padding: '24px', width: '100%', maxWidth: '440px',
            maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>

            {/* Bill header */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>
                🌾 VIJAYASREE STORES
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
                Pesticides & Seeds
              </div>
            </div>

            {/* Bill details */}
            <div style={{
              borderTop: '1px dashed var(--gray-200)',
              borderBottom: '1px dashed var(--gray-200)',
              padding: '10px 0', marginBottom: '12px', fontSize: '13px'
            }}>
              {[
                { label: 'Receipt', value: viewingSale.receiptNo, mono: true },
                {
                  label: 'Date',
                  value: new Date(viewingSale.createdAt).toLocaleString('en-IN')
                },
                {
                  label: 'Customer',
                  value: `${viewingSale.customerName || 'Walk-in'}${viewingSale.customerVillage
                    ? ` (${viewingSale.customerVillage})` : ''}`
                },
                viewingSale.customerPhone
                  ? { label: 'Phone', value: viewingSale.customerPhone }
                  : null,
                { label: 'Cashier', value: viewingSale.soldBy || '—' },
                {
                  label: 'Payment',
                  value: viewingSale.isCredit
                    ? 'CREDIT' : (viewingSale.paymentMethod || 'CASH'),
                  color: viewingSale.isCredit ? 'var(--danger)' : 'var(--green-mid)'
                },
              ].filter(Boolean).map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <span style={{ color: 'var(--gray-400)' }}>{row.label}</span>
                  <span style={{
                    fontWeight: row.mono ? '600' : '400',
                    fontFamily: row.mono ? 'monospace' : 'inherit',
                    color: row.color || 'inherit'
                  }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Items */}
            <table style={{
              width: '100%', borderCollapse: 'collapse', marginBottom: '12px'
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <th style={{
                    textAlign: 'left', padding: '6px 0',
                    fontSize: '11px', color: 'var(--gray-400)'
                  }}>Item</th>
                  <th style={{
                    textAlign: 'center', padding: '6px 0',
                    fontSize: '11px', color: 'var(--gray-400)'
                  }}>Qty</th>
                  <th style={{
                    textAlign: 'right', padding: '6px 0',
                    fontSize: '11px', color: 'var(--gray-400)'
                  }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(viewingSale.items || []).map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '8px 0' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>
                        {item.productName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                        ₹{parseFloat(item.unitPrice).toFixed(2)} each
                      </div>
                    </td>
                    <td style={{
                      textAlign: 'center', fontSize: '13px', fontWeight: '600'
                    }}>
                      x{item.quantity}
                    </td>
                    <td style={{
                      textAlign: 'right', fontSize: '13px', fontWeight: '600'
                    }}>
                      ₹{parseFloat(item.lineTotal).toFixed(2)}
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
                <span>₹{parseFloat(viewingSale.subtotal).toFixed(2)}</span>
              </div>
              {viewingSale.discountValue && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '13px', color: 'var(--danger)', marginBottom: '4px'
                }}>
                  <span>Discount</span>
                  <span>-₹{parseFloat(viewingSale.discountValue).toFixed(2)}</span>
                </div>
              )}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '17px', fontWeight: '700',
                paddingTop: '8px', borderTop: '1px solid var(--gray-200)'
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--green-mid)' }}>
                  ₹{parseFloat(viewingSale.grandTotal).toFixed(2)}
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
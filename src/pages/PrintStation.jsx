import { useEffect, useState, useRef, useCallback } from 'react'
import api from '../api/axios'
import { openReceiptAndPrint } from '../utils/receiptHtml'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081/api'

export default function PrintStation() {
  // Bills waiting to be printed — treated as a queue (first in, first out)
  const [queue, setQueue]       = useState([])
  // Last 10 bills that were printed — shown for reprintingt
  const [history, setHistory]   = useState([])
  const [connected, setConnected] = useState(false)
  const [statusMsg, setStatusMsg] = useState('Connecting to server...')

  const user  = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  // ─── Fetch any bills that weren't printed while this tab was closed/sleeping ───
  const fetchUnprinted = useCallback(async () => {
    try {
      const res = await api.get('/sales/unprinted')
      const missed = res.data || []
      if (missed.length > 0) {
        setStatusMsg(`Catching up — ${missed.length} bill(s) missed while offline`)
        setQueue(prev => {
          const existingIds = new Set(prev.map(s => s.id))
          // Only add bills we don't already have in the queue
          return [...prev, ...missed.filter(s => !existingIds.has(s.id))]
        })
      } else {
        setStatusMsg('Ready — waiting for new bills')
      }
    } catch {
      setStatusMsg('Ready — waiting for new bills')
    }
  }, [])

  // ─── SSE connection — stays open as long as this tab is open ───────────────────
  useEffect(() => {
    if (!token) return

    // EventSource doesn't support custom headers, so JWT goes in the query string
    const es = new EventSource(`${API_BASE}/print/events?token=${token}`)

    es.addEventListener('connected', () => {
      setConnected(true)
      fetchUnprinted() // immediately check for bills we missed while offline
    })

    es.addEventListener('new-sale', (e) => {
      const sale = JSON.parse(e.data)
      setQueue(prev => [...prev, sale])
      setStatusMsg(`New bill arrived: ${sale.receiptNo}`)
    })

    es.onerror = () => {
      setConnected(false)
      setStatusMsg('Connection lost — browser will reconnect automatically')
    }

    return () => es.close()
  }, [token, fetchUnprinted])

  // ─── Print a single bill ────────────────────────────────────────────────────────
  const printBill = useCallback(async (sale) => {
    // Opens a popup with the 80mm receipt layout and triggers the iOS print dialog
    openReceiptAndPrint(sale, user.name)

    // Tell the backend this bill was printed — removes it from the unprinted list
    try {
      await api.post(`/sales/${sale.id}/mark-printed`)
    } catch {
      // Non-critical — bill still gets removed from the UI queue
    }

    setQueue(prev  => prev.filter(s => s.id !== sale.id))
    setHistory(prev => [sale, ...prev].slice(0, 10)) // keep last 10 in history
  }, [user.name])

  // The first bill in the queue is shown prominently as "ready to print"
  const current = queue[0] || null

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      maxWidth: '520px', margin: '0 auto'
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '8px'
      }}>
        <p style={{
          fontSize: '22px', fontWeight: '600',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.5px', margin: 0
        }}>
          Print Station
        </p>

        {/* Live / Offline pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px',
          background: connected
            ? 'var(--color-background-success)'
            : 'var(--color-background-danger)',
          border: `0.5px solid ${connected
            ? 'var(--color-border-success)'
            : 'var(--color-border-danger)'}`,
          borderRadius: '20px'
        }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: connected
              ? 'var(--color-text-success)'
              : 'var(--color-text-danger)'
          }} />
          <span style={{
            fontSize: '12px', fontWeight: '500',
            color: connected
              ? 'var(--color-text-success)'
              : 'var(--color-text-danger)'
          }}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      <p style={{
        fontSize: '13px', color: 'var(--color-text-secondary)',
        marginBottom: '24px'
      }}>
        {statusMsg}
      </p>

      {/* ── Current bill (front of queue) ── */}
      {current ? (
        <div style={{
          padding: '20px',
          background: 'var(--color-background-primary)',
          border: '1.5px solid #1a3c1a',
          borderRadius: '16px', marginBottom: '16px'
        }}>
          <p style={{
            fontSize: '11px', fontWeight: '600',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.6px',
            margin: '0 0 12px'
          }}>
            Ready to Print
          </p>

          <p style={{
            fontSize: '18px', fontWeight: '700',
            color: 'var(--color-text-primary)',
            margin: '0 0 4px', letterSpacing: '-0.3px'
          }}>
            {current.receiptNo}
          </p>

          <p style={{
            fontSize: '13px', color: 'var(--color-text-secondary)',
            margin: '0 0 4px'
          }}>
            {current.customerName}
            {current.customerVillage ? ` · ${current.customerVillage}` : ''}
          </p>

          <p style={{
            fontSize: '22px', fontWeight: '700',
            color: 'var(--color-text-primary)',
            margin: '0 0 4px', letterSpacing: '-0.5px'
          }}>
            ₹{parseFloat(current.grandTotal).toFixed(2)}
            <span style={{
              fontSize: '13px', fontWeight: '500',
              color: 'var(--color-text-secondary)', marginLeft: '8px'
            }}>
              {current.isCredit ? 'CREDIT' : current.paymentMethod}
            </span>
          </p>

          <p style={{
            fontSize: '12px', color: 'var(--color-text-secondary)',
            margin: '0 0 20px'
          }}>
            {(current.items || []).length} item(s) · by {current.soldBy}
          </p>

          {/* Main action — tap to open receipt and print */}
          <button
            onClick={() => printBill(current)}
            style={{
              width: '100%', padding: '15px',
              fontSize: '16px', fontWeight: '600',
              borderRadius: '12px', border: 'none',
              background: '#1a3c1a', color: 'white',
              cursor: 'pointer', letterSpacing: '-0.2px'
            }}
          >
            Print Bill
          </button>

          {/* Skip — moves this bill to the end of the queue */}
          {queue.length > 1 && (
            <button
              onClick={() => setQueue(prev => [...prev.slice(1), prev[0]])}
              style={{
                width: '100%', padding: '10px', marginTop: '6px',
                fontSize: '13px', border: 'none',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer'
              }}
            >
              Skip (print later)
            </button>
          )}
        </div>
      ) : (
        /* Empty state */
        <div style={{
          padding: '48px 20px', textAlign: 'center',
          background: 'var(--color-background-secondary)',
          borderRadius: '16px', marginBottom: '16px',
          border: '0.5px solid var(--color-border-tertiary)'
        }}>
          <p style={{
            fontSize: '15px', fontWeight: '500',
            color: 'var(--color-text-primary)', margin: '0 0 6px'
          }}>
            No pending bills
          </p>
          <p style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)', margin: 0
          }}>
            {connected
              ? 'New bills will appear here the moment a salesperson checks out'
              : 'Reconnecting...'}
          </p>
        </div>
      )}

      {/* ── Queue — bills after the first one ── */}
      {queue.length > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            fontSize: '11px', fontWeight: '600',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.6px',
            margin: '0 0 8px'
          }}>
            In Queue ({queue.length - 1} more)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {queue.slice(1).map(sale => (
              <div key={sale.id} style={{
                padding: '10px 14px',
                background: 'var(--color-background-secondary)',
                borderRadius: '10px',
                border: '0.5px solid var(--color-border-tertiary)',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{
                    fontSize: '13px', fontWeight: '500',
                    color: 'var(--color-text-primary)'
                  }}>
                    {sale.receiptNo}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    marginLeft: '8px'
                  }}>
                    {sale.customerName}
                  </span>
                </div>
                <span style={{
                  fontSize: '13px', fontWeight: '600',
                  color: 'var(--color-text-primary)'
                }}>
                  ₹{parseFloat(sale.grandTotal).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recently printed — for reprints ── */}
      {history.length > 0 && (
        <div>
          <p style={{
            fontSize: '11px', fontWeight: '600',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.6px',
            margin: '0 0 8px'
          }}>
            Recently Printed
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {history.map(sale => (
              <div key={sale.id} style={{
                padding: '10px 14px',
                background: 'var(--color-background-secondary)',
                borderRadius: '10px',
                border: '0.5px solid var(--color-border-tertiary)',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{
                    fontSize: '13px', fontWeight: '500',
                    color: 'var(--color-text-secondary)'
                  }}>
                    {sale.receiptNo}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    marginLeft: '8px'
                  }}>
                    {sale.customerName}
                  </span>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)'
                  }}>
                    ₹{parseFloat(sale.grandTotal).toFixed(0)}
                  </span>
                  <button
                    onClick={() => openReceiptAndPrint(sale, user.name)}
                    style={{
                      fontSize: '11px', padding: '3px 10px',
                      borderRadius: '20px',
                      border: '0.5px solid var(--color-border-secondary)',
                      background: 'transparent',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    Reprint
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
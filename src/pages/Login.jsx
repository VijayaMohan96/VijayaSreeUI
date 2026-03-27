import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function VSTLogo({ size = 120 }) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.43
  const sw = size * 0.065
  const circ = 2 * Math.PI * r
  const big = circ * 0.63
  const small = circ * 0.37
  const fs1 = size * 0.175
  const fs2 = size * 0.215
  const off1 = size * 0.265
  const off2 = size * 0.27

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4a9e4a"
        strokeWidth={sw}
        strokeDasharray={`${big} ${small}`}
        strokeDashoffset="0" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#c8a84b"
        strokeWidth={sw}
        strokeDasharray={`${small} ${big}`}
        strokeDashoffset={-big} strokeLinecap="round"/>
      <text x={cx} y={cy - off1}
        fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="rgba(255,255,255,0.85)"
        textAnchor="middle" dominantBaseline="central">V</text>
      <text x={cx - off2} y={cy}
        fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="#4a9e4a"
        textAnchor="middle" dominantBaseline="central">V</text>
      <text x={cx} y={cy}
        fontFamily="Georgia,serif" fontSize={fs2} fontWeight="700"
        fill="#ffffff"
        textAnchor="middle" dominantBaseline="central">S</text>
      <text x={cx + off2} y={cy}
        fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="#c8a84b"
        textAnchor="middle" dominantBaseline="central">T</text>
      <text x={cx} y={cy + off1}
        fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="rgba(255,255,255,0.85)"
        textAnchor="middle" dominantBaseline="central">T</text>
    </svg>
  )
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true })
    }
  }, [])

  const handleLogin = async () => {
    if (!username.trim() || !password.trim())
      return setError('Please enter username and password')
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8081/api'}/auth/login`,
        { username: username.trim(), password: password.trim() }
      )
      const data = res.data?.data || res.data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        name: data.name,
        role: data.role,
        roleId: data.roleId,
        permissions: data.permissions || []
      }))
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid username or password')
    } finally { setLoading(false) }
  }

  const fillCreds = (u, p) => { setUsername(u); setPassword(p); setError('') }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#0f0f0f'
    }}>

      {/* LEFT — branding */}
      <div style={{
        width: '320px', flexShrink: 0,
        background: 'linear-gradient(160deg, #1a3c1a 0%, #2d6a2d 50%, #3d2b1f 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 28px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Decoration circles */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '220px', height: '220px', borderRadius: '50%',
          background: 'rgba(200,168,75,0.06)'
        }}/>
        <div style={{
          position: 'absolute', bottom: '-40px', left: '-40px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'rgba(74,158,74,0.08)'
        }}/>

        <VSTLogo size={130} />

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <div style={{
            fontSize: '20px', fontWeight: '800',
            color: '#c8a84b', letterSpacing: '2px',
            fontFamily: 'Georgia, serif'
          }}>VIJAYASREE</div>
          <div style={{
            fontSize: '12px', color: 'rgba(255,255,255,0.45)',
            letterSpacing: '3px', marginTop: '4px'
          }}>STORES</div>
          <div style={{
            width: '36px', height: '2px',
            background: '#c8a84b', margin: '12px auto', opacity: 0.4
          }}/>
          <div style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.35)',
            letterSpacing: '1px'
          }}>Pesticides & Seeds</div>
        </div>

        {/* Features */}
        <div style={{
          marginTop: '28px', display: 'flex',
          flexDirection: 'column', gap: '8px', width: '100%'
        }}>
          {[
            { icon: '📦', text: 'Inventory management' },
            { icon: '🧾', text: 'Fast billing & receipts' },
            { icon: '👤', text: 'Customer tracking' },
            { icon: '📈', text: 'Daily sales reports' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <span style={{ fontSize: '15px' }}>{icon}</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — sign in form */}
      <div style={{
        flex: 1, background: '#ffffff',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '60px 40px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '34px', fontWeight: '800',
              color: '#1a1a1a', marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '16px', color: '#999', lineHeight: 1.5 }}>
              Sign in to access your POS
            </p>
          </div>

          {/* Username */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '14px',
              fontWeight: '600', color: '#333', marginBottom: '8px'
            }}>Username</label>
            <input
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoFocus
              style={{
                width: '100%', padding: '14px 16px',
                fontSize: '16px', border: '2px solid #e8e8e2',
                borderRadius: '10px', outline: 'none',
                color: '#1a1a1a', background: '#fafaf8',
                transition: 'border-color 0.15s', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#2d6a2d'}
              onBlur={e => e.target.style.borderColor = '#e8e8e2'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block', fontSize: '14px',
              fontWeight: '600', color: '#333', marginBottom: '8px'
            }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%', padding: '14px 16px',
                fontSize: '16px', border: '2px solid #e8e8e2',
                borderRadius: '10px', outline: 'none',
                color: '#1a1a1a', background: '#fafaf8',
                transition: 'border-color 0.15s', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#2d6a2d'}
              onBlur={e => e.target.style.borderColor = '#e8e8e2'}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px', background: '#FCEBEB',
              color: '#A32D2D', borderRadius: '8px',
              fontSize: '14px', marginBottom: '20px',
              border: '1px solid #f5c6c3'
            }}>{error}</div>
          )}

          {/* Sign in button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              fontSize: '16px', fontWeight: '700',
              background: '#1a3c1a',
              color: '#ffffff', border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.5px',
              opacity: loading ? 0.8 : 1,
              marginBottom: '28px',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#2d6a2d' }}
            onMouseLeave={e => { if (!loading) e.target.style.background = '#1a3c1a' }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

          {/* Demo credentials */}
          <div style={{
            background: '#f4f4f0', borderRadius: '10px',
            padding: '16px 18px', border: '1px solid #e8e8e2'
          }}>
            <div style={{
              fontSize: '11px', fontWeight: '700', color: '#aaa',
              textTransform: 'uppercase', letterSpacing: '1px',
              marginBottom: '10px'
            }}>
              Demo credentials — click to fill
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px'
            }}>
              {[
                { role: 'Admin', u: 'admin', p: 'admin123' },
                { role: 'Inventory', u: 'inventory', p: 'inv123' },
                { role: 'Sales', u: 'sales', p: 'sales123' },
                { role: 'Accountant', u: 'accountant', p: 'acc123' },
              ].map(({ role, u, p }) => (
                <div key={role}
                  onClick={() => fillCreds(u, p)}
                  style={{
                    padding: '8px 10px', background: '#ffffff',
                    borderRadius: '6px', border: '1px solid #e8e8e2',
                    cursor: 'pointer', transition: 'border-color 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#2d6a2d'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e2'}
                >
                  <div style={{
                    fontSize: '11px', fontWeight: '700',
                    color: '#2d6a2d', marginBottom: '2px'
                  }}>{role}</div>
                  <div style={{
                    fontSize: '11px', color: '#999',
                    fontFamily: 'monospace'
                  }}>{u} / {p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
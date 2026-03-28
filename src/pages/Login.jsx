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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#0f0f0f',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif'
    }}>

      {/* LEFT — branding panel */}
      <div style={{
        width: '360px',
        flexShrink: 0,
        background: 'linear-gradient(160deg, #1a3c1a 0%, #2d6a2d 55%, #3d2b1f 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'rgba(200,168,75,0.07)'
        }}/>
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(74,158,74,0.09)'
        }}/>
        <div style={{
          position: 'absolute', top: '40%', left: '-40px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'rgba(200,168,75,0.04)'
        }}/>

        {/* Logo */}
        <VSTLogo size={140} />

        {/* Shop name */}
        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <div style={{
            fontSize: '26px',
            fontWeight: '800',
            color: '#c8a84b',
            letterSpacing: '3px',
            fontFamily: 'Georgia, serif'
          }}>VIJAYASREE</div>

          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '4px',
            marginTop: '6px',
            fontWeight: '600'
          }}>TRADERS</div>

          <div style={{
            width: '40px', height: '1.5px',
            background: '#c8a84b',
            margin: '14px auto',
            opacity: 0.5
          }}/>

          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.5px',
            lineHeight: 1.7
          }}>
            Pesticides & Fertilizers
          </div>
        </div>

        {/* Agriculture illustration */}
        <div style={{ marginTop: '44px', opacity: 0.18 }}>
          <svg width="160" height="120" viewBox="0 0 160 120"
            xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="90" width="160" height="30" fill="#c8a84b" rx="2"/>
            <line x1="30" y1="90" x2="30" y2="50"
              stroke="#4a9e4a" strokeWidth="3" strokeLinecap="round"/>
            <ellipse cx="30" cy="45" rx="14" ry="10"
              fill="#4a9e4a" transform="rotate(-20 30 45)"/>
            <ellipse cx="22" cy="60" rx="12" ry="8"
              fill="#4a9e4a" transform="rotate(20 22 60)"/>
            <line x1="80" y1="90" x2="80" y2="30"
              stroke="#4a9e4a" strokeWidth="3" strokeLinecap="round"/>
            <ellipse cx="80" cy="25" rx="16" ry="12"
              fill="#4a9e4a" transform="rotate(-10 80 25)"/>
            <ellipse cx="68" cy="48" rx="13" ry="9"
              fill="#4a9e4a" transform="rotate(15 68 48)"/>
            <ellipse cx="92" cy="52" rx="13" ry="9"
              fill="#4a9e4a" transform="rotate(-15 92 52)"/>
            <line x1="130" y1="90" x2="130" y2="55"
              stroke="#4a9e4a" strokeWidth="3" strokeLinecap="round"/>
            <ellipse cx="130" cy="50" rx="14" ry="10"
              fill="#4a9e4a" transform="rotate(15 130 50)"/>
            <ellipse cx="140" cy="65" rx="12" ry="8"
              fill="#4a9e4a" transform="rotate(-20 140 65)"/>
            <circle cx="140" cy="20" r="10" fill="#c8a84b"/>
            <line x1="140" y1="5" x2="140" y2="1"
              stroke="#c8a84b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="152" y1="8" x2="155" y2="5"
              stroke="#c8a84b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="155" y1="20" x2="159" y2="20"
              stroke="#c8a84b" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Location */}
        <div style={{
          marginTop: '28px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.8px'
        }}>
          Madanapalli, Andhra Pradesh
        </div>
      </div>

      {/* RIGHT — login form */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #f7f9f4 0%, #f0f4ec 50%, #f8f6f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* Background decorations */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'rgba(74,158,74,0.05)'
        }}/>
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(200,168,75,0.05)'
        }}/>

        {/* Subtle leaf top-left */}
        <div style={{
          position: 'absolute', top: '24px', left: '24px', opacity: 0.07
        }}>
          <svg width="90" height="90" viewBox="0 0 80 80">
            <ellipse cx="40" cy="40" rx="30" ry="18"
              fill="#2d6a2d" transform="rotate(-30 40 40)"/>
            <ellipse cx="40" cy="40" rx="30" ry="18"
              fill="#2d6a2d" transform="rotate(30 40 40)"/>
            <ellipse cx="40" cy="40" rx="30" ry="18"
              fill="#2d6a2d" transform="rotate(90 40 40)"/>
          </svg>
        </div>

        {/* Subtle leaf bottom-right */}
        <div style={{
          position: 'absolute', bottom: '24px', right: '24px', opacity: 0.07
        }}>
          <svg width="90" height="90" viewBox="0 0 80 80">
            <ellipse cx="40" cy="40" rx="30" ry="18"
              fill="#c8a84b" transform="rotate(-30 40 40)"/>
            <ellipse cx="40" cy="40" rx="30" ry="18"
              fill="#c8a84b" transform="rotate(30 40 40)"/>
            <ellipse cx="40" cy="40" rx="30" ry="18"
              fill="#c8a84b" transform="rotate(90 40 40)"/>
          </svg>
        </div>

        {/* Form card */}
        <div style={{
          width: '100%',
          maxWidth: '420px',
          position: 'relative'
        }}>

          {/* Heading */}
          <div style={{ marginBottom: '44px' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '10px',
              letterSpacing: '-0.5px',
              lineHeight: 1.2
            }}>
              Welcome back
            </h1>
            <p style={{
              fontSize: '17px',
              color: '#888',
              lineHeight: 1.5
            }}>
              Sign in to access your POS system
            </p>
          </div>

          {/* Username field */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '600',
              color: '#444',
              marginBottom: '8px'
            }}>
              Username
            </label>
            <input
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoFocus
              style={{
                width: '100%',
                padding: '15px 18px',
                fontSize: '16px',
                border: '1.5px solid #dde8d8',
                borderRadius: '12px',
                outline: 'none',
                color: '#1a1a1a',
                background: '#ffffff',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxSizing: 'border-box',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
              onFocus={e => {
                e.target.style.borderColor = '#2d6a2d'
                e.target.style.boxShadow = '0 0 0 3px rgba(45,106,45,0.1)'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#dde8d8'
                e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
              }}
            />
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '600',
              color: '#444',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%',
                padding: '15px 18px',
                fontSize: '16px',
                border: '1.5px solid #dde8d8',
                borderRadius: '12px',
                outline: 'none',
                color: '#1a1a1a',
                background: '#ffffff',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxSizing: 'border-box',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
              onFocus={e => {
                e.target.style.borderColor = '#2d6a2d'
                e.target.style.boxShadow = '0 0 0 3px rgba(45,106,45,0.1)'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#dde8d8'
                e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
              }}
            />
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              padding: '14px 18px',
              background: '#FCEBEB',
              color: '#A32D2D',
              borderRadius: '10px',
              fontSize: '15px',
              marginBottom: '22px',
              border: '1px solid #f5c6c3',
              lineHeight: 1.5
            }}>
              {error}
            </div>
          )}

          {/* Sign in button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '17px',
              fontWeight: '600',
              background: '#1a3c1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.3px',
              opacity: loading ? 0.75 : 1,
              transition: 'background 0.15s, transform 0.1s',
              boxShadow: '0 2px 8px rgba(26,60,26,0.25)'
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.target.style.background = '#2d6a2d'
                e.target.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.target.style.background = '#1a3c1a'
                e.target.style.transform = 'translateY(0)'
              }
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

          {/* Divider */}
          <div style={{
            margin: '32px 0 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#2a2a22' }}/>
            <div style={{ fontSize: '12px', color: '#aaaaaa', letterSpacing: '0.5px' }}>
              VIJAYA SREE TRADERS
            </div>
            <div style={{ flex: 1, height: '1px', background: '#2a2a22' }}/>
          </div>

          {/* Footer info */}
          <div style={{
            textAlign: 'center',
            lineHeight: 1.8
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#2a2a22'
            }}>
              Pesticides & Fertilizers
            </div>
            <div style={{
              fontSize: '14px',
              color: '#888',
              marginTop: '4px'
            }}>
              Prop: U Rama Mohan
            </div>
            <div style={{
              fontSize: '13px',
              color: '#bbb',
              marginTop: '4px'
            }}>
              Madanapalli, Andhra Pradesh
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
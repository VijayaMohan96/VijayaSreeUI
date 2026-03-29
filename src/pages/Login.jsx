import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  body { 
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  .login-root {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background: #0a1a0a;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .mobile-header {
    display: none;
    background: linear-gradient(160deg, #1a3c1a 0%, #2d6a2d 100%);
    padding: 32px 24px 28px;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  .mobile-header-text .shop-name {
    font-size: 20px; font-weight: 800;
    color: #c8a84b; letter-spacing: 2px;
    font-family: Georgia, serif;
  }
  .mobile-header-text .shop-sub {
    font-size: 11px; color: rgba(255,255,255,0.5);
    letter-spacing: 3px; margin-top: 2px; font-weight: 600;
  }
  .mobile-header-text .shop-type {
    font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 4px;
  }

  .login-body { flex: 1; display: flex; min-height: 0; }

  .left-panel {
    width: 380px; flex-shrink: 0;
    background: linear-gradient(160deg, #1a3c1a 0%, #2d6a2d 55%, #3d2b1f 100%);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 48px 32px; position: relative; overflow: hidden;
  }
  .left-panel .deco1 {
    position: absolute; top: -80px; right: -80px;
    width: 280px; height: 280px; border-radius: 50%;
    background: rgba(200,168,75,0.07);
  }
  .left-panel .deco2 {
    position: absolute; bottom: -60px; left: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(74,158,74,0.09);
  }
  .left-panel .shop-name {
    font-size: 26px; font-weight: 800; color: #c8a84b;
    letter-spacing: 3px; font-family: Georgia, serif; margin-top: 28px;
  }
  .left-panel .shop-sub {
    font-size: 13px; color: rgba(255,255,255,0.5);
    letter-spacing: 4px; margin-top: 6px; font-weight: 600;
  }
  .left-panel .divider {
    width: 40px; height: 1.5px;
    background: #c8a84b; margin: 14px auto; opacity: 0.5;
  }
  .left-panel .shop-type {
    font-size: 14px; color: rgba(255,255,255,0.6);
    text-align: center; line-height: 1.7;
  }
  .left-panel .location {
    margin-top: 28px; font-size: 12px;
    color: rgba(255,255,255,0.3); letter-spacing: 0.8px; text-align: center;
  }

  .right-panel {
    flex: 1;
    background: linear-gradient(135deg, #f7f9f4 0%, #f0f4ec 50%, #f8f6f0 100%);
    display: flex; align-items: center; justify-content: center;
    padding: 48px 32px; position: relative; overflow: hidden; min-height: 0;
  }
  .right-panel .deco-r1 {
    position: absolute; top: -100px; right: -100px;
    width: 350px; height: 350px; border-radius: 50%;
    background: rgba(74,158,74,0.05); pointer-events: none;
  }
  .right-panel .deco-r2 {
    position: absolute; bottom: -80px; left: -80px;
    width: 300px; height: 300px; border-radius: 50%;
    background: rgba(200,168,75,0.05); pointer-events: none;
  }

  .form-card { width: 100%; max-width: 420px; position: relative; z-index: 1; }

  .form-heading { margin-bottom: 40px; }
  .form-heading h1 {
    font-size: clamp(28px, 5vw, 36px); font-weight: 700;
    color: #1a1a1a; letter-spacing: -0.5px; line-height: 1.2;
  }
  .form-heading p { font-size: 16px; color: #888; margin-top: 8px; line-height: 1.5; }

  .field-group { margin-bottom: 20px; }
  .field-label {
    display: block; font-size: 15px; font-weight: 600;
    color: #444; margin-bottom: 8px;
  }
  .field-input {
    width: 100%; padding: 15px 18px;
    font-size: 16px;
    border: 1.5px solid #dde8d8; border-radius: 12px;
    outline: none; color: #1a1a1a; background: #ffffff;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    -webkit-appearance: none; appearance: none;
  }
  .field-input:focus {
    border-color: #2d6a2d;
    box-shadow: 0 0 0 3px rgba(45,106,45,0.12);
  }

  .error-box {
    padding: 13px 16px; background: #FCEBEB; color: #A32D2D;
    border-radius: 10px; font-size: 15px; margin-bottom: 20px;
    border: 1px solid #f5c6c3; line-height: 1.5;
  }

  .sign-in-btn {
    width: 100%; padding: 16px; font-size: 17px; font-weight: 600;
    background: #1a3c1a; color: #ffffff; border: none; border-radius: 12px;
    cursor: pointer; letter-spacing: 0.3px;
    transition: background 0.15s, transform 0.1s, opacity 0.15s;
    box-shadow: 0 2px 8px rgba(26,60,26,0.25);
    -webkit-appearance: none; touch-action: manipulation;
  }
  .sign-in-btn:hover:not(:disabled) { background: #2d6a2d; transform: translateY(-1px); }
  .sign-in-btn:active:not(:disabled) { transform: translateY(0); }
  .sign-in-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .form-divider { margin: 28px 0 20px; display: flex; align-items: center; gap: 12px; }
  .form-divider-line { flex: 1; height: 1px; background: #d8e4d4; }
  .form-divider-text { font-size: 11px; color: #aaa; letter-spacing: 0.5px; white-space: nowrap; }

  .form-footer { text-align: center; line-height: 1.8; }
  .form-footer .f1 { font-size: 15px; font-weight: 600; color: #2a2a22; }
  .form-footer .f2 { font-size: 13px; color: #888; margin-top: 2px; }
  .form-footer .f3 { font-size: 12px; color: #bbb; margin-top: 2px; }

  @media (max-width: 640px) {
    .left-panel { display: none; }
    .mobile-header { display: flex; }
    .login-body { flex-direction: column; }
    .right-panel { flex: 1; padding: 32px 20px 40px; align-items: flex-start; overflow-y: auto; }
    .form-card { max-width: 100%; padding-bottom: 24px; }
    .form-heading { margin-bottom: 28px; }
    .form-heading h1 { font-size: 28px; }
    .field-input { padding: 14px 16px; font-size: 16px; }
    .sign-in-btn { padding: 16px; font-size: 16px; }
  }

  @media (min-width: 641px) and (max-width: 900px) {
    .left-panel { width: 280px; padding: 32px 24px; }
    .left-panel .shop-name { font-size: 20px; }
    .right-panel { padding: 32px 24px; }
  }
`

function VSTLogo({ size = 120 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.43
  const sw = size * 0.065, circ = 2 * Math.PI * r
  const big = circ * 0.63, small = circ * 0.37
  const fs1 = size * 0.175, fs2 = size * 0.215
  const off1 = size * 0.265, off2 = size * 0.27

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4a9e4a" strokeWidth={sw}
        strokeDasharray={`${big} ${small}`} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#c8a84b" strokeWidth={sw}
        strokeDasharray={`${small} ${big}`} strokeDashoffset={-big} strokeLinecap="round"/>
      <text x={cx} y={cy - off1} fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="rgba(255,255,255,0.85)" textAnchor="middle" dominantBaseline="central">V</text>
      <text x={cx - off2} y={cy} fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="#4a9e4a" textAnchor="middle" dominantBaseline="central">V</text>
      <text x={cx} y={cy} fontFamily="Georgia,serif" fontSize={fs2} fontWeight="700"
        fill="#ffffff" textAnchor="middle" dominantBaseline="central">S</text>
      <text x={cx + off2} y={cy} fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="#c8a84b" textAnchor="middle" dominantBaseline="central">T</text>
      <text x={cx} y={cy + off1} fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="rgba(255,255,255,0.85)" textAnchor="middle" dominantBaseline="central">T</text>
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
    if (localStorage.getItem('token')) navigate('/dashboard', { replace: true })
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
        id: data.id, username: data.username, name: data.name,
        role: data.role, roleId: data.roleId, permissions: data.permissions || []
      }))
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid username or password')
    } finally { setLoading(false) }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">

        <div className="mobile-header">
          <VSTLogo size={64} />
          <div className="mobile-header-text">
            <div className="shop-name">VIJAYASREE</div>
            <div className="shop-sub">TRADERS</div>
            <div className="shop-type">Pesticides & Fertilizers</div>
          </div>
        </div>

        <div className="login-body">

          <div className="left-panel">
            <div className="deco1"/><div className="deco2"/>
            <VSTLogo size={140} />
            <div className="shop-name">VIJAYASREE</div>
            <div className="shop-sub">TRADERS</div>
            <div className="divider"/>
            <div className="shop-type">Pesticides & Fertilizers</div>
            <div style={{ marginTop: '44px', opacity: 0.18 }}>
              <svg width="160" height="100" viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="90" width="160" height="30" fill="#c8a84b" rx="2"/>
                <line x1="30" y1="90" x2="30" y2="50" stroke="#4a9e4a" strokeWidth="3" strokeLinecap="round"/>
                <ellipse cx="30" cy="45" rx="14" ry="10" fill="#4a9e4a" transform="rotate(-20 30 45)"/>
                <ellipse cx="22" cy="60" rx="12" ry="8" fill="#4a9e4a" transform="rotate(20 22 60)"/>
                <line x1="80" y1="90" x2="80" y2="30" stroke="#4a9e4a" strokeWidth="3" strokeLinecap="round"/>
                <ellipse cx="80" cy="25" rx="16" ry="12" fill="#4a9e4a" transform="rotate(-10 80 25)"/>
                <ellipse cx="68" cy="48" rx="13" ry="9" fill="#4a9e4a" transform="rotate(15 68 48)"/>
                <ellipse cx="92" cy="52" rx="13" ry="9" fill="#4a9e4a" transform="rotate(-15 92 52)"/>
                <line x1="130" y1="90" x2="130" y2="55" stroke="#4a9e4a" strokeWidth="3" strokeLinecap="round"/>
                <ellipse cx="130" cy="50" rx="14" ry="10" fill="#4a9e4a" transform="rotate(15 130 50)"/>
                <ellipse cx="140" cy="65" rx="12" ry="8" fill="#4a9e4a" transform="rotate(-20 140 65)"/>
                <circle cx="140" cy="20" r="10" fill="#c8a84b"/>
              </svg>
            </div>
            <div className="location">Madanapalli, Andhra Pradesh</div>
          </div>

          <div className="right-panel">
            <div className="deco-r1"/><div className="deco-r2"/>
            <div className="form-card">

              <div className="form-heading">
                <h1>Welcome back</h1>
                <p>Sign in to access your POS system</p>
              </div>

              <div className="field-group">
                <label className="field-label">Username</label>
                <input
                  className="field-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>

              <div className="field-group" style={{ marginBottom: '28px' }}>
                <label className="field-label">Password</label>
                <input
                  className="field-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  autoComplete="current-password"
                />
              </div>

              {error && <div className="error-box">{error}</div>}

              <button className="sign-in-btn" onClick={handleLogin} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>

              <div className="form-divider">
                <div className="form-divider-line"/>
                <div className="form-divider-text">VIJAYA SREE TRADERS</div>
                <div className="form-divider-line"/>
              </div>

              <div className="form-footer">
                <div className="f1">Pesticides & Fertilizers</div>
                <div className="f2">Prop: U Rama Mohan</div>
                <div className="f3">Madanapalli, Andhra Pradesh</div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  )
}
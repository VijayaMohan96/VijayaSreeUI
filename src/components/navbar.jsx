import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬛' },
  { to: '/checkout', label: 'POS', icon: '🧾' },
  { to: '/print-station', label: 'Print Station', icon: '🖨️' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/customers', label: 'Customers', icon: '👤' },
  { to: '/reports', label: 'Reports', icon: '📈' },
  { to: '/stock', label: 'Stock', icon: '📊' },
  { to: '/purchases', label: 'Purchases', icon: '🏪' },
]

const adminLinks = [
  { to: '/roles', label: 'Roles', icon: '🔐' },
  { to: '/users', label: 'Users', icon: '👥' },
   { to: '/categories', label: 'Categories', icon: '🗂️' }, 
]

export default function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const perms = user.permissions || []
  const isAdmin = user.role === 'Admin'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const canSee = (to) => {
    const map = {
      '/checkout': 'SALES_CHECKOUT',
      '/print-station': 'PRINT_STATION',
      '/products': 'PRODUCT_VIEW',
      '/customers': 'SALES_CHECKOUT',
      '/reports': 'REPORTS_DAILY',
      '/stock': 'STOCK_VIEW',
      '/purchases': 'STOCK_PURCHASE',
      '/dashboard': null,
    }
    const perm = map[to]
    return !perm || perms.includes(perm)
  }

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '6px 11px', borderRadius: 'var(--radius-sm)',
    fontSize: '13px', fontWeight: isActive ? '600' : '400',
    color: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.7)',
    background: isActive ? 'rgba(200,168,75,0.15)' : 'transparent',
    textDecoration: 'none', transition: 'all 0.15s',
    borderBottom: isActive ? '2px solid var(--gold)' : '2px solid transparent',
    whiteSpace: 'nowrap'
  })

  return (
    <nav style={{
      background: 'var(--green-dark)',
      borderBottom: '3px solid var(--gold)',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      height: '54px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>

      {/* VST Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginRight: '12px', cursor: 'pointer', flexShrink: 0
      }} onClick={() => navigate('/dashboard')}>
        <svg width="36" height="36" viewBox="0 0 160 160"
          xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="70" fill="none" stroke="#4a9e4a"
            strokeWidth="10" strokeDasharray="280 160"
            strokeDashoffset="0" strokeLinecap="round"/>
          <circle cx="80" cy="80" r="70" fill="none" stroke="#c8a84b"
            strokeWidth="10" strokeDasharray="160 280"
            strokeDashoffset="-280" strokeLinecap="round"/>
          <text x="80" y="38" fontFamily="Georgia,serif" fontSize="22"
            fontWeight="700" fill="rgba(255,255,255,0.85)"
            textAnchor="middle" dominantBaseline="central">V</text>
          <text x="38" y="82" fontFamily="Georgia,serif" fontSize="22"
            fontWeight="700" fill="#4a9e4a"
            textAnchor="middle" dominantBaseline="central">V</text>
          <text x="80" y="82" fontFamily="Georgia,serif" fontSize="28"
            fontWeight="700" fill="#ffffff"
            textAnchor="middle" dominantBaseline="central">S</text>
          <text x="122" y="82" fontFamily="Georgia,serif" fontSize="22"
            fontWeight="700" fill="#c8a84b"
            textAnchor="middle" dominantBaseline="central">T</text>
          <text x="80" y="124" fontFamily="Georgia,serif" fontSize="22"
            fontWeight="700" fill="rgba(255,255,255,0.85)"
            textAnchor="middle" dominantBaseline="central">T</text>
        </svg>
        <div>
          <div style={{
            color: 'var(--gold)', fontWeight: '700',
            fontSize: '13px', lineHeight: 1
          }}>
            VijayaSreeTraders
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '10px', marginTop: '1px'
          }}>
            Pesticides & Seeds
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{
        display: 'flex', gap: '2px', flex: 1,
        overflowX: 'auto', scrollbarWidth: 'none'
      }}>
        {links.filter(l => canSee(l.to)).map(({ to, label, icon }) => (
          <NavLink key={to} to={to} style={navLinkStyle}>
            <span style={{ fontSize: '13px' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
        {isAdmin && adminLinks.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} style={navLinkStyle}>
            <span style={{ fontSize: '13px' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>

      {/* User info + logout */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '10px', flexShrink: 0
      }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            color: 'var(--white)', fontSize: '13px',
            fontWeight: '500', lineHeight: 1
          }}>
            {user.name}
          </div>
          <div style={{
            color: 'var(--gold)', fontSize: '11px',
            background: 'rgba(200,168,75,0.15)',
            padding: '1px 7px', borderRadius: '10px',
            display: 'inline-block', marginTop: '2px'
          }}>
            {user.role}
          </div>
        </div>
        <button onClick={handleLogout} style={{
          padding: '6px 14px', background: 'transparent',
          color: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 'var(--radius-sm)', fontSize: '12px',
          cursor: 'pointer'
        }}>
          Logout
        </button>
      </div>
    </nav>
  )
}
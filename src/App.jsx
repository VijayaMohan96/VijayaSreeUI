import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navbar from './components/navbar'

// Lazy load all pages — only loads when user navigates to that page
const LandingPage = lazy(() => import('./pages/LandingPage'))
const Login       = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Categories = lazy(() => import('./pages/Categories'))
const Products = lazy(() => import('./pages/Products'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Reports = lazy(() => import('./pages/Reports'))
const Stock = lazy(() => import('./pages/Stock'))
const Roles = lazy(() => import('./pages/Roles'))
const Users = lazy(() => import('./pages/Users'))
const Customers = lazy(() => import('./pages/Customers'))
const PrintStation = lazy(() => import('./pages/PrintStation'))

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/" replace />
  return children
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div style={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {children}
      </div>
    </>
  )
}

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid #f0f0f0',
        borderTop: '3px solid #1a3c1a',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <p style={{ color: '#888', fontSize: '14px' }}>Loading...</p>
    </div>
  )
}

const routes = [
  { path: '/dashboard', el: <Dashboard /> },
  { path: '/categories', el: <Categories /> },
  { path: '/products', el: <Products /> },
  { path: '/checkout', el: <Checkout /> },
  { path: '/reports', el: <Reports /> },
  { path: '/stock', el: <Stock /> },
  { path: '/roles', el: <Roles /> },
  { path: '/users', el: <Users /> },
  { path: '/customers', el: <Customers /> },
  { path: '/print-station', el: <PrintStation /> },
]

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={
            localStorage.getItem('token')
              ? <Navigate to="/dashboard" replace />
              : <LandingPage />
          } />
          <Route path="/login" element={
            localStorage.getItem('token')
              ? <Navigate to="/dashboard" replace />
              : <Login />
          } />

          {routes.map(({ path, el }) => (
            <Route key={path} path={path} element={
              <ProtectedRoute>
                <Layout>{el}</Layout>
              </ProtectedRoute>
            } />
          ))}

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
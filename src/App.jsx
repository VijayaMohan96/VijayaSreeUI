import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import Products from './pages/Products'
import Checkout from './pages/Checkout'
import Reports from './pages/Reports'
import Stock from './pages/Stock'
import Roles from './pages/Roles'
import Users from './pages/Users'
import Customers from './pages/Customers'

const isLoggedIn = () => !!localStorage.getItem('token')

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div
        className="page-content"
        style={{
          padding: '24px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {children}
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isLoggedIn() ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {[
          { path: '/dashboard', el: <Dashboard /> },
          { path: '/categories', el: <Categories /> },
          { path: '/products', el: <Products /> },
          { path: '/checkout', el: <Checkout /> },
          { path: '/reports', el: <Reports /> },
          { path: '/stock', el: <Stock /> },
          { path: '/roles', el: <Roles /> },
          { path: '/users', el: <Users /> },
          { path: '/customers', el: <Customers /> },
        ].map(({ path, el }) => (
          <Route key={path} path={path} element={
            <ProtectedRoute><Layout>{el}</Layout></ProtectedRoute>
          } />
        ))}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
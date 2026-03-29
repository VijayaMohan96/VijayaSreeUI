import { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../api/axios'
import ProductPlaceholder from '../components/ProductPlaceholder'

const empty = {
  name: '', sku: '', categoryId: '', company: '',
  price: '', stockQty: '', lowStockThreshold: '',
  notes: '', imageUrl: ''
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [companies, setCompanies] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 50

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const perms = user.permissions || []
  const canCreate = perms.includes('PRODUCT_CREATE')
  const canEdit = perms.includes('PRODUCT_EDIT')
  const canDelete = perms.includes('PRODUCT_DELETE')
  const canImport = perms.includes('PRODUCT_IMPORT')
  const canImage = perms.includes('PRODUCT_IMAGE_UPLOAD')

  useEffect(() => {
    fetchCategories()
    fetchCompanies()
  }, [])

  useEffect(() => {
    fetchProducts(0)
  }, [search, filterCat, filterCompany])

  const fetchProducts = async (page = 0) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
      })
      if (search) params.append('search', search)
      if (filterCompany) params.append('company', filterCompany)
      if (filterCat) params.append('categoryId', filterCat)

      const res = await api.get(`/products?${params}`)
      if (res.data) {
        const data = res.data
        setProducts(Array.isArray(data) ? data : (data.products || []))
        setCurrentPage(data.currentPage || 0)
        setTotalPages(data.totalPages || 0)
        setTotalItems(data.totalItems || 0)
      }
    } catch {}
    finally { setLoading(false) }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(Array.isArray(res.data) ? res.data : [])
    } catch {}
  }

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/products/companies')
      setCompanies(Array.isArray(res.data) ? res.data : [])
    } catch {}
  }

  const flash = (text, type = 'ok') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 4000)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.sku || !form.categoryId || !form.price ||
        form.stockQty === '' || !form.lowStockThreshold)
      return flash('Please fill all required fields', 'err')
    setSaving(true)
    try {
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        price: parseFloat(form.price),
        stockQty: parseInt(form.stockQty),
        lowStockThreshold: parseInt(form.lowStockThreshold),
      }
      if (editId) {
        await api.put(`/products/${editId}`, payload)
        flash('Product updated!')
      } else {
        await api.post('/products', payload)
        flash('Product created!')
      }
      setForm(empty); setEditId(null); setShowForm(false)
      fetchProducts(currentPage)
      fetchCompanies()
    } catch (e) { flash(e.message, 'err') }
    finally { setSaving(false) }
  }

  const handleEdit = (p) => {
    const cat = categories.find(c => c.name === p.categoryName)
    setForm({
      name: p.name, sku: p.sku,
      company: p.company || '',
      categoryId: cat?.id || '',
      price: p.price, stockQty: p.stockQty,
      lowStockThreshold: p.lowStockThreshold,
      notes: p.notes || '', imageUrl: p.imageUrl || ''
    })
    setEditId(p.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      flash('Product deleted')
      fetchProducts(currentPage)
    } catch (e) { flash(e.message, 'err') }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8081/api'}/images/upload`, formData,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
      )
      const url = res.data?.data?.url || res.data?.url
      setForm(prev => ({ ...prev, imageUrl: url }))
      flash('Image uploaded!')
    } catch (e) { flash('Image upload failed', 'err') }
    finally { setImageUploading(false); e.target.value = '' }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.xlsx'))
      return flash('Only .xlsx files are supported', 'err')
    setImporting(true)
    setImportResult(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8081/api'}/import/products`, formData,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
      )
      const result = res.data?.data || res.data
      setImportResult(result)
      fetchProducts(0)
      fetchCompanies()
    } catch (e) {
      setImportResult({ successCount: 0, failedCount: 1, errors: [e.message] })
    } finally { setImporting(false); e.target.value = '' }
  }

  const parseErrorRow = (errMsg) => {
    const prefilled = {}
    if (!errMsg) return prefilled
    const skuMatch = errMsg.match(/SKU[:\s]+([A-Z0-9\-]+)/i)
    if (skuMatch) prefilled.sku = skuMatch[1]
    const nameMatch = errMsg.match(/product[:\s]+"?([^"]+)"?/i)
    if (nameMatch) prefilled.name = nameMatch[1]
    return prefilled
  }

  const stockBadge = (status) => {
    if (status === 'OUT_OF_STOCK') return { bg: 'var(--danger-pale)', color: 'var(--danger)', label: 'Out of stock' }
    if (status === 'LOW_STOCK') return { bg: 'var(--warning-pale)', color: 'var(--warning)', label: 'Low stock' }
    return { bg: 'var(--green-pale)', color: 'var(--green-dark)', label: 'In stock' }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">📦 Products</h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {canImport && (
            <label style={{
              padding: '9px 16px', background: 'var(--gold-pale)',
              color: 'var(--brown)', border: '1px solid var(--gold)',
              borderRadius: 'var(--radius-sm)', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap'
            }}>
              {importing ? '⏳ Importing...' : '📥 Import Excel'}
              <input type="file" accept=".xlsx" onChange={handleImport}
                style={{ display: 'none' }} disabled={importing} />
            </label>
          )}
          {canCreate && (
            <button className="btn-primary" onClick={() => {
              setShowForm(!showForm); setForm(empty); setEditId(null)
            }}>
              {showForm ? 'Cancel' : '+ Add Product'}
            </button>
          )}
        </div>
      </div>

      {/* Flash message */}
      {msg.text && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px',
          background: msg.type === 'err' ? 'var(--danger-pale)' : 'var(--green-pale)',
          color: msg.type === 'err' ? 'var(--danger)' : 'var(--green-dark)',
          border: `1px solid ${msg.type === 'err' ? '#f5c6c3' : '#b8ddb8'}`
        }}>{msg.text}</div>
      )}

      {/* Import result */}
      {importResult && (
        <div style={{
          borderRadius: 'var(--radius-md)', marginBottom: '16px',
          border: `1px solid ${importResult.failedCount === 0 ? '#b8ddb8' : 'var(--gold)'}`,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 16px',
            background: importResult.failedCount === 0 ? 'var(--green-pale)' : 'var(--gold-pale)',
            display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: '700', color: 'var(--gray-800)' }}>
                Import complete
              </span>
              <span style={{ marginLeft: '10px', fontSize: '13px' }}>
                <span style={{ color: 'var(--green-dark)', fontWeight: '600' }}>
                  ✓ {importResult.successCount} imported
                </span>
                {importResult.failedCount > 0 && (
                  <span style={{ color: 'var(--danger)', fontWeight: '600', marginLeft: '10px' }}>
                    ✗ {importResult.failedCount} failed
                  </span>
                )}
              </span>
            </div>
            <button onClick={() => setImportResult(null)} style={{
              background: 'transparent', border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-sm)', padding: '4px 12px',
              fontSize: '12px', cursor: 'pointer', color: 'var(--gray-600)'
            }}>Dismiss</button>
          </div>
          {(importResult.errors || []).length > 0 && (
            <div style={{ background: 'var(--white)', padding: '12px 16px' }}>
              <div style={{
                fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
                letterSpacing: '0.5px', color: 'var(--gray-400)', marginBottom: '10px'
              }}>Failed rows — click to fix in form</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(importResult.errors || []).map((err, i) => {
                  const prefilled = parseErrorRow(err)
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', background: 'var(--danger-pale)',
                      borderRadius: 'var(--radius-sm)', border: '1px solid #f5c6c3'
                    }}>
                      <span style={{ fontSize: '16px' }}>⚠️</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--danger)' }}>
                          {err}
                        </div>
                      </div>
                      {canCreate && (
                        <button onClick={() => {
                          setForm({ ...empty, ...prefilled })
                          setEditId(null); setShowForm(true)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }} style={{
                          padding: '5px 14px', background: 'var(--white)',
                          color: 'var(--danger)', border: '1px solid var(--danger)',
                          borderRadius: 'var(--radius-sm)', fontSize: '12px',
                          fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap'
                        }}>Fix in form</button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Excel format guide */}
      {canImport && products.length === 0 && !showForm && (
        <div style={{
          background: 'var(--gold-pale)', border: '1px solid var(--gold)',
          borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '20px'
        }}>
          <div style={{ fontWeight: '700', color: 'var(--brown)', marginBottom: '8px' }}>
            📋 Excel Import Format
          </div>
          <div style={{ fontSize: '13px', color: 'var(--brown-mid)', marginBottom: '10px' }}>
            Your Excel file must have these column headers in Row 1:
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '4px', marginBottom: '10px'
          }}>
            {['name', 'sku', 'category', 'price', 'stock',
              'lowStockThreshold', 'notes', 'imageUrl', 'company'].map(h => (
              <div key={h} style={{
                padding: '6px 8px', background: 'var(--brown)',
                color: 'var(--gold)', borderRadius: '4px',
                fontSize: '11px', fontWeight: '700', textAlign: 'center'
              }}>{h}</div>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--brown-mid)' }}>
            ✓ Price as number only &nbsp;·&nbsp;
            ✓ SKU must be unique &nbsp;·&nbsp;
            ✓ Notes, imageUrl, company optional &nbsp;·&nbsp;
            ✓ Save as .xlsx
          </div>
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (canCreate || canEdit) && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>
            {editId ? '✏️ Edit Product' : '+ New Product'}
          </h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input placeholder="e.g. Chlorpyrifos 500ml"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input placeholder="e.g. PEST-001"
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })} />
            </div>
          </div>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Company</label>
              <input placeholder="e.g. Bayer, Syngenta, UPL"
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input type="number" placeholder="0.00" min="0" step="0.01"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Stock Qty *</label>
              <input type="number" placeholder="0" min="0"
                value={form.stockQty}
                onChange={e => setForm({ ...form, stockQty: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Low Stock Threshold *</label>
              <input type="number" placeholder="e.g. 5" min="1"
                value={form.lowStockThreshold}
                onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Usage Directions / Notes</label>
            <textarea
              placeholder="e.g. Mix 2ml per litre of water..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          {canImage && (
            <div className="form-group">
              <label className="form-label">Product Image</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="Product" style={{
                    width: '64px', height: '64px', objectFit: 'cover',
                    borderRadius: '8px', border: '1px solid var(--gray-200)'
                  }} />
                )}
                <label style={{
                  padding: '9px 16px', background: 'var(--gray-100)',
                  border: '1px dashed var(--gray-400)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px', color: 'var(--gray-600)', cursor: 'pointer'
                }}>
                  {imageUploading ? 'Uploading...' : form.imageUrl ? '🔄 Change Image' : '📷 Upload Image'}
                  <input type="file" accept="image/*" onChange={handleImageUpload}
                    style={{ display: 'none' }} disabled={imageUploading} />
                </label>
                {form.imageUrl && (
                  <button onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--danger)', cursor: 'pointer', fontSize: '13px'
                    }}>Remove</button>
                )}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editId ? 'Update Product' : 'Save Product'}
            </button>
            <button className="btn-secondary" onClick={() => {
              setShowForm(false); setForm(empty); setEditId(null)
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '160px' }}
        />
        <select value={filterCat}
          onChange={e => { setFilterCat(e.target.value); setCurrentPage(0) }}
          style={{ minWidth: '130px', flex: 1 }}>
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={filterCompany}
          onChange={e => { setFilterCompany(e.target.value); setCurrentPage(0) }}
          style={{ minWidth: '130px', flex: 1 }}>
          <option value="">All Companies</option>
          {companies.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Product table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>🌱</div>
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📦</div>
            <div style={{ fontWeight: '600', color: 'var(--gray-600)', marginBottom: '8px' }}>
              No products found
            </div>
            <div style={{ fontSize: '13px', marginBottom: '16px' }}>
              {canImport
                ? 'Import your products from Excel or add them one by one'
                : 'No products have been added yet'}
            </div>
            {canCreate && (
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                + Add First Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', flexWrap: 'wrap', gap: '8px',
              borderBottom: '1px solid var(--gray-100)'
            }}>
              <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>
                Showing {products.length} of {totalItems} product{totalItems !== 1 ? 's' : ''}
                {filterCompany && ` · ${filterCompany}`}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>
                Page {currentPage + 1} of {totalPages || 1}
              </span>
            </div>

            {/* Scrollable table wrapper */}
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="hide-mobile">Company</th>
                    <th className="hide-mobile">SKU</th>
                    <th className="hide-mobile">Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th className="hide-mobile">Status</th>
                    {(canEdit || canDelete) && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const badge = stockBadge(p.stockStatus)
                    return (
                      <>
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt="" loading="lazy" style={{
                                  width: '40px', height: '40px', borderRadius: '6px',
                                  objectFit: 'cover', flexShrink: 0
                                }} />
                              ) : (
                                <ProductPlaceholder size={40} />
                              )}
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '13px' }}>
                                  {p.name}
                                </div>
                                {/* Show company + category on mobile under name */}
                                <div className="mobile-only" style={{
                                  fontSize: '11px', color: 'var(--gray-400)',
                                  marginTop: '2px'
                                }}>
                                  {p.categoryName}
                                  {p.company && ` · ${p.company}`}
                                </div>
                                {p.notes && (
                                  <button
                                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                                    style={{
                                      background: 'none', border: 'none',
                                      color: 'var(--green-mid)', fontSize: '11px',
                                      cursor: 'pointer', padding: '2px 0'
                                    }}>
                                    {expandedId === p.id ? '▲ Hide' : '▼ Directions'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="hide-mobile">
                            {p.company ? (
                              <span style={{
                                padding: '3px 9px', borderRadius: '20px', fontSize: '12px',
                                background: 'var(--info-pale)', color: 'var(--info)',
                                fontWeight: '500'
                              }}>{p.company}</span>
                            ) : (
                              <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>—</span>
                            )}
                          </td>
                          <td className="hide-mobile" style={{
                            fontFamily: 'monospace', fontSize: '12px', color: 'var(--gray-400)'
                          }}>
                            {p.sku}
                          </td>
                          <td className="hide-mobile">
                            <span style={{
                              padding: '3px 9px', borderRadius: '20px', fontSize: '12px',
                              background: 'var(--green-pale)', color: 'var(--green-dark)',
                              fontWeight: '500'
                            }}>{p.categoryName}</span>
                          </td>
                          <td style={{ fontWeight: '700', color: 'var(--green-mid)' }}>
                            ₹{parseFloat(p.price).toFixed(2)}
                          </td>
                          <td style={{ fontWeight: '600' }}>{p.stockQty}</td>
                          <td className="hide-mobile">
                            <span style={{
                              padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                              fontWeight: '600', background: badge.bg, color: badge.color
                            }}>{badge.label}</span>
                          </td>
                          {(canEdit || canDelete) && (
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {canEdit && (
                                  <button className="btn-secondary btn-sm"
                                    onClick={() => handleEdit(p)}>Edit</button>
                                )}
                                {canDelete && (
                                  <button className="btn-danger btn-sm"
                                    onClick={() => handleDelete(p.id)}>Del</button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                        {expandedId === p.id && p.notes && (
                          <tr key={`notes-${p.id}`}>
                            <td colSpan={8} style={{
                              padding: '0 14px 12px',
                              background: 'var(--off-white)'
                            }}>
                              <div style={{
                                background: 'var(--green-pale)',
                                border: '1px solid #b8ddb8',
                                borderRadius: 'var(--radius-sm)',
                                padding: '10px 14px', fontSize: '13px',
                                color: 'var(--green-dark)', lineHeight: 1.6
                              }}>
                                <strong style={{
                                  fontSize: '11px', textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  Usage Directions:
                                </strong>
                                <p style={{ marginTop: '4px' }}>{p.notes}</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: '6px', padding: '16px', flexWrap: 'wrap',
                borderTop: '1px solid var(--gray-100)'
              }}>
                <button
                  onClick={() => { setCurrentPage(0); fetchProducts(0) }}
                  disabled={currentPage === 0}
                  className="btn-secondary btn-sm">«</button>
                <button
                  onClick={() => {
                    const p = currentPage - 1
                    setCurrentPage(p); fetchProducts(p)
                  }}
                  disabled={currentPage === 0}
                  className="btn-secondary btn-sm">‹ Prev</button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) pageNum = i
                  else if (currentPage < 3) pageNum = i
                  else if (currentPage > totalPages - 3) pageNum = totalPages - 5 + i
                  else pageNum = currentPage - 2 + i
                  return (
                    <button key={pageNum}
                      onClick={() => { setCurrentPage(pageNum); fetchProducts(pageNum) }}
                      style={{
                        padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                        border: '1px solid',
                        background: pageNum === currentPage ? 'var(--green-mid)' : 'var(--white)',
                        color: pageNum === currentPage ? 'var(--white)' : 'var(--gray-600)',
                        borderColor: pageNum === currentPage ? 'var(--green-mid)' : 'var(--gray-200)',
                        fontWeight: pageNum === currentPage ? '700' : '400',
                        cursor: 'pointer', fontSize: '13px'
                      }}>
                      {pageNum + 1}
                    </button>
                  )
                })}

                <button
                  onClick={() => {
                    const p = currentPage + 1
                    setCurrentPage(p); fetchProducts(p)
                  }}
                  disabled={currentPage >= totalPages - 1}
                  className="btn-secondary btn-sm">Next ›</button>
                <button
                  onClick={() => {
                    const p = totalPages - 1
                    setCurrentPage(p); fetchProducts(p)
                  }}
                  disabled={currentPage >= totalPages - 1}
                  className="btn-secondary btn-sm">»</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
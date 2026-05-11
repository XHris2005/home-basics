import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabase'
import AdminLayout from '../AdminLayout/AdminLayout'
import ProductModal from './ProductModal'

function Products() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  async function load() {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(products); return }
    setFiltered(products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    ))
  }, [search, products])

  async function handleDelete(id) {
    await supabase.from('products').delete().eq('id', id)
    setDeleteConfirm(null)
    load()
  }

  async function toggleActive(product) {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    load()
  }

  function openAdd() { setEditingProduct(null); setModalOpen(true) }
  function openEdit(p) { setEditingProduct(p); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditingProduct(null) }
  function onSaved() { closeModal(); load() }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-sub">Manage your product catalog</p>
        </div>
        <button className="admin-btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="admin-table-count">{filtered.length} products</span>
        </div>

        {loading ? (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Retail</th>
                <th>Member</th>
                <th>Wholesale</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                    {product.is_member_product && (
                      <div style={{ fontSize: '11px', color: '#9333ea', marginTop: '2px' }}>Member product</div>
                    )}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{product.categories?.name || '—'}</td>
                  <td>₦{product.retail_price?.toLocaleString()}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {product.member_price ? `₦${product.member_price.toLocaleString()}` : '—'}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {product.wholesale_price ? `₦${product.wholesale_price.toLocaleString()}` : '—'}
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <span
                      className={`status-badge ${product.is_active ? 'status-active' : 'status-inactive'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleActive(product)}
                      title="Click to toggle"
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="admin-icon-btn" onClick={() => openEdit(product)} title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="admin-icon-btn danger" onClick={() => setDeleteConfirm(product)} title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="admin-modal-backdrop">
          <div className="admin-confirm-modal">
            <h3>Delete Product?</h3>
            <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
            <div className="admin-confirm-actions">
              <button className="admin-btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="admin-btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default Products
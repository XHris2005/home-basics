import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabase'
import './Products.css'

function ProductModal({ product, onClose, onSaved }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', category_id: '',
    retail_price: '', wholesale_price: '', member_price: '',
    min_wholesale_qty: 24, stock: '', is_active: true,
    is_member_product: false, images: []
  })
  const [imageUrls, setImageUrls] = useState([''])

  useEffect(() => {
    supabase.from('categories').select('id, name').then(({ data }) => setCategories(data || []))
    if (product) {
      setForm({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        category_id: product.category_id || '',
        retail_price: product.retail_price || '',
        wholesale_price: product.wholesale_price || '',
        member_price: product.member_price || '',
        min_wholesale_qty: product.min_wholesale_qty || 24,
        stock: product.stock || '',
        is_active: product.is_active ?? true,
        is_member_product: product.is_member_product ?? false,
        images: product.images || []
      })
      setImageUrls(product.images?.length ? product.images : [''])
    }
  }, [product])

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  function generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function handleNameChange(e) {
    const val = e.target.value
    set('name', val)
    if (!product) set('slug', generateSlug(val))
  }

  async function handleSave() {
    if (!form.name || !form.retail_price || !form.category_id) {
      alert('Name, category and retail price are required.')
      return
    }
    setLoading(true)

    const images = imageUrls.filter(u => u.trim())
    const payload = {
      ...form,
      retail_price: Number(form.retail_price),
      wholesale_price: form.wholesale_price ? Number(form.wholesale_price) : null,
      member_price: form.member_price ? Number(form.member_price) : null,
      min_wholesale_qty: Number(form.min_wholesale_qty),
      stock: Number(form.stock),
      images,
    }

    if (product) {
      await supabase.from('products').update(payload).eq('id', product.id)
    } else {
      await supabase.from('products').insert([payload])
    }

    setLoading(false)
    onSaved()
  }

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-modal-body">
          {/* Basic Info */}
          <div className="modal-section-title">Basic Info</div>

          <div className="modal-field">
            <label>Product Name *</label>
            <input value={form.name} onChange={handleNameChange} placeholder="e.g. Orekelewa Shea Butter 50g" />
          </div>

          <div className="modal-field">
            <label>Slug</label>
            <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" />
          </div>

          <div className="modal-field">
            <label>Category *</label>
            <select value={form.category_id} onChange={e => set('category_id', e.target.value)}>
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Product description..." />
          </div>

          {/* Pricing */}
          <div className="modal-section-title" style={{ marginTop: '20px' }}>Pricing</div>

          <div className="modal-row">
            <div className="modal-field">
              <label>Retail Price (₦) *</label>
              <input type="number" value={form.retail_price} onChange={e => set('retail_price', e.target.value)} placeholder="0" />
            </div>
            <div className="modal-field">
              <label>Wholesale Price (₦)</label>
              <input type="number" value={form.wholesale_price} onChange={e => set('wholesale_price', e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label>Member Price (₦)</label>
              <input type="number" value={form.member_price} onChange={e => set('member_price', e.target.value)} placeholder="0" />
            </div>
            <div className="modal-field">
              <label>Min Wholesale Qty</label>
              <input type="number" value={form.min_wholesale_qty} onChange={e => set('min_wholesale_qty', e.target.value)} />
            </div>
          </div>

          {/* Stock & Status */}
          <div className="modal-section-title" style={{ marginTop: '20px' }}>Stock & Status</div>

          <div className="modal-row">
            <div className="modal-field">
              <label>Stock Quantity</label>
              <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" />
            </div>
            <div className="modal-field">
              <label>Status</label>
              <select value={form.is_active} onChange={e => set('is_active', e.target.value === 'true')}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-checkbox">
            <input type="checkbox" id="is_member" checked={form.is_member_product}
              onChange={e => set('is_member_product', e.target.checked)} />
            <label htmlFor="is_member">Member product (show member price nudge)</label>
          </div>

          {/* Images */}
          <div className="modal-section-title" style={{ marginTop: '20px' }}>Image URLs (Cloudinary)</div>
          {imageUrls.map((url, i) => (
            <div key={i} className="modal-row" style={{ alignItems: 'center' }}>
              <div className="modal-field" style={{ flex: 1 }}>
                <input
                  value={url}
                  onChange={e => {
                    const updated = [...imageUrls]
                    updated[i] = e.target.value
                    setImageUrls(updated)
                  }}
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>
              {imageUrls.length > 1 && (
                <button className="admin-icon-btn danger" style={{ marginTop: '0', flexShrink: 0 }}
                  onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <button className="admin-btn-secondary" style={{ marginTop: '8px', fontSize: '13px' }}
            onClick={() => setImageUrls([...imageUrls, ''])}>
            + Add Image URL
          </button>
        </div>

        <div className="admin-modal-footer">
          <button className="admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="admin-btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
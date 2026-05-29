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
  const [uploading, setUploading] = useState(false)

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

  async function handleImageUpload(e, index) {
  const file = e.target.files[0]
  if (!file) return
  setUploading(true)
  const data = new FormData()
  data.append('file', file)
  data.append('upload_preset', 'homebasics_products')
  data.append('cloud_name', 'db2a43rey')
  try {
    const res = await fetch('https://api.cloudinary.com/v1_1/db2a43rey/image/upload', {
      method: 'POST',
      body: data
    })
    const json = await res.json()
    if (json.secure_url) {
      const updated = [...imageUrls]
      updated[index] = json.secure_url
      setImageUrls(updated)
    }
  } catch (err) {
    console.error('Upload failed:', err)
  }
  setUploading(false)
}

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
<div className="modal-section-title" style={{ marginTop: '20px' }}>Images</div>
{imageUrls.map((url, i) => (
  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '10px' }}>
    {/* Preview */}
    <div style={{
      width: '56px', height: '56px', borderRadius: '8px', border: '1px solid var(--color-border)',
      background: '#fafafa', flexShrink: 0, overflow: 'hidden', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      {url ? (
        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      )}
    </div>

    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* URL input */}
      <input
        className="modal-field input"
        style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', color: 'var(--color-text)', outline: 'none' }}
        value={url}
        onChange={e => {
          const updated = [...imageUrls]
          updated[i] = e.target.value
          setImageUrls(updated)
        }}
        placeholder="https://res.cloudinary.com/..."
      />
      {/* Upload button */}
      <label style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
        fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        {uploading ? 'Uploading...' : 'Upload image'}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          disabled={uploading}
          onChange={e => handleImageUpload(e, i)}
        />
      </label>
    </div>

    {imageUrls.length > 1 && (
      <button className="admin-icon-btn danger" style={{ flexShrink: 0 }}
        onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}>
        ✕
      </button>
    )}
  </div>
))}
<button className="admin-btn-secondary" style={{ marginTop: '4px', fontSize: '13px' }}
  onClick={() => setImageUrls([...imageUrls, ''])}>
  + Add Image
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
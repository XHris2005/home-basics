import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabase'
import imageCompression from 'browser-image-compression'
import './Products.css'

const EMPTY_VARIANT = {
  id: null, fragrance: '', size: '', retail_price: '',
  wholesale_price: '', member_price: '', min_wholesale_qty: 24,
  stock: 0, images: [], imageUrls: ['']
}

function ProductModal({ product, onClose, onSaved }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [form, setForm] = useState({
    name: '', slug: '', description: '', category_id: '',
    retail_price: '', wholesale_price: '', member_price: '',
    min_wholesale_qty: 24, stock: '', is_active: true,
    is_member_product: false, images: []
  })
  const [imageUrls, setImageUrls] = useState([''])
  const [variants, setVariants] = useState([])
  const [deletedVariantIds, setDeletedVariantIds] = useState([])

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
      // Load existing variants
      const existing = (product.product_variants || []).map(v => ({
        ...v,
        imageUrls: v.images?.length ? v.images : ['']
      }))
      setVariants(existing)
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

  async function uploadImage(file) {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true
    })
    const data = new FormData()
    data.append('file', compressed)
    data.append('upload_preset', 'homebasics_products')
    data.append('cloud_name', 'db2a43rey')
    const res = await fetch('https://api.cloudinary.com/v1_1/db2a43rey/image/upload', {
      method: 'POST', body: data
    })
    const json = await res.json()
    return json.secure_url || null
  }

  async function handleProductImageUpload(e, index) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      if (url) {
        const updated = [...imageUrls]
        updated[index] = url
        setImageUrls(updated)
      }
    } catch (err) { console.error(err) }
    setUploading(false)
  }

  async function handleVariantImageUpload(e, variantIndex, imgIndex) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      if (url) {
        const updated = [...variants]
        const updatedUrls = [...(updated[variantIndex].imageUrls || [''])]
        updatedUrls[imgIndex] = url
        updated[variantIndex] = { ...updated[variantIndex], imageUrls: updatedUrls }
        setVariants(updated)
      }
    } catch (err) { console.error(err) }
    setUploading(false)
  }

  function updateVariant(index, key, val) {
    const updated = [...variants]
    updated[index] = { ...updated[index], [key]: val }
    setVariants(updated)
  }

  function addVariant() {
    setVariants([...variants, { ...EMPTY_VARIANT }])
  }

  function removeVariant(index) {
    const v = variants[index]
    if (v.id) setDeletedVariantIds(prev => [...prev, v.id])
    setVariants(variants.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!form.name || !form.category_id) {
      alert('Name and category are required.')
      return
    }
    const hasVariants = variants.length > 0
    if (!hasVariants && !form.retail_price) {
      alert('Retail price is required for products without variants.')
      return
    }
    setLoading(true)

    const images = imageUrls.filter(u => u.trim())
    const payload = {
      ...form,
      retail_price: form.retail_price ? Number(form.retail_price) : null,
      wholesale_price: form.wholesale_price ? Number(form.wholesale_price) : null,
      member_price: form.member_price ? Number(form.member_price) : null,
      min_wholesale_qty: Number(form.min_wholesale_qty),
      stock: form.stock ? Number(form.stock) : 0,
      images,
    }

    let productId = product?.id
    if (product) {
      await supabase.from('products').update(payload).eq('id', product.id)
    } else {
      const { data } = await supabase.from('products').insert([payload]).select().single()
      productId = data?.id
    }

    if (productId) {
      // Delete removed variants
      for (const id of deletedVariantIds) {
        await supabase.from('product_variants').delete().eq('id', id)
      }

      // Upsert variants
      for (const v of variants) {
        const variantImages = (v.imageUrls || []).filter(u => u.trim())
        const variantPayload = {
          product_id: productId,
          fragrance: v.fragrance?.trim() || null,
          size: v.size,
          retail_price: Number(v.retail_price),
          wholesale_price: v.wholesale_price ? Number(v.wholesale_price) : null,
          member_price: v.member_price ? Number(v.member_price) : null,
          min_wholesale_qty: Number(v.min_wholesale_qty) || 24,
          stock: Number(v.stock) || 0,
          images: variantImages,
        }
        if (v.id) {
          await supabase.from('product_variants').update(variantPayload).eq('id', v.id)
        } else {
          await supabase.from('product_variants').insert(variantPayload)
        }
      }
    }

    setLoading(false)
    onSaved()
  }

  function ImageUploadSlot({ url, onUrlChange, onUpload, showRemove, onRemove }) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '8px', border: '1px solid var(--color-border)',
          background: '#fafafa', flexShrink: 0, overflow: 'hidden', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          {url
            ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
          }
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input
            style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', color: 'var(--color-text)', outline: 'none' }}
            value={url}
            onChange={e => onUrlChange(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
          />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {uploading ? 'Uploading...' : 'Upload image'}
            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={onUpload} />
          </label>
        </div>
        {showRemove && (
          <button className="admin-icon-btn danger" style={{ flexShrink: 0 }} onClick={onRemove}>✕</button>
        )}
      </div>
    )
  }

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal" style={{ maxWidth: '680px' }}>
        <div className="admin-modal-header">
          <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', padding: '0 24px' }}>
          {['info', 'pricing', 'images', 'variants'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '12px 16px', fontSize: '13px', fontWeight: 600,
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: '-1px', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize'
            }}>
              {tab === 'variants' ? `Variants (${variants.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="admin-modal-body">

          {/* ── INFO TAB ── */}
          {activeTab === 'info' && <>
            <div className="modal-section-title">Basic Info</div>
            <div className="modal-field">
              <label>Product Name *</label>
              <input value={form.name} onChange={handleNameChange} placeholder="e.g. Orekelewa Shea Butter" />
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
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Product description..." />
            </div>
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
          </>}

          {/* ── PRICING TAB ── */}
          {activeTab === 'pricing' && <>
            <div className="modal-section-title">Product-Level Pricing</div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              For products without variants. If variants are defined, pricing is set per variant.
            </p>
            <div className="modal-row">
              <div className="modal-field">
                <label>Retail Price (₦)</label>
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
          </>}

          {/* ── IMAGES TAB ── */}
          {activeTab === 'images' && <>
            <div className="modal-section-title">Product Images</div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Default images shown when no variant is selected.
            </p>
            {imageUrls.map((url, i) => (
              <ImageUploadSlot
                key={i}
                url={url}
                onUrlChange={val => {
                  const updated = [...imageUrls]
                  updated[i] = val
                  setImageUrls(updated)
                }}
                onUpload={e => handleProductImageUpload(e, i)}
                showRemove={imageUrls.length > 1}
                onRemove={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
              />
            ))}
            <button className="admin-btn-secondary" style={{ marginTop: '4px', fontSize: '13px' }}
              onClick={() => setImageUrls([...imageUrls, ''])}>
              + Add Image
            </button>
          </>}

          {/* ── VARIANTS TAB ── */}
          {activeTab === 'variants' && <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div className="modal-section-title" style={{ margin: 0 }}>Variants</div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Each variant can have its own fragrance, size, price and images.
                </p>
              </div>
              <button className="admin-btn-primary" style={{ fontSize: '13px' }} onClick={addVariant}>
                + Add Variant
              </button>
            </div>

            {variants.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>
                No variants yet. Click "+ Add Variant" to add one.
              </p>
            )}

            {variants.map((v, i) => (
              <div key={i} style={{
                border: '1px solid var(--color-border)', borderRadius: '12px',
                padding: '16px', marginBottom: '16px', background: 'var(--color-background)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                    Variant {i + 1} {v.fragrance && `— ${v.fragrance}`} {v.size && `${v.size}`}
                  </p>
                  <button className="admin-icon-btn danger" onClick={() => removeVariant(i)}>✕</button>
                </div>

                <div className="modal-row">
                  <div className="modal-field">
                    <label>Fragrance (optional)</label>
                    <input value={v.fragrance || ''} onChange={e => updateVariant(i, 'fragrance', e.target.value)}
                      placeholder="e.g. Berry Blast" />
                  </div>
                  <div className="modal-field">
                    <label>Size *</label>
                    <input value={v.size || ''} onChange={e => updateVariant(i, 'size', e.target.value)}
                      placeholder="e.g. 200g, 500ml" />
                  </div>
                </div>

                <div className="modal-row">
                  <div className="modal-field">
                    <label>Retail Price (₦) *</label>
                    <input type="number" value={v.retail_price || ''} onChange={e => updateVariant(i, 'retail_price', e.target.value)} placeholder="0" />
                  </div>
                  <div className="modal-field">
                    <label>Wholesale Price (₦)</label>
                    <input type="number" value={v.wholesale_price || ''} onChange={e => updateVariant(i, 'wholesale_price', e.target.value)} placeholder="0" />
                  </div>
                </div>

                <div className="modal-row">
                  <div className="modal-field">
                    <label>Member Price (₦)</label>
                    <input type="number" value={v.member_price || ''} onChange={e => updateVariant(i, 'member_price', e.target.value)} placeholder="0" />
                  </div>
                  <div className="modal-field">
                    <label>Stock</label>
                    <input type="number" value={v.stock || ''} onChange={e => updateVariant(i, 'stock', e.target.value)} placeholder="0" />
                  </div>
                </div>

                {/* Variant Images */}
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', margin: '12px 0 8px' }}>Images</p>
                {(v.imageUrls || ['']).map((url, imgIdx) => (
                  <ImageUploadSlot
                    key={imgIdx}
                    url={url}
                    onUrlChange={val => {
                      const updated = [...variants]
                      const updatedUrls = [...(updated[i].imageUrls || [''])]
                      updatedUrls[imgIdx] = val
                      updated[i] = { ...updated[i], imageUrls: updatedUrls }
                      setVariants(updated)
                    }}
                    onUpload={e => handleVariantImageUpload(e, i, imgIdx)}
                    showRemove={(v.imageUrls || []).length > 1}
                    onRemove={() => {
                      const updated = [...variants]
                      updated[i] = { ...updated[i], imageUrls: updated[i].imageUrls.filter((_, idx) => idx !== imgIdx) }
                      setVariants(updated)
                    }}
                  />
                ))}
                <button className="admin-btn-secondary" style={{ fontSize: '12px', marginTop: '4px' }}
                  onClick={() => {
                    const updated = [...variants]
                    updated[i] = { ...updated[i], imageUrls: [...(updated[i].imageUrls || ['']), ''] }
                    setVariants(updated)
                  }}>
                  + Add Image
                </button>
              </div>
            ))}
          </>}
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
import { supabase } from './supabase'

const PRODUCT_SELECT = '*, categories(name, slug), product_variants(*)'

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .limit(8)

  if (error) { console.error(error); return [] }
  return data
}

export async function getOrekelwaDeals() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .ilike('name', '%orekelewa%')
    .limit(8)

  if (error) { console.error(error); return [] }
  return data
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .single()

  if (error) { console.error(error); return null }
  return data
}

export async function getProductsByCategory(categorySlug) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('categories.slug', categorySlug)
    .limit(20)

  if (error) { console.error(error); return [] }
  return data
}

export async function searchProducts(query) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .ilike('name', `%${query}%`)
    .limit(10)

  if (error) { console.error(error); return [] }
  return data
}

export async function getAllProducts(filters = {}) {
  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  if (filters.category) {
  const { data: catData } = await supabase
    .from('categories')
    .select('id')
    .eq('name', filters.category)
    .maybeSingle()

  if (catData?.id) {
    query = query.eq('category_id', catData.id)
  } else {
    query = query.eq('subcategory', filters.category)
  }
}

  if (filters.minPrice) query = query.gte('retail_price', filters.minPrice)
  if (filters.maxPrice) query = query.lte('retail_price', filters.maxPrice)

  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return data
}

// ── Variant helpers ──

export async function getVariantsByProductId(productId) {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('fragrance', { ascending: true })
    .order('size', { ascending: true })

  if (error) { console.error(error); return [] }
  return data
}

export async function upsertVariant(variant) {
  const { data, error } = variant.id
    ? await supabase.from('product_variants').update(variant).eq('id', variant.id).select().single()
    : await supabase.from('product_variants').insert(variant).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function deleteVariant(id) {
  const { error } = await supabase.from('product_variants').delete().eq('id', id)
  if (error) console.error(error)
}
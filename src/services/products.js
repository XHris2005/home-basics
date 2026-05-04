import { supabase } from './supabase'

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .limit(8)

  if (error) { console.error(error); return [] }
  return data
}

export async function getOrekelwaDeals() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .ilike('name', '%orekelewa%')
    .limit(8)

  if (error) { console.error(error); return [] }
  return data
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .single()

  if (error) { console.error(error); return null }
  return data
}

export async function getProductsByCategory(categorySlug) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .eq('categories.slug', categorySlug)
    .limit(20)

  if (error) { console.error(error); return [] }
  return data
}

export async function searchProducts(query) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .ilike('name', `%${query}%`)
    .limit(10)

  if (error) { console.error(error); return [] }
  return data
}

export async function getAllProducts(filters = {}) {
  let query = supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)

  if (filters.search) query = query.ilike('name', `%${filters.search}%`)
  if (filters.category) query = query.eq('categories.slug', filters.category)
  if (filters.minPrice) query = query.gte('retail_price', filters.minPrice)
  if (filters.maxPrice) query = query.lte('retail_price', filters.maxPrice)

  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return data
}
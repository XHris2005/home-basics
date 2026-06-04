export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function cloudinaryOptimize(url, width = 600) {
  if (!url || !url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`)
}
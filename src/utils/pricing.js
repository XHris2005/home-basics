export function getPrice(product, role, quantity) {
  if (!product) return 0

  // Member price
  if (role === 'member' && product.member_price) {
    return product.member_price
  }

  // Wholesale price — triggered by quantity
  if (quantity >= (product.min_wholesale_qty || 24) && product.wholesale_price) {
    return product.wholesale_price
  }

  // Default retail price
  return product.retail_price
}

export function isWholesaleEligible(product, quantity) {
  return quantity >= (product.min_wholesale_qty || 24)
}

export function getMemberSavings(product) {
  if (!product?.member_price) return 0
  return product.retail_price - product.member_price
}

export function getWholesaleSavings(product) {
  if (!product?.wholesale_price) return 0
  return product.retail_price - product.wholesale_price
}
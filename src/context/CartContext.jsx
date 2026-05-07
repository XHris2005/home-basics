import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hb_cart')
    if (saved) setItems(JSON.parse(saved))
  }, [])

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('hb_cart', JSON.stringify(items))
  }, [items])

  function addItem(product, quantity = 1, selectedVariant = null) {
    setItems(prev => {
      const variantKey = selectedVariant?.size || 'default'
      const existing = prev.find(
        item => item.product.id === product.id && item.variantKey === variantKey
      )
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.variantKey === variantKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, {
        id: `${product.id}-${variantKey}`,
        product,
        quantity,
        selectedVariant,
        variantKey,
        checked: true
      }]
    })
  }

  function removeItem(itemId) {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  function removeSelected() {
    setItems(prev => prev.filter(item => !item.checked))
  }

  function updateQuantity(itemId, quantity) {
    if (quantity < 1) return
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ))
  }

  function toggleCheck(itemId) {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ))
  }

  function clearCart() {
    setItems([])
  }

  function getItemPrice(item) {
    const retailPrice = item.selectedVariant
      ? item.selectedVariant.retail_price
      : item.product.retail_price

    const wholesalePrice = item.selectedVariant
      ? item.selectedVariant.wholesale_price
      : item.product.wholesale_price

    const isWholesale = wholesalePrice &&
      wholesalePrice < retailPrice &&
      item.quantity >= item.product.min_wholesale_qty

    return isWholesale ? wholesalePrice : retailPrice
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + getItemPrice(item) * item.quantity
  }, 0)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  // Derive checkedItems from your existing cart state
// Your cart items likely have a `checked` boolean already from toggleCheck
const checkedItems = items.filter(item => item.checked);

function clearCheckedItems() {
  setItems(prev => prev.filter(item => !item.checked));
  localStorage.setItem('cart', JSON.stringify(
    items.filter(item => !item.checked)
  ));
}

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      removeSelected,
      updateQuantity,
      toggleCheck,
      clearCart,
      getItemPrice,
      subtotal,
      totalItems,
      checkedItems,        // ← add this
      clearCheckedItems   // ← add this
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../../services/addresses'
import './AccountAddresses.css'

function AccountAddresses() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState(null)

  const emptyForm = {
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    area: '',
    city: '',
    state: '',
    is_default: false,
  }
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    fetchAddresses()
  }, [user])

  async function fetchAddresses() {
    try {
      const data = await getUserAddresses(user.id)
      setAddresses(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function openAddForm() {
    setEditingAddress(null)
    setFormData(emptyForm)
    setError(null)
    setShowForm(true)
  }

  function openEditForm(address) {
    setEditingAddress(address)
    setFormData({
      first_name: address.first_name,
      last_name: address.last_name,
      phone: address.phone,
      address: address.address,
      area: address.area || '',
      city: address.city,
      state: address.state,
      is_default: address.is_default,
    })
    setError(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingAddress(null)
    setFormData(emptyForm)
    setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData)
      } else {
        await addAddress({ ...formData, user_id: user.id })
      }
      await fetchAddresses()
      closeForm()
    } catch (err) {
      setError('Failed to save address. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleSetDefault(addressId) {
    try {
      await setDefaultAddress(addressId, user.id)
      await fetchAddresses()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(addressId) {
    try {
      await deleteAddress(addressId)
      await fetchAddresses()
      setDeleteConfirm(null)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="account-addresses">
        <div className="account-addresses__header">
          <h1 className="account-addresses__title">Addresses</h1>
          <p className="account-addresses__sub">Loading your addresses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="account-addresses">
      <div className="account-addresses__header">
        <div>
          <h1 className="account-addresses__title">Addresses</h1>
          <p className="account-addresses__sub">Manage your delivery addresses</p>
        </div>
        <button className="account-addresses__add-btn" onClick={openAddForm}>
          + Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="account-addresses__empty">
          <div className="account-addresses__empty-icon">📍</div>
          <p>No addresses saved yet.</p>
          <button className="account-addresses__empty-btn" onClick={openAddForm}>
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="account-addresses__grid">
          {addresses.map(address => (
            <div
              key={address.id}
              className={`address-card ${address.is_default ? 'address-card--default' : ''}`}
            >
              {address.is_default && (
                <span className="address-card__default-badge">Default</span>
              )}
              <p className="address-card__name">
                {address.first_name} {address.last_name}
              </p>
              <p className="address-card__line">{address.address}</p>
              {address.area && (
                <p className="address-card__line">{address.area}</p>
              )}
              <p className="address-card__line">
                {address.city}, {address.state}
              </p>
              <p className="address-card__phone">{address.phone}</p>

              <div className="address-card__actions">
                {!address.is_default && (
                  <button
                    className="address-card__action-btn"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Set as Default
                  </button>
                )}
                <button
                  className="address-card__action-btn"
                  onClick={() => openEditForm(address)}
                >
                  Edit
                </button>
                <button
                  className="address-card__action-btn address-card__action-btn--delete"
                  onClick={() => setDeleteConfirm(address.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="addresses-modal-backdrop" onClick={closeForm}>
          <div
            className="addresses-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="addresses-modal__header">
              <h2 className="addresses-modal__title">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button className="addresses-modal__close" onClick={closeForm}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="addresses-modal__form">
              <div className="addresses-modal__row">
                <div className="addresses-modal__field">
                  <label className="addresses-modal__label">First Name</label>
                  <input
                    className="addresses-modal__input"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="addresses-modal__field">
                  <label className="addresses-modal__label">Last Name</label>
                  <input
                    className="addresses-modal__input"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div className="addresses-modal__field">
                <label className="addresses-modal__label">Phone Number</label>
                <input
                  className="addresses-modal__input"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  required
                />
              </div>

              <div className="addresses-modal__field">
                <label className="addresses-modal__label">Address</label>
                <input
                  className="addresses-modal__input"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="addresses-modal__row">
                <div className="addresses-modal__field">
                  <label className="addresses-modal__label">State</label>
                  <input
                    className="addresses-modal__input"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    required
                  />
                </div>
                <div className="addresses-modal__field">
                  <label className="addresses-modal__label">City / LGA</label>
                  <input
                    className="addresses-modal__input"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City or LGA"
                    required
                  />
                </div>
              </div>

              <div className="addresses-modal__field">
                <label className="addresses-modal__label">
                  Area <span className="addresses-modal__optional">(optional)</span>
                </label>
                <input
                  className="addresses-modal__input"
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Area or neighbourhood"
                />
              </div>

              <label className="addresses-modal__checkbox">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                />
                Set as default address
              </label>

              {error && <p className="addresses-modal__error">{error}</p>}

              <div className="addresses-modal__footer">
                <button
                  type="button"
                  className="addresses-modal__cancel"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="addresses-modal__submit"
                  disabled={formLoading}
                >
                  {formLoading ? 'Saving...' : editingAddress ? 'Save Changes' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="addresses-modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div
            className="addresses-modal addresses-modal--sm"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="addresses-modal__title">Delete Address</h2>
            <p className="addresses-modal__confirm-text">
              Are you sure you want to delete this address? This cannot be undone.
            </p>
            <div className="addresses-modal__footer">
              <button
                className="addresses-modal__cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="addresses-modal__delete"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountAddresses
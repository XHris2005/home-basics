import { useState, useEffect } from 'react';
import {
  getUserAddresses, setDefaultAddress,
  deleteAddress, addAddress, updateAddress
} from '../../services/addresses';
import AddNewAddressModal from '../AddNewAddressModal/AddNewAddressModal';
import './AddressBookModal.css';

function DeleteConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="del-modal">
        <div className="del-modal-header">
          <h3>Delete Address</h3>
          <button className="modal-close-btn" onClick={onCancel}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="1.5"/>
              <path d="M15 9l-6 6M9 9l6 6" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <p>Do you want to delete this address?</p>
        <div className="del-modal-actions">
          <button className="del-cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="del-confirm-btn" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AddressBookModal({ onClose, onConfirm }) {
  const [addresses,    setAddresses]    = useState([]);
  const [selectedId,   setSelectedId]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [showAddForm,  setShowAddForm]  = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionId,     setActionId]     = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getUserAddresses();
      setAddresses(data);
      const def = data.find(a => a.is_default) || data[0];
      if (def) setSelectedId(def.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSetDefault(id) {
    setActionId(id);
    try {
      await setDefaultAddress(id);
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
    } catch (err) { console.error(err); }
    finally { setActionId(null); }
  }

  async function handleDelete() {
    setActionId(deleteTarget);
    try {
      await deleteAddress(deleteTarget);
      const next = addresses.filter(a => a.id !== deleteTarget);
      setAddresses(next);
      if (selectedId === deleteTarget) setSelectedId(next[0]?.id || null);
    } catch (err) { console.error(err); }
    finally { setActionId(null); setDeleteTarget(null); }
  }

  async function handleSave(formData) {
    try {
      if (editTarget) {
        await updateAddress(editTarget.id, formData);
      } else {
        await addAddress(formData);
      }
      await load();
    } catch (err) { console.error(err); }
    setShowAddForm(false);
    setEditTarget(null);
  }

  function handleConfirm() {
    const addr = addresses.find(a => a.id === selectedId);
    if (addr) onConfirm(addr);
    onClose();
  }

  if (loading) {
    return (
      <div className="modal-backdrop">
        <div className="ab-modal">
          <div className="ab-loading">
            <div className="ab-spinner"/>
            <span>Loading addresses...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="ab-modal">

          <div className="ab-header">
            <h2>Address Book</h2>
            <button className="modal-close-btn" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="1.5"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="ab-body">
            {addresses.length === 0 ? (
              <div className="ab-empty">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <path d="M22 4C15.373 4 10 9.373 10 16c0 9.333 12 24 12 24s12-14.667 12-24c0-6.627-5.373-12-12-12z" stroke="#ddd" strokeWidth="1.8" fill="none"/>
                  <circle cx="22" cy="16" r="4" stroke="#ddd" strokeWidth="1.8"/>
                </svg>
                <p>No saved addresses</p>
                <span>Add your first delivery address to get started</span>
              </div>
            ) : (
              <div className="ab-grid">
                {addresses.map((addr, i) => (
                  <div
                    key={addr.id}
                    className={`ab-card${selectedId === addr.id ? ' ab-card--selected' : ''}`}
                    onClick={() => setSelectedId(addr.id)}
                  >
                    <div className="ab-card-top">
                      <label className="ab-radio-row" onClick={e => e.stopPropagation()}>
                        <input
                          type="radio"
                          name="ab-address"
                          checked={selectedId === addr.id}
                          onChange={() => setSelectedId(addr.id)}
                        />
                        <span className="ab-addr-label">Address {i + 1}</span>
                      </label>
                      {addr.is_default
                        ? <span className="ab-badge-default">Default</span>
                        : (
                          <button
                            className="ab-set-default-btn"
                            onClick={e => { e.stopPropagation(); handleSetDefault(addr.id); }}
                            disabled={actionId === addr.id}
                          >
                            {actionId === addr.id ? 'Setting...' : 'Set as Default'}
                          </button>
                        )
                      }
                    </div>

                    <div className="ab-details">
                      <div className="ab-details-row">
                        <div className="ab-detail">
                          <span className="ab-detail-label">Full Name</span>
                          <span className="ab-detail-val">{addr.first_name} {addr.last_name}</span>
                        </div>
                        <div className="ab-detail">
                          <span className="ab-detail-label">Phone Number</span>
                          <span className="ab-detail-val">{addr.phone}</span>
                        </div>
                        <div className="ab-detail">
                          <span className="ab-detail-label">Address</span>
                          <span className="ab-detail-val">{addr.address}</span>
                        </div>
                      </div>
                      <div className="ab-details-row">
                        <div className="ab-detail">
                          <span className="ab-detail-label">Area</span>
                          <span className="ab-detail-val">{addr.area || '—'}</span>
                        </div>
                        <div className="ab-detail">
                          <span className="ab-detail-label">City</span>
                          <span className="ab-detail-val">{addr.city}</span>
                        </div>
                        <div className="ab-detail">
                          <span className="ab-detail-label">State</span>
                          <span className="ab-detail-val">{addr.state}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ab-card-actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="ab-edit-btn"
                        onClick={() => { setEditTarget(addr); setShowAddForm(true); }}
                      >
                        Edit
                      </button>
                      <button
                        className="ab-delete-btn"
                        onClick={() => setDeleteTarget(addr.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ab-footer">
            <button className="ab-add-btn" onClick={() => { setEditTarget(null); setShowAddForm(true); }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 2v11M2 7.5h11" stroke="#01A451" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Add New Address
            </button>
            <button
              className="ab-confirm-btn"
              onClick={handleConfirm}
              disabled={!selectedId}
            >
              Confirm
            </button>
          </div>

        </div>
      </div>

      {showAddForm && (
        <AddNewAddressModal
          editData={editTarget}
          onClose={() => { setShowAddForm(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
import { useState, useRef, useEffect } from 'react';
import { STATES, getLGAs, getAreas } from '../../data/nigeriaGeo';
import './AddNewAddressModal.css';

function CustomSelect({ value, onChange, options, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className={`cs-wrap${disabled ? ' cs-disabled' : ''}`} ref={ref}>
      <button
        type="button"
        className={`cs-trigger${open ? ' cs-open' : ''}`}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
      >
        <span className={value ? '' : 'cs-placeholder'}>{value || placeholder}</span>
        <svg className={`cs-chevron${open ? ' up' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="cs-dropdown">
          <div className="cs-scroll">
            {options.length === 0
              ? <div className="cs-empty">No options available</div>
              : options.map(opt => (
                  <div
                    key={opt}
                    className={`cs-option${value === opt ? ' cs-active' : ''}`}
                    onClick={() => { onChange(opt); setOpen(false); }}
                  >
                    {opt}
                    {value === opt && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7l3 3 6-6" stroke="#01A451" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddNewAddressModal({ onClose, onSave, editData = null }) {
  const [form, setForm] = useState({
    first_name: editData?.first_name || '',
    last_name:  editData?.last_name  || '',
    phone:      editData?.phone      || '',
    address:    editData?.address    || '',
    state:      editData?.state      || '',
    city:       editData?.city       || '',
    area:       editData?.area       || '',
    is_default: editData?.is_default || false,
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const lgas  = form.state ? getLGAs(form.state) : [];
  const areas = form.state && form.city ? getAreas(form.state, form.city) : [];

  function set(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'state') { next.city = ''; next.area = ''; }
      if (field === 'city')  { next.area = ''; }
      return next;
    });
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.first_name.trim()) e.first_name = 'Required';
    if (!form.last_name.trim())  e.last_name  = 'Required';
    if (!form.phone.trim())      e.phone      = 'Required';
    else if (!/^[0-9]{10,11}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid Nigerian phone number';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.state)          e.state   = 'Select a state';
    if (!form.city)           e.city    = 'Select an LGA';
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await onSave(form);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="anm-modal">

        <div className="anm-header">
          <h2>{editData ? 'Edit Address' : 'Add New Address'}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="1.5"/>
              <path d="M15 9l-6 6M9 9l6 6" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="anm-body">
          <div className="anm-row-2">
            <div className={`anm-field${errors.first_name ? ' field-err' : ''}`}>
              <input
                placeholder="First name"
                value={form.first_name}
                onChange={e => set('first_name', e.target.value)}
              />
              {errors.first_name && <span className="err-msg">{errors.first_name}</span>}
            </div>
            <div className={`anm-field${errors.last_name ? ' field-err' : ''}`}>
              <input
                placeholder="Last name"
                value={form.last_name}
                onChange={e => set('last_name', e.target.value)}
              />
              {errors.last_name && <span className="err-msg">{errors.last_name}</span>}
            </div>
          </div>

          <div className={`anm-field${errors.phone ? ' field-err' : ''}`}>
            <input
              type="tel"
              placeholder="Phone number (e.g. 08012345678)"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
            />
            {errors.phone && <span className="err-msg">{errors.phone}</span>}
          </div>

          <div className={`anm-field${errors.address ? ' field-err' : ''}`}>
            <input
              placeholder="Street address"
              value={form.address}
              onChange={e => set('address', e.target.value)}
            />
            {errors.address && <span className="err-msg">{errors.address}</span>}
          </div>

          <div className={`anm-field${errors.state ? ' field-err' : ''}`}>
            <CustomSelect
              value={form.state}
              onChange={v => set('state', v)}
              options={STATES}
              placeholder="Select state"
            />
            {errors.state && <span className="err-msg">{errors.state}</span>}
          </div>

          <div className={`anm-field${errors.city ? ' field-err' : ''}`}>
            <CustomSelect
              value={form.city}
              onChange={v => set('city', v)}
              options={lgas}
              placeholder="Select LGA / City"
              disabled={!form.state}
            />
            {errors.city && <span className="err-msg">{errors.city}</span>}
          </div>

          {areas.length > 0 && (
            <div className="anm-field">
              <CustomSelect
                value={form.area}
                onChange={v => set('area', v)}
                options={areas}
                placeholder="Select area"
                disabled={!form.city}
              />
            </div>
          )}

          <label className="anm-default-check">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={e => set('is_default', e.target.checked)}
            />
            Set as default address
          </label>
        </div>

        <div className="anm-footer">
          <button className="anm-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="anm-btn-save" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Address'}
          </button>
        </div>

      </div>
    </div>
  );
}
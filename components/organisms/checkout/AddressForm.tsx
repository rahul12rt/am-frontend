'use client';

import React, { useState } from 'react';
import { X, Loader2, MapPin } from 'lucide-react';
import { useCreateAddress, useUpdateAddress } from '@/hooks/queries/useAddress';
import { type CreateAddressData, type Address } from '@/lib/api-services';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import styles from './AddressForm.module.scss';

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (address: Address) => void;
  editAddress?: Address | null; // For editing existing address
}

// Indian states for dropdown
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

const AddressForm: React.FC<AddressFormProps> = ({ isOpen, onClose, onSuccess, editAddress }) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();

  const [formData, setFormData] = useState<CreateAddressData>(() => ({
    address_type: editAddress?.address_type || 'home',
    is_billing_address: editAddress?.is_billing_address ?? true,
    is_shipping_address: editAddress?.is_shipping_address ?? true,
    full_name: editAddress?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
    phone: editAddress?.phone || profile?.phone_number || '',
    address_line1: editAddress?.address_line1 || '',
    address_line2: editAddress?.address_line2 || '',
    city: editAddress?.city || '',
    state: editAddress?.state || '',
    postal_code: editAddress?.postal_code || '',
    country: editAddress?.country || 'India',
    country_code: editAddress?.country_code || 'IN',
    is_default: editAddress?.is_default ?? false,
    delivery_instructions: editAddress?.delivery_instructions || '',
    landmark: editAddress?.landmark || '',
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }
    if (!formData.address_line1.trim()) newErrors.address_line1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postal_code.trim()) newErrors.postal_code = 'PIN code is required';
    if (!/^\d{6}$/.test(formData.postal_code)) newErrors.postal_code = 'Please enter a valid 6-digit PIN code';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let result: Address;

      if (editAddress) {
        // Update existing address
        result = await updateAddress.mutateAsync({
          ...formData,
          id: editAddress.id,
        });
        showToast('Address updated successfully!', 'success');
      } else {
        // Create new address
        result = await createAddress.mutateAsync(formData);
        showToast('Address added successfully!', 'success');
      }

      onSuccess?.(result);
      onClose();
    } catch (error) {
      console.error('Address form error:', error);
      showToast('Failed to save address. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin size={24} />
            {editAddress ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Type and Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Address Type</label>
              <select
                name="address_type"
                value={formData.address_type}
                onChange={handleInputChange}
                className={styles.input}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_billing_address"
                  checked={formData.is_billing_address}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className="text-sm">Use for billing</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_shipping_address"
                  checked={formData.is_shipping_address}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className="text-sm">Use for shipping</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className="text-sm">Make default address</span>
              </label>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.full_name ? styles.error : ''}`}
                placeholder="Enter full name"
              />
              {errors.full_name && <p className={styles.errorText}>{errors.full_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
              />
              {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
            </div>
          </div>

          {/* Address Lines */}
          <div>
            <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
            <input
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.address_line1 ? styles.error : ''}`}
              placeholder="House/Flat No., Building, Street"
            />
            {errors.address_line1 && <p className={styles.errorText}>{errors.address_line1}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address Line 2 (Optional)</label>
            <input
              type="text"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Area, Colony, Sector (Optional)"
            />
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.city ? styles.error : ''}`}
                placeholder="Enter city"
              />
              {errors.city && <p className={styles.errorText}>{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">State *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.state ? styles.error : ''}`}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className={styles.errorText}>{errors.state}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">PIN Code *</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.postal_code ? styles.error : ''}`}
                placeholder="000000"
                maxLength={6}
              />
              {errors.postal_code && <p className={styles.errorText}>{errors.postal_code}</p>}
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label className="block text-sm font-medium mb-2">Landmark (Optional)</label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Nearby landmark for easy identification"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Delivery Instructions (Optional)</label>
            <textarea
              name="delivery_instructions"
              value={formData.delivery_instructions}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Any special delivery instructions..."
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={styles.secondaryButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {editAddress ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                editAddress ? 'Update Address' : 'Add Address'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;
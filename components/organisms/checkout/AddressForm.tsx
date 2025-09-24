'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, MapPin, Check, AlertCircle } from 'lucide-react';
import { useCreateAddress, useUpdateAddress } from '@/hooks/queries/useAddress';
import { type CreateAddressData, type Address } from '@/lib/api-services';
import { useAuth } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import { checkPincodeWithCache, type ValidationResult } from '@/services/pincodeValidation';

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
    full_name: editAddress?.full_name || profile?.first_name || '',
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
  const [pincodeValidation, setPincodeValidation] = useState<ValidationResult | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

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

  // Pincode validation effect
  useEffect(() => {
    const validatePincode = async () => {
      if (formData.postal_code && /^\d{6}$/.test(formData.postal_code)) {
        setIsCheckingPincode(true);
        try {
          const result = await checkPincodeWithCache(formData.postal_code);
          setPincodeValidation(result);
          
          // Update errors based on pincode validation
          if (!result.isValid) {
            setErrors(prev => ({
              ...prev,
              postal_code: result.message
            }));
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.postal_code;
              return newErrors;
            });
          }
        } catch (error) {
          setPincodeValidation({
            isValid: false,
            message: 'Failed to validate pincode'
          });
        } finally {
          setIsCheckingPincode(false);
        }
      } else {
        setPincodeValidation(null);
      }
    };

    const timeoutId = setTimeout(validatePincode, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [formData.postal_code]);

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }
    if (!formData.address_line1.trim()) newErrors.address_line1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.postal_code)) {
      newErrors.postal_code = 'Please enter a valid 6-digit PIN code';
    } else if (pincodeValidation && !pincodeValidation.isValid) {
      newErrors.postal_code = pincodeValidation.message;
    }

    // Check if pincode validation is still in progress
    if (isCheckingPincode) {
      newErrors.postal_code = 'Validating pincode...';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !isCheckingPincode;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(await validateForm())) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    // Final check: ensure pincode is serviceable before saving
    if (!pincodeValidation?.isValid) {
      showToast('Please enter a serviceable pincode', 'error');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-gray-900 flex items-center gap-3" style={{ fontSize: '2.2rem' }}>
            <MapPin size={28} className="text-gray-600" />
            {editAddress ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Type and Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>Address Type</label>
              <select
                name="address_type"
                value={formData.address_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                style={{ fontSize: '1.3rem' }}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_billing_address"
                  checked={formData.is_billing_address}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <span className="text-gray-900" style={{ fontSize: '1.3rem' }}>Use for billing</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_shipping_address"
                  checked={formData.is_shipping_address}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <span className="text-gray-900" style={{ fontSize: '1.3rem' }}>Use for shipping</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <span className="text-gray-900" style={{ fontSize: '1.3rem' }}>Make default address</span>
              </label>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter full name"
                style={{ fontSize: '1.3rem' }}
              />
              {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
            </div>
            <div>
              <label className="block mb-2 text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                style={{ fontSize: '1.3rem' }}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Address Lines */}
          <div>
            <label className="block mb-2 text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>Address Line 1 *</label>
            <input
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 ${errors.address_line1 ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="House/Flat No., Building, Street"
              style={{ fontSize: '1.3rem' }}
            />
            {errors.address_line1 && <p className="text-red-500 text-sm mt-1">{errors.address_line1}</p>}
          </div>

          <div>
            <label className="block mb-2 text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>Address Line 2 (Optional)</label>
            <input
              type="text"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
              placeholder="Area, Colony, Sector (Optional)"
              style={{ fontSize: '1.3rem' }}
            />
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter city"
                style={{ fontSize: '1.3rem' }}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block mb-2 text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>State *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                style={{ fontSize: '1.3rem' }}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>
            <div>
              <label className="block mb-2 text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>PIN Code *</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 ${errors.postal_code ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="000000"
                maxLength={6}
                style={{ fontSize: '1.3rem' }}
              />
              {errors.postal_code && <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>}
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label className="block mb-2 text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>Landmark (Optional)</label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
              placeholder="Nearby landmark for easy identification"
              style={{ fontSize: '1.3rem' }}
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>Delivery Instructions (Optional)</label>
            <textarea
              name="delivery_instructions"
              value={formData.delivery_instructions}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 resize-none"
              placeholder="Any special delivery instructions..."
              rows={3}
              style={{ fontSize: '1.3rem' }}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
              style={{ fontSize: '1.5rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
              style={{ fontSize: '1.5rem' }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
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
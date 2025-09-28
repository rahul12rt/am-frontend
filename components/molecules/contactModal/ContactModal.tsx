"use client";
import React, { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import './ContactModal.scss';

interface ContactModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  /**
   * Render style for the component
   * - 'modal' (default): overlay popup with backdrop and close icon
   * - 'page': full-page layout without backdrop/close icon
   */
  mode?: 'modal' | 'page';
}

interface FormData {
  email: string;
  message: string;
}

interface FormErrors {
  email?: string;
  message?: string;
  general?: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  mode = 'modal'
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  // In modal mode, respect isOpen; in page mode always render
  if (mode !== 'page' && !isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = 'Message must not exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const { unprotectedApiClient } = await import('@/lib/api-clients');
      
      const response = await unprotectedApiClient.post('/alban-queries', {
        email: formData.email.trim(),
        message: formData.message.trim()
      });

      const data = response.data;

      setIsSuccess(true);
      setFormData({ email: '', message: '' });
      
      // After 2 seconds: in page mode redirect to home; in modal mode close
      setTimeout(() => {
        if (mode === 'page') {
          onSuccess?.();
          setIsSuccess(false);
          router.push('/');
        } else {
          onSuccess?.();
          onClose?.();
          setIsSuccess(false);
        }
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting query:', error);
      
      // Handle axios error response
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to submit query';
      
      // Handle specific error codes
      if (errorMessage.includes('RATE_LIMIT') || errorMessage.includes('Too many')) {
        setErrors({ general: 'You have reached the query limit. Please try again later.' });
      } else if (errorMessage.includes('VALIDATION_ERROR')) {
        setErrors({ general: 'Please check your input and try again.' });
      } else if (error?.response?.status === 429) {
        setErrors({ general: 'Too many requests. Please try again later.' });
      } else {
        setErrors({ general: 'Failed to submit your query. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ email: '', message: '' });
      setErrors({});
      setIsSuccess(false);
      onClose?.();
    }
  };

  return (
    <div className={mode === 'page' ? "w-full" : "fixed inset-0 z-50 flex items-center justify-center p-4"}>
      {/* Backdrop only for modal mode */}
      {mode === 'modal' && (
        <div 
          className="absolute inset-0 bg-black/90 backdrop-blur-lg"
          onClick={handleClose}
        />
      )}
      
      {/* Container */}
      <div 
        className={mode === 'page'
          ? "relative w-full  my-16 md:my-24 min-h-[100vh] bg-black shadow-2xl overflow-hidden flex"
          : "relative w-full  min-h-[100vh] bg-black overflow-hidden flex"}
        style={{ 
          backgroundColor: '#000000',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
        }}
      >
        
        {/* Left Side - Image (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 lg:w-2/5 relative overflow-hidden">
          <Image
            src="/images/login_pop_up_image_left_side.jpg"
            alt="Alban Marcus Contact"
            fill
            className="object-cover"
            priority
          />
          
          {/* Image Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-end p-8">
            <div className="text-white">
              <h3 className="text-3xl font-bold mb-3 tracking-wider">GET IN TOUCH</h3>
              <p className="text-white text-[1.4rem] leading-relaxed font-medium">
                Questions about our collection? We're here to help you find the perfect timepiece.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Contact Form */}
        <div 
          className="w-full md:w-1/2 lg:w-3/5 flex flex-col bg-gray-900"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b-2 border-gray-700">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Contact Us</h2>
              <p className="text-[1.4rem] text-gray-200 leading-relaxed font-medium">
                Send us your inquiry and we'll get back to you soon
              </p>
            </div>
            {mode === 'modal' && (
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-300 hover:text-white transition-all duration-200 p-3 rounded-full hover:bg-gray-800 ml-4 border border-gray-600 hover:border-gray-400 disabled:opacity-50"
              >
                <X className="w-7 h-7" />
              </button>
            )}
          </div>
          
          {/* Form Container */}
          <div className="flex-1 overflow-y-auto bg-gray-900 p-8" style={{ backgroundColor: '#1a1a1a' }}>
            {isSuccess ? (
              /* Success State */
              <div className="flex flex-col items-center justify-center h-full text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-gray-300 text-[1.6rem] leading-relaxed">
                  Thank you for your inquiry. We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              /* Contact Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="flex items-center space-x-2 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-[1.4rem]">{errors.general}</p>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-white text-[1.6rem] font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 bg-black border rounded-lg text-[1.6rem] leading-[1.5] focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gray-600 focus:border-white focus:ring-white/20'
                    }`}
                    placeholder="your.email@example.com"
                    disabled={isSubmitting}
                    style={{ color: 'black !important' }}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-[1.4rem] mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-white text-[1.6rem] font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className={`w-full px-4 py-3 bg-black border rounded-lg text-[1.6rem] leading-[1.5] focus:outline-none focus:ring-2 transition-all duration-200 resize-none placeholder-gray-400 ${
                      errors.message 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gray-600 focus:border-white focus:ring-white/20'
                    }`}
                    placeholder="Tell us about your inquiry, questions about our collection, or any specific timepiece you're interested in..."
                    disabled={isSubmitting}
                   
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.message ? (
                      <p className="text-red-400 text-[1.4rem]">{errors.message}</p>
                    ) : (
                      <div />
                    )}
                    <p className="text-gray-400 text-[1.3rem]">
                      {formData.message.length}/2000
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white px-8 py-4 text-[1.6rem] leading-[1.2] font-medium border border-white hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>

                {/* Privacy Note */}
                <p className="text-gray-400 text-[1.3rem] text-center">
                  Your information is secure and will only be used to respond to your inquiry.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;

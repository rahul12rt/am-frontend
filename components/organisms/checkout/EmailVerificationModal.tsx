import React, { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { Loader2, X, ArrowLeft, Edit2 } from 'lucide-react';
import { useAuth, useSendEmailOTP, useVerifyEmailOTP } from '@/hooks/queries/useUser';
import { useToast } from '@/contexts/ToastContext';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Use the new API hooks
  const sendEmailOTP = useSendEmailOTP();
  const verifyEmailOTP = useVerifyEmailOTP();

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      // Initialize with profile email if available
      if (profile?.email && !email) {
        setEmail(profile.email);
      }
    } else {
      // Reset state when modal is closed
      setStep('email');
      setOtp(new Array(6).fill(''));
      // Don't reset email to allow user to keep their entered email
    }
  }, [isOpen, profile?.email]);

  // Reset OTP when step changes back to email
  useEffect(() => {
    if (step === 'email') {
      setOtp(new Array(6).fill(''));
    }
  }, [step]);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      const response = await sendEmailOTP.mutateAsync(email);
      
      // Check if email is already verified
      if (response?.alreadyVerified) {
        showToast(response.message || 'Email is already verified!', 'success');
        // Auto-close modal after showing success message
        setTimeout(() => {
          onSuccess();
        }, 2000);
        return;
      }
      
      showToast('Verification code sent to your email!', 'success');
      setStep('otp');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send verification code';
      showToast(errorMessage, 'error');
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast('Please enter the complete 6-digit code', 'error');
      return;
    }

    try {
      const response = await verifyEmailOTP.mutateAsync({ email, otp: otpCode });
      
      // Check if email was already verified
      if (response?.alreadyVerified) {
        showToast(response?.message || 'Email is already verified!', 'success');
        onSuccess();
        return;
      }
      
      showToast('Email verified successfully!', 'success');
      onSuccess();
    } catch (error: any) {
      // Handle specific error responses
      let errorMessage = 'Invalid or expired verification code';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
      
      // Clear OTP fields on error for better UX
      setOtp(new Array(6).fill(''));
      if (otpInputs.current[0]) {
        otpInputs.current[0].focus();
      }
    }
  };

  const handleChangeEmail = () => {
    // Reset OTP and go back to email step
    setOtp(new Array(6).fill(''));
    setStep('email');
    showToast('You can now enter a different email address', 'info');
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      await sendEmailOTP.mutateAsync(email);
      showToast('New verification code sent to your email!', 'success');
      // Reset OTP inputs
      setOtp(new Array(6).fill(''));
      // Focus on first OTP input
      if (otpInputs.current[0]) {
        otpInputs.current[0].focus();
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to resend verification code';
      showToast(errorMessage, 'error');
    }
  };

  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Move to next input
      if (index < 5 && otpInputs.current[index + 1]) {
        otpInputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        // Clear current field if it has a value
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous field and clear it if current field is empty
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpInputs.current[index - 1]?.focus();
      }
    }
  };

  if (!isOpen) return null;

  const isLoading = sendEmailOTP.isPending || verifyEmailOTP.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="backgroundWhite rounded-3xl shadow-2xl border-2 border-gray-200 p-6 w-full max-w-[300px] relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
        
        {step === 'email' ? (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-center" style={{ fontSize: '2.2rem' }}>
              Verify Email
            </h2>
            <p className="text-center text-gray-600" style={{ fontSize: '1.5rem' }}>
              We'll send a verification code to your email.
            </p>
            <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-200">
              <p className="text-blue-700 font-medium" style={{ fontSize: '1.3rem' }}>
                💡 Already verified?
              </p>
              <p className="text-blue-600 text-sm mt-1">
                If your email is already verified, the system will detect it automatically!
              </p>
            </div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
              style={{ fontSize: '1.5rem' }}
            />
            <button 
              onClick={handleSendOtp} 
              disabled={isLoading || !email} 
              className="w-full py-4 bg-gray-900 text-white font-medium rounded-lg transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: '1.5rem' }}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-center" style={{ fontSize: '2.2rem' }}>
              Enter Code
            </h2>
            <div className="text-center">
              <p className="text-gray-600" style={{ fontSize: '1.5rem' }}>
                A 6-digit code has been sent to
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-medium text-gray-900" style={{ fontSize: '1.4rem' }}>
                  {email}
                </span>
                <button
                  onClick={handleChangeEmail}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                  title="Change email address"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { otpInputs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-10 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-bold text-gray-900"
                  style={{ fontSize: '1.5rem' }}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                onClick={handleVerifyOtp} 
                disabled={isLoading || otp.some(d => d === '')} 
                className="w-full py-4 bg-gray-900 text-white font-medium rounded-lg transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '1.5rem' }}
              >
                {isLoading && verifyEmailOTP.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  'Verify & Proceed'
                )}
              </button>

              {/* Secondary Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleChangeEmail}
                  disabled={isLoading}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ fontSize: '1.3rem' }}
                >
                  <ArrowLeft size={16} />
                  Change Email
                </button>
                
                <button
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: '1.3rem' }}
                >
                  {isLoading && sendEmailOTP.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Resend OTP'
                  )}
                </button>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Didn't receive the code? Check your spam folder or click "Resend OTP"
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Wrong email? Click "Change Email" to enter a different address
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationModal;

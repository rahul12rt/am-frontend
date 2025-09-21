import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Loader2, X } from 'lucide-react';
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
      await sendEmailOTP.mutateAsync(email);
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
      await verifyEmailOTP.mutateAsync({ email, otp: otpCode });
      showToast('Email verified successfully!', 'success');
      onSuccess();
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid or expired verification code';
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
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  if (!isOpen) return null;

  const isLoading = sendEmailOTP.isPending || verifyEmailOTP.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-[300px] relative">
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
            <p className="text-center text-gray-600" style={{ fontSize: '1.5rem' }}>
              A 6-digit code has been sent to {email}
            </p>
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
            <button 
              onClick={handleVerifyOtp} 
              disabled={isLoading || otp.some(d => d === '')} 
              className="w-full py-4 bg-gray-900 text-white font-medium rounded-lg transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: '1.5rem' }}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                'Verify & Proceed'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationModal;

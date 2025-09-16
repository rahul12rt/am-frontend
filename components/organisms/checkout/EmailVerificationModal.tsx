import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { unprotectedApiClient } from '@/lib/api-clients';
import { useToast } from '@/contexts/ToastContext';
import styles from './EmailVerificationModal.module.scss';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, refetchProfile } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

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

    setIsLoading(true);
    try {
      const response = await unprotectedApiClient.post('/auth/email/send-otp', { email });

      if (response.data.success) {
        showToast('Verification code sent to your email!', 'success');
        setStep('otp');
      } else {
        showToast(response.data.message || 'Failed to send verification code', 'error');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send verification code';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast('Please enter the complete 6-digit code', 'error');
      return;
    }

    if (!user?.id) {
      showToast('User session not found. Please try again.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await unprotectedApiClient.post('/auth/email/verify-otp', {
        email,
        otp: otpCode,
        userId: user.id
      });

      if (response.data.success) {
        showToast('Email verified successfully!', 'success');
        await refetchProfile(); // Refresh profile to get updated email status
        onSuccess();
      } else {
        showToast(response.data.message || 'Invalid verification code', 'error');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid or expired verification code';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
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

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        {step === 'email' ? (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">Verify Your Email</h2>
            <p className="text-center text-gray-300 text-base">We'll send a verification code to your email.</p>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
            <button onClick={handleSendOtp} disabled={isLoading || !email} className={styles.button}>
              {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">Enter Verification Code</h2>
            <p className="text-center text-gray-300 text-base">A 6-digit code has been sent to {email}</p>
            <div className={styles.otpInputContainer}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { otpInputs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={styles.otpInput}
                />
              ))}
            </div>
            <button onClick={handleVerifyOtp} disabled={isLoading || otp.some(d => d === '')} className={styles.button}>
              {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Verify & Proceed'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationModal;

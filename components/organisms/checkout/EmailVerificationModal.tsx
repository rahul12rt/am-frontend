import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import styles from './EmailVerificationModal.module.scss';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = async () => {
    setIsLoading(true);
    // Mock API call to send OTP
    console.log(`Sending OTP to ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    // Mock API call to verify OTP
    console.log(`Verifying OTP ${otp.join('')}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    onSuccess();
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
            <h2 className="text-2xl font-bold text-center">Verify Your Email</h2>
            <p className="text-center text-gray-300">We'll send a verification code to your email.</p>
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
            <h2 className="text-2xl font-bold text-center">Enter Verification Code</h2>
            <p className="text-center text-gray-300">A 6-digit code has been sent to {email}</p>
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

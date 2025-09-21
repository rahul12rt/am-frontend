"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Toast.module.scss';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

const Toast = ({ message, type, onRemove }: { message: string; type: 'success' | 'error' | 'info'; onRemove: () => void; }) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = useCallback(() => {
    if (!isRemoving) {
      setIsRemoving(true);
      // Small delay to allow for any animations
      setTimeout(() => {
        onRemove();
      }, 100);
    }
  }, [onRemove, isRemoving]);

  useEffect(() => {
    timerRef.current = setTimeout(handleRemove, 3000);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [handleRemove]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className={`${styles.toast} ${styles[type]} ${isRemoving ? styles.removing : ''}`}>
      {message}
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={styles.toastContainer}>
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          {...toast} 
          onRemove={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  );
};

"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { ToastContainer } from '@/components/atoms/toast/Toast';
import { usePathname } from 'next/navigation';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now() + Math.random(); // More unique ID
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Clear toasts on navigation to prevent DOM issues
  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      // Clear toasts when navigating to prevent DOM manipulation errors
      setToasts([]);
      previousPathnameRef.current = pathname;
    }
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setToasts([]);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

"use client";

import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useUserModal } from '@/contexts/UserModalContext';
import User from '@/components/molecules/user/User';

const UserModalWrapper = () => {
  const { isOpen, closeModal } = useUserModal();
  const [isClient, setIsClient] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      // When closing, wait for animation to finish before unmounting
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, 500); // Must match animation duration
      document.body.style.overflow = 'auto';
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isClient || !isMounted) {
    return null;
  }

  const modalContent = (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[50]"
        style={{
          animation: isOpen ? 'fadeIn 0.5s ease-out forwards' : 'fadeOut 0.5s ease-in forwards',
          backdropFilter: 'blur(10px)',
        }}
        onClick={closeModal}
      >
        <div
          className="fixed top-0 right-0 h-full bg-black text-white-1 shadow-lg w-full max-w-md"
          style={{
            animation: isOpen ? 'slideInRight 0.5s ease-out forwards' : 'slideOutRight 0.5s ease-in forwards',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <User onClose={closeModal} />
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default UserModalWrapper;

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UserModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const UserModalContext = createContext<UserModalContextType | undefined>(undefined);

interface UserModalProviderProps {
  children: ReactNode;
}

export const UserModalProvider: React.FC<UserModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <UserModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </UserModalContext.Provider>
  );
};

export const useUserModal = (): UserModalContextType => {
  const context = useContext(UserModalContext);
  if (!context) {
    throw new Error("useUserModal must be used within a UserModalProvider");
  }
  return context;
};
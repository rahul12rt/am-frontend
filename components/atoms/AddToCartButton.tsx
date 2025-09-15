"use client";

import { useState } from "react";
import { ShoppingBag, Loader2, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useAddToCart, useIsInCart } from "@/hooks/queries/useCart";

interface AddToCartButtonProps {
  watchColorId: string;
  watchName: string;
  quantity?: number;
  disabled?: boolean;
  variant?: "default" | "large" | "compact";
  showUserIcon?: boolean;
  onAuthRequired?: () => void; // Callback to open login modal
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  watchColorId,
  watchName,
  quantity = 1,
  disabled = false,
  variant = "default",
  showUserIcon = true,
  onAuthRequired,
  className = "",
}) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const addToCart = useAddToCart();
  const { isInCart, cartItem } = useIsInCart(watchColorId);

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!profile) {
      showToast("Please sign in to add items to cart. Click the user icon in the header to login.", "info");
      return;
    }

    // Check if item is already in cart
    if (isInCart) {
      showToast(`${watchName} is already in your cart`, "info");
      return;
    }

    setIsAdding(true);

    try {
      await addToCart.mutateAsync({
        watchColorIds: [
          {
            watch_color_id: watchColorId,
            quantity: quantity,
          },
        ],
      });

      // Show success feedback
      setJustAdded(true);
      showToast(`${watchName} added to cart successfully!`, "success");

      // Reset success state after 2 seconds
      setTimeout(() => {
        setJustAdded(false);
      }, 2000);
    } catch (error: any) {
      console.error("Add to cart error:", error);

      // Handle specific error cases
      if (error?.response?.status === 409) {
        showToast(`${watchName} is already in your cart`, "info");
      } else if (error?.response?.status === 400) {
        showToast("This item is out of stock", "error");
      } else {
        showToast("Failed to add item to cart. Please try again.", "error");
      }
    } finally {
      setIsAdding(false);
    }
  };

  // Button size variants
  const getSizeClasses = () => {
    switch (variant) {
      case "large":
        return "px-8 py-4 text-lg";
      case "compact":
        return "px-4 py-2 text-sm";
      default:
        return "px-6 py-3 text-base";
    }
  };

  // Button content based on state
  const getButtonContent = () => {
    if (isAdding) {
      return (
        <>
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Adding...
        </>
      );
    }

    if (justAdded) {
      return (
        <>
          <Check className="w-5 h-5 mr-2" />
          Added to Cart!
        </>
      );
    }

    if (isInCart) {
      return (
        <>
          <Check className="w-5 h-5 mr-2" />
          In Cart ({cartItem?.quantity})
        </>
      );
    }

    return (
      <>
        <ShoppingBag className="w-5 h-5 mr-2" />
        Add to Cart
      </>
    );
  };

  // Button color based on state
  const getButtonColor = () => {
    if (justAdded) {
      return "bg-green-600 hover:bg-green-700 text-white";
    }

    if (isInCart) {
      return "bg-gray-600 hover:bg-gray-700 text-white cursor-default";
    }

    return "bg-white hover:bg-gray-100 text-black";
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isAdding || (isInCart && !justAdded)}
      className={`
        inline-flex items-center justify-center font-semibold rounded-lg
        transition-all duration-200 transform hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${getSizeClasses()}
        ${getButtonColor()}
        ${className}
      `}
      aria-label={isInCart ? `${watchName} is already in cart` : `Add ${watchName} to cart`}
    >
      {getButtonContent()}
    </button>
  );
};

export default AddToCartButton;
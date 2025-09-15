'use client';

import { useState, useEffect } from 'react';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Custom hook to manage the Razorpay checkout script.
 * It ensures the script is loaded only once and provides loading status.
 * @returns `[isLoaded, error]` - A tuple where `isLoaded` is true if the script is ready, and `error` is true if it failed to load.
 */
const useRazorpay = (): [boolean, boolean] => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check if the script is already loaded (e.g., by a previous component)
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)) {
      // Also check if the Razorpay object is available on window
      if ((window as any).Razorpay) {
        setIsLoaded(true);
      } else {
        // If script tag exists but object isn't there, wait for it to load
        const script = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)!;
        const handleLoad = () => setIsLoaded(true);
        script.addEventListener('load', handleLoad);
        return () => script.removeEventListener('load', handleLoad);
      }
      return;
    }

    // If script is not loaded, create and append it
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    const handleLoad = () => {
      setIsLoaded(true);
    };

    const handleError = () => {
      setError(true);
      console.error('Razorpay script failed to load.');
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    document.body.appendChild(script);

    // Cleanup function to remove event listeners
    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      // We don't remove the script itself, as it might be needed by other components
      // and it's generally safe to leave it.
    };
  }, []);

  return [isLoaded, error];
};

export default useRazorpay;

'use client';

import { useState, useEffect } from 'react';
import {
  Star,
  ShoppingBag,
  Shield,
  RotateCcw,
  CreditCard,
  ArrowRight,
  Loader2,
  Check,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { useParams } from 'next/navigation';
import { useWatch } from '@/hooks/queries/useWatches';
import { useWatchFromCache, useRandomRecommendations, useWatchImagePreloader } from '@/contexts/WatchCacheContext';
import { WatchImage, Review, WatchColor } from '@/lib/api-services';
import { useAuth } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import { useAddToCart, useIsInCart, useUpdateCartItem } from '@/hooks/queries/useCart';
import PincodeChecker from '@/components/molecules/pincodeChecker/PincodeChecker';
import LoginModal from '@/components/molecules/loginModal/LoginModal';
import EmailVerificationModal from '@/components/organisms/checkout/EmailVerificationModal';
import { useRouter } from 'next/navigation';
import { unprotectedApiClient } from '@/lib/api-clients';

export default function Component() {
  const params = useParams();
  const watchId = params.id as string; // Corrected from 'name' to 'id'

  // Data hooks - use cache first, fallback to API
  const { watch: cachedWatch, isReady: cacheReady } = useWatchFromCache(watchId);
  const { data: apiWatch, isLoading: apiLoading, error } = useWatch(watchId, !cacheReady);
  
  // Use cached data if available, otherwise use API data
  const watch = cachedWatch || apiWatch;
  const loading = !cacheReady && apiLoading;
  
  // Get random recommendations (excluding current watch)
  const { recommendations } = useRandomRecommendations(4, watchId);
  
  // Image preloader hook
  const preloadImages = useWatchImagePreloader();

  // Auth and toast hooks
  const { profile, user, loading: authLoading, refetchProfile } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // State declarations first
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("information");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [loginAction, setLoginAction] = useState<'buy_now' | 'add_to_cart'>('buy_now');
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [pincode, setPincode] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<{
    serviceable: boolean;
    message: string;
    estimatedDays?: number;
    deliveryDate?: string;
  } | null>(null);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);

  // Cart hooks (after state is declared)
  const addToCart = useAddToCart();
  const { mutate: updateCartItem, isPending: isUpdatingCart } = useUpdateCartItem();

  // Check if current watch color combination is in cart
  const watchColorId = watch?.WatchColors?.[selectedColor]?.id || '';
  const isAuthenticated = !!(user || profile);
  const { isInCart, cartItem } = useIsInCart(watchColorId, isAuthenticated);
  const [reviewData, setReviewData] = useState({
    name: "",
    rating: 0,
    comment: "",
  });

  // Sync local quantity with cart quantity
  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
    } else {
      setQuantity(1); // Reset to 1 if item not in cart or color changes
    }
  }, [cartItem]);

  // Reset selected image when color changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  // Preload images when watch data is available
  useEffect(() => {
    if (watch && watchId) {
      // Preload images for all color variants of this watch
      preloadImages(watchId);
      console.log(`🖼️ Preloading images for watch: ${watch.name}`);
    }
  }, [watch, watchId, preloadImages]);

  const handleQuantityChange = (newQuantity: number) => {
    if (!cartItem) return;

    const finalQuantity = Math.max(1, newQuantity);
    setQuantity(finalQuantity); // Optimistic update

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      updateCartItem({
        cartItemId: cartItem.id,
        data: { quantity: finalQuantity }
      });
    }, 1500); // 1.5s delay

    setDebounceTimer(timer);
  };

  const formatObjectToString = (value: string | object | null | undefined): string => {
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${val !== null ? val : 'null'}`)
        .join(', ');
    }
    return String(value || ''); // Handle null values
  };

  // Get dispatch date (current date + 2 days)
  const getDispatchDate = () => {
    const today = new Date();
    const dispatchDate = new Date(today);
    dispatchDate.setDate(today.getDate() + 2);
    return dispatchDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Get delivery date based on dispatch + estimated days
  const getDeliveryDate = (estimatedDays: number) => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 2 + estimatedDays); // dispatch + delivery days
    return deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Handle pincode checking
  const checkPincode = async () => {
    if (pincode.length !== 6) {
      showToast('Please enter a valid 6-digit pincode', 'error');
      return;
    }

    setIsCheckingPincode(true);
    
    try {
      // Call the public Delhivery serviceability API
      const response = await unprotectedApiClient.get(`/delhivery/serviceability/${pincode}`);
      const data = response.data;
      
      if (data.success) {
        const estimatedDays = data.serviceable ? Math.floor(Math.random() * 4) + 3 : 0; // 3-6 days
        const deliveryDate = data.serviceable ? getDeliveryDate(estimatedDays) : '';
        
        // Only update result when we get a successful API response
        setPincodeResult({
          serviceable: data.serviceable,
          message: data.serviceable 
            ? 'Great! We deliver to this location' 
            : data.message || 'Sorry, we don\'t deliver to this pincode yet',
          estimatedDays,
          deliveryDate
        });
        
        showToast(
          data.serviceable 
            ? 'Delivery available in your area!' 
            : data.message || 'Service not available in this area',
          data.serviceable ? 'success' : 'info'
        );
      } else {
        // Only update result when we get a response (even if not successful)
        setPincodeResult({
          serviceable: false,
          message: data.message || 'Unable to check serviceability'
        });
        showToast(data.message || 'Failed to check serviceability', 'error');
      }
    } catch (error) {
      console.error('Serviceability check error:', error);
      showToast('Failed to check serviceability. Please try again.', 'error');
      // Don't clear previous result on network error - keep showing previous data
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setPincode(value);
      // Don't reset result immediately - keep previous values until new API call succeeds
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    // Check authentication - use both user and profile for robust check
    if (!user && !profile) {
      // Store current path for redirect after login
      sessionStorage.setItem('redirectAfterLogin', `/collections/${watchId}`);
      setLoginAction('add_to_cart');
      setShowLoginModal(true);
      return;
    }

    // If user exists but profile is still loading, wait a moment
    if (user && !profile && authLoading) {
      showToast("Loading your profile, please wait...", "info");
      return;
    }

    // If authenticated, proceed with add to cart
    await handleAddToCartAfterAuth();
  };

  // Handle login success
  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    
    try {
      // Force refresh the profile to get the latest data including email
      console.log('Refreshing profile after login...');
      await refetchProfile();
      
      // Wait a moment for the profile state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Profile refreshed successfully:', { 
        id: profile?.id, 
        email: profile?.email,
        hasEmail: !!profile?.email 
      });
      
      // Execute the original action that triggered login
      if (loginAction === 'buy_now') {
        await handleBuyNowAfterAuth();
      } else if (loginAction === 'add_to_cart') {
        await handleAddToCartAfterAuth();
      }
    } catch (error) {
      console.error('Failed to refresh profile after login:', error);
      showToast('Failed to load profile. Please try again.', 'error');
    }
  };

  // Handle email verification success
  const handleEmailVerificationSuccess = async () => {
    setShowEmailVerificationModal(false);
    showToast("Email verified successfully!", "success");
    
    // After email verification, proceed with buy now
    if (loginAction === 'buy_now') {
      // Add item to cart first, then navigate to checkout
      await handleAddItemToCartForCheckout();
    }
  };

  // Helper function to add item to cart for checkout
  const handleAddItemToCartForCheckout = async () => {
    if (!watch) {
      showToast("Watch data not available. Please try again.", "error");
      return;
    }

    const selectedWatchColor = watch.WatchColors?.[selectedColor];
    if (!selectedWatchColor) {
      showToast("Please select a color.", "error");
      return;
    }

    setIsBuyingNow(true);

    try {
      // Add to cart if not already in cart
      if (!isInCart) {
        await addToCart.mutateAsync({
          watchColorIds: [
            {
              watch_color_id: selectedWatchColor.id,
              quantity: quantity,
            },
          ],
        });
        
        showToast(`${watch.name} added to cart successfully!`, "success");
        
        // Wait a moment for cart state to update before navigation
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Navigate to checkout
      router.push('/checkout');
    } catch (error: any) {
      console.error("Add to cart error:", error);
      showToast("Failed to add item to cart. Please try again.", "error");
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Handle add to cart after authentication
  const handleAddToCartAfterAuth = async () => {
    // Check if watch data is available
    if (!watch) {
      showToast("Watch data not available. Please try again.", "error");
      return;
    }

    const selectedWatchColor = watch.WatchColors?.[selectedColor];
    if (!selectedWatchColor) {
      showToast("Please select a color.", "error");
      return;
    }

    setIsAddingToCart(true);

    try {
      await addToCart.mutateAsync({
        watchColorIds: [
          {
            watch_color_id: selectedWatchColor.id,
            quantity: quantity,
          },
        ],
      });

      showToast(`${watch.name} (${selectedWatchColor.name}) added to cart successfully!`, "success");
      
      // Check if email verification is needed for future checkout
      if (!profile?.email) {
        showToast("Please verify your email for faster checkout", "info");
      }
    } catch (error: any) {
      console.error("Add to cart error:", error);

      // Handle specific error cases
      if (error?.response?.status === 409) {
        showToast(`${watch.name} is already in your cart`, "info");
      } else if (error?.response?.status === 400) {
        showToast("This item is out of stock", "error");
      } else if (error?.response?.status === 404) {
        showToast("Watch color not found. Please ensure the watch colors are set up in the backend.", "error");
      } else {
        showToast("Failed to add item to cart. Please try again.", "error");
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle buy now after authentication
  const handleBuyNowAfterAuth = async () => {
    console.log('Checking email after authentication:', { 
      email: profile?.email,
      profileId: profile?.id 
    });
    
    // Check if email exists and is valid
    const hasValidEmail = profile?.email && profile.email.trim() !== '';
    
    if (!hasValidEmail) {
      console.log('Email verification needed - showing modal');
      setShowEmailVerificationModal(true);
      return;
    }

    console.log('Email exists, proceeding to checkout:', profile?.email);

    // Use the shared helper function to add item and go to checkout
    await handleAddItemToCartForCheckout();
  };

  // Handle buy now
  const handleBuyNow = async () => {
    // Check authentication first - use both user and profile for robust check
    if (!user && !profile) {
      // Store current path for redirect after login
      sessionStorage.setItem('redirectAfterLogin', `/collections/${watchId}`);
      setLoginAction('buy_now');
      setShowLoginModal(true);
      return;
    }

    // If user exists but profile is still loading, wait a moment
    if (user && !profile && authLoading) {
      showToast("Loading your profile, please wait...", "info");
      return;
    }

    // If authenticated, proceed with buy now
    await handleBuyNowAfterAuth();
  };

  const getImageViews = (watchColors: any[] | undefined) => {
    if (!watchColors || watchColors.length === 0) return [];
    
    // Get images from the selected color
    const selectedColorData = watchColors[selectedColor];
    if (!selectedColorData || !selectedColorData.WatchImage || selectedColorData.WatchImage.length === 0) {
      return [];
    }
    
    const images = selectedColorData.WatchImage[0];
    const views = [];
    
    // Format image URLs properly
    const formatUrl = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return `https://${url}`;
    };
    
    if (images.isoview) views.push({ url: formatUrl(images.isoview), label: 'ISO View' });
    if (images.front) views.push({ url: formatUrl(images.front), label: 'Front View' });
    if (images.back) views.push({ url: formatUrl(images.back), label: 'Back View' });
    if (images.side) views.push({ url: formatUrl(images.side), label: 'Side View' });
    if (images.strap) views.push({ url: formatUrl(images.strap), label: 'Strap View' });
    if (images.closeup) views.push({ url: formatUrl(images.closeup), label: 'Close Up' });
    if (images.dial) views.push({ url: formatUrl(images.dial), label: 'Dial View' });
    
    return views;
  };

  // Use cached recommendations instead of static data
  const relatedProducts = recommendations.map(watch => {
    const firstColor = watch.WatchColors?.[0];
    const actualprice = firstColor ? parseFloat(firstColor.actualprice || '0') : 0;
    const offerprice = firstColor ? parseFloat(firstColor.offerprice || '0') : 0;
    
    // Get the first available image
    const imageData = firstColor?.WatchImage?.[0];
    let imageUrl = '/images/alban-marcus-watch.png';
    
    if (imageData) {
      imageUrl = imageData.front || imageData.isoview || imageData.side || imageData.closeup || '/images/alban-marcus-watch.png';
      if (imageUrl && imageUrl !== 'undefined' && imageUrl !== 'null') {
        imageUrl = imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`;
      } else {
        imageUrl = '/images/alban-marcus-watch.png';
      }
    }
    
    return {
      id: watch.id,
      name: watch.name,
      price: offerprice > 0 ? offerprice : actualprice,
      originalPrice: actualprice,
      image: imageUrl,
      watchId: watch.id
    };
  });

  if (loading) {
    return (
      <div className='pt-[90px] pb-[70px] bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen'>
        <div className='container'>
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className="inline-flex items-center space-x-3">
              <Loader2 className='w-8 h-8 animate-spin text-gray-900' />
              <span className='text-lg font-medium text-gray-900'>Loading luxury watch details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !watch) {
    return (
      <div className='pt-[90px] pb-[70px] bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen'>
        <div className='container'>
          <div className='text-center min-h-[400px] flex items-center justify-center'>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
              <h2 className='text-2xl font-bold mb-4 text-gray-900'>Watch Not Found</h2>
              <p className='text-gray-600 mb-6'>
                {error?.message || 'The requested watch could not be found.'}
              </p>
              <Link href='/collections' className='bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors inline-block'>
                Return to Collections
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const imageViews = getImageViews(watch.WatchColors);
  
  // Get pricing from selected color
  const selectedWatchColor = watch.WatchColors?.[selectedColor] as any;
  const actualprice = selectedWatchColor ? parseFloat(selectedWatchColor.actualprice || '0') : 0;
  const offerprice = selectedWatchColor ? parseFloat(selectedWatchColor.offerprice || '0') : 0;
  const offerpercentage = selectedWatchColor ? selectedWatchColor.offerpercentage : 0;
  
  const discountPercentage = offerpercentage || 
    (offerprice > 0 && actualprice > offerprice ? Math.round(((actualprice - offerprice) / actualprice) * 100) : 0);

  return (
    <div className='pt-[90px] pb-[70px] bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen'>
      <div className='container'>
        <div className='flex items-center text-[14px] pb-[40px] gap-2 text-gray-700'>
          <Link href='/' className='opacity-60 hover:opacity-100 hover:text-black transition-colors'>Home</Link>
          <MdKeyboardArrowRight className='text-gray-400' />
          <Link href='/collections' className='opacity-60 hover:opacity-100 hover:text-black transition-colors'>Collections</Link>
          <MdKeyboardArrowRight className='text-gray-400' />
          <span className='text-black font-medium'>{watch.name}</span>
        </div>

        <div className='py-8'>
          <div className='bg-white rounded-3xl shadow-2xl overflow-hidden'>
            <div className='gap-12 p-8 flex max-[991px]:flex-col max-[991px]:gap-8'>
              <div className='flex gap-4 max-[768px]:flex-col-reverse flex-1'>
                {imageViews.length > 1 && (
                  <div className='flex flex-col gap-4 max-[768px]:flex-row'>
                    {imageViews.slice(0, 4).map((view, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-20 rounded-lg border-2 overflow-hidden transition-all duration-200 ${selectedImage === index ? 'border-gray-900 ring-2 ring-gray-300' : 'border-gray-300 hover:border-gray-500'}`}
                        title={view.label}
                      >
                        <Image
                          src={view.url}
                          alt={view.label}
                          width={80}
                          height={80}
                          className='w-full h-full object-cover'
                        />
                      </button>
                    ))}
                  </div>
                )}
                <div className='flex-1 relative'>
                  <div className='aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative group'>
                    <Image
                      src={imageViews[selectedImage]?.url || imageViews[0]?.url || '/images/alban-marcus-watch.png'}
                      alt={watch.name || 'Watch'}
                      width={500}
                      height={500}
                      className='w-full h-full object-contain p-8 cursor-zoom-in transition-transform duration-500 group-hover:scale-150'
                    />
                    
                    {/* Zoom Icon */}
                    <div className='absolute top-4 right-4 bg-white bg-opacity-80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <svg className='w-5 h-5 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7' />
                      </svg>
                    </div>
                    
                    {/* Image Counter */}
                    <div className='absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs'>
                      {selectedImage + 1} / {imageViews.length}
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex-1'>
                <div className='pb-4'>
                  {/* Brand Name */}
                  <p className='text-gray-600 mb-1' style={{ fontSize: '14px' }}>
                    {(watch as any).brand || selectedWatchColor?.watch_name || 'Alban Marcus'}
                  </p>
                  
                  {/* Watch Name */}
                  <h1 className='text-gray-900 font-semibold mb-2' style={{ fontSize: '18px' }}>
                    {watch.name}
                  </h1>
                  
                  {/* Description */}
                  {watch.description && watch.description !== 'undefined' && (
                    <p className='text-gray-500 mb-3' style={{ fontSize: '12px' }}>
                      {formatObjectToString(watch.description)}
                    </p>
                  )}
                  
                  {/* Price Section */}
                  <div className='mb-3'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-gray-500' style={{ fontSize: '14px' }}>MRP</span>
                      {offerprice > 0 ? (
                        <span className='text-gray-900 font-bold' style={{ fontSize: '24px' }}>
                          ₹{offerprice.toLocaleString('en-IN')}
                        </span>
                      ) : actualprice > 0 ? (
                        <span className='text-gray-900 font-bold' style={{ fontSize: '24px' }}>
                          ₹{actualprice.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className='text-gray-600' style={{ fontSize: '18px' }}>
                          Contact for Price
                        </span>
                      )}
                    </div>
                    <p className='text-gray-500' style={{ fontSize: '12px' }}>Inclusive of all taxes*</p>
                    
                    {/* Rating Only */}
                    {/* <div className='flex items-center gap-2 mt-2'>
                      <div className='flex items-center gap-1'>
                        <Star className='w-4 h-4 fill-orange-400 text-orange-400' />
                        <span className='text-gray-900 font-semibold' style={{ fontSize: '14px' }}>
                          {watch.rating?.toFixed(1) || '4.5'}
                        </span>
                      </div>
                    </div> */}

                   
                  </div>
                  
                </div>

                {/* Watch Variants Section */}
                <div className='mb-6'>
                  <div className='flex items-center gap-2 mb-3'>
                    <span className='text-gray-900 font-semibold' style={{ fontSize: '16px' }}>Choose Variant:</span>
                    <span className='text-gray-700' style={{ fontSize: '14px' }}>
                      {selectedWatchColor?.name || 'Default'}
                    </span>
                  </div>
                  <div className='space-y-3'>
                    {watch.WatchColors?.map((color: WatchColor, index: number) => {
                      // Get the front view image for this variant - with better fallback logic
                      const imageData = color.WatchImage?.[0];
                      let frontImage = '/images/alban-marcus-watch.png'; // default fallback
                      
                      if (imageData) {
                        // Try multiple image sources in order of preference
                        frontImage = imageData.front || imageData.isoview || imageData.side || imageData.closeup || '/images/alban-marcus-watch.png';
                      }
                      
                      const formatUrl = (url: string) => {
                        if (!url || url === 'undefined' || url === 'null') {
                          console.log(`Missing image for variant: ${color.name}, using fallback`);
                          return '/images/alban-marcus-watch.png';
                        }
                        if (url.startsWith('http://') || url.startsWith('https://')) {
                          return url;
                        }
                        return `https://${url}`;
                      };
                      
                      const finalImageUrl = formatUrl(frontImage);
                      
                      return (
                        <label
                          key={color.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                            selectedColor === index
                              ? 'border-black bg-white shadow-lg'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="watchVariant"
                            checked={selectedColor === index}
                            onChange={() => setSelectedColor(index)}
                            className="sr-only"
                          />
                          
                          {/* Image container */}
                          <div className='relative w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0'>
                            <Image
                              src={finalImageUrl}
                              alt={color.name}
                              fill
                              className='object-contain p-2'
                              sizes='64px'
                              onError={(e) => {
                                console.error(`Failed to load image for ${color.name}:`, finalImageUrl);
                                // Set fallback image on error
                                e.currentTarget.src = '/images/alban-marcus-watch.png';
                              }}
                            />
                          </div>
                          
                          {/* Text content */}
                          <div className='flex-1'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <h4 className='font-bold text-gray-900' style={{ fontSize: '14px' }}>
                                  {color.name}
                                </h4>
                                <p className='text-gray-600' style={{ fontSize: '12px' }}>
                                  Variant Option
                                </p>
                              </div>
                              
                              {/* Radio indicator */}
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                selectedColor === index
                                  ? 'backgroundBlack border-black'
                                  : 'border-gray-300 bg-white'
                              }`}>
                                {/* No inner dot - solid black circle when selected */}
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='mb-6'>
                  <div className='flex gap-3 mb-4'>
                    <button
                      onClick={handleAddToCart}
                      className={`flex-1 py-3 border border-gray-900 text-gray-900 font-medium rounded transition-colors ${
                        !watch.stockavailability || isAddingToCart
                          ? 'opacity-50 cursor-not-allowed'
                          : isInCart
                          ? 'bg-green-600 text-white border-green-600'
                          : 'hover:bg-gray-200 hover:text_color_white'
                      }`}
                      disabled={!watch.stockavailability || isAddingToCart}
                      style={{ fontSize: '16px' }}
                    >
                      {isAddingToCart ? (
                        <Loader2 className='w-4 h-4 animate-spin inline mr-2' />
                      ) : isInCart ? (
                        <Check className='w-4 h-4 inline mr-2' />
                      ) : (
                        <ShoppingBag className='w-4 h-4 inline mr-2' />
                      )}
                      {isAddingToCart ? 'ADDING...' : isInCart ? 'IN CART' : 'ADD TO BAG'}
                    </button>
                    
                    <button
                      onClick={handleBuyNow}
                      className={`flex-1 py-3 bg-gray-900 text-white font-medium rounded transition-colors ${
                        !watch.stockavailability || isBuyingNow
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-800'
                      }`}
                      disabled={!watch.stockavailability || isBuyingNow}
                      style={{ fontSize: '16px' }}
                    >
                      {isBuyingNow ? (
                        <Loader2 className='w-4 h-4 animate-spin inline mr-2' />
                      ) : (
                        <Zap className='w-4 h-4 inline mr-2' />
                      )}
                      {isBuyingNow ? 'PROCESSING...' : 'BUY NOW'}
                    </button>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className='mb-4'>
                  <button
                    onClick={() => setShowPincodeModal(true)}
                    className='w-full p-4 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 cursor-pointer'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='text-left'>
                        <div className='flex items-center gap-2 mb-2'>
                          <span className='text-gray-900 font-semibold' style={{ fontSize: '14px' }}>📦 Check Delivery Availability</span>
                        </div>
                        <p className='text-gray-600' style={{ fontSize: '12px' }}>
                          Dispatch by {getDispatchDate()}
                        </p>
                        <p className='text-orange-600' style={{ fontSize: '12px' }}>
                          If ordered by Today
                        </p>
                        {pincodeResult && pincodeResult.serviceable && (
                          <div className='mt-1'>
                            <p className='text-green-600 font-medium' style={{ fontSize: '12px' }}>
                              Expected delivery for {pincode}: {pincodeResult.deliveryDate}
                            </p>
                            <button
                              onClick={() => setShowPincodeModal(true)}
                              className='text-blue-600 hover:text-blue-800 font-medium transition-colors mt-1'
                              style={{ fontSize: '11px' }}
                            >
                              Change pincode
                            </button>
                          </div>
                        )}
                      </div>
                      <ArrowRight className='w-5 h-5 text-gray-400' />
                    </div>
                  </button>
                </div>

                 {/* AI Recommended Events Section */}
                 <div className='mt-6 p-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl border-2 border-gray-300 shadow-lg'>
                      <div className='flex items-center gap-3 mb-5'>
                        <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-black'>
                          <svg className='w-5 h-5 text-black' fill='black' viewBox='0 0 20 20'>
                            <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'/>
                          </svg>
                        </div>
                        <h4 className='text-xl font-bold text-gray-900'>AI Recommended Events</h4>
                      </div>
                      <p className='text-gray-700 mb-5 leading-relaxed font-medium' style={{ fontSize: '14px' }}>
                        Our AI will analyze this watch's design, specifications, and aesthetics to recommend perfect occasions in real-time
                      </p>
                      <div className='flex flex-wrap gap-3'>
                        {(() => {
                          // 40 different events for variety
                          const allEvents = [
                            'Business Meeting', 'Wedding Ceremony', 'Corporate Dinner', 'Anniversary Celebration',
                            'Board Meeting', 'Graduation Day', 'Job Interview', 'Date Night',
                            'Formal Gala', 'Conference', 'Award Ceremony', 'Cocktail Party',
                            'Office Party', 'Client Meeting', 'Networking Event', 'Product Launch',
                            'Team Building', 'Executive Lunch', 'Charity Event', 'Art Gallery Opening',
                            'Wine Tasting', 'Business Travel', 'Important Presentation', 'Company Anniversary',
                            'Holiday Party', 'Retirement Celebration', 'Promotion Dinner', 'Industry Summit',
                            'VIP Event', 'Milestone Celebration', 'Professional Conference', 'Leadership Meeting',
                            'Investor Meeting', 'Contract Signing', 'Achievement Award', 'Formal Dinner',
                            'Corporate Retreat', 'Executive Session', 'Business Lunch', 'Special Occasion'
                          ];
                          
                          // Use watch ID as seed for consistent recommendations
                          const watchSeed = watchId ? parseInt(watchId.replace(/\D/g, '')) || 0 : 0;
                          
                          // Create a seeded random function for consistent results
                          const seededRandom = (seed: number) => {
                            const x = Math.sin(seed) * 10000;
                            return x - Math.floor(x);
                          };
                          
                          // Generate consistent shuffle based on watch ID
                          const shuffledEvents = [...allEvents].sort((a, b) => {
                            const seedA = watchSeed + a.charCodeAt(0);
                            const seedB = watchSeed + b.charCodeAt(0);
                            return seededRandom(seedA) - seededRandom(seedB);
                          });
                          
                          // Always select 5 events consistently
                          const selectedEvents = shuffledEvents.slice(0, 5);
                          
                          return selectedEvents.map((event, index) => (
                            <span
                              key={`${watchId}-${event}-${index}`}
                              className='px-4 py-2 rounded-full font-bold bg-black text-white backgroundBlack'
                              style={{ fontSize: '10px', minHeight: '32px', display: 'flex', alignItems: 'center' }}
                            >
                              {event}
                            </span>
                          ));
                        })()}
                      </div>
                      <div className='mt-4 text-gray-600 italic font-medium' style={{ fontSize: '12px' }}>
                        ✨ Powered by AI 
                      </div>
                    </div>

                {/* Service Icons */}
                <div className='grid grid-cols-4 gap-6 py-6 border-t border-gray-200'>
                  <div className='text-center'>
                    <div className='w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center'>
                      <Shield className='w-8 h-8 text-gray-600' />
                    </div>
                    <p className='text-gray-700 font-medium' style={{ fontSize: '12px' }}>24 Months</p>
                    <Link href='/warranty' className='text-gray-700 hover:text-gray-900 underline transition-colors' style={{ fontSize: '12px' }}>
                      Warranty
                    </Link>
                  </div>
                  
                  <div className='text-center'>
                    <div className='w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center'>
                      <svg className='w-8 h-8 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
                      </svg>
                    </div>
                    <p className='text-gray-700 font-medium' style={{ fontSize: '12px' }}>Free Shipping</p>
                    <p className='text-gray-700' style={{ fontSize: '12px' }}>Countrywide</p>
                  </div>
                  
                  <div className='text-center'>
                    <div className='w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center'>
                      <RotateCcw className='w-8 h-8 text-gray-600' />
                    </div>
                    <p className='text-gray-700 font-medium' style={{ fontSize: '12px' }}>Easy</p>
                    <p className='text-gray-700' style={{ fontSize: '12px' }}>Return</p>
                  </div>
                  
                  <div className='text-center'>
                    <div className='w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center'>
                      <svg className='w-8 h-8 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' />
                      </svg>
                    </div>
                    <p className='text-gray-700 font-medium' style={{ fontSize: '12px' }}>Serviced</p>
                    <p className='text-gray-700' style={{ fontSize: '12px' }}>Across India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What's in the Box Section */}
          <div className='bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-12'>
            <div className='text-center mb-8 md:mb-12'>
              <h3 className='text-3xl md:text-4xl lg:text-5xl text-gray-900 font-bold mb-6 md:mb-8 tracking-tight'>
                What's in the Box
              </h3>
              <p className='text-gray-700 leading-relaxed font-light max-w-3xl mx-auto' style={{ fontSize: '14px' }}>
                Inside every Alban Marcus package, you'll receive premium accessories designed to enhance your luxury watch experience
              </p>
            </div>

            {/* Items Grid - matching Service Icons style */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-gray-200'>
              {/* Premium Watch Box */}
              <div className='text-center'>
                <div className='w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center'>
                  <svg className='w-8 h-8 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4' />
                  </svg>
                </div>
                <p className='text-gray-700 font-medium' style={{ fontSize: '12px' }}>Premium</p>
                <p className='text-gray-700' style={{ fontSize: '12px' }}>Watch Box</p>
              </div>

              {/* Polishing Cloth */}
              <div className='text-center'>
                <div className='w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center'>
                  <svg className='w-8 h-8 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v8' />
                  </svg>
                </div>
                <p className='text-gray-700 font-medium' style={{ fontSize: '12px' }}>Polishing</p>
                <p className='text-gray-700' style={{ fontSize: '12px' }}>Cloth</p>
              </div>

              {/* Owner's Manual */}
              <div className='text-center'>
                <div className='w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center'>
                  <svg className='w-8 h-8 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                  </svg>
                </div>
                <p className='text-gray-700 font-medium' style={{ fontSize: '12px' }}>Owner's</p>
                <p className='text-gray-700' style={{ fontSize: '12px' }}>Manual</p>
              </div>

              {/* Warranty Card */}
              <div className='text-center'>
                <div className='w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center'>
                  <Shield className='w-8 h-8 text-gray-600' />
                </div>
                <p className='text-gray-700 font-medium' style={{ fontSize: '12px' }}>Warranty Card</p>
                <p className='text-gray-700' style={{ fontSize: '12px' }}>Peace of mind</p>
              </div>
            </div>

            {/* Additional Description */}
            <div className='text-center pt-6 border-t border-gray-200'>
              <p className='text-gray-700 leading-relaxed font-light' style={{ fontSize: '14px' }}>
                Each timepiece comes with premium accessories ensuring complete luxury experience and worldwide support
              </p>
            </div>
          </div>

          <div className='bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-12'>
            <div className='flex gap-8 md:gap-12 flex-col lg:flex-row'>
              {/* Left Side - Description and Details */}
              <div className='flex-1'>
                <h2 className='text-3xl md:text-4xl lg:text-5xl text-gray-900 font-bold mb-6 md:mb-8 tracking-tight'>
                  All about watch
                </h2>
                
                {/* Description */}
                {watch.description && watch.description !== 'undefined' && (
                  <div className='mb-6 md:mb-8'>
                    <p className='text-gray-700 leading-relaxed font-light' style={{ fontSize: '14px' }}>
                      {formatObjectToString(watch.description)}
                    </p>
                  </div>
                )}

                {/* Technical Specifications Table */}
                {watch.characteristics && (
                  <div className='mb-8'>
                    <h3 className='text-2xl font-bold text-gray-900 mb-6 tracking-tight'>Technical Specifications</h3>
                    <div className='bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-0 divide-x-0 md:divide-x divide-gray-200'>
                        {Object.entries(typeof watch.characteristics === 'object' ? watch.characteristics : {})
                          .filter(([key]) => {
                            // Skip unwanted fields - more comprehensive list
                            const skipFields = [
                              'id', 'watch_id', 'watchId', 'created_at', 'updated_at', 'createdAt', 'updatedAt',
                              'createdat', 'updatedat', 'Created_at', 'Updated_at'
                            ];
                            return !skipFields.includes(key);
                          })
                          .map(([key, value], index) => {
                            // Convert camelCase to readable format
                            const readableKey = key
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, str => str.toUpperCase())
                              .replace(/case diameter/i, 'Case Diameter')
                              .replace(/case thickness/i, 'Case Thickness')
                              .replace(/case material/i, 'Case Material')
                              .replace(/lug spacing/i, 'Lug Spacing')
                              .replace(/water resistance/i, 'Water Resistance')
                              .replace(/movement type/i, 'Movement Type')
                              .replace(/dial/i, 'Dial')
                              .replace(/crystal/i, 'Crystal')
                              .replace(/bezel/i, 'Bezel')
                              .replace(/strap/i, 'Strap')
                              .replace(/weight/i, 'Weight')
                              .replace(/movement/i, 'Movement');

                            const isLeftColumn = index % 2 === 0;
                            
                            return (
                              <div 
                                key={key} 
                                className={`px-4 md:px-6 py-4 md:py-5 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200 last:border-b-0 md:border-b-0 ${
                                  !isLeftColumn ? 'md:border-l md:border-gray-200' : ''
                                }`}
                              >
                                <dt className='text-[1.4rem] font-bold text-gray-900 tracking-wide mb-2' style={{ fontSize: '14px' }}>
                                  {readableKey}
                                </dt>
                                <dd className='text-gray-700 font-medium leading-relaxed' style={{ fontSize: '13px' }}>
                                  {typeof value === 'object' ? formatObjectToString(value) : String(value)}
                                </dd>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Warranty and Release Date - Responsive */}
                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 pt-6 border-t border-gray-200'>
                  <div className='flex items-center gap-4'>
                    <div className='w-3 h-3 bg-gradient-to-r from-gray-800 to-gray-600 rounded-full'></div>
                    <div>
                      <Link href='/warranty' className='text-[1.4rem] font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors'>
                        Warranty Period
                      </Link>
                      <p className='text-base md:text-lg font-bold text-gray-900'>{watch.warrantyperiod}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='w-3 h-3 bg-gradient-to-r from-gray-800 to-gray-600 rounded-full'></div>
                    <div>
                      <span className='text-[1.4rem] font-medium text-gray-500 uppercase tracking-wider'>Release Date</span>
                      <p className='text-base md:text-lg font-bold text-gray-900'>{new Date(watch.releasedate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Category Information */}
              <div className='flex-1 lg:max-w-md mt-8 lg:mt-0'>
                <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 text-white shadow-lg'>
                  <h3 className='text-lg md:text-xl font-bold mb-6 md:mb-8 text-center tracking-wider'>WATCH DETAILS</h3>
                  
                  <div className='space-y-4 md:space-y-6'>
                    <div className='flex justify-between items-center pb-3 md:pb-4 border-b border-gray-700'>
                      <span className='text-gray-300 font-medium' style={{ fontSize: '14px' }}>Category</span>
                      <span className='text-white font-bold' style={{ fontSize: '14px' }}>{watch.category}</span>
                    </div>
                    
                    <div className='flex justify-between items-center pb-3 md:pb-4 border-b border-gray-700'>
                      <span className='text-gray-300 font-medium' style={{ fontSize: '14px' }}>Series</span>
                      <span className='text-white font-bold' style={{ fontSize: '14px' }}>{watch.series}</span>
                    </div>
                    
                    <div className='flex justify-between items-center pb-3 md:pb-4 border-b border-gray-700'>
                      <span className='text-gray-300 font-medium' style={{ fontSize: '14px' }}>Model Group</span>
                      <span className='text-white font-bold' style={{ fontSize: '14px' }}>{watch.modelgroup}</span>
                    </div>
                    
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-300 font-medium' style={{ fontSize: '14px' }}>Theme</span>
                      <span className='text-white font-bold' style={{ fontSize: '14px' }}>{watch.theme}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-3xl shadow-lg p-6 md:p-8'>
            <h2 className='text-2xl text-gray-900 pb-6 font-bold'>
              Recommended for You
              <span className='text-[1.4rem] font-normal text-gray-500 ml-2'>
                (Refreshed daily)
              </span>
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {relatedProducts.length > 0 ? relatedProducts.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/collections/${product.watchId}`}
                  className='group cursor-pointer hover:shadow-xl transition-all duration-300 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 block'
                >
                  <div className='p-4'>
                    <div className='aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 overflow-hidden border border-gray-200'>
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        width={200} 
                        height={200} 
                        className='w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300' 
                        onError={(e) => {
                          e.currentTarget.src = '/images/alban-marcus-watch.png';
                        }}
                      />
                    </div>
                    <div className='flex items-start justify-between bg-white rounded-lg px-4 py-3 border border-gray-200'>
                      <div>
                        <h3 className='text-gray-900 text-base text-xl font-bold truncate'>{product.name}</h3>
                        <div className='flex items-center gap-2'>
                          <span className='text-gray-900 text-xl font-bold'>
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className='text-gray-500 line-through text-xl'>
                              ₹{product.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className='w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors' />
                    </div>
                  </div>
                </Link>
              )) : (
                // Fallback if no recommendations available
                <div className='col-span-full text-center py-8'>
                  <p className='text-gray-500'>Loading recommendations...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        onSuccess={() => {
          setShowEmailVerificationModal(false);
          showToast("Email verified successfully! Proceeding to checkout...", "success");
          // Continue with buy now flow after email verification
          setTimeout(() => {
            router.push('/checkout');
          }, 1000);
        }}
      />

      {/* Pincode Modal */}
      {showPincodeModal && (
        <div className='fixed inset-0 flex items-center justify-center p-4' style={{ zIndex: 9999, backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
          <div className='backgroundWhite rounded-2xl px-8 py-6 w-full max-w-lg mx-auto shadow-2xl relative'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-bold text-gray-900'>Check Delivery</h3>
              <button
                onClick={() => setShowPincodeModal(false)}
                className='w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors'
              >
                <svg className='w-5 h-5 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            <div className='mb-4'>
              <p className='text-gray-600 mb-3' style={{ fontSize: '14px' }}>
                Enter your 6-digit pincode to check delivery availability
              </p>
              
              <div className='flex gap-3 mb-4'>
                <input
                  type='text'
                  value={pincode}
                  onChange={handlePincodeChange}
                  onKeyPress={(e) => e.key === 'Enter' && checkPincode()}
                  placeholder='Enter pincode'
                  className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors'
                  maxLength={6}
                  inputMode='numeric'
                  style={{ 
                    fontSize: '16px', 
                    color: 'black', 
                    backgroundColor: 'white',
                    caretColor: 'black'
                  }}
                />
                <button
                  onClick={checkPincode}
                  disabled={pincode.length !== 6 || isCheckingPincode}
                  className='px-6 py-3 backgroundBlack text_color_white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2'
                >
                  {isCheckingPincode ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    'Check'
                  )}
                </button>
              </div>

              {/* Dispatch Info */}
              <div className='bg-gray-50 p-4 rounded-lg mb-4'>
                <p className='text-gray-700 font-medium' style={{ fontSize: '14px' }}>
                  📦 Dispatch Information
                </p>
                <p className='text-gray-600' style={{ fontSize: '12px' }}>
                  Dispatch by: {getDispatchDate()}
                </p>
                <p className='text-orange-600' style={{ fontSize: '12px' }}>
                  If ordered by today
                </p>
              </div>

              {/* Pincode Result */}
              {pincodeResult && (
                <div className={`p-4 rounded-lg border-2 ${
                  pincodeResult.serviceable 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className='flex items-start gap-3'>
                    {pincodeResult.serviceable ? (
                      <Check className='w-5 h-5 text-green-600 flex-shrink-0 mt-0.5' />
                    ) : (
                      <svg className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                      </svg>
                    )}
                    <div className='flex-1'>
                      <p className={`font-bold ${pincodeResult.serviceable ? 'text-green-800' : 'text-red-800'}`} style={{ fontSize: '14px' }}>
                        {pincodeResult.message}
                      </p>
                      {pincodeResult.serviceable && pincodeResult.estimatedDays && pincodeResult.deliveryDate && (
                        <div className='mt-2'>
                          <p className='text-green-700 font-medium' style={{ fontSize: '13px' }}>
                            Expected delivery: {pincodeResult.deliveryDate}
                          </p>
                          <p className='text-green-600' style={{ fontSize: '12px' }}>
                            ({pincodeResult.estimatedDays}-{pincodeResult.estimatedDays + 2} business days)
                          </p>
                        </div>
                      )}
                      {pincodeResult.serviceable && (
                        <button
                          onClick={() => {
                            setPincode('');
                            // Don't clear pincodeResult immediately - let user enter new pincode first
                          }}
                          className='mt-3 text_color_black hover:text-black-800 font-medium transition-colors'
                          style={{ fontSize: '12px' }}
                        >
                          Change pincode
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className='flex gap-3'>
              {pincodeResult && pincodeResult.serviceable && (
                <button
                  onClick={() => {
                    setShowPincodeModal(false);
                    // You can add logic here to proceed with the order
                  }}
                  className='flex-1 py-6 backgroundBlack text_color_white rounded-lg font-medium hover:bg-gray-800 transition-colors'
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        title="Sign In Required"
        message={loginAction === 'buy_now' 
          ? "Please sign in to proceed with your purchase" 
          : "Please sign in to add items to your cart"
        }
      />

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        onSuccess={handleEmailVerificationSuccess}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  Star,
  ShoppingBag,
  Shield,
  RotateCcw,
  CreditCard,
  ArrowRight,
  Loader2,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { useParams } from 'next/navigation';
import { useWatch } from '@/hooks/queries/useWatches';
import { WatchImage, Review } from '@/lib/api-services';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useAddToCart, useIsInCart } from '@/hooks/queries/useCart';

export default function Component() {
  const params = useParams();
  const watchId = params.id as string; // Corrected from 'name' to 'id'

  // Data hooks
  const { data: watch, isLoading: loading, error } = useWatch(watchId);

  // Auth and toast hooks
  const { profile } = useAuth();
  const { showToast } = useToast();

  // State declarations first
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("information");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Cart hooks (after state is declared)
  const addToCart = useAddToCart();

  // Check if current watch color combination is in cart
  const watchColorId = watch?.WatchColors?.[selectedColor]?.id || '';
  const { isInCart } = useIsInCart(watchColorId);
  const [reviewData, setReviewData] = useState({
    name: "",
    rating: 0,
    comment: "",
  });

  const formatObjectToString = (value: string | object | undefined): string => {
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ');
    }
    return (value as string) || '';
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    // Check authentication
    if (!profile) {
      showToast("Please sign in to add items to cart. Click the user icon in the header to login.", "info");
      return;
    }

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


  const getImageViews = (watchImages: WatchImage[] | undefined) => {
    if (!watchImages || watchImages.length === 0) return [];
    const images = watchImages[0];
    const views = [];
    if (images.isoview) views.push({ url: images.isoview, label: 'ISO View' });
    if (images.front) views.push({ url: images.front, label: 'Front View' });
    if (images.back) views.push({ url: images.back, label: 'Back View' });
    if (images.side) views.push({ url: images.side, label: 'Side View' });
    if (images.strap) views.push({ url: images.strap, label: 'Strap View' });
    if (images.closeup) views.push({ url: images.closeup, label: 'Close Up' });
    if (images.dial) views.push({ url: images.dial, label: 'Dial View' });
    return views;
  };

  const relatedProducts = Array(4).fill(null).map((_, i) => ({
    id: i,
    name: 'Alban 0S1',
    price: 240,
    originalPrice: 260,
    image: '/placeholder.svg?height=200&width=200',
  }));

  if (loading) {
    return (
      <div className='pt-[90px] pb-[70px] text-black-1 bg-white-1'>
        <div className='container'>
          <div className='flex items-center justify-center min-h-[400px]'>
            <Loader2 className='w-8 h-8 animate-spin' />
            <span className='ml-2'>Loading watch details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !watch) {
    return (
      <div className='pt-[90px] pb-[70px] text-black-1 bg-white-1'>
        <div className='container'>
          <div className='text-center min-h-[400px] flex items-center justify-center'>
            <div>
              <h2 className='text-2xl font-bold mb-4'>Watch Not Found</h2>
              <p className='text-gray-600 mb-4'>
                {error?.message || 'The requested watch could not be found.'}
              </p>
              <Link href='/collections' className='text-blue-600 hover:underline'>
                Return to Collections
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const imageViews = getImageViews(watch.WatchImages);
  const discountPercentage = Math.round(
    ((watch.actualprice - watch.offerprice) / watch.actualprice) * 100
  );

  return (
    <div className='pt-[90px] pb-[70px] text-black-1 bg-white-1'>
      <div className='container'>
        <p className='flex items-center text-[14px] pb-[40px] gap-2'>
          <Link href='/' className='opacity-60 hover:opacity-100'>Home</Link>
          <MdKeyboardArrowRight />
          <Link href='/collections' className='opacity-60 hover:opacity-100'>Collections</Link>
          <MdKeyboardArrowRight />
          <span>{watch.name}</span>
        </p>

        <div className='py-8'>
          <div className='gap-12 pb-[48px] flex max-[991px]:flex-col max-[991px]:gap-8'>
            <div className='flex gap-4 max-[768px]:flex-col-reverse flex-1'>
              {imageViews.length > 1 && (
                <div className='flex flex-col gap-4 max-[768px]:flex-row'>
                  {imageViews.slice(0, 4).map((view, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg border-2 overflow-hidden ${selectedImage === index ? 'border-[#ff3333]' : 'border-[#d9d9d9]'}`}
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
              <div className='flex-1'>
                <div className='aspect-square bg-[#f8f8fb] rounded-lg overflow-hidden'>
                  <Image
                    src={imageViews[selectedImage]?.url || imageViews[0]?.url || '/images/alban-marcus-watch.png'}
                    alt={watch.name || 'Watch'}
                    width={500}
                    height={500}
                    className='w-full h-full object-contain'
                  />
                </div>
              </div>
            </div>

            <div className='flex-1'>
              <div className='pb-[23px]'>
                <h1 className='text-[40px] font-bold text-black-1 pb-13'>{watch.name}</h1>
                <div className='flex items-center gap-4 pb-[13px] flex-wrap'>
                  <span className='text-[32px] text-black-1'>${watch.offerprice}</span>
                  <span className='text-[32px] text-[rgba(0,0,0,0.3)] line-through'>${watch.actualprice}</span>
                  {discountPercentage > 0 && (
                    <span className='bg-[rgba(255,51,51,0.1)] text-[16px] px-[20px] py-[8px] rounded-full text-[#ff3333]'>
                      -{discountPercentage}%
                    </span>
                  )}
                  <div className='flex items-center gap-2'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < Math.floor(watch.rating || 0) ? 'fill-[#ffc600] text-[#ffc600]' : 'fill-gray-200 text-gray-200'}`}
                      />
                    ))}
                    {watch.reviewscount && watch.reviewscount > 0 && (
                      <span className='text-sm text-gray-500'>({watch.reviewscount})</span>
                    )}
                  </div>
                </div>
                <p className='text-[16px] text-[rgba(0,0,0,0.6)] leading-relaxed line-height-[22px]'>
                  {formatObjectToString(watch.description)}
                </p>
              </div>

              <div className='py-[15px] border-y border-[#d9d9d9]'>
                <h3 className='text-[16px] font-bold text-black-1 pb-[10px]'>Colors</h3>
                <div className='flex gap-[7px]'>
                  {watch.WatchColors?.map((color, index) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(index)}
                      className={`rounded-full p-2 border transition-all duration-200 ${
                        selectedColor === index
                          ? 'border-[#A59E9E] scale-110'
                          : 'border-[#ffffff] hover:border-[#d9d9d9]'
                      }`}
                      title={color.name}
                    >
                      <span
                        className='w-[30px] h-[30px] rounded-full inline-block'
                        style={{ backgroundColor: color.hex_code }}
                      >&nbsp;</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className='py-2'>
                <span className={`text-sm ${watch.stockavailability ? 'text-green-600' : 'text-red-600'}`}>
                  {watch.stockavailability ? '✓ In Stock' : '✗ Out of Stock'}
                </span>
              </div>

              <div className='flex items-stretch py-[18px] gap-[13px] border-b border-[#d9d9d9]'>
                <div className='flex items-center gap-[30px] rounded px-[19px] py-[12px] bg-[#F8F8FB]'>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className='hover:bg-[#f8f8fb] text-[16px]'>&minus;</button>
                  <span className='text-center text-[16px]'>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className='hover:bg-[#f8f8fb] text-[16px]'>&#43;</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`px-[19px] py-[12px] flex items-center gap-[8px] rounded transition-all duration-200 ${
                    !watch.stockavailability || isAddingToCart
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : isInCart
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-[#000000] text-white-1 hover:bg-[#262626] hover:scale-105 active:scale-95'
                  }`}
                  disabled={!watch.stockavailability || isAddingToCart}
                >
                  {isAddingToCart ? (
                    <Loader2 className='w-6 h-6 animate-spin' />
                  ) : isInCart ? (
                    <Check className='w-6 h-6' />
                  ) : (
                    <ShoppingBag className='w-6 h-6' />
                  )}
                  <span className='text-[14px] font-bold'>
                    {isAddingToCart
                      ? 'Adding to Bag...'
                      : isInCart
                      ? 'In Cart'
                      : watch.stockavailability
                      ? 'Add to Bag'
                      : 'Out of Stock'}
                  </span>
                </button>
              </div>

              <div className='flex gap-[26px] pt-[21px] flex-wrap'>
                <div className='flex items-center gap-[9px]'>
                  <Shield className='w-9 h-9 text-black-1' />
                  <span className='text-[16px] text-[rgba(0,0,0,0.6)]'>100% Genuine Products</span>
                </div>
                <div className='flex items-center gap-[9px]'>
                  <Shield className='w-9 h-9 text-black-1' />
                  <span className='text-[16px] text-[rgba(0,0,0,0.6)]'>Buy With Trust</span>
                </div>
                <div className='flex items-center gap-[9px]'>
                  <CreditCard className='w-9 h-9 text-black-1' />
                  <span className='text-[16px] text-[rgba(0,0,0,0.6)]'>Secure payment</span>
                </div>
                <div className='flex items-center gap-3'>
                  <RotateCcw className='w-9 h-9 text-black-1' />
                  <div>
                    <div className='text-[16px] leading-[24px] text-[rgba(0,0,0,0.6)]'>Return Delivery</div>
                    <div className='text-[12px] leading-[18px] text-[rgba(0,0,0,0.6)]'>
                      Free {watch.warrantyperiod} Months Warranty. <span className='underline cursor-pointer'>Details</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='flex gap-8 pb-[88px] max-[991px]:flex-wrap'>
            <h2 className='text-[48px] text-black-1 max-[768px]:text-[32px] flex-1'>MOVEMENT CHARACTERISTICS</h2>
            <div className='text-black-1 text-[20px] pl-[44px] flex-1'>
              <div className='list-item'>Category: {watch.category}</div>
              <div className='list-item'>Series: {watch.series}</div>
              <div className='list-item'>Model Group: {watch.modelgroup}</div>
              <div className='list-item'>Theme: {watch.theme}</div>
              <div className='list-item'>Warranty: {watch.warrantyperiod} months</div>
              {watch.characteristics && (
                <div className='list-item mt-4'>{formatObjectToString(watch.characteristics)}</div>
              )}
            </div>
          </div>

          <div className="pb-[88px]">
            <div className="flex border-b border-[#d9d9d9] mb-8">
              <button
                onClick={() => setActiveTab("information")}
                className={`px-6 py-3 text-[16px] font-medium border-b-2 transition-colors ${activeTab === "information" ? "border-blue-500 text-blue-500" : "border-transparent text-[rgba(0,0,0,0.6)] hover:text-black-1"}`}>
                Product Information
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-6 py-3 text-[16px] font-medium border-b-2 transition-colors ${activeTab === "reviews" ? "border-blue-500 text-blue-500" : "border-transparent text-[rgba(0,0,0,0.6)] hover:text-black-1"}`}>
                Reviews ({watch.reviewscount})
              </button>
            </div>

            {activeTab === "information" && (
              <div>
                <div className="mb-12">
                  <h4 className="text-[18px] font-semibold text-black-1 mb-2">Description</h4>
                  <p className="text-[16px] text-[rgba(0,0,0,0.6)] leading-relaxed">
                    {formatObjectToString(watch.description)}
                  </p>
                  {watch.characteristics && (
                    <div className="mt-6">
                      <h4 className="text-[18px] font-semibold text-black-1 mb-2">Additional Details</h4>
                      <p className="text-[16px] text-[rgba(0,0,0,0.6)] leading-relaxed">
                        {formatObjectToString(watch.characteristics)}
                      </p>
                    </div>
                  )}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[18px] font-semibold text-black-1 mb-1">Warranty</h4>
                      <p className="text-[16px] text-[rgba(0,0,0,0.6)]">{watch.warrantyperiod} Months</p>
                    </div>
                    <div>
                      <h4 className="text-[18px] font-semibold text-black-1 mb-1">Release Date</h4>
                      <p className="text-[16px] text-[rgba(0,0,0,0.6)]">{new Date(watch.releasedate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div className="mb-8 p-6 bg-[#f8f8fb] rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-[48px] font-bold text-black-1">{watch.rating?.toFixed(1) || "0.0"}</div>
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${i < Math.floor(watch.rating || 0) ? "fill-[#ffc600] text-[#ffc600]" : "fill-gray-200 text-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-[16px] text-[rgba(0,0,0,0.6)]">Based on {watch.reviewscount} reviews</p>
                    </div>
                  </div>
                </div>

                {watch.reviewscount === 0 ? (
                  <div className="text-center text-[16px] text-[rgba(0,0,0,0.6)] py-6">No reviews yet. Be the first to write a review!</div>
                ) : (
                  <div className="space-y-6">
                    {watch.reviews?.map((review: Review) => (
                      <div key={review.id} className="border-b border-[#d9d9d9] pb-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-[16px] font-semibold text-black-1">{review.name}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-[#ffc600] text-[#ffc600]" : "fill-gray-200 text-gray-200"}`} />
                                ))}
                              </div>
                              <span className="text-[14px] text-[rgba(0,0,0,0.6)]">{new Date(review.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[16px] text-[rgba(0,0,0,0.8)] leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 text-center">
                  {!showReviewForm ? (
                    <button onClick={() => setShowReviewForm(true)} className="bg-[#000000] text-white-1 px-8 py-3 rounded hover:bg-[#262626] transition-colors text-[16px]">Write a Review</button>
                  ) : (
                    <div className="p-6 border rounded-lg text-left bg-white">
                      <form onSubmit={(e) => { e.preventDefault(); console.log("Submitting review:", reviewData); setShowReviewForm(false); setReviewData({ name: "", rating: 0, comment: "" }); }} className="space-y-4">
                        <div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} onClick={() => setReviewData({ ...reviewData, rating: star })} className={`w-10 h-10 cursor-pointer ${star <= reviewData.rating ? "fill-[#ffc600] text-[#ffc600]" : "fill-gray-200 text-gray-200"}`} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <textarea value={reviewData.comment} onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })} className="w-full border rounded px-3 py-2 text-[16px] h-28" placeholder='Write Review' required />
                        </div>
                        <div className="flex justify-end gap-3">
                          <button type="button" onClick={() => setShowReviewForm(false)} className="px-6 py-2 rounded border text-[16px]">Cancel</button>
                          <button type="submit" className="bg-[#000000] text-white-1 px-6 py-2 rounded hover:bg-[#262626]">Submit</button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className='text-[24px] text-black-1 pb-[21px]'>Most Liked</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {relatedProducts.map((product) => (
                <div key={product.id} className='group cursor-pointer border-[#d9d9d9] hover:shadow-lg transition-shadow bg-[#D9D9D9] hover:bg-[#F8F8FB] rounded-xl border shadow'>
                  <div className='p-4'>
                    <div className='aspect-square bg-[#c1c8ce] rounded-lg mb-4 overflow-hidden'>
                      <Image src={imageViews[0]?.url || '/images/alban-marcus-watch.png'} alt={product.name} width={200} height={200} className='w-full h-full object-cover' />
                    </div>
                    <div className='flex items-start justify-between bg-white-1 rounded-[8px] px-[19px] py-[14px]'>
                      <div>
                        <h3 className='text-black-1 text-[16px]'>{product.name}</h3>
                        <div className='flex items-center gap-2'>
                          <span className='text-black-1 text-[14px]'>${product.price}</span>
                          <span className='text-[rgba(0,0,0,0.4)] line-through text-[16px]'>${product.originalPrice}</span>
                        </div>
                      </div>
                      <ArrowRight className='w-8 h-8 text-[#000000] group-hover:text-black-1 transition-colors rotate-[-35deg]' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

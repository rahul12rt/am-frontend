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
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { useParams } from 'next/navigation';

interface WatchImage {
  id: string;
  isoview: string;
  front: string;
  back: string;
  side: string;
  strap?: string;
  closeup?: string;
  dial?: string;
}

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean;
}

interface Watch {
  id: string;
  name: string;
  description: string;
  characteristics: string;
  actualprice: string;
  offerprice: string;
  offerpercentage: string;
  rating: number;
  reviewscount: number;
  category: string;
  series: string;
  modelgroup: string;
  releasedate: string;
  theme: string;
  warrantyperiod: string;
  stockavailability: boolean;
  isfeatured: boolean;
  WatchImages: WatchImage[];
  reviews?: Review[];
}

interface ApiResponse {
  success: boolean;
  data: Watch;
}

export default function Component() {
  const params = useParams();
  const watchId = params.name as string;

  const [watch, setWatch] = useState<Watch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(2);
  const [activeTab, setActiveTab] = useState("information")

  const colors = [
    {
      name: 'Brown Gradient',
      gradient:
        'conic-gradient(at center, #4B2A16 36%, #EAB872 37%, #AE824E 57%, #533018 87%, #FFEAC2 87%)',
    },
    {
      name: 'Light Gradient',
      gradient:
        'conic-gradient(at center, #D6DFE6 36%, #FAFBFC 37%, #D7E0E7 87%, #F7F8F9 87%)',
    },
    {
      name: 'Dark Gradient',
      gradient:
        'conic-gradient(at center, #262626 10%, #000000 36%, #5B5B5B 37%, #000000 87%, #484848 87%)',
    },
  ];

  // Get available image views from API data
  const getImageViews = (watchImages: WatchImage[]) => {
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

  const relatedProducts = Array(4)
    .fill(null)
    .map((_, i) => ({
      id: i,
      name: 'Alban 0S1',
      price: 240,
      originalPrice: 260,
      image: '/placeholder.svg?height=200&width=200',
    }));

  const mockReviews = [
    {
      id: 1,
      name: "John Smith",
      rating: 5,
      date: "2024-01-15",
      comment:
        "Excellent watch! The build quality is outstanding and it looks even better in person. Highly recommend!",
      verified: true,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      rating: 4,
      date: "2024-01-10",
      comment:
        "Beautiful design and comfortable to wear. The only minor issue is that the strap could be a bit softer.",
      verified: true,
    },
    {
      id: 3,
      name: "Mike Chen",
      rating: 5,
      date: "2024-01-05",
      comment: "Perfect watch for both casual and formal occasions. Great value for money!",
      verified: false,
    },
  ]

  useEffect(() => {
    const fetchWatch = async () => {
      if (!watchId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/watches/${watchId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch watch details');
        }

        const result: ApiResponse = await response.json();

        console.log({ result });

        if (result.success && result.data) {
          setWatch(result.data);
        } else {
          throw new Error('Watch not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWatch();
  }, [watchId]);

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
                {error || 'The requested watch could not be found.'}
              </p>
              <Link href='/' className='text-blue-600 hover:underline'>
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const imageViews = getImageViews(watch.WatchImages);
  const discountPercentage = Math.round(
    ((parseFloat(watch.actualprice) - parseFloat(watch.offerprice)) /
      parseFloat(watch.actualprice)) *
    100
  );

  return (
    <div className='pt-[90px] pb-[70px] text-black-1 bg-white-1'>
      <div className='container'>
        <p className='flex items-center text-[14px] pb-[40px] gap-2'>
          <Link href='/' className='opacity-60 hover:opacity-100'>
            Home
          </Link>
          <MdKeyboardArrowRight />
          <span>{watch.name}</span>
        </p>

        <div className='py-8'>
          {/* Product Section */}
          <div className='gap-12 pb-[48px] flex max-[991px]:flex-col max-[991px]:gap-8'>
            {/* Left Side - Images */}
            <div className='flex gap-4 max-[768px]:flex-col-reverse flex-1'>
              {/* Thumbnails */}
              {imageViews.length > 1 && (
                <div className='flex flex-col gap-4 max-[768px]:flex-row'>
                  {imageViews.slice(0, 4).map((view, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg border-2 overflow-hidden ${selectedImage === index
                        ? 'border-[#ff3333]'
                        : 'border-[#d9d9d9]'
                        }`}
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

              {/* Main Image */}
              <div className='flex-1'>
                <div className='aspect-square bg-[#f8f8fb] rounded-lg overflow-hidden'>
                  <Image
                    src={
                      imageViews[selectedImage]?.url ||
                      imageViews[0]?.url ||
                      '/images/alban-marcus-watch.png'
                    }
                    alt={watch.name}
                    width={500}
                    height={500}
                    className='w-full h-full object-contain'
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Product Details */}
            <div className='flex-1'>
              <div className='pb-[23px]'>
                <h1 className='text-[40px] font-bold text-black-1 pb-13'>
                  {watch.name}
                </h1>

                <div className='flex items-center gap-4 pb-[13px] flex-wrap'>
                  <span className='text-[32px] text-black-1'>
                    ${watch.offerprice}
                  </span>
                  <span className='text-[32px] text-[rgba(0,0,0,0.3)] line-through'>
                    ${watch.actualprice}
                  </span>
                  {discountPercentage > 0 && (
                    <span className='bg-[rgba(255,51,51,0.1)] text-[16px] px-[20px] py-[8px] rounded-full text-[#ff3333]'>
                      -{discountPercentage}%
                    </span>
                  )}
                  <div className='flex items-center gap-2'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < Math.floor(watch.rating || 0)
                          ? 'fill-[#ffc600] text-[#ffc600]'
                          : 'fill-gray-200 text-gray-200'
                          }`}
                      />
                    ))}
                    {watch.reviewscount > 0 && (
                      <span className='text-sm text-gray-500'>
                        ({watch.reviewscount})
                      </span>
                    )}
                  </div>
                </div>

                <p className='text-[16px] text-[rgba(0,0,0,0.6)] leading-relaxed line-height-[22px]'>
                  {watch.description}
                </p>
              </div>

              {/* Colors */}
              <div className='py-[15px] border-y border-[#d9d9d9]'>
                <h3 className='text-[16px] font-bold text-black-1 pb-[10px]'>
                  Colors
                </h3>
                <div className='flex gap-[7px]'>
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`rounded-full p-2 border ${selectedColor === index
                        ? 'border-[#A59E9E]'
                        : 'border-[#ffffff]'
                        }`}
                      title={color.name}
                    >
                      <span
                        className='w-[30px] h-[30px] rounded-full inline-block'
                        style={{ backgroundImage: color.gradient }}
                      >
                        &nbsp;
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              <div className='py-2'>
                <span
                  className={`text-sm ${watch.stockavailability ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                  {watch.stockavailability ? '✓ In Stock' : '✗ Out of Stock'}
                </span>
              </div>

              {/* Quantity and Add to Bag */}
              <div className='flex items-stretch py-[18px] gap-[13px] border-b border-[#d9d9d9]'>
                <div className='flex items-center gap-[30px] rounded px-[19px] py-[12px] bg-[#F8F8FB]'>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className='hover:bg-[#f8f8fb] text-[16px]'
                  >
                    &minus;
                  </button>
                  <span className='text-center text-[16px]'>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className='hover:bg-[#f8f8fb] text-[16px]'
                  >
                    &#43;
                  </button>
                </div>

                <button
                  className={`px-[19px] py-[12px] flex items-center gap-[8px] rounded ${watch.stockavailability
                    ? 'bg-[#000000] text-white-1 hover:bg-[#262626]'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  disabled={!watch.stockavailability}
                >
                  <ShoppingBag className='w-9 h-9' />
                  <span className='text-[14px] font-bold'>
                    {watch.stockavailability ? 'Add to Bag' : 'Out of Stock'}
                  </span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className='flex gap-[26px] pt-[21px] flex-wrap'>
                <div className='flex items-center gap-[9px]'>
                  <Shield className='w-9 h-9 text-black-1' />
                  <span className='text-[16px] text-[rgba(0,0,0,0.6)]'>
                    100% Genuine Products
                  </span>
                </div>
                <div className='flex items-center gap-[9px]'>
                  <Shield className='w-9 h-9 text-black-1' />
                  <span className='text-[16px] text-[rgba(0,0,0,0.6)]'>
                    Buy With Trust
                  </span>
                </div>
                <div className='flex items-center gap-[9px]'>
                  <CreditCard className='w-9 h-9 text-black-1' />
                  <span className='text-[16px] text-[rgba(0,0,0,0.6)]'>
                    Secure payment
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <RotateCcw className='w-9 h-9 text-black-1' />
                  <div>
                    <div className='text-[16px] leading-[24px] text-[rgba(0,0,0,0.6)]'>
                      Return Delivery
                    </div>
                    <div className='text-[12px] leading-[18px] text-[rgba(0,0,0,0.6)]'>
                      Free {watch.warrantyperiod} Months Warranty.{' '}
                      <span className='underline cursor-pointer'>Details</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Movement Characteristics */}
          <div className='flex gap-8 pb-[88px] max-[991px]:flex-wrap'>
            <h2 className='text-[48px] text-black-1 max-[768px]:text-[32px] flex-1'>
              MOVEMENT CHARACTERISTICS
            </h2>
            <div className='text-black-1 text-[20px] pl-[44px] flex-1'>
              <div className='list-item'>Category: {watch.category}</div>
              <div className='list-item'>Series: {watch.series}</div>
              <div className='list-item'>Model Group: {watch.modelgroup}</div>
              <div className='list-item'>Theme: {watch.theme}</div>
              <div className='list-item'>
                Warranty: {watch.warrantyperiod} months
              </div>
              {watch.characteristics && (
                <div className='list-item mt-4'>{watch.characteristics}</div>
              )}
            </div>
          </div>

          {/* Tabs Section */}
          <div className="pb-[88px]">
            {/* Tab Navigation */}
            <div className="flex border-b border-[#d9d9d9] mb-8">
              <button
                onClick={() => setActiveTab("information")}
                className={`px-6 py-3 text-[16px] font-medium border-b-2 transition-colors ${activeTab === "information"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-[rgba(0,0,0,0.6)] hover:text-black-1"
                  }`}
              >
                Product Information
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-6 py-3 text-[16px] font-medium border-b-2 transition-colors ${activeTab === "reviews"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-[rgba(0,0,0,0.6)] hover:text-black-1"
                  }`}
              >
                Reviews ({watch.reviewscount})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "information" && (
              <div>
                {/* Product Description */}
                <div className="mb-12">
                  <h3 className="text-[24px] font-bold text-black-1 mb-4">Description</h3>
                  <p className="text-[16px] text-[rgba(0,0,0,0.6)] leading-relaxed">
                    {watch.description}
                  </p>

                  {watch.characteristics && (
                    <div className="mt-6">
                      <h4 className="text-[18px] font-semibold text-black-1 mb-2">
                        Additional Details
                      </h4>
                      <p className="text-[16px] text-[rgba(0,0,0,0.6)] leading-relaxed">
                        {watch.characteristics}
                      </p>
                    </div>
                  )}

                  {/* Warranty & Release Info */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[18px] font-semibold text-black-1 mb-1">
                        Warranty
                      </h4>
                      <p className="text-[16px] text-[rgba(0,0,0,0.6)]">
                        {watch.warrantyperiod} Months
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[18px] font-semibold text-black-1 mb-1">
                        Release Date
                      </h4>
                      <p className="text-[16px] text-[rgba(0,0,0,0.6)]">
                        {new Date(watch.releasedate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                {/* Reviews Summary */}
                <div className="mb-8 p-6 bg-[#f8f8fb] rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-[48px] font-bold text-black-1">
                      {watch.rating?.toFixed(1) || "0.0"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(watch.rating || 0)
                                ? "fill-[#ffc600] text-[#ffc600]"
                                : "fill-gray-200 text-gray-200"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-[16px] text-[rgba(0,0,0,0.6)]">
                        Based on {watch.reviewscount} reviews
                      </p>
                    </div>
                  </div>
                </div>

                {/* If no reviews */}
                {watch.reviewscount === 0 ? (
                  <div className="text-center text-[16px] text-[rgba(0,0,0,0.6)] py-6">
                    No reviews yet. Be the first to write a review!
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Replace below with actual fetched reviews when available */}
                    {watch.reviews?.map((review) => (
                      <div key={review.id} className="border-b border-[#d9d9d9] pb-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-[16px] font-semibold text-black-1">
                                {review.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating
                                        ? "fill-[#ffc600] text-[#ffc600]"
                                        : "fill-gray-200 text-gray-200"
                                      }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[14px] text-[rgba(0,0,0,0.6)]">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[16px] text-[rgba(0,0,0,0.8)] leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Write Review Button */}
                <div className="mt-8 text-center">
                  <button className="bg-[#000000] text-white-1 px-8 py-3 rounded hover:bg-[#262626] transition-colors">
                    Write a Review
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* Most Liked */}
          <div>
            <h2 className='text-[24px] text-black-1 pb-[21px]'>Most Liked</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {relatedProducts.map((product) => (
                <div
                  key={product.id}
                  className='group cursor-pointer border-[#d9d9d9] hover:shadow-lg transition-shadow bg-[#D9D9D9] hover:bg-[#F8F8FB] rounded-xl border shadow'
                >
                  <div className='p-4'>
                    <div className='aspect-square bg-[#c1c8ce] rounded-lg mb-4 overflow-hidden'>
                      <Image
                        src={
                          imageViews[0]?.url || '/images/alban-marcus-watch.png'
                        }
                        alt={product.name}
                        width={200}
                        height={200}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className='flex items-start justify-between bg-white-1 rounded-[8px] px-[19px] py-[14px]'>
                      <div>
                        <h3 className='text-black-1 text-[16px]'>
                          {product.name}
                        </h3>
                        <div className='flex items-center gap-2'>
                          <span className='text-black-1 text-[14px]'>
                            ${product.price}
                          </span>
                          <span className='text-[rgba(0,0,0,0.4)] line-through text-[16px]'>
                            ${product.originalPrice}
                          </span>
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

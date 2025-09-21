"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Watch } from "@/lib/api-services";

const Collections = ({ data }: { data: Watch[] }) => {
  const [hoveredWatch, setHoveredWatch] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  const formatImageUrl = (url: string) => {
    if (!url) return "/images/am0s1.webp";
    
    // If it's already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a CDN path without protocol, add https://
    if (url.includes('alban-marcus') || url.includes('b-cdn.net')) {
      return `https://${url}`;
    }
    
    // If it's a relative path starting with /, treat as local
    if (url.startsWith('/')) {
      return url;
    }
    
    // Fallback to local image
    return "/images/am0s1.webp";
  };

  const getWatchImages = (watch: Watch) => {
    // First try to get images from WatchColors (your JSON structure)
    const firstColor = watch.WatchColors?.[0];
    if (firstColor && (firstColor as any).WatchImage?.[0]) {
      const images = (firstColor as any).WatchImage[0];
      const imageUrls = [
        formatImageUrl(images.isoview),
        formatImageUrl(images.front),
        formatImageUrl(images.back),
        formatImageUrl(images.side)
      ].filter(url => url && url !== "/images/am0s1.webp");
      
      // Debug: Log the first watch's images
      if (process.env.NODE_ENV === 'development' && imageUrls.length > 0) {
        console.log(`Watch ${watch.name} images:`, imageUrls);
      }
      
      return imageUrls;
    }
    
    // Fallback to direct WatchImages if available
    if (watch.WatchImages?.[0]) {
      const images = watch.WatchImages[0];
      return [
        formatImageUrl(images.isoview),
        formatImageUrl(images.front),
        formatImageUrl(images.back),
        formatImageUrl(images.side)
      ].filter(url => url && url !== "/images/am0s1.webp");
    }
    
    return [];
  };

  const getCurrentImage = (watch: Watch) => {
    const images = getWatchImages(watch);
    // Default to index 1 (front view) if available, otherwise index 0
    const defaultIndex = images.length > 1 ? 1 : 0;
    const index = currentImageIndex[watch.id] !== undefined ? currentImageIndex[watch.id] : defaultIndex;
    const imageUrl = images[index] || "/images/am0s1.webp";
    
    // If this image has errored before, use fallback
    if (imageErrors[`${watch.id}-${index}`]) {
      return "/images/am0s1.webp";
    }
    
    return imageUrl;
  };

  const handleImageError = (watchId: string, imageIndex: number) => {
    setImageErrors(prev => ({
      ...prev,
      [`${watchId}-${imageIndex}`]: true
    }));
  };

  const handleImageHover = (watchId: string, imageIndex: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [watchId]: imageIndex
    }));
  };

  const formatDescription = (description: string | object, maxLength = 60) => {
    let text = '';
    if (typeof description === 'object' && description !== null) {
      text = Object.entries(description)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } else {
      text = description as string;
    }

    if (text?.length <= maxLength) return text;
    return text?.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="grid grid-cols-1 custom-xsm:grid-cols-2 custom-sm:grid-cols-3 custom-md:grid-cols-4 gap-6">
      {data.map((product) => {
        const images = getWatchImages(product);
        
        // Get pricing from the first active watch color
        const firstColor = product.WatchColors?.[0] as any;
        const actualprice = firstColor ? parseFloat(firstColor.actualprice || '0') : (product as any).actualprice || 0;
        const offerprice = firstColor ? parseFloat(firstColor.offerprice || '0') : (product as any).offerprice || 0;
        const offerpercentage = firstColor ? firstColor.offerpercentage : (product as any).offerpercentage || 0;
        
        const discountPercentage = offerpercentage || 
          (offerprice > 0 && actualprice > offerprice ? Math.round(((actualprice - offerprice) / actualprice) * 100) : 0);
        
        return (
          <div
            key={product.id}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-700 hover:transform hover:scale-[1.03] border border-gray-100"
            onMouseEnter={() => setHoveredWatch(product.id)}
            onMouseLeave={() => setHoveredWatch(null)}
          >
            {/* Stock Status Badge */}
            {product.stockavailability && (
              <div className="absolute top-4 left-4 z-20">
                <span className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg">
                  IN STOCK
                </span>
              </div>
            )}

            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-4 right-4 z-20">
                <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                  -{discountPercentage}% OFF
                </span>
              </div>
            )}

            {/* Featured Badge */}
            {product.isfeatured && (
              <div className="absolute top-16 left-4 z-20">
                <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold rounded-full shadow-lg border border-yellow-300">
                  ⭐ FEATURED
                </span>
              </div>
            )}

            {/* Edit Button (Admin) */}
            <Link
              prefetch={false}
              href={`/product?id=${product.id}`}
              className="absolute top-4 right-16 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <button className="p-2 bg-blue-600/90 hover:bg-blue-700 text-white rounded-lg text-xs backdrop-blur-sm">
                ✏️
              </button>
            </Link>

            <Link href={`/collections/${product.id}`} className="block">
              {/* Image Section - 70% of card height */}
              <div className="relative h-96 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-gray-100 group-hover:to-gray-50 transition-all duration-500">
                <Image
                  fill
                  src={getCurrentImage(product)}
                  alt={product.name}
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                  onError={() => handleImageError(product.id, currentImageIndex[product.id] || 0)}
                  priority={false}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
                
                {/* Image Navigation Dots */}
                {images.length > 1 && hoveredWatch === product.id && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-200 shadow-lg ${
                          (currentImageIndex[product.id] !== undefined ? currentImageIndex[product.id] : (images.length > 1 ? 1 : 0)) === index 
                            ? 'bg-black scale-125 ring-2 ring-gray-300' 
                            : 'bg-gray-400 hover:bg-gray-600'
                        }`}
                        onMouseEnter={() => handleImageHover(product.id, index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Content Section - 30% of card height */}
              <div className="p-4 space-y-3 bg-white">
                {/* Title and Price */}
                <div className="text-left border-b border-gray-100 pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                      {product.name}
                    </h3>
                    <div className="text-right">
                      {offerprice > 0 ? (
                        <>
                          <span className="text-3xl font-bold text-gray-900">
                            ₹{offerprice.toLocaleString('en-IN')}
                          </span>
                          {actualprice > offerprice && (
                            <div className="text-lg text-gray-500 line-through font-medium">
                              ₹{actualprice.toLocaleString('en-IN')}
                            </div>
                          )}
                        </>
                      ) : actualprice > 0 ? (
                        <span className="text-3xl font-bold text-gray-900">
                          ₹{actualprice.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-xl font-medium text-gray-600">
                          Contact for Price
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-base text-gray-600 font-medium uppercase tracking-wider">
                    {(product as any).brand || firstColor?.watch_name || 'Alban Marcus'}
                  </p>
                  {firstColor?.name && (
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-500 font-medium">
                        {firstColor.name}
                      </p>
                      {product.WatchColors && product.WatchColors.length > 1 && (
                        <p className="text-xs text-gray-400">
                          +{product.WatchColors.length - 1} more color{product.WatchColors.length > 2 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                {product.description && product.description !== 'undefined' && (
                  <p className="text-base text-gray-700 text-left leading-relaxed min-h-[40px]">
                    {formatDescription(product.description)}
                  </p>
                )}

                {/* Key Features */}
                <div className="flex justify-start flex-wrap gap-2 text-gray-600" style={{ fontSize: '12px' }}>
                  {product.characteristics && (
                    <>
                      <span className="flex items-center bg-gray-50 px-3 py-2 rounded-full">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                        <span className="font-medium">{product.characteristics.caseDiameter}</span>
                      </span>
                      <span className="flex items-center bg-gray-50 px-3 py-2 rounded-full">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                        <span className="font-medium">{product.characteristics.movement}</span>
                      </span>
                      <span className="flex items-center bg-gray-50 px-3 py-2 rounded-full">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                        <span className="font-medium">{product.characteristics.waterResistance}</span>
                      </span>
                    </>
                  )}
                </div>

                {/* Savings */}
                {discountPercentage > 0 && offerprice > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <p className="text-base text-green-700 font-semibold">
                      💰 Save ₹{(actualprice - offerprice).toLocaleString('en-IN')}
                    </p>
                  </div>
                )}

                {/* Warranty */}
                {product.warrantyperiod && (
                  <div className="text-left">
                    <span className="inline-flex items-center text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full font-medium">
                      🛡️ {product.warrantyperiod}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Collections;

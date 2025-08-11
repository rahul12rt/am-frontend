'use client';

import { useState } from 'react';
import {
  Star,
  ShoppingBag,
  Shield,
  RotateCcw,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MdKeyboardArrowRight } from 'react-icons/md';

export default function Component() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(2);

  const thumbnails = [
    '/placeholder.svg?height=80&width=80',
    '/placeholder.svg?height=80&width=80',
    '/placeholder.svg?height=80&width=80',
  ];

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

  const relatedProducts = Array(4)
    .fill(null)
    .map((_, i) => ({
      id: i,
      name: 'Alban 0S1',
      price: 240,
      originalPrice: 260,
      image: '/placeholder.svg?height=200&width=200',
    }));

  return (
    <div className='pt-[90px] pb-[70px] text-black-1 bg-white-1'>
      <div className='container'>
        <p className='flex items-center text-[14px] pb-[40px] gap-2'>
          <Link href='/' className='opacity-60 hover:opacity-100'>
            Home
          </Link>
          <MdKeyboardArrowRight />
          <span>watchdetail</span>
        </p>

        <div className='py-8'>
          {/* Product Section */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 pb-[48px]'>
            {/* Left Side - Images */}
            <div className='flex gap-4 max-[768px]:flex-col-reverse'>
              {/* Thumbnails */}
              <div className='flex flex-col gap-4 max-[768px]:flex-row'>
                {thumbnails.map((thumb, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg border-2 overflow-hidden ${
                      selectedImage === index
                        ? 'border-[#ff3333]'
                        : 'border-[#d9d9d9]'
                    }`}
                  >
                    <Image
                      src={thumb || '/placeholder.svg'}
                      alt={`Watch thumbnail ${index + 1}`}
                      width={80}
                      height={80}
                      className='w-full h-full object-cover'
                    />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className='flex-1'>
                <div className='aspect-square bg-[#f8f8fb] rounded-lg overflow-hidden'>
                  <Image
                    src='/images/alban-marcus-watch.png'
                    alt='Alban 0S1 Watch'
                    width={500}
                    height={500}
                    className='w-full h-full object-contain'
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Product Details */}
            <div>
              <div className='pb-[23px]'>
                <h1 className='text-[40px] font-bold text-black-1 pb-13'>
                  Alban 0S1
                </h1>

                <div className='flex items-center gap-4 pb-[13px] flex-wrap'>
                  <span className='text-[32px] text-black-1'>$240</span>
                  <span className='text-[32px] text-[rgba(0,0,0,0.3)] line-through'>
                    $260
                  </span>
                  <span className='bg-[rgba(255,51,51,0.1)] text-[16px] px-[20px] py-[8px] rounded-full text-[#ff3333]'>
                    -20%
                  </span>
                  <div className='flex items-center gap-2'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className='w-6 h-6 fill-[#ffc600] text-[#ffc600]'
                      />
                    ))}
                  </div>
                </div>

                <p className='text-[16px] text-[rgba(0,0,0,0.6)] leading-relaxed line-height-[22px]'>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s
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
                      className={`rounded-full p-2 border ${
                        selectedColor === index
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

                <button className='bg-[#000000] text-white-1 hover:bg-[#262626] px-[19px] py-[12px] flex items-center gap-[8px] rounded'>
                  <ShoppingBag className='w-9 h-9' />
                  <span className='text-[14px] font-bold'>Add to Bag</span>
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
                      Free 30 Days Delivery Returns.{' '}
                      <span className='underline'>Details</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Movement Characteristics */}
          <div className='flex gap-8 pb-[88px] max-[991px]:flex-wrap'>
            <h2 className='text-[48px] text-black-1 max-[768px]:text-[32px]'>
              MOVEMENT CHARACTERISTICS
            </h2>
            <div className='text-black-1 text-[20px] pl-[16px]'>
              <div className='list-item'>
                Movement: Landeron 24 Skeleton AutomaticMovement - Swiss Made
              </div>
              <div className='list-item'>Dimensions: 55 x 45 mm</div>
              <div className='list-item'>
                Glass: Double Dome Sapphire Crystal with Anti-reflective coating
              </div>
              <div className='list-item'>Number of jewels: 25</div>
            </div>
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
                        src={product.image || '/placeholder.svg'}
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

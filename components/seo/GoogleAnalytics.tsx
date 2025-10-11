'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  measurementId?: string
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const GA_MEASUREMENT_ID = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  )
}

// ============================================
// GENERIC EVENT TRACKING
// ============================================

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// ============================================
// E-COMMERCE EVENTS
// ============================================

// 1. View Item List (Collections page)
export const trackViewItemList = (itemListId: string, itemListName: string, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item_list', {
      item_list_id: itemListId,
      item_list_name: itemListName,
      items: items
    });
  }
};

// 2. View Item (Product detail page)
export const trackViewItem = (currency: string = 'INR', value: number, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: currency,
      value: value,
      items: items
    });
  }
};

// 3. Select Item (Click on product card)
export const trackSelectItem = (itemListId: string, itemListName: string, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'select_item', {
      item_list_id: itemListId,
      item_list_name: itemListName,
      items: items
    });
  }
};

// 4. Add to Cart
export const trackAddToCart = (currency: string = 'INR', value: number, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: currency,
      value: value,
      items: items
    });
  }
};

// 5. Remove from Cart
export const trackRemoveFromCart = (currency: string = 'INR', value: number, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      currency: currency,
      value: value,
      items: items
    });
  }
};

// 6. View Cart
export const trackViewCart = (currency: string = 'INR', value: number, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_cart', {
      currency: currency,
      value: value,
      items: items
    });
  }
};

// 7. Begin Checkout
export const trackBeginCheckout = (currency: string = 'INR', value: number, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: currency,
      value: value,
      items: items
    });
  }
};

// 8. Add Shipping Info
export const trackAddShippingInfo = (currency: string = 'INR', value: number, shippingTier: string, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_shipping_info', {
      currency: currency,
      value: value,
      shipping_tier: shippingTier,
      items: items
    });
  }
};

// 9. Add Payment Info
export const trackAddPaymentInfo = (currency: string = 'INR', value: number, paymentType: string, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_payment_info', {
      currency: currency,
      value: value,
      payment_type: paymentType,
      items: items
    });
  }
};

// 10. Purchase (CRITICAL)
export const trackPurchase = (transactionId: string, value: number, currency: string = 'INR', items: any[], tax?: number, shipping?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      tax: tax || 0,
      shipping: shipping || 0,
      items: items
    });
  }
};

// 11. Refund
export const trackRefund = (transactionId: string, value: number, currency: string = 'INR', items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'refund', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    });
  }
};

// ============================================
// USER ENGAGEMENT EVENTS
// ============================================

// 12. Login
export const trackLogin = (method: string = 'email', userId?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method: method,
      ...(userId && { user_id: userId })
    });
  }
};

// 13. Sign Up
export const trackSignUp = (method: string = 'email', userId?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method,
      ...(userId && { user_id: userId })
    });
  }
};

// 14. Search
export const trackSearch = (searchTerm: string, pageLocation?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      ...(pageLocation && { page_location: pageLocation })
    });
  }
};

// 15. Filter
export const trackFilter = (filterType: string, filterValue: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'filter', {
      filter_type: filterType,
      filter_value: filterValue,
      page_location: window.location.pathname
    });
  }
};

// 16. View Item Color
export const trackViewItemColor = (itemId: string, itemName: string, colorName: string, colorHex: string, price: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item_color', {
      item_id: itemId,
      item_name: itemName,
      color_name: colorName,
      color_hex: colorHex,
      price: price
    });
  }
};

// 17. Share
export const trackShare = (method: string, contentType: string, itemId: string, itemName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'share', {
      method: method,
      content_type: contentType,
      item_id: itemId,
      item_name: itemName
    });
  }
};

// ============================================
// ENGAGEMENT & INTERACTION EVENTS
// ============================================

// 18. Contact Form Submit
export const trackContactFormSubmit = (formName: string = 'Contact Us', formLocation: string = 'contact_page') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'contact_form_submit', {
      form_name: formName,
      form_location: formLocation
    });
  }
};

// 19. Newsletter Signup
export const trackNewsletterSignup = (method: string = 'footer_form') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'newsletter_signup', {
      method: method
    });
  }
};

// 20. Add to Wishlist
export const trackAddToWishlist = (currency: string = 'INR', value: number, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_wishlist', {
      currency: currency,
      value: value,
      items: items
    });
  }
};

// 21. View Promotion
export const trackViewPromotion = (promotionId: string, promotionName: string, creativeName: string, creativeSlot: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_promotion', {
      promotion_id: promotionId,
      promotion_name: promotionName,
      creative_name: creativeName,
      creative_slot: creativeSlot
    });
  }
};

// 22. Select Promotion
export const trackSelectPromotion = (promotionId: string, promotionName: string, creativeName: string, creativeSlot: string, locationId: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'select_promotion', {
      promotion_id: promotionId,
      promotion_name: promotionName,
      creative_name: creativeName,
      creative_slot: creativeSlot,
      location_id: locationId
    });
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format watch data to GA4 item format
export const formatWatchToGAItem = (watch: any, index?: number) => ({
  item_id: watch.id,
  item_name: watch.name,
  item_category: watch.category || 'Watches',
  item_category2: watch.series || '',
  item_category3: watch.theme || '',
  item_brand: 'Alban Marcus',
  price: parseFloat(watch.offerprice || watch.price || 0),
  ...(watch.actualprice && {
    discount: parseFloat(watch.actualprice) - parseFloat(watch.offerprice)
  }),
  ...(index !== undefined && { index }),
  ...(watch.color && { item_variant: watch.color })
});

// Format cart item to GA4 item format
export const formatCartItemToGAItem = (cartItem: any, index?: number) => ({
  item_id: cartItem.watchColor?.watch_id || cartItem.watch_id,
  item_name: cartItem.watchColor?.watch_name || cartItem.watch_name,
  item_category: cartItem.watchColor?.Watch?.category || 'Watches',
  item_category2: cartItem.watchColor?.Watch?.series || '',
  item_variant: cartItem.watchColor?.name || '',
  item_brand: 'Alban Marcus',
  price: parseFloat(cartItem.watchColor?.offerprice || cartItem.unit_price || 0),
  quantity: cartItem.quantity || 1,
  ...(index !== undefined && { index })
});

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

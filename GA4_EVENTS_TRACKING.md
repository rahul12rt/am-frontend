# GA4 Events Tracking Guide - Alban Marcus

This document outlines all Google Analytics 4 (GA4) events that should be tracked for the Alban Marcus luxury watch e-commerce platform to measure user behavior, conversions, and business metrics.

## Setup & Configuration

### Environment Variable
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

The GA4 Measurement ID is loaded from environment variables via `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID`.

### Helper Functions Location
**File**: `components/seo/GoogleAnalytics.tsx`

Available tracking functions:
- `trackEvent(eventName, parameters)` - Generic event tracking
- `trackPurchase(transactionId, value, currency, items)` - Purchase tracking
- `trackAddToCart(currency, value, items)` - Add to cart tracking
- `trackViewItem(currency, value, items)` - View item tracking

---

## E-commerce Events (Required for Enhanced E-commerce)

### 1. **view_item_list** - Collections Page
**When**: User views the collections/product listing page  
**File**: `app/collections/page.tsx`  
**Trigger**: On page load when watches are displayed

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Add in useEffect after watches load
useEffect(() => {
  if (watches && watches.length > 0) {
    trackEvent('view_item_list', {
      item_list_id: 'collections_all',
      item_list_name: 'All Watches Collection',
      items: watches.slice(0, 10).map((watch, index) => ({
        item_id: watch.id,
        item_name: watch.name,
        item_category: watch.category,
        item_category2: watch.series,
        item_brand: 'Alban Marcus',
        price: parseFloat(watch.offerprice),
        index: index
      }))
    });
  }
}, [watches]);
```

---

### 2. **view_item** - Individual Watch Page
**When**: User views a specific watch detail page  
**File**: `app/collections/[id]/page.tsx`  
**Trigger**: On page load when watch details are displayed

```typescript
// Import at top
import { trackViewItem } from '@/components/seo/GoogleAnalytics';

// Add in useEffect when watch data loads (around line 350-400)
useEffect(() => {
  if (watch && watch.id) {
    trackViewItem('INR', parseFloat(watch.offerprice), [
      {
        item_id: watch.id,
        item_name: watch.name,
        item_category: watch.category,
        item_category2: watch.series,
        item_category3: watch.theme,
        item_brand: 'Alban Marcus',
        price: parseFloat(watch.offerprice),
        discount: parseFloat(watch.actualprice) - parseFloat(watch.offerprice),
        quantity: 1
      }
    ]);
  }
}, [watch]);
```

---

### 3. **select_item** - Watch Card Click
**When**: User clicks on a watch card to view details  
**File**: `components/organisms/collections/Collections.tsx` or watch card component  
**Trigger**: On watch card click

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Add onClick handler to watch card
const handleWatchClick = (watch: Watch, index: number) => {
  trackEvent('select_item', {
    item_list_id: 'collections_all',
    item_list_name: 'All Watches Collection',
    items: [{
      item_id: watch.id,
      item_name: watch.name,
      item_category: watch.category,
      item_brand: 'Alban Marcus',
      price: parseFloat(watch.offerprice),
      index: index
    }]
  });
  
  // Continue with navigation
  router.push(`/collections/${watch.id}`);
};
```

---

### 4. **add_to_cart** - Add to Cart Button
**When**: User clicks "Add to Cart" button  
**File**: `app/collections/[id]/page.tsx` (in the AddToCartButton component usage)  
**Trigger**: On successful cart addition

```typescript
// Import at top
import { trackAddToCart } from '@/components/seo/GoogleAnalytics';

// Add in the onSuccess callback of useAddToCart mutation
const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

const handleAddToCart = async () => {
  if (!selectedColor) {
    toast.error('Please select a color');
    return;
  }
  
  addToCart(
    {
      watchColorIds: [
        {
          watch_color_id: selectedColor.id,
          quantity: quantity,
        },
      ],
    },
    {
      onSuccess: (data) => {
        // Track add to cart event
        trackAddToCart('INR', parseFloat(selectedColor.offerprice) * quantity, [
          {
            item_id: watch.id,
            item_name: watch.name,
            item_category: watch.category,
            item_category2: watch.series,
            item_variant: selectedColor.name,
            item_brand: 'Alban Marcus',
            price: parseFloat(selectedColor.offerprice),
            quantity: quantity
          }
        ]);
        
        toast.success('Added to cart successfully!');
        setIsSuccessModalOpen(true);
      },
      onError: (error: any) => {
        // Error handling...
      },
    }
  );
};
```

---

### 5. **remove_from_cart** - Remove from Cart
**When**: User removes an item from cart  
**File**: `app/cart/page.tsx` or cart component  
**Trigger**: On cart item removal

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Add in remove item mutation
const handleRemoveItem = (cartItemId: string, item: CartItem) => {
  // Track removal
  trackEvent('remove_from_cart', {
    currency: 'INR',
    value: parseFloat(item.watchColor.offerprice) * item.quantity,
    items: [{
      item_id: item.watchColor.watch_id,
      item_name: item.watchColor.watch_name,
      item_variant: item.watchColor.name,
      item_brand: 'Alban Marcus',
      price: parseFloat(item.watchColor.offerprice),
      quantity: item.quantity
    }]
  });
  
  // Continue with removal
  removeFromCart(cartItemId);
};
```

---

### 6. **view_cart** - Cart Page View
**When**: User navigates to cart page  
**File**: `app/cart/page.tsx`  
**Trigger**: On cart page load

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Add in useEffect when cart loads
useEffect(() => {
  if (cart && cart.items && cart.items.length > 0) {
    const cartValue = cart.items.reduce((total, item) => {
      return total + (parseFloat(item.watchColor.offerprice) * item.quantity);
    }, 0);
    
    trackEvent('view_cart', {
      currency: 'INR',
      value: cartValue,
      items: cart.items.map((item, index) => ({
        item_id: item.watchColor.watch_id,
        item_name: item.watchColor.watch_name,
        item_variant: item.watchColor.name,
        item_brand: 'Alban Marcus',
        price: parseFloat(item.watchColor.offerprice),
        quantity: item.quantity,
        index: index
      }))
    });
  }
}, [cart]);
```

---

### 7. **begin_checkout** - Checkout Initiated
**When**: User clicks "Proceed to Checkout" or navigates to checkout page  
**File**: `app/cart/page.tsx` (checkout button) or `app/checkout/page.tsx` (page load)  
**Trigger**: On checkout initiation

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Option A: On checkout button click in cart page
const handleProceedToCheckout = () => {
  if (cart && cart.items) {
    trackEvent('begin_checkout', {
      currency: 'INR',
      value: parseFloat(cart.summary.totalAmount),
      items: cart.items.map((item, index) => ({
        item_id: item.watchColor.watch_id,
        item_name: item.watchColor.watch_name,
        item_variant: item.watchColor.name,
        item_brand: 'Alban Marcus',
        price: parseFloat(item.watchColor.offerprice),
        quantity: item.quantity,
        index: index
      }))
    });
  }
  
  router.push('/checkout');
};

// Option B: On checkout page load
useEffect(() => {
  if (cart && cart.items && cart.items.length > 0) {
    trackEvent('begin_checkout', {
      currency: 'INR',
      value: parseFloat(cart.summary.totalAmount),
      items: cart.items.map((item, index) => ({
        item_id: item.watchColor.watch_id,
        item_name: item.watchColor.watch_name,
        item_variant: item.watchColor.name,
        item_brand: 'Alban Marcus',
        price: parseFloat(item.watchColor.offerprice),
        quantity: item.quantity,
        index: index
      }))
    });
  }
}, [cart]);
```

---

### 8. **add_shipping_info** - Shipping Information Added
**When**: User completes shipping address form  
**File**: `app/checkout/page.tsx`  
**Trigger**: After shipping address selection/completion

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Add when shipping address is selected
const handleShippingAddressSelect = (address: Address) => {
  setShippingAddress(address);
  
  trackEvent('add_shipping_info', {
    currency: 'INR',
    value: totalAmount,
    shipping_tier: 'Standard', // or 'Express' based on selection
    items: cartItems.map((item, index) => ({
      item_id: item.watchColor.watch_id,
      item_name: item.watchColor.watch_name,
      item_variant: item.watchColor.name,
      item_brand: 'Alban Marcus',
      price: parseFloat(item.watchColor.offerprice),
      quantity: item.quantity,
      index: index
    }))
  });
};
```

---

### 9. **add_payment_info** - Payment Method Selected
**When**: User selects payment method (Razorpay, COD, etc.)  
**File**: `app/checkout/page.tsx`  
**Trigger**: On payment method selection

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Add when payment method is selected
const handlePaymentMethodSelect = (method: string) => {
  setPaymentMethod(method);
  
  trackEvent('add_payment_info', {
    currency: 'INR',
    value: totalAmount,
    payment_type: method, // 'upi', 'card', 'cod', etc.
    items: cartItems.map((item, index) => ({
      item_id: item.watchColor.watch_id,
      item_name: item.watchColor.watch_name,
      item_variant: item.watchColor.name,
      item_brand: 'Alban Marcus',
      price: parseFloat(item.watchColor.offerprice),
      quantity: item.quantity,
      index: index
    }))
  });
};
```

---

### 10. **purchase** - Order Completed (CRITICAL)
**When**: Order is successfully placed and payment verified  
**File**: `app/order-success/page.tsx` or checkout completion handler  
**Trigger**: On order confirmation page load

```typescript
// Import at top
import { trackPurchase } from '@/components/seo/GoogleAnalytics';

// Add in useEffect on order success page
useEffect(() => {
  if (orderDetails && orderDetails.id) {
    // Get order items from localStorage or passed via URL params
    const orderItems = JSON.parse(localStorage.getItem('completedOrderItems') || '[]');
    const orderTotal = parseFloat(localStorage.getItem('completedOrderTotal') || '0');
    const orderTax = parseFloat(localStorage.getItem('completedOrderTax') || '0');
    const orderShipping = parseFloat(localStorage.getItem('completedOrderShipping') || '0');
    
    trackPurchase(
      orderDetails.orderNumber || orderDetails.id,
      orderTotal,
      'INR',
      orderItems.map((item: any, index: number) => ({
        item_id: item.watch_id,
        item_name: item.watch_name,
        item_variant: item.color_name,
        item_brand: 'Alban Marcus',
        price: parseFloat(item.unit_price),
        quantity: item.quantity,
        index: index
      }))
    );
    
    // Additional purchase details
    trackEvent('purchase', {
      transaction_id: orderDetails.orderNumber || orderDetails.id,
      value: orderTotal,
      currency: 'INR',
      tax: orderTax,
      shipping: orderShipping,
      items: orderItems.map((item: any, index: number) => ({
        item_id: item.watch_id,
        item_name: item.watch_name,
        item_variant: item.color_name,
        item_brand: 'Alban Marcus',
        price: parseFloat(item.unit_price),
        quantity: item.quantity,
        index: index
      }))
    });
    
    // Clear order details from localStorage after tracking
    localStorage.removeItem('completedOrderItems');
    localStorage.removeItem('completedOrderTotal');
    localStorage.removeItem('completedOrderTax');
    localStorage.removeItem('completedOrderShipping');
  }
}, [orderDetails]);
```

**IMPORTANT**: Store order details in localStorage during checkout completion:

```typescript
// In checkout success handler (before redirecting to order-success)
localStorage.setItem('completedOrderItems', JSON.stringify(orderItems));
localStorage.setItem('completedOrderTotal', totalAmount.toString());
localStorage.setItem('completedOrderTax', taxAmount.toString());
localStorage.setItem('completedOrderShipping', shippingAmount.toString());

router.push(`/order-success?orderId=${orderId}&orderNumber=${orderNumber}`);
```

---

### 11. **refund** - Order Refund
**When**: Order is refunded/cancelled  
**File**: Order details or admin panel  
**Trigger**: On refund confirmation

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

const handleRefund = (order: Order) => {
  trackEvent('refund', {
    transaction_id: order.order_number,
    value: parseFloat(order.total_amount),
    currency: 'INR',
    items: order.items.map((item, index) => ({
      item_id: item.watch_color_id,
      item_name: item.watch_name,
      price: parseFloat(item.unit_price),
      quantity: item.quantity,
      index: index
    }))
  });
  
  // Continue with refund processing
};
```

---

## User Engagement Events

### 12. **login** - User Login
**When**: User successfully logs in  
**File**: `components/molecules/loginModal/LoginModal.tsx` or `app/login/page.tsx`  
**Trigger**: After successful Supabase authentication

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Add after successful login
const handleLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (!error && data.user) {
    trackEvent('login', {
      method: 'email', // or 'google', 'facebook' for social login
      user_id: data.user.id
    });
    
    toast.success('Login successful!');
  }
};
```

---

### 13. **sign_up** - User Registration
**When**: User completes registration  
**File**: Registration modal/page  
**Trigger**: After successful Supabase signup

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Add after successful signup
const handleSignup = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name }
    }
  });
  
  if (!error && data.user) {
    trackEvent('sign_up', {
      method: 'email',
      user_id: data.user.id
    });
    
    toast.success('Registration successful!');
  }
};
```

---

### 14. **search** - Product Search
**When**: User performs a search in collections  
**File**: `app/collections/page.tsx` or search component  
**Trigger**: On search submission

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Add in search handler
const handleSearch = (searchTerm: string) => {
  trackEvent('search', {
    search_term: searchTerm,
    page_location: window.location.pathname
  });
  
  // Continue with search logic
  performSearch(searchTerm);
};
```

---

### 15. **filter** - Collection Filters Applied
**When**: User applies category/series/price filters  
**File**: `app/collections/page.tsx`  
**Trigger**: On filter change

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Add when filters are applied
const handleFilterChange = (filterType: string, filterValue: string) => {
  trackEvent('filter', {
    filter_type: filterType, // 'category', 'series', 'price', 'theme'
    filter_value: filterValue,
    page_location: window.location.pathname
  });
  
  // Apply filter logic
};
```

---

### 16. **view_item_color** - Color Variant Selection
**When**: User selects a different watch color  
**File**: `app/collections/[id]/page.tsx`  
**Trigger**: On color selection

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Add in color selection handler
const handleColorSelect = (color: WatchColor) => {
  setSelectedColor(color);
  
  trackEvent('view_item_color', {
    item_id: watch.id,
    item_name: watch.name,
    color_name: color.name,
    color_hex: color.hex_code,
    price: parseFloat(color.offerprice)
  });
};
```

---

### 17. **share** - Product Share
**When**: User clicks share button on watch details  
**File**: `app/collections/[id]/page.tsx`  
**Trigger**: On share action

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Add share button handler
const handleShare = (method: string) => {
  trackEvent('share', {
    method: method, // 'whatsapp', 'facebook', 'twitter', 'copy_link'
    content_type: 'product',
    item_id: watch.id,
    item_name: watch.name
  });
  
  // Continue with share logic
};
```

---

### 18. **view_promotion** - Banner/Promotion View
**When**: Homepage promotional banner is visible  
**File**: `app/page.tsx` or banner component  
**Trigger**: On promotion visibility (use Intersection Observer)

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

// Add with Intersection Observer
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        trackEvent('view_promotion', {
          promotion_id: 'homepage_hero_banner',
          promotion_name: 'Luxury Watches Collection',
          creative_name: 'Hero Banner',
          creative_slot: 'homepage_top'
        });
      }
    });
  }, { threshold: 0.5 });
  
  const bannerElement = document.getElementById('hero-banner');
  if (bannerElement) observer.observe(bannerElement);
  
  return () => observer.disconnect();
}, []);
```

---

### 19. **select_promotion** - Promotion Click
**When**: User clicks on a promotional banner  
**File**: Banner/promotion components  
**Trigger**: On promotion click

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

const handlePromotionClick = () => {
  trackEvent('select_promotion', {
    promotion_id: 'homepage_hero_banner',
    promotion_name: 'Luxury Watches Collection',
    creative_name: 'Hero Banner',
    creative_slot: 'homepage_top',
    location_id: 'homepage'
  });
  
  router.push('/collections');
};
```

---

## Engagement & Interaction Events

### 20. **contact_form_submit** - Contact Form
**When**: User submits contact form  
**File**: `app/contact/page.tsx` or contact modal  
**Trigger**: On form submission

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

const handleContactSubmit = async (formData: ContactFormData) => {
  trackEvent('contact_form_submit', {
    form_name: 'Contact Us',
    form_location: 'contact_page'
  });
  
  // Submit form
};
```

---

### 21. **newsletter_signup** - Newsletter Subscription
**When**: User subscribes to newsletter (if implemented)  
**File**: Footer or newsletter component  
**Trigger**: On successful subscription

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

const handleNewsletterSignup = async (email: string) => {
  trackEvent('newsletter_signup', {
    method: 'footer_form',
    user_email_hash: hashEmail(email) // Hash for privacy
  });
  
  // Process subscription
};
```

---

### 22. **wishlist_add** - Add to Wishlist (if implemented)
**When**: User adds watch to wishlist  
**File**: Watch detail or card component  
**Trigger**: On wishlist addition

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

const handleAddToWishlist = (watch: Watch) => {
  trackEvent('add_to_wishlist', {
    currency: 'INR',
    value: parseFloat(watch.offerprice),
    items: [{
      item_id: watch.id,
      item_name: watch.name,
      item_category: watch.category,
      item_brand: 'Alban Marcus',
      price: parseFloat(watch.offerprice)
    }]
  });
  
  // Add to wishlist logic
};
```

---

### 23. **page_view** - Enhanced Page Views
**When**: User navigates to any page  
**File**: `app/layout.tsx` or navigation handler  
**Trigger**: On route change (automatic with GA4, but can enhance)

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';
import { usePathname } from 'next/navigation';

// Add in root layout or navigation boundary
const pathname = usePathname();

useEffect(() => {
  trackEvent('page_view', {
    page_path: pathname,
    page_title: document.title,
    page_location: window.location.href
  });
}, [pathname]);
```

---

### 24. **video_engagement** - Watch Video Views (if videos exist)
**When**: User watches product videos  
**File**: Video player component  
**Trigger**: On video milestones (25%, 50%, 75%, 100%)

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

const handleVideoProgress = (videoId: string, progress: number) => {
  trackEvent('video_progress', {
    video_id: videoId,
    video_title: 'Watch Showcase',
    progress_percent: progress,
    item_id: watch.id
  });
};
```

---

### 25. **scroll_depth** - Scroll Tracking
**When**: User scrolls through product pages  
**File**: Watch detail page  
**Trigger**: At 25%, 50%, 75%, 90% scroll depth

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

useEffect(() => {
  const scrollDepths = [25, 50, 75, 90];
  const trackedDepths = new Set<number>();
  
  const handleScroll = () => {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    scrollDepths.forEach(depth => {
      if (scrollPercent >= depth && !trackedDepths.has(depth)) {
        trackedDepths.add(depth);
        trackEvent('scroll_depth', {
          percent_scrolled: depth,
          page_path: window.location.pathname
        });
      }
    });
  };
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

---

## Conversion & Revenue Events

### 26. **view_warranty_info** - Warranty Page View
**When**: User views warranty information  
**File**: `app/warranty/page.tsx`  
**Trigger**: On page view

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

useEffect(() => {
  trackEvent('view_warranty_info', {
    page_location: '/warranty'
  });
}, []);
```

---

### 27. **view_shipping_policy** - Shipping Policy View
**When**: User views shipping policy  
**File**: `app/shipping-policy/page.tsx`  
**Trigger**: On page view

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

useEffect(() => {
  trackEvent('view_shipping_policy', {
    page_location: '/shipping-policy'
  });
}, []);
```

---

### 28. **order_tracking** - View Order Status
**When**: User views order tracking/details  
**File**: `app/orders/[id]/page.tsx`  
**Trigger**: On order details page load

```typescript
// Import at top
import { trackEvent } from '@/components/seo/GoogleAnalytics';

useEffect(() => {
  if (order) {
    trackEvent('view_order_status', {
      order_id: order.id,
      order_status: order.order_status,
      transaction_id: order.order_number
    });
  }
}, [order]);
```

---

## Implementation Priority

### **CRITICAL** (Implement First)
1. ✅ **purchase** - Revenue tracking
2. ✅ **add_to_cart** - Conversion funnel
3. ✅ **begin_checkout** - Checkout funnel
4. ✅ **view_item** - Product interest
5. ✅ **view_item_list** - Collection engagement

### **HIGH** (Implement Second)
6. ✅ **add_shipping_info** - Checkout progress
7. ✅ **add_payment_info** - Checkout progress
8. ✅ **remove_from_cart** - Cart abandonment analysis
9. ✅ **login** / **sign_up** - User acquisition
10. ✅ **select_item** - Product clicks

### **MEDIUM** (Implement Third)
11. ✅ **view_cart** - Cart engagement
12. ✅ **search** - Search behavior
13. ✅ **filter** - Filter usage
14. ✅ **view_item_color** - Product customization
15. ✅ **contact_form_submit** - Lead generation

### **LOW** (Nice to Have)
16. ⚪ **share** - Social engagement
17. ⚪ **view_promotion** - Marketing effectiveness
18. ⚪ **scroll_depth** - Content engagement
19. ⚪ **video_engagement** - Video performance
20. ⚪ **add_to_wishlist** - Future purchase intent

---

## Testing Events

### Test in Browser Console
```javascript
// Check if gtag is loaded
console.log(typeof window.gtag);

// Manually trigger test event
window.gtag('event', 'test_event', {
  test_param: 'test_value'
});
```

### Verify in GA4 DebugView
1. Install Google Analytics Debugger Chrome extension
2. Enable debug mode
3. Navigate through site and perform actions
4. Check GA4 > Admin > DebugView to see events in real-time

### Event Parameters Best Practices
- Always include `currency: 'INR'` for monetary events
- Always include `item_brand: 'Alban Marcus'` for items
- Use consistent `item_id` (watch.id from database)
- Include `item_category`, `item_category2`, `item_category3` hierarchy
- Track `item_variant` for color selections
- Include `index` for list positions

---

## Additional Setup Required

### 1. Add TypeScript Types
```typescript
// types/analytics.ts
export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_brand: string;
  item_variant?: string;
  price: number;
  quantity?: number;
  index?: number;
  discount?: number;
}

export interface AnalyticsEvent {
  event_name: string;
  parameters: Record<string, any>;
}
```

### 2. Create Analytics Hook
```typescript
// hooks/useAnalytics.ts
import { trackEvent } from '@/components/seo/GoogleAnalytics';

export const useAnalytics = () => {
  const trackAddToCart = (watch: Watch, color: WatchColor, quantity: number) => {
    // Implementation
  };
  
  const trackPurchaseEvent = (order: Order) => {
    // Implementation
  };
  
  return {
    trackAddToCart,
    trackPurchaseEvent,
    // ... other helpers
  };
};
```

---

## Maintenance & Monitoring

### Regular Checks
- ✅ Verify GA4 Measurement ID is set in production `.env`
- ✅ Test all critical events in GA4 DebugView before production
- ✅ Monitor event counts in GA4 Reports
- ✅ Set up custom conversion events in GA4 Admin
- ✅ Create audiences based on tracked events
- ✅ Set up e-commerce reports in GA4

### Custom Reports to Create
1. **Conversion Funnel**: view_item_list → view_item → add_to_cart → begin_checkout → purchase
2. **Cart Abandonment**: Users who add_to_cart but don't complete purchase
3. **Product Performance**: Top viewed, added to cart, and purchased items
4. **User Journey**: Login → Browse → Add to Cart → Purchase time analysis

---

**Last Updated**: 2025-01-15  
**Analytics Platform**: Google Analytics 4 (GA4)  
**Framework**: Next.js 14 with App Router  
**Currency**: INR (Indian Rupee)

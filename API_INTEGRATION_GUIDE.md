# API Integration Guide - Alban Marcus Backend

This document provides a comprehensive guide to integrating with the Alban Marcus backend APIs, specifically focusing on the cart and order/checkout functionality.

## 🔑 Authentication

All APIs (except auth endpoints) require Supabase authentication token in the Authorization header:

```typescript
const headers = {
  'Authorization': `Bearer ${supabaseToken}`,
  'Content-Type': 'application/json'
}
```

The backend uses Supabase for authentication and maintains a local User table. The auth middleware (`middleware/auth.js`) validates tokens and provides `req.user.id` for local database operations.

---

## 🛒 Cart API (`/cart`)

**Base URL:** `http://localhost:5000/cart`
**Authentication:** Required for all endpoints

### 1. Get User Cart
```typescript
GET /cart

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "watch_color_id": "uuid",
        "quantity": 2,
        "price_at_time": "0.00",
        "createdat": "2024-01-01T00:00:00.000Z",
        "updatedat": "2024-01-01T00:00:00.000Z",
        "watchColor": {
          "id": "uuid",
          "name": "Silver",
          "hex_code": "#C0C0C0",
          "quantity": 10,
          "is_active": true,
          "sort_order": 1,
          "Watch": {
            "id": "uuid",
            "name": "Classic Watch",
            "description": "Premium timepiece",
            "brand": "Alban Marcus",
            "actualprice": "25000.00",
            "offerprice": "20000.00",
            "offerpercentage": 20,
            "rating": 4.5,
            "reviewscount": 150,
            // ... other watch properties
          }
        }
      }
    ],
    "summary": {
      "totalItems": 3,
      "totalAmount": "45000.00"
    }
  }
}
```

### 2. Add Items to Cart
```typescript
POST /cart/add

Body:
{
  "watchColorIds": [
    {
      "watch_color_id": "uuid",
      "quantity": 1
    }
  ]
}

Success Response (201):
{
  "success": true,
  "message": "1 item(s) added to cart",
  "results": [
    {
      "index": 0,
      "action": "created",
      "data": {
        "id": "uuid",
        "user_id": "uuid",
        "watch_color_id": "uuid",
        "quantity": 1,
        "watchColor": {
          "id": "uuid",
          "name": "Gold",
          "hex_code": "#FFD700"
        }
      }
    }
  ]
}

Error Response (409 - Item already in cart):
{
  "success": false,
  "code": "ALREADY_IN_CART",
  "message": "One or more items already exist in the cart",
  "errors": [...]
}
```

**Important Notes:**
- This is a **create-only** endpoint - it won't update existing items
- If item already exists in cart, returns 409 error
- Validates watch color exists, is active, and in stock
- Supports bulk adding multiple items

### 3. Update Cart Item Quantity
```typescript
PUT /cart/update/:cartItemId

Body:
{
  "quantity": 3
}

Response:
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "id": "uuid",
    "quantity": 3,
    "watchColor": {...}
  }
}
```

### 4. Remove Item from Cart
```typescript
DELETE /cart/delete/:cartItemId

Response:
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

### 5. Clear Entire Cart
```typescript
DELETE /cart/clear

Response:
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

### 6. Get Cart Summary
```typescript
GET /cart/summary

Response:
{
  "success": true,
  "data": {
    "totalItems": 5,
    "totalAmount": "125000.00"
  }
}
```

---

## 💳 Payment API (`/payment`)

**Base URL:** `http://localhost:5000/payment`
**Authentication:** Not explicitly required (but recommended)

### 1. Create Razorpay Order
```typescript
POST /payment/create-order

Body:
{
  "amount": 25000, // In rupees
  "currency": "INR", // Optional, defaults to INR
  "receipt": "receipt_123" // Optional
}

Response:
{
  "success": true,
  "order_id": "order_xyz123",
  "amount": 2500000, // In paise
  "currency": "INR",
  "key_id": "rzp_test_..."
}
```

### 2. Verify Payment
```typescript
POST /payment/verify

Body:
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash"
}

Response:
{
  "success": true,
  "message": "Payment verified",
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456"
}
```

---

## 📦 Order & Shipping API (`/delhivery`)

**Base URL:** `http://localhost:5000/delhivery`
**Authentication:** Required

### Complete Order Creation & Shipping
```typescript
POST /delhivery/create-and-ship

Body:
{
  "shipping_address_id": "uuid",
  "billing_address_id": "uuid",
  "cart_items": [
    {
      "watch_color_id": "uuid",
      "quantity": 1,
      "unit_price": 20000.00
    }
  ],
  "pricing": {
    "subtotal_amount": 20000.00,
    "tax_amount": 3600.00,
    "shipping_amount": 500.00,
    "discount_amount": 0.00,
    "total_amount": 24100.00,
    "currency": "INR"
  },
  "payment": {
    "method": "upi", // "cod", "upi", "card", etc.
    "gateway_order_id": "order_xyz123",
    "gateway_payment_id": "pay_abc456",
    "gateway_response": {...}, // Optional razorpay response
    "ip_address": "192.168.1.1" // Optional
  },
  "notes": "Special delivery instructions"
}

Response:
{
  "ok": true,
  "order": {
    "id": "uuid",
    "order_number": "ORD202501151234567890",
    "user_id": "uuid",
    "subtotal_amount": "20000.00",
    "tax_amount": "3600.00",
    "shipping_amount": "500.00",
    "total_amount": "24100.00",
    "order_status": "shipped",
    "shipping_address_id": "uuid",
    "billing_address_id": "uuid",
    "confirmed_at": "2024-01-01T00:00:00.000Z"
  },
  "items": [
    {
      "id": "uuid",
      "order_id": "uuid",
      "watch_color_id": "uuid",
      "quantity": 1,
      "unit_price": "20000.00",
      "total_price": "20000.00"
    }
  ],
  "payment_status": "completed",
  "shipment": {
    "id": "uuid",
    "order_id": "uuid",
    "waybill_number": "DHL123456789",
    "courier_name": "delhivery",
    "shipping_status": "manifested",
    "manifested_at": "2024-01-01T00:00:00.000Z"
  },
  "waybill": "DHL123456789",
  "delhivery": {
    // Raw Delhivery API response
  }
}
```

**This endpoint:**
- Creates Order in database
- Creates OrderItems from cart_items
- Records Payment information
- Creates shipment with Delhivery
- Updates order status to 'shipped'
- Returns complete order details with tracking

---

## 🏠 Address API (`/address`)

**Base URL:** `http://localhost:5000/address`
**Authentication:** Required for all endpoints

### 1. Create/Update Address
```typescript
POST /address

Body (Create):
{
  "address_line1": "123 Main Street",
  "address_line2": "Apt 4B", // Optional
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "country": "India"
}

Body (Update):
{
  "id": "existing-address-uuid",
  "address_line1": "456 New Street",
  // ... other fields
}

Response:
{
  "success": true,
  "message": "Address created/updated successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "address_line1": "123 Main Street",
    "city": "Mumbai",
    // ... other fields
  }
}
```

### 2. Get Single Address
```typescript
GET /address/:id

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "address_line1": "123 Main Street",
    // ... address fields
  }
}
```

### 3. Get All User Addresses
```typescript
GET /address/all

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "address_line1": "123 Main Street",
      // ... address fields
    }
  ]
}
```

---

## 🔄 Complete Checkout Flow

Here's the recommended checkout flow:

### 1. Frontend Preparation
```typescript
// 1. Get cart items
const cart = await fetch('/cart', { headers });

// 2. Get/create shipping and billing addresses
const addresses = await fetch('/address/all', { headers });
```

### 2. Payment Processing
```typescript
// 3. Create Razorpay order
const razorpayOrder = await fetch('/payment/create-order', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    amount: totalAmount,
    receipt: `receipt_${Date.now()}`
  })
});

// 4. Process payment with Razorpay SDK
const paymentResult = await processRazorpayPayment(razorpayOrder);

// 5. Verify payment
const verification = await fetch('/payment/verify', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    razorpay_order_id: paymentResult.razorpay_order_id,
    razorpay_payment_id: paymentResult.razorpay_payment_id,
    razorpay_signature: paymentResult.razorpay_signature
  })
});
```

### 3. Order Creation & Shipping
```typescript
// 6. Create complete order with shipping
const order = await fetch('/delhivery/create-and-ship', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    shipping_address_id: selectedShippingAddress.id,
    billing_address_id: selectedBillingAddress.id,
    cart_items: cartItems.map(item => ({
      watch_color_id: item.watch_color_id,
      quantity: item.quantity,
      unit_price: item.watchColor.Watch.offerprice
    })),
    pricing: {
      subtotal_amount: subtotal,
      tax_amount: tax,
      shipping_amount: shipping,
      discount_amount: discount,
      total_amount: total,
      currency: 'INR'
    },
    payment: {
      method: 'upi',
      gateway_order_id: paymentResult.razorpay_order_id,
      gateway_payment_id: paymentResult.razorpay_payment_id,
      gateway_response: paymentResult
    }
  })
});

// 7. Clear cart after successful order
await fetch('/cart/clear', { method: 'DELETE', headers });
```

---

## 📊 Database Models

### Order Status Flow
```
pending → confirmed → processing → shipped → delivered
   ↓
cancelled (from pending/confirmed only)
   ↓
returned (from delivered)
```

### Key Relationships
- **User** → **Cart** (1:many)
- **User** → **Order** (1:many)
- **User** → **Address** (1:many)
- **Order** → **OrderItem** (1:many)
- **Order** → **Payment** (1:many)
- **Order** → **ShipmentTracking** (1:1)
- **WatchColor** → **Cart** (1:many)
- **WatchColor** → **OrderItem** (1:many)

---

## 🚨 Error Handling

### Common Error Codes
- **AUTH_ERROR**: Authentication/token issues
- **CART_ITEM_NOT_FOUND**: Invalid cart item ID
- **ALREADY_IN_CART**: Item already exists in cart
- **OUT_OF_STOCK**: Watch color not available
- **INVALID_UUID**: Malformed UUID in request
- **INVALID_QUANTITY**: Invalid quantity value

### Standard Error Response Format
```typescript
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human readable error message",
  "errors": [...] // Additional error details if applicable
}
```

---

## 🛠 Integration Tips

### 1. Using TanStack Query (Recommended)
```typescript
// Cart queries
export const useCart = () =>
  useQuery({
    queryKey: queryKeys.cart.list(),
    queryFn: () => apiServices.cart.getCart(),
  });

export const useAddToCart = () =>
  useMutation({
    mutationFn: (items) => apiServices.cart.addItems(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart._def });
    },
  });

// Order mutation
export const useCreateOrder = () =>
  useMutation({
    mutationFn: (orderData) => apiServices.orders.createAndShip(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart._def });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders._def });
    },
  });
```

### 2. Environment Variables Required
```env
# Backend
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
DELHIVERY_API_TOKEN=...
DELHIVERY_BASE_URL=https://staging-express.delhivery.com
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

### 3. TypeScript Types
```typescript
interface CartItem {
  id: string;
  user_id: string;
  watch_color_id: string;
  quantity: number;
  price_at_time: string;
  watchColor: {
    id: string;
    name: string;
    hex_code: string;
    quantity: number;
    is_active: boolean;
    Watch: Watch;
  };
}

interface CreateOrderPayload {
  shipping_address_id: string;
  billing_address_id: string;
  cart_items: {
    watch_color_id: string;
    quantity: number;
    unit_price: number;
  }[];
  pricing: {
    subtotal_amount: number;
    tax_amount: number;
    shipping_amount: number;
    discount_amount: number;
    total_amount: number;
    currency: string;
  };
  payment: {
    method: string;
    gateway_order_id?: string;
    gateway_payment_id?: string;
    gateway_response?: any;
    ip_address?: string;
  };
  notes?: string;
}
```

This integration guide provides all the necessary information to implement cart functionality and complete checkout flow in your frontend application.
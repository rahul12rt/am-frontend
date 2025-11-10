# Checkout Purchase Tracking Setup

## ⚠️ IMPORTANT: Required for Purchase Event Tracking

The purchase event in `app/order-success/page.tsx` reads order data from **localStorage**. You MUST set this data in your checkout page before redirecting to the order success page.

## 📍 Where to Add This Code

Add this code in your **checkout page** (`app/checkout/page.tsx`) RIGHT BEFORE redirecting to the order-success page, typically after successful payment verification.

## 📝 Code to Add

```typescript
// In your checkout success handler (after payment is verified)
// Right before: router.push('/order-success?orderId=...')

// Prepare order items for GA4 tracking
const orderItemsForTracking = cartItems.map(item => ({
  watch_id: item.watchColor?.watch_id || item.watch_id,
  watch_name: item.watchColor?.watch_name || item.watch_name,
  color_name: item.watchColor?.name || '',
  unit_price: item.watchColor?.offerprice || item.unit_price,
  quantity: item.quantity
}));

// Store in localStorage for purchase event tracking
localStorage.setItem('completedOrderItems', JSON.stringify(orderItemsForTracking));
localStorage.setItem('completedOrderTotal', totalAmount.toString());
localStorage.setItem('completedOrderTax', taxAmount.toString());
localStorage.setItem('completedOrderShipping', shippingAmount.toString());

// NOW redirect to order success
router.push(`/order-success?orderId=${orderId}&orderNumber=${orderNumber}&status=confirmed`);
```

## 🎯 Complete Example Integration

Here's a complete example of where this fits in your checkout flow:

```typescript
// File: app/checkout/page.tsx

const handlePaymentSuccess = async (paymentData: any) => {
  try {
    // 1. Create order in backend
    const orderResponse = await fetch('/api/orders/create-and-ship', {
      method: 'POST',
      body: JSON.stringify({
        shipping_address_id: shippingAddress.id,
        billing_address_id: billingAddress.id,
        cart_items: cartItems,
        pricing: {
          subtotal_amount: subtotalAmount,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          currency: 'INR'
        },
        payment: {
          method: paymentMethod,
          gateway_order_id: paymentData.razorpay_order_id,
          gateway_payment_id: paymentData.razorpay_payment_id,
          gateway_response: paymentData
        }
      })
    });

    const orderData = await orderResponse.json();
    
    if (orderData.ok && orderData.order) {
      // ✅ CRITICAL: Store data for GA4 purchase tracking
      const orderItemsForTracking = cartItems.map(item => ({
        watch_id: item.watchColor?.watch_id || item.watch_id,
        watch_name: item.watchColor?.watch_name || item.watch_name,
        color_name: item.watchColor?.name || '',
        unit_price: item.watchColor?.offerprice || item.unit_price,
        quantity: item.quantity
      }));
      
      localStorage.setItem('completedOrderItems', JSON.stringify(orderItemsForTracking));
      localStorage.setItem('completedOrderTotal', totalAmount.toString());
      localStorage.setItem('completedOrderTax', taxAmount.toString());
      localStorage.setItem('completedOrderShipping', shippingAmount.toString());
      
      // 2. Clear cart
      await clearCart();
      
      // 3. Redirect to success page
      router.push(`/order-success?orderId=${orderData.order.id}&orderNumber=${orderData.order.order_number}&status=confirmed`);
    } else {
      throw new Error('Order creation failed');
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    showToast('Failed to process order. Please contact support.', 'error');
  }
};
```

## 🔍 Data Format Reference

### completedOrderItems (Array of Objects)
```json
[
  {
    "watch_id": "abc-123-def",
    "watch_name": "Classic Aviator Silver",
    "color_name": "Silver",
    "unit_price": "24500",
    "quantity": 1
  },
  {
    "watch_id": "xyz-789-ghi",
    "watch_name": "Diver Pro Black",
    "color_name": "Black",
    "unit_price": "32000",
    "quantity": 2
  }
]
```

### completedOrderTotal (String)
```json
"80500"
```

### completedOrderTax (String)
```json
"14490"
```

### completedOrderShipping (String)
```json
"0"
```

## ✅ Verification Steps

### 1. Test in Browser Console
Before checkout:
```javascript
// Should be null
console.log(localStorage.getItem('completedOrderItems'));
```

After successful order:
```javascript
// Should show your data
console.log(JSON.parse(localStorage.getItem('completedOrderItems')));
console.log(localStorage.getItem('completedOrderTotal'));
console.log(localStorage.getItem('completedOrderTax'));
console.log(localStorage.getItem('completedOrderShipping'));
```

On order-success page:
```javascript
// Should show purchase event in console
// Look for: 🎯 GA4 Event: PURCHASE
// Then all items should be removed:
console.log(localStorage.getItem('completedOrderItems')); // Should be null
```

### 2. Check GA4 DebugView
1. Complete a test purchase
2. Open GA4 → Admin → DebugView
3. Look for `purchase` event
4. Verify it contains:
   - `transaction_id`
   - `value` (total amount)
   - `currency: 'INR'`
   - `tax`
   - `shipping`
   - `items` array with all products

## 🚨 Common Issues

### Issue: Purchase event not firing
**Cause**: localStorage not set before redirect
**Solution**: Ensure localStorage.setItem() calls happen BEFORE router.push()

### Issue: Purchase event fires but items are empty
**Cause**: Items array not properly formatted
**Solution**: Check cartItems mapping, ensure all required fields exist

### Issue: Purchase event fires multiple times
**Cause**: Page remounting or navigation loops
**Solution**: localStorage is cleared after tracking, so this shouldn't happen. Check for redirect loops.

### Issue: Can't read from localStorage
**Cause**: Privacy mode or localStorage disabled
**Solution**: Wrap in try-catch:
```typescript
try {
  localStorage.setItem('completedOrderItems', JSON.stringify(items));
} catch (error) {
  console.error('Failed to store order data:', error);
  // Fallback: Pass data via URL params or sessionStorage
}
```

## 📋 Pre-Deployment Checklist

- [ ] localStorage.setItem() calls added to checkout success handler
- [ ] Order items properly formatted with all required fields
- [ ] localStorage calls happen BEFORE router.push()
- [ ] Tested complete purchase flow end-to-end
- [ ] Verified purchase event in GA4 DebugView
- [ ] Confirmed localStorage is cleared after tracking
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices

## 🎯 Expected Flow

```
User completes checkout
    ↓
Payment verified
    ↓
Order created in backend
    ↓
✅ localStorage.setItem() × 4 (items, total, tax, shipping)
    ↓
Redirect to /order-success
    ↓
Order-success page loads
    ↓
useEffect reads from localStorage
    ↓
🎯 trackPurchase() fires with full data
    ↓
localStorage items cleared
    ↓
User sees success message
```

## 💡 Pro Tips

1. **Always use .toString()** for numeric values to ensure consistency
2. **Store raw price values** without currency symbols or commas
3. **Test with small orders first** to verify data accuracy
4. **Monitor for 24 hours** after deployment to catch any issues
5. **Set up GA4 alerts** for purchase event anomalies

---

**Last Updated**: 2025-01-15  
**Status**: Required for Purchase Tracking  
**Priority**: 🔴 CRITICAL - Must implement before production

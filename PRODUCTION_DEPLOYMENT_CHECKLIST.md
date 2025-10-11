# Production Deployment Checklist

## 🚀 Pre-Deployment Checklist

### ✅ Code Quality & Cleanup
- [x] Remove all console.log statements (30 logs removed)
- [x] Remove conflicting favicon.ico from public folder
- [x] Clean up middleware unnecessary checks
- [x] GA4 tracking implemented and cleaned
- [ ] Run ESLint: `npm run lint`
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Test build locally: `npm run build`

### ✅ Environment Variables

Ensure these are set in your **production** `.env` file:

```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key

# Backend API (Production)
NEXT_PUBLIC_API_BASE_URL=https://api.albanmarcus.com/api

# Razorpay (Production - LIVE keys)
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
RAZORPAY_KEY_SECRET=your-live-secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://albanmarcus.com

# Google Analytics (IMPORTANT)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # ⚠️ MUST BE SET

# SEO Verification
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-google-verification-code
```

### ✅ GA4 Configuration

**CRITICAL**: Before deploying, complete these steps:

1. **Set GA4 Measurement ID**
   - [ ] Replace `G-XXXXXXXXXX` with your actual GA4 ID
   - [ ] Verify in `.env` file
   - [ ] Confirm it loads in browser

2. **Configure GA4 Property**
   - [ ] Mark `purchase` as conversion event
   - [ ] Mark `add_to_cart` as conversion event
   - [ ] Mark `begin_checkout` as conversion event
   - [ ] Mark `sign_up` as conversion event
   - [ ] Enable Enhanced Measurement
   - [ ] Enable E-commerce reports

3. **Test GA4 Tracking**
   - [ ] Test in DebugView (install GA Debugger extension)
   - [ ] Complete a test purchase
   - [ ] Verify purchase event appears with correct data
   - [ ] Check all critical events fire correctly

### ✅ Checkout Purchase Tracking Setup

**CRITICAL**: Add localStorage code to checkout page:

- [ ] Read `CHECKOUT_PURCHASE_TRACKING_SETUP.md`
- [ ] Add localStorage.setItem() calls before redirect to order-success
- [ ] Test complete purchase flow
- [ ] Verify purchase event fires in GA4

Example code to add in `app/checkout/page.tsx`:
```typescript
// Before: router.push('/order-success?orderId=...')

localStorage.setItem('completedOrderItems', JSON.stringify(orderItems));
localStorage.setItem('completedOrderTotal', totalAmount.toString());
localStorage.setItem('completedOrderTax', taxAmount.toString());
localStorage.setItem('completedOrderShipping', shippingAmount.toString());

// Then: router.push('/order-success?orderId=...')
```

### ✅ Security Checks

- [ ] Verify no API keys in client-side code
- [ ] Ensure all sensitive data uses environment variables
- [ ] Check CORS settings on backend
- [ ] Verify Supabase RLS policies are enabled
- [ ] Test authentication flow end-to-end
- [ ] Verify payment gateway is in LIVE mode (not TEST)

### ✅ Performance Optimization

- [ ] Images optimized and using Next.js Image component
- [ ] Watch cache system working correctly
- [ ] Check bundle size: `npm run build` (verify < 500KB per chunk)
- [ ] Verify lazy loading for components
- [ ] Test on mobile devices (Chrome DevTools)
- [ ] Check Lighthouse score (aim for 90+)

### ✅ Functional Testing

**Critical User Flows**:

1. **Browse & View**
   - [ ] Homepage loads correctly
   - [ ] Collections page displays watches
   - [ ] Watch detail page shows all info
   - [ ] Color selection works
   - [ ] Images load properly

2. **Authentication**
   - [ ] User can sign up
   - [ ] User can log in
   - [ ] Profile loads correctly
   - [ ] Logout works properly

3. **Shopping Cart**
   - [ ] Add to cart works
   - [ ] Update quantity works
   - [ ] Remove from cart works
   - [ ] Cart persists after login
   - [ ] Cart summary calculates correctly

4. **Checkout & Purchase**
   - [ ] Checkout page loads
   - [ ] Address selection/creation works
   - [ ] Payment integration works (Razorpay)
   - [ ] Order creation succeeds
   - [ ] Order success page displays
   - [ ] Purchase event fires in GA4
   - [ ] Order confirmation email sent

5. **Post-Purchase**
   - [ ] Order appears in user's order history
   - [ ] Order details page displays correctly
   - [ ] Cart is cleared after purchase

### ✅ Browser & Device Testing

Test on:
- [ ] Chrome (Desktop)
- [ ] Safari (Desktop)
- [ ] Firefox (Desktop)
- [ ] Chrome (Mobile)
- [ ] Safari (iOS)
- [ ] Edge (Desktop)

### ✅ API Integration

- [ ] Backend API is deployed and accessible
- [ ] All API endpoints return correct data
- [ ] Error handling works properly
- [ ] Rate limiting configured
- [ ] Database backups enabled

### ✅ SEO & Metadata

- [ ] All pages have proper titles
- [ ] Meta descriptions set
- [ ] Open Graph tags configured
- [ ] Sitemap.xml generated
- [ ] Robots.txt configured
- [ ] Canonical URLs set
- [ ] Google Search Console verified

## 📋 Deployment Steps

### Option A: Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all production environment variables
   - Ensure GA4 Measurement ID is set

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option B: Manual Deployment

1. **Build Production Bundle**
   ```bash
   npm run build
   ```

2. **Test Production Build Locally**
   ```bash
   npm start
   ```

3. **Deploy to Server**
   ```bash
   # Upload .next folder and necessary files
   # Ensure Node.js 18+ is installed on server
   # Run: npm start or use PM2
   ```

## 🎯 Post-Deployment Verification

### Immediately After Deployment (0-15 minutes)

- [ ] Website loads at production URL
- [ ] No console errors in browser
- [ ] GA4 Realtime reports show activity
- [ ] Test a complete purchase flow
- [ ] Verify purchase event in GA4 DebugView
- [ ] Check payment gateway dashboard for test order
- [ ] Verify order appears in admin/backend

### First 24 Hours

- [ ] Monitor GA4 Realtime reports
- [ ] Check error logging/monitoring
- [ ] Verify email notifications work
- [ ] Monitor server resources (CPU, memory)
- [ ] Check for any user-reported issues
- [ ] Verify all GA4 events are firing correctly

### First Week

- [ ] Review GA4 conversion data
- [ ] Analyze user behavior funnel
- [ ] Check cart abandonment rate
- [ ] Review top-performing products
- [ ] Monitor page load times
- [ ] Check for any API errors
- [ ] Review customer feedback

## 🚨 Rollback Plan

If issues occur after deployment:

1. **Quick Rollback (Vercel)**
   ```bash
   vercel rollback
   ```

2. **Manual Rollback**
   - Redeploy previous working version
   - Restore database backup if needed
   - Clear CDN cache
   - Notify users if necessary

## 📊 Success Metrics

After deployment, track these KPIs:

| Metric | Target | How to Check |
|--------|--------|--------------|
| Purchase Events | >0 per day | GA4 → Reports → Monetization |
| Conversion Rate | >2% | (Purchases / Sessions) × 100 |
| Cart Abandonment | <70% | GA4 → Custom Report |
| Page Load Time | <3s | Lighthouse or GA4 → Engagement |
| Error Rate | <1% | Browser console + server logs |
| GA4 Event Tracking | 100% | GA4 → DebugView |

## 📞 Support Contacts

- **Frontend Issues**: [Your Team]
- **Backend API**: [Backend Team]
- **Payment Gateway**: Razorpay Support
- **Hosting**: Vercel Support / Your hosting provider
- **Analytics**: Google Analytics Support

## 🎉 Launch Announcement

After successful deployment:

- [ ] Notify team of successful launch
- [ ] Update documentation
- [ ] Announce on social media
- [ ] Send email to existing customers
- [ ] Update Google Search Console
- [ ] Submit sitemap to search engines

---

## ✅ Final Sign-Off

**Deployment Ready**: Only check when ALL items above are complete

- [ ] All code quality checks passed
- [ ] All environment variables set correctly
- [ ] GA4 tracking implemented and tested
- [ ] Checkout localStorage setup complete
- [ ] All critical user flows tested
- [ ] Security checks completed
- [ ] Performance optimization verified
- [ ] Team notified and ready for launch

**Deployed By**: _________________  
**Deployment Date**: _________________  
**Production URL**: https://albanmarcus.com  
**Verified By**: _________________

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-15  
**Status**: Ready for Production Deployment

# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Alban Marcus** is a luxury watch e-commerce platform built with Next.js 14 (App Router), TypeScript, React, and Supabase authentication. The application features a sophisticated caching strategy, Razorpay payment integration, and comprehensive cart/checkout functionality.

## Development Commands

### Core Commands
```powershell
# Install dependencies
npm install

# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Backend Integration
- **Backend API**: `http://localhost:5000/api` (configured via `NEXT_PUBLIC_API_BASE_URL`)
- **Backend must be running** for most features (cart, orders, user profile, watch data)

## Project Architecture

### High-Level Architecture Pattern

This is a **layered architecture** with clear separation of concerns:

```
UI Layer (Pages/Components)
    ↓
Hooks Layer (TanStack Query + Custom Hooks)
    ↓
Services Layer (API Clients + Service Functions)
    ↓
Context Layer (Global State Management)
    ↓
External APIs (Backend API, Supabase, Razorpay)
```

### Critical Architecture Concepts

#### 1. **Dual API Client System** (`lib/api-clients.ts`)
The application uses **two separate Axios instances**:
- **`unprotectedApiClient`**: For public endpoints (watches, products)
- **`protectedApiClient`**: For authenticated endpoints (cart, orders, profile)
  - Automatically injects Supabase JWT token in `Authorization` header
  - Token retrieved from Supabase session on every request

**When to use which client:**
- Use `unprotectedApiClient` for watch listings, product details, public data
- Use `protectedApiClient` for cart operations, orders, user data, addresses

#### 2. **Service Layer Pattern** (`lib/api-services.ts`)
All API calls are abstracted into service functions:
- `watchServices.*` - Watch/product operations
- `cartServices.*` - Cart management
- `addressServices.*` - Address management
- `userServices.*` - User profile operations

**Never call Axios directly from components** - always use service functions.

#### 3. **Global Watch Cache System** (Critical for Performance)
The app loads **all watches once** and caches them globally via `WatchCacheContext`:

**How it works:**
- On initial load (homepage or any watch-related page), all watches are fetched
- `WatchCacheProvider` stores watches in React Context
- All components read from cache instead of making repeated API calls
- Result: ~90% faster page loads after initial cache

**Key hooks:**
- `useWatchCache()` - Access entire cache
- `useWatchFromCache(id)` - Get specific watch from cache
- `useRandomRecommendations(count, excludeId)` - Get daily-seeded random watches

**When to refresh cache:**
- After creating/updating/deleting watches (admin operations)
- Use `refreshCache()` from `useWatchCache()`

#### 4. **Provider Hierarchy** (IMPORTANT - Order Matters!)
```tsx
ErrorBoundary
  → Providers (QueryClientProvider)
    → UserProvider (Auth + User Profile)
      → WatchCacheProvider (Watch Data Cache)
        → ToastProvider (Notifications)
          → UserModalProvider (Login/Register Modal State)
            → App Content
```

**Why this order matters:**
- `UserProvider` must wrap `WatchCacheProvider` because cache may need auth tokens
- `QueryClientProvider` wraps everything for TanStack Query
- Modal/Toast providers are innermost for UI concerns

#### 5. **Authentication Flow** (Supabase)
- **Middleware** (`middleware.ts`): Validates Supabase session on every request
- **UserContext**: Maintains auth state and user profile
- **Token Management**: Automatic via Supabase SDK, injected by `protectedApiClient`

**Auth states:**
- `isInitializing: true` - App is checking initial auth state
- `isLoadingProfile: true` - Fetching user profile from backend
- `isAuthenticated: true` - User has valid Supabase session
- `isReady: true` - Auth check complete AND profile loaded (if authenticated)

**Wait for `isReady` before rendering protected content.**

#### 6. **Query Key Management** (`lib/query-keys.ts`)
Centralized TanStack Query keys prevent cache inconsistencies:

```typescript
// Use these structured keys:
queryKeys.watches.detail(id)     // ['watches', 'detail', id]
queryKeys.cart.items()           // ['cart', 'items']
queryKeys.orders.detail(id)      // ['orders', 'detail', id]
```

**When invalidating queries after mutations:**
```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() })
```

### Component Organization (Atomic Design)

```
components/
├── atoms/          # Basic building blocks (buttons, inputs, icons)
├── molecules/      # Simple combinations (form fields, cards)
├── organisms/      # Complex components (header, footer, checkout)
├── layout/         # Layout wrappers (AppLoader)
├── seo/            # SEO components (GoogleAnalytics)
└── ui/             # Shadcn UI components
```

## Key Technical Patterns

### 1. **Cart Integration Pattern**
```typescript
// Adding to cart (bulk operation)
const { mutate: addToCart } = useAddToCart();
addToCart({
  watchColorIds: [
    { watch_color_id: "uuid", quantity: 1 }
  ]
});
```

**Important:** The `/cart/add` endpoint is **create-only**. If item exists, it returns 409 error. Use `/cart/update/:id` to change quantity.

### 2. **Checkout Flow** (Razorpay Integration)
Complete order flow spans 3 APIs:
1. `POST /payment/create-order` - Create Razorpay order
2. Process payment via Razorpay SDK (client-side)
3. `POST /payment/verify` - Verify payment signature
4. `POST /delhivery/create-and-ship` - Create order + shipment
5. `DELETE /cart/clear` - Clear cart after success

**See `API_INTEGRATION_GUIDE.md` for detailed checkout implementation.**

### 3. **Image Optimization**
- Uses Next.js `<Image>` component with CDN domains configured in `next.config.js`
- Allowed domains: `alban.b-cdn.net`, `d1w5wvfcm01czh.cloudfront.net`
- Image preloading **disabled** for mobile performance (relies on Next.js caching)

### 4. **Error Boundaries**
- `ErrorBoundary` wraps entire app to catch React errors
- `NavigationBoundary` handles navigation-specific errors
- Always provide fallback UI for error states

### 5. **Loading States**
- `AppLoader` component shows loading screen on initial page load
- Configurable paths where loading appears (`loadingEnabledPaths`)
- Minimum loading time to prevent flash: `minLoadingTime: 3000ms`

## Environment Variables

Required variables in `.env`:

```env
# Supabase (Authentication)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# Razorpay (Payments)
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx

# SEO & Analytics
NEXT_PUBLIC_SITE_URL=https://albanmarcus.com
NEXT_PUBLIC_GOOGLE_VERIFICATION=xxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Testing & Debugging

### Testing Single Components
```powershell
# Navigate to specific page/component to test
# Development server watches for changes
npm run dev
```

### Cache Monitoring (Development Only)
- `CacheMonitor` component shows cache stats in development
- Location: `components/molecules/cacheMonitor/CacheMonitor.tsx`
- Displays: total watches, cache ready state, preloaded images

### Common Issues & Solutions

**Issue**: Cart not updating after add
- **Cause**: Query cache not invalidated
- **Fix**: Ensure mutation's `onSuccess` calls `queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() })`

**Issue**: "Item already in cart" error (409)
- **Cause**: Using `/cart/add` for existing items
- **Fix**: Use `/cart/update/:cartItemId` endpoint instead

**Issue**: Authentication errors (401) on protected routes
- **Cause**: Supabase session expired or invalid
- **Fix**: Check `UserContext.isAuthenticated`, ensure user is logged in

**Issue**: Watch images not loading
- **Cause**: CDN domain not whitelisted in `next.config.js`
- **Fix**: Add domain to `images.domains` or `images.remotePatterns`

**Issue**: Slow initial page load
- **Cause**: Watch cache not initialized
- **Fix**: Ensure `WatchCacheProvider` is mounting and `needsWatchData` paths are correct

## Code Style & Conventions

### ESLint Rules
- Unused vars warnings disabled (`.eslintrc.json`)
- `any` types allowed (transitional codebase)
- React exhaustive-deps warnings disabled (use carefully)

### TypeScript Paths
- `@/*` alias maps to project root
- Use absolute imports: `import { Component } from '@/components/...'`

### File Naming
- Components: PascalCase (`Header.tsx`, `CartItem.tsx`)
- Utilities/Hooks: camelCase (`useAuth.ts`, `api-clients.ts`)
- Types: PascalCase interfaces in `types/` folder

## Key Files Reference

| File Path | Purpose |
|-----------|---------|
| `lib/api-clients.ts` | Axios instances with auth interceptors |
| `lib/api-services.ts` | All API service functions (watches, cart, orders) |
| `lib/query-keys.ts` | Centralized TanStack Query keys |
| `lib/supabase.ts` | Supabase client creation |
| `contexts/WatchCacheContext.tsx` | Global watch cache |
| `contexts/UserContext.tsx` | Auth state + user profile |
| `middleware.ts` | Supabase session validation |
| `app/providers.tsx` | QueryClient + context providers |
| `hooks/useCart.ts` | Cart operations hooks |

## Performance Optimization Notes

- **Watch Cache**: Single API call loads all watches (~90% faster subsequent loads)
- **Image Preloading**: Disabled for mobile performance
- **Compression**: Enabled in `next.config.js` (`compress: true`)
- **SWC Minification**: Enabled (`swcMinify: true`)
- **Static Asset Caching**: 1-year cache headers for images

## Important Gotchas

1. **Cart Quantity Updates**: Never use `/cart/add` for existing items - use `/cart/update/:id`
2. **Token Injection**: Only happens in `protectedApiClient` - unprotected client has no auth
3. **Cache Invalidation**: Always invalidate after mutations or stale data will persist
4. **Provider Order**: Changing provider hierarchy can break auth/cache dependencies
5. **Middleware Paths**: Update `middleware.ts` matcher if adding new protected routes
6. **Image Domains**: Add new CDN domains to `next.config.js` before using
7. **API Response Format**: Backend uses `{ success: boolean, data: T, message?: string }` wrapper

## Related Documentation

- `API_INTEGRATION_GUIDE.md` - Complete API reference with request/response examples
- `CACHE_OPTIMIZATION.md` - Detailed watch cache implementation and performance metrics
- `SEO_OPTIMIZATION_GUIDE.md` - SEO configuration and best practices

---

**Last Updated**: 2025-01-15  
**Framework**: Next.js 14.2.11 (App Router)  
**Primary Language**: TypeScript  
**Auth Provider**: Supabase  
**Payment Gateway**: Razorpay

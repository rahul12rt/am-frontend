/**
 * Centralized Query Key Factory
 * 
 * This file provides a centralized way to manage all TanStack Query keys
 * with a hierarchical structure for better cache invalidation and organization.
 * 
 * Usage Examples:
 * - queryKeys.watches.all() -> ['watches']
 * - queryKeys.watches.lists() -> ['watches', 'list']
 * - queryKeys.watches.list(filters) -> ['watches', 'list', { category: 'luxury' }]
 * - queryKeys.watches.details() -> ['watches', 'detail']
 * - queryKeys.watches.detail(id) -> ['watches', 'detail', '123']
 */

export const queryKeys = {
  // =================
  // WATCHES
  // =================
  watches: {
    all: () => ['watches'] as const,
    lists: () => [...queryKeys.watches.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.watches.lists(), ...(filters ? [filters] : [])] as const,
    details: () => [...queryKeys.watches.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.watches.details(), id] as const,
    featured: () => [...queryKeys.watches.all(), 'featured'] as const,
    byCategory: (category: string) => 
      [...queryKeys.watches.all(), 'category', category] as const,
    bySeries: (series: string) => 
      [...queryKeys.watches.all(), 'series', series] as const,
    byModelGroup: (modelGroup: string) => 
      [...queryKeys.watches.all(), 'model-group', modelGroup] as const,
    search: (query: string) => 
      [...queryKeys.watches.all(), 'search', query] as const,
  },

  // =================
  // AUTHENTICATION
  // =================
  auth: {
    all: () => ['auth'] as const,
    user: () => [...queryKeys.auth.all(), 'user'] as const,
    profile: () => [...queryKeys.auth.all(), 'profile'] as const,
    session: () => [...queryKeys.auth.all(), 'session'] as const,
  },

  // =================
  // CART
  // =================
  cart: {
    all: () => ['cart'] as const,
    items: () => [...queryKeys.cart.all(), 'items'] as const,
    count: () => [...queryKeys.cart.all(), 'count'] as const,
    total: () => [...queryKeys.cart.all(), 'total'] as const,
  },

  // =================
  // ORDERS
  // =================
  orders: {
    all: () => ['orders'] as const,
    lists: () => [...queryKeys.orders.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.orders.lists(), ...(filters ? [filters] : [])] as const,
    details: () => [...queryKeys.orders.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
    tracking: (orderId: string) => 
      [...queryKeys.orders.all(), 'tracking', orderId] as const,
  },

  // =================
  // ADDRESSES
  // =================
  addresses: {
    all: () => ['addresses'] as const,
    lists: () => [...queryKeys.addresses.all(), 'list'] as const,
    details: () => [...queryKeys.addresses.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.addresses.details(), id] as const,
  },

  // =================
  // PAYMENTS
  // =================
  payments: {
    all: () => ['payments'] as const,
    orders: () => [...queryKeys.payments.all(), 'orders'] as const,
    order: (orderId: string) => [...queryKeys.payments.orders(), orderId] as const,
    methods: () => [...queryKeys.payments.all(), 'methods'] as const,
  },

  // =================
  // USER PROFILE
  // =================
  user: {
    all: () => ['user'] as const,
    profile: () => [...queryKeys.user.all(), 'profile'] as const,
    preferences: () => [...queryKeys.user.all(), 'preferences'] as const,
    wishlist: () => [...queryKeys.user.all(), 'wishlist'] as const,
    notifications: () => [...queryKeys.user.all(), 'notifications'] as const,
  },

  // =================
  // CATEGORIES & SERIES
  // =================
  categories: {
    all: () => ['categories'] as const,
    lists: () => [...queryKeys.categories.all(), 'list'] as const,
  },

  series: {
    all: () => ['series'] as const,
    lists: () => [...queryKeys.series.all(), 'list'] as const,
    byCategory: (categoryId: string) => 
      [...queryKeys.series.all(), 'category', categoryId] as const,
  },

  // =================
  // REVIEWS
  // =================
  reviews: {
    all: () => ['reviews'] as const,
    byWatch: (watchId: string) => 
      [...queryKeys.reviews.all(), 'watch', watchId] as const,
    byUser: (userId: string) => 
      [...queryKeys.reviews.all(), 'user', userId] as const,
  },

  // =================
  // THEMES & MODEL GROUPS
  // =================
  themes: {
    all: () => ['themes'] as const,
    lists: () => [...queryKeys.themes.all(), 'list'] as const,
  },

  modelGroups: {
    all: () => ['model-groups'] as const,
    lists: () => [...queryKeys.modelGroups.all(), 'list'] as const,
  },
} as const;

/**
 * Type helper for extracting query key types
 */
export type QueryKey = ReturnType<typeof queryKeys[keyof typeof queryKeys][keyof typeof queryKeys[keyof typeof queryKeys]]>;

/**
 * Utility functions for query key management
 */
export const queryKeyUtils = {
  /**
   * Get all query keys that start with a specific prefix
   */
  getKeysWithPrefix: (prefix: string) => {
    return Object.values(queryKeys)
      .flatMap(category => Object.values(category))
      .filter(keyFn => {
        const key = typeof keyFn === 'function' ? keyFn() : keyFn;
        return Array.isArray(key) && key[0] === prefix;
      });
  },

  /**
   * Create a query key for dynamic endpoints
   */
  createDynamicKey: (base: readonly string[], ...params: (string | number | Record<string, any>)[]) => {
    return [...base, ...params] as const;
  },

  /**
   * Check if a query key matches a pattern
   */
  matchesPattern: (queryKey: readonly unknown[], pattern: readonly unknown[]) => {
    return pattern.every((part, index) => queryKey[index] === part);
  },
} as const;
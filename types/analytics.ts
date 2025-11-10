// TypeScript types for Google Analytics 4 tracking

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

export interface PurchaseEvent {
  transaction_id: string;
  value: number;
  currency: string;
  tax?: number;
  shipping?: number;
  items: AnalyticsItem[];
}

export interface EcommerceEvent {
  currency: string;
  value: number;
  items: AnalyticsItem[];
}

export interface CartEvent extends EcommerceEvent {}

export interface CheckoutEvent extends EcommerceEvent {}

export interface LoginEvent {
  method: string;
  user_id?: string;
}

export interface SignUpEvent {
  method: string;
  user_id?: string;
}

export interface SearchEvent {
  search_term: string;
  page_location?: string;
}

export interface FilterEvent {
  filter_type: string;
  filter_value: string;
  page_location: string;
}

export interface PromotionEvent {
  promotion_id: string;
  promotion_name: string;
  creative_name: string;
  creative_slot: string;
  location_id?: string;
}

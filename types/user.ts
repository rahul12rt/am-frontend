export interface Address {
    id: number;
    user_id: number;
    address_type: string;
    is_billing_address: boolean;
    is_shipping_address: boolean;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    country_code: string;
    is_default: boolean;
    is_verified: boolean;
    latitude: number;
    longitude: number;
    delivery_instructions: string;
    landmark: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface UserProfile {
    id: number;
    supabase_id: string;
    first_name: string;
    last_name: string;
    profile_image_url: string;
    phone_number: string;
    phone_country_code: string;
    phone_verified: boolean;
    email: string;
    email_verified: boolean;
    google_id: string;
    role: string;
    created_at: string;
    updated_at: string;
    addresses: Address[];
    cartCount: number;
    eligibleForDiscount: boolean;
  }
  

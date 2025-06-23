export interface Watch {
  external_id: string;
  name: string;
  description?: string;
  images?: string[]; // Assuming images is an array of URLs or base64 strings
  characteristics?: string;
  colors?: string[]; // Assuming colors is an array of color names or codes
  actual_price?: string;
  offer_price?: string;
  offer_percentage?: string;
  rating?: number;
  reviews_count?: number;
  category?: string;
  series?: string;
  model_group?: string;
  release_date?: string; // ISO date string
  theme?: string;
  warranty_period?: string;
  stock_availability?: boolean;
  dimensions?: { [key: string]: string | number }; // e.g., { width: 40, height: 10 }
  weight?: { [key: string]: string | number }; // e.g., { value: 120, unit: 'g' }
  is_featured?: boolean;
  tags?: string[];
  brand?: string;
  model?: string;
  price?: string;
}
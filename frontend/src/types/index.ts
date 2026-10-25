export type UserRole = 'customer' | 'restaurant_owner' | 'rider' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string;
  profile_photo: string;
  dietary_preferences?: string[];
  notification_preferences?: Record<string, boolean>;
  is_phone_verified: boolean;
  is_staff: boolean;
}

export interface CustomerAddress {
  id: number;
  label: 'home' | 'work' | 'other';
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
  delivery_instructions?: string;
}

export interface MenuItem {
  id: number;
  restaurant: number;
  category: number;
  name: string;
  description: string;
  image_url: string;
  price: number | string;
  is_veg: boolean;
  is_available: boolean;
  preparation_time_mins: number;
  spice_level: 'none' | 'mild' | 'medium' | 'spicy' | 'extra_spicy';
  portion_size: string;
  ingredients: string[];
  allergens: string[];
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  customization_options?: Array<{
    title: string;
    options: Array<{ name: string; price: number }>;
  }>;
  stock_quantity: number;
  is_bestseller: boolean;
}

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  items: MenuItem[];
}

export interface Review {
  id: number;
  customer_name?: string;
  customer_username?: string;
  rating: number;
  food_rating: number;
  delivery_rating: number;
  taste_score: number;
  quantity_score: number;
  packaging_score: number;
  value_score: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo_url: string;
  banner_url: string;
  cuisines: string[];
  city: string;
  area: string;
  address: string;
  phone: string;
  email?: string;
  fssai_license?: string;
  fssai_verified: boolean;
  rating: number;
  total_reviews: number;
  price_range: '$' | '$$' | '$$$';
  is_pure_veg: boolean;
  is_open: boolean;
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  avg_delivery_time_mins: number;
  delivery_fee_base: number | string;
  min_order_amount: number | string;
  commission_rate?: number | string;
  featured: boolean;
  categories?: MenuCategory[];
  reviews?: Review[];
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  selected_customizations?: Record<string, string>;
  special_instructions?: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer: number;
  customer_name?: string;
  customer_phone?: string;
  restaurant: number;
  restaurant_name?: string;
  restaurant_phone?: string;
  restaurant_address?: string;
  delivery_partner?: number;
  delivery_partner_name?: string;
  delivery_partner_phone?: string;
  status:
    | 'PLACED'
    | 'PAYMENT_PENDING'
    | 'CONFIRMED'
    | 'ACCEPTED'
    | 'PREPARING'
    | 'READY_FOR_PICKUP'
    | 'PICKED_UP'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUND_PENDING'
    | 'REFUNDED';
  items_subtotal: number | string;
  tax_amount: number | string;
  delivery_fee: number | string;
  platform_fee: number | string;
  discount_amount: number | string;
  coupon_code?: string;
  total_amount: number | string;
  payment_method: string;
  payment_status: string;
  delivery_address: Record<string, any>;
  delivery_instructions?: string;
  preparation_time_mins: number;
  estimated_delivery_time?: string;
  delay_reason?: string;
  cancellation_reason?: string;
  created_at: string;
  items?: Array<{
    id: number;
    item_name: string;
    quantity: number;
    price_per_unit: number | string;
    total_price: number | string;
    customizations?: Record<string, any>;
  }>;
}

export interface Coupon {
  id: number;
  code: string;
  title: string;
  description: string;
  discount_percent: number;
  discount_flat: number;
  min_order_amount: number;
  max_discount_amount: number;
  is_active: boolean;
}

export interface LastCallBite {
  id: number;
  restaurant: number;
  restaurant_name?: string;
  restaurant_area?: string;
  title: string;
  description: string;
  image_url: string;
  original_price: number | string;
  discounted_price: number | string;
  quantity_total: number;
  quantity_remaining: number;
  pickup_deadline: string;
  is_active: boolean;
}

export interface BitePointsData {
  balance: number;
  referral_code: string;
  milestones: Array<{ title: string; target: number; achieved: boolean }>;
  ledger: Array<{
    id: number;
    points: number;
    transaction_type: string;
    description: string;
    created_at: string;
  }>;
}

export interface SupportTicket {
  id: number;
  ticket_number: string;
  user_name?: string;
  category: string;
  subject: string;
  description: string;
  status: 'open' | 'in_investigation' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  resolution_notes?: string;
  created_at: string;
}

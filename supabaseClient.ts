import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Offer {
  id: string;
  title: string;
  description: string;
  price_text: string;
  valid_till: string;
  is_active: boolean;
  created_at: string;
  created_year: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  tagline: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface AppImage {
  id: string;
  section_key: string;
  image_data: string;
  updated_at: string;
}

export interface DatabaseReview {
  id: string;
  name: string;
  text: string;
  rating: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

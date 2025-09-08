import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
          health_conditions: string[] | null;
          dietary_restrictions: string[] | null;
          trigger_foods: string[] | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          health_conditions?: string[] | null;
          dietary_restrictions?: string[] | null;
          trigger_foods?: string[] | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          health_conditions?: string[] | null;
          dietary_restrictions?: string[] | null;
          trigger_foods?: string[] | null;
        };
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          dish_name: string;
          restaurant_name: string | null;
          meal_time: string;
          portion_size: string;
          customizations: string | null;
          notes: string | null;
          tags: string[] | null;
          location_lat: number | null;
          location_lng: number | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          dish_name: string;
          restaurant_name?: string | null;
          meal_time?: string;
          portion_size?: string;
          customizations?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          location_lat?: number | null;
          location_lng?: number | null;
        };
        Update: {
          dish_name?: string;
          restaurant_name?: string | null;
          meal_time?: string;
          portion_size?: string;
          customizations?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          location_lat?: number | null;
          location_lng?: number | null;
        };
      };
      symptoms: {
        Row: {
          id: string;
          user_id: string;
          meal_id: string | null;
          overall_feeling: string;
          symptoms: string[] | null;
          severity_scores: Record<string, number> | null;
          notes: string | null;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          meal_id?: string | null;
          overall_feeling: string;
          symptoms?: string[] | null;
          severity_scores?: Record<string, number> | null;
          notes?: string | null;
          recorded_at?: string;
        };
        Update: {
          overall_feeling?: string;
          symptoms?: string[] | null;
          severity_scores?: Record<string, number> | null;
          notes?: string | null;
        };
      };
    };
  };
};
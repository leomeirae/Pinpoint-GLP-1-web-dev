import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/lib/clerk';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter for Supabase using SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string;
          name?: string | null;
          updated_at?: string;
        };
      };
      medications: {
        Row: {
          id: string;
          user_id: string;
          type: 'mounjaro' | 'ozempic' | 'saxenda' | 'wegovy' | 'zepbound';
          dosage: number;
          frequency: 'weekly' | 'daily';
          start_date: string;
          end_date: string | null;
          active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'mounjaro' | 'ozempic' | 'saxenda' | 'wegovy' | 'zepbound';
          dosage: number;
          frequency: 'weekly' | 'daily';
          start_date: string;
          end_date?: string | null;
          active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: 'mounjaro' | 'ozempic' | 'saxenda' | 'wegovy' | 'zepbound';
          dosage?: number;
          frequency?: 'weekly' | 'daily';
          start_date?: string;
          end_date?: string | null;
          active?: boolean;
          notes?: string | null;
          updated_at?: string;
        };
      };
      weight_logs: {
        Row: {
          id: string;
          user_id: string;
          weight: number;
          unit: 'kg' | 'lbs';
          date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight: number;
          unit?: 'kg' | 'lbs';
          date: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          weight?: number;
          unit?: 'kg' | 'lbs';
          date?: string;
          notes?: string | null;
          updated_at?: string;
        };
      };
      side_effects: {
        Row: {
          id: string;
          user_id: string;
          medication_id: string | null;
          type: string;
          severity: 1 | 2 | 3 | 4 | 5;
          date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          medication_id?: string | null;
          type: string;
          severity: 1 | 2 | 3 | 4 | 5;
          date: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          medication_id?: string | null;
          type?: string;
          severity?: 1 | 2 | 3 | 4 | 5;
          date?: string;
          notes?: string | null;
          updated_at?: string;
        };
      };
      medication_applications: {
        Row: {
          id: string;
          user_id: string;
          medication_id: string;
          dosage: number;
          application_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          medication_id: string;
          dosage: number;
          application_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          dosage?: number;
          application_date?: string;
          notes?: string | null;
        };
      };
    };
  };
}

// Hook to sync Supabase auth with Clerk
export function useSupabaseAuth() {
  const { getToken, userId } = useAuth();

  const setSupabaseAuth = async () => {
    if (!userId) {
      console.log('No user ID found');
      return;
    }

    try {
      // Get Clerk JWT token with Supabase template
      const token = await getToken({ template: 'supabase' });
      
      if (token) {
        console.log('Setting Supabase auth with Clerk token');
        
        // Set the auth session in Supabase
        const { error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token,
        });

        if (error) {
          console.error('Error setting Supabase session:', error);
        } else {
          console.log('Supabase session set successfully');
        }
      }
    } catch (error) {
      console.error('Error getting Clerk token:', error);
    }
  };

  return { setSupabaseAuth };
}

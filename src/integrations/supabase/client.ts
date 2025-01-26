import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oolikhpmpzqoptnnzctx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbGlraHBtcHpxb3B0bm56Y3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0NzE0NjksImV4cCI6MjA1MzA0NzQ2OX0.LFl1gHiWeTGEfM3vqkszi_7pUCChfGh5FQyC9MOCRYQ";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      storage: {
        getItem: (key) => {
          try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            return JSON.parse(item);
          } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch (error) {
            console.error('Error writing to localStorage:', error);
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing from localStorage:', error);
          }
        }
      }
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  }
);
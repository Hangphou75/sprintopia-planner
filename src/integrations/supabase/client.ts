
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oolikhpmpzqoptnnzctx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbGlraHBtcHpxb3B0bm56Y3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0NzE0NjksImV4cCI6MjA1MzA0NzQ2OX0.LFl1gHiWeTGEfM3vqkszi_7pUCChfGh5FQyC9MOCRYQ";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      storageKey: 'supabase.auth.token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
    realtime: {
      timeout: 60000, // Augmenter le délai d'attente pour réduire les reconnexions fréquentes
    }
  }
);

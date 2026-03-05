import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://vajnpycsaokmmxklfumv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZham5weWNzYW9rbW14a2xmdW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTUxMzksImV4cCI6MjA4ODI5MTEzOX0.i4xBsnK3G2WGshx2yis2Wotx7yVUhY1toUrQGIAnt_Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

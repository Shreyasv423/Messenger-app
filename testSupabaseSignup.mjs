import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://vajnpycsaokmmxklfumv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZham5weWNzYW9rbW14a2xmdW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTUxMzksImV4cCI6MjA4ODI5MTEzOX0.i4xBsnK3G2WGshx2yis2Wotx7yVUhY1toUrQGIAnt_Y';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.auth.signUp({
      email: 'testlogin@example.com',
      password: 'password123',
  });
  console.log("Data:", data, "Error:", error);
}
await test();

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vajnpycsaokmmxklfumv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZham5weWNzYW9rbW14a2xmdW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTUxMzksImV4cCI6MjA4ODI5MTEzOX0.i4xBsnK3G2WGshx2yis2Wotx7yVUhY1toUrQGIAnt_Y');
// this confirms emails
supabase.auth.admin.updateUserById(
    '9669e4f0-cb13-4be2-a094-e2f1e8132dcc',
    { email_confirm: true }
  ).then(console.log).catch(console.error);

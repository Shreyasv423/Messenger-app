const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vajnpycsaokmmxklfumv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZham5weWNzYW9rbW14a2xmdW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTUxMzksImV4cCI6MjA4ODI5MTEzOX0.i4xBsnK3G2WGshx2yis2Wotx7yVUhY1toUrQGIAnt_Y');

async function check() {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    console.log('Auth Users:', authUsers?.users?.length || 0);
    
    const { data: publicUsers, error: publicError } = await supabase.from('users').select('*');
    console.log('Public Users:', publicUsers?.length || 0);
    if (publicUsers) console.log('Usernames:', publicUsers.map(u => u.username));
}
check();

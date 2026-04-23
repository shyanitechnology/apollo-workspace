window.SUPABASE_URL = 'https://lgdscvrbzuibxyqdpwya.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZHNjdnJienVpYnh5cWRwd3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTc3MTIsImV4cCI6MjA5MjQ5MzcxMn0.2NQvhITJRRe5_13HwicciHYmZv5PPXPIgz92gfDPfDA';
window.supaClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage }
});

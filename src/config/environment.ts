export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://pbfgnkoeuygcdybuefkp.supabase.co/functions/v1/make-server-4e8803b0',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://pbfgnkoeuygcdybuefkp.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZmdua29ldXlnY2R5YnVlZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzgxNzYsImV4cCI6MjA3NDU1NDE3Nn0.odfalR1k5UCb6Qjek9hK34OtqYyjMPSsHDdBZMi6JZQ',
  USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true',
  DEFAULT_USER_ID: import.meta.env.VITE_DEFAULT_USER_ID || 'default'
};

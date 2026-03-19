/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_USE_MOCK_API: string
  readonly VITE_ENABLE_DEBUG_LOGGING: string
  readonly VITE_DEFAULT_USER_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

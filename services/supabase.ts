import { createClient } from '@supabase/supabase-js';

// Estes valores virão das variáveis de ambiente (arquivo .env)
// Usamos fallback para evitar crash na inicialização caso as variáveis não estejam definidas
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://setup-your-env-vars.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'setup-your-env-vars';

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("⚠️ Supabase Credentials missing! Check your .env file. Authentication will not work.");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Solo la clave publicable. Se configura por variable de entorno (EAS o .env local), nunca en el código.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const clave = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const hayBase = Boolean(url && clave);

export const supabase = hayBase
  ? createClient(url, clave, {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    })
  : null;

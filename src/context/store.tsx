/**
 * Punto de entrada del store. Elige automáticamente el proveedor según la
 * configuración de entorno:
 *  - Con VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY → SupabaseStoreProvider (nube).
 *  - Sin credenciales → StoreProvider (localStorage, modo demo/offline).
 */
import React from 'react';
import { isSupabaseEnabled } from '../lib/supabase';
import { StoreProvider as LocalStoreProvider, useStore as useLocalStore } from './StoreContext';
import { SupabaseStoreProvider, useSupabaseStore } from './SupabaseStoreContext';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isSupabaseEnabled) return <SupabaseStoreProvider>{children}</SupabaseStoreProvider>;
  return <LocalStoreProvider>{children}</LocalStoreProvider>;
};

type AnyStore = ReturnType<typeof useLocalStore> & Partial<NonNullable<ReturnType<typeof useSupabaseStore>>>;

/** Hook único: funciona en ambos modos de persistencia. */
export const useStore = (): AnyStore => {
  const ctx = useSupabaseStore();
  if (ctx) return ctx as AnyStore;
  return useLocalStore() as unknown as AnyStore;
};

/** Datos de autenticación (solo disponibles en modo Supabase). */
export const useAuthExtras = () => {
  const ctx = useSupabaseStore();
  return {
    enabled: isSupabaseEnabled && Boolean(ctx),
    session: ctx?.session ?? null,
    authUser: ctx?.authUser ?? null,
    loading: ctx?.loading ?? false,
    signIn: ctx?.signIn ?? (async () => 'Modo local activo'),
    signUp: ctx?.signUp ?? (async () => 'Modo local activo'),
    signOut: ctx?.signOut ?? (async () => {}),
  };
};

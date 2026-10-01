# Mitra POS Arequipa 🛍️

SaaS **multi-tienda** para pequeños comerciantes de Arequipa (Perú): inventario, punto de venta (POS), catálogo digital con pedidos por WhatsApp (pago contraentrega: Yape/Plin/efectivo) y reportes diarios/semanales/mensuales.

- 🔗 Demo en GitHub Pages: https://makromediad.github.io/SaaS_Comercio_AQP/
- 🧱 Stack: React 19 + TypeScript + Vite + Tailwind CSS v4 + Supabase (Postgres + Auth + Realtime + Edge Functions)

## Modos de funcionamiento

| Modo | Condición | Persistencia |
|---|---|---|
| **Demo/Local** | Sin credenciales de Supabase | `localStorage` del navegador |
| **Nube (SaaS real)** | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` definidos | Postgres con RLS por tenant + login email/password |

En modo nube cada comerciante se registra, crea su tienda y sus datos quedan aislados por **Row Level Security**. Los clientes ven el catálogo público vía enlace `?tienda=<slug>` y los pedidos entran por la Edge Function `create-order` (sin exponer la clave service-role). El panel recibe pedidos en tiempo real (Realtime).

## Desarrollo local

```bash
npm install --legacy-peer-deps
cp .env.example .env.local   # opcional: activa el modo Supabase
npm run dev                  # http://localhost:3000
npm run lint                 # tsc --noEmit
npm run build                # genera dist/ con base /SaaS_Comercio_AQP/
```

## Despliegue en GitHub Pages (automático)

El workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) construye con Vite y publica `dist/` en cada push a `main`.

1. En el repo: **Settings → Pages → Source: GitHub Actions**.
2. (Opcional, para modo nube) **Settings → Secrets and variables → Actions** y crea:
   - `VITE_SUPABASE_URL` → URL del proyecto Supabase
   - `VITE_SUPABASE_ANON_KEY` → clave anónima (public-safe)
3. Push a `main` → Actions despliega en ~1 min.

> La subruta de build está fijada en `vite.config.ts` (`REPO = 'SaaS_Comercio_AQP'`). Si cambias el nombre del repo o usas dominio propio, ajusta `base`/`homepage`.

## Conectar Supabase (una sola vez)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor** ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql) (tablas + políticas RLS + triggers de numeración de comprobantes/pedidos).
3. Activa **Authentication → Email/Password**.
4. Despliega la Edge Function que inserta pedidos públicos sin clave privilegiada:
   ```bash
   npm i -g supabase
   supabase functions deploy create-order   # usa supabase/functions/create-order/index.ts
   ```
   (o pégala en la pestaña *Edge Functions* de la dashboard).
5. Copia `URL` y `anon key` a `.env.local` (dev) o a los secrets del repo (producción).

## Estructura

```
src/
  context/store.tsx        # selector de proveedor (Supabase o localStorage)
  context/StoreContext.tsx         # modo demo (localStorage)
  context/SupabaseStoreContext.tsx # modo nube (auth + CRUD + realtime)
  lib/supabase.ts          # cliente + mapeo snake_case ↔ camelCase
  lib/utils.ts             # uid(), soles, resolución de imágenes
  components/…             # Dashboard, POS, Inventario, Reportes, Pedidos, Catálogo, Ajustes…
supabase/
  schema.sql               # DDL + RLS multi-tenant
  functions/create-order/  # Edge Function (Deno) para pedidos anónimos
```

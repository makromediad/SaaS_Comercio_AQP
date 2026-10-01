/**
 * Utilidades compartidas: IDs únicos, formateo de moneda (soles), imágenes.
 */

/** ID único sin colisiones (uuid v4 si está disponible). */
export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback para contextos sin crypto.randomUUID
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const solFormat = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formatea un monto en soles peruanos: S/. 12.50 */
export function formatSoles(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `S/. ${solFormat.format(safe)}`;
}

/** Redondea a 2 decimales para evitar errores de punto flotante en sumatorios. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// ---------------- Imágenes del proyecto ----------------
// Las rutas "/src/assets/..." solo funcionan en dev; tras el build no existen
// en dist/. Este mapa las resuelve importándolas como módulos de Vite.

import heroMarket from '../assets/images/hero_arequipa_market_1790861630483.jpg';
import bodegaShowcase from '../assets/images/store_bodega_showcase_1790861644926.jpg';
import chocolates from '../assets/images/artisan_product_chocolates_1790861657657.jpg';
import quesoHelado from '../assets/images/artisan_queso_helado_1790861669062.jpg';

const IMAGE_MAP: Record<string, string> = {
  '/src/assets/images/hero_arequipa_market_1790861630483.jpg': heroMarket,
  '/src/assets/images/store_bodega_showcase_1790861644926.jpg': bodegaShowcase,
  '/src/assets/images/artisan_product_chocolates_1790861657657.jpg': chocolates,
  '/src/assets/images/artisan_queso_helado_1790861669062.jpg': quesoHelado,
};

/** Resuelve una imageUrl: convierte rutas de fuente en URLs compiladas por Vite. */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  return IMAGE_MAP[url] ?? url;
}

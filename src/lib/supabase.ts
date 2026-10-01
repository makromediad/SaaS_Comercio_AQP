/**
 * Cliente Supabase — capa de backend para Mitra POS Arequipa.
 *
 * El proyecto funciona en DOS modos:
 *  - LOCAL: sin credenciales → persistencia en localStorage (demo/offline).
 *  - SUPABASE: VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY definidos → datos
 *    multi-tenant reales en Postgres con RLS y autenticación por email/password.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url!, anonKey!)
  : null;

// ------------------------------------------------------------------
// Filas de la base de datos (snake_case) ↔ tipos de la app (camelCase)
// ------------------------------------------------------------------

export interface TenantRow {
  id: string; owner_id?: string; name: string; slug: string; tagline: string;
  district: string; address: string; whatsapp_number: string; yape_phone?: string | null;
  plin_phone?: string | null; owner_name: string; banner_image?: string | null;
  currency: string; default_delivery_fee: number; free_delivery_threshold: number;
  delivery_coverage: string[]; active: boolean; created_at: string;
}

export interface ProductRow {
  id: string; tenant_id: string; name: string; sku: string; barcode?: string | null;
  category: string; description: string; cost_price: number; sale_price: number;
  stock: number; min_stock_alert: number; unit: string; image_url: string;
  is_active: boolean; featured_in_catalog: boolean; created_at?: string;
}

export interface SaleRow {
  id: string; tenant_id: string; receipt_number: string; items: unknown[];
  subtotal: number; discount: number; total: number; cost_total: number;
  profit: number; payment_method: string; amount_paid: number; change_due: number;
  customer_name: string; customer_dni: string; source: string; notes?: string | null;
  date: string;
}

export interface OrderRow {
  id: string; tenant_id: string; order_number: string; customer_name: string;
  customer_phone: string; district: string; address: string; reference: string;
  items: unknown[]; subtotal: number; delivery_fee: number; total: number;
  payment_method: string; status: string; notes?: string | null;
  created_at: string; completed_at?: string | null;
}

// ----------------------- Mappers -----------------------

import type { Tenant, Product, Sale, WhatsAppOrder } from '../types';

export const tenantFromRow = (r: TenantRow): Tenant => ({
  id: r.id, name: r.name, slug: r.slug, tagline: r.tagline,
  district: r.district as Tenant['district'], address: r.address,
  whatsappNumber: r.whatsapp_number, yapePhone: r.yape_phone ?? undefined,
  plinPhone: r.plin_phone ?? undefined, ownerName: r.owner_name,
  bannerImage: r.banner_image ?? undefined, currency: r.currency,
  defaultDeliveryFee: Number(r.default_delivery_fee),
  freeDeliveryThreshold: Number(r.free_delivery_threshold),
  deliveryCoverage: r.delivery_coverage ?? [], active: r.active,
  createdAt: r.created_at,
});

export const tenantToRow = (t: Tenant, ownerId: string): Partial<TenantRow> => ({
  id: t.id, owner_id: ownerId, name: t.name, slug: t.slug, tagline: t.tagline,
  district: t.district, address: t.address, whatsapp_number: t.whatsappNumber,
  yape_phone: t.yapePhone ?? null, plin_phone: t.plinPhone ?? null,
  owner_name: t.ownerName, banner_image: t.bannerImage ?? null,
  currency: t.currency, default_delivery_fee: t.defaultDeliveryFee,
  free_delivery_threshold: t.freeDeliveryThreshold,
  delivery_coverage: t.deliveryCoverage, active: t.active, created_at: t.createdAt,
});

export const productFromRow = (r: ProductRow): Product => ({
  id: r.id, tenantId: r.tenant_id, name: r.name, sku: r.sku,
  barcode: r.barcode ?? undefined, category: r.category, description: r.description,
  costPrice: Number(r.cost_price), salePrice: Number(r.sale_price),
  stock: Number(r.stock), minStockAlert: Number(r.min_stock_alert),
  unit: r.unit as Product['unit'], imageUrl: r.image_url,
  isActive: r.is_active, featuredInCatalog: r.featured_in_catalog,
});

export const productToRow = (p: Product): Partial<ProductRow> => ({
  id: p.id, tenant_id: p.tenantId, name: p.name, sku: p.sku,
  barcode: p.barcode ?? null, category: p.category, description: p.description,
  cost_price: p.costPrice, sale_price: p.salePrice, stock: p.stock,
  min_stock_alert: p.minStockAlert, unit: p.unit, image_url: p.imageUrl,
  is_active: p.isActive, featured_in_catalog: p.featuredInCatalog,
});

export const saleFromRow = (r: SaleRow): Sale => ({
  id: r.id, tenantId: r.tenant_id, receiptNumber: r.receipt_number,
  items: r.items as Sale['items'], subtotal: Number(r.subtotal),
  discount: Number(r.discount), total: Number(r.total),
  costTotal: Number(r.cost_total), profit: Number(r.profit),
  paymentMethod: r.payment_method as Sale['paymentMethod'],
  amountPaid: Number(r.amount_paid), changeDue: Number(r.change_due),
  customerName: r.customer_name, customerDni: r.customer_dni,
  source: r.source as Sale['source'], notes: r.notes ?? undefined, date: r.date,
});

export const saleToRow = (s: Sale): Partial<SaleRow> => ({
  id: s.id, tenant_id: s.tenantId, receipt_number: s.receiptNumber,
  items: s.items, subtotal: s.subtotal, discount: s.discount, total: s.total,
  cost_total: s.costTotal, profit: s.profit, payment_method: s.paymentMethod,
  amount_paid: s.amountPaid, change_due: s.changeDue,
  customer_name: s.customerName, customer_dni: s.customerDni,
  source: s.source, notes: s.notes ?? null, date: s.date,
});

export const orderFromRow = (r: OrderRow): WhatsAppOrder => ({
  id: r.id, tenantId: r.tenant_id, orderNumber: r.order_number,
  customerName: r.customer_name, customerPhone: r.customer_phone,
  district: r.district as WhatsAppOrder['district'], address: r.address,
  reference: r.reference, items: r.items as WhatsAppOrder['items'],
  subtotal: Number(r.subtotal), deliveryFee: Number(r.delivery_fee),
  total: Number(r.total), paymentMethod: r.payment_method as WhatsAppOrder['paymentMethod'],
  notes: r.notes ?? undefined, status: r.status as WhatsAppOrder['status'],
  createdAt: r.created_at, completedAt: r.completed_at ?? undefined,
});

export const orderToRow = (o: WhatsAppOrder): Partial<OrderRow> => ({
  id: o.id, tenant_id: o.tenantId, order_number: o.orderNumber,
  customer_name: o.customerName, customer_phone: o.customerPhone,
  district: o.district, address: o.address, reference: o.reference,
  items: o.items, subtotal: o.subtotal, delivery_fee: o.deliveryFee,
  total: o.total, payment_method: o.paymentMethod, status: o.status,
  notes: o.notes ?? null, created_at: o.createdAt, completed_at: o.completedAt ?? null,
});

// ----------------------- API de datos -----------------------

async function must(client: SupabaseClient | null): Promise<SupabaseClient> {
  if (!client) throw new Error('Supabase no está configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  return client;
}

export const db = {
  async listTenantsByOwner(ownerId: string): Promise<Tenant[]> {
    const sb = await must(supabase);
    const { data, error } = await sb.from('tenants').select('*').eq('owner_id', ownerId).order('created_at');
    if (error) throw error;
    return (data as TenantRow[]).map(tenantFromRow);
  },

  async findTenantBySlug(slug: string): Promise<Tenant | null> {
    const sb = await must(supabase);
    const { data, error } = await sb.from('tenants').select('*').eq('slug', slug).eq('active', true).maybeSingle();
    if (error) throw error;
    return data ? tenantFromRow(data as TenantRow) : null;
  },

  async upsertTenant(t: Tenant, ownerId: string): Promise<void> {
    const sb = await must(supabase);
    const { error } = await sb.from('tenants').upsert(tenantToRow(t, ownerId));
    if (error) throw error;
  },

  async updateTenant(t: Tenant): Promise<void> {
    const sb = await must(supabase);
    const row = tenantToRow(t, '');
    delete (row as Record<string, unknown>).owner_id;
    const { error } = await sb.from('tenants').update(row).eq('id', t.id);
    if (error) throw error;
  },

  async listProducts(tenantIds: string[]): Promise<Product[]> {
    const sb = await must(supabase);
    if (tenantIds.length === 0) return [];
    const { data, error } = await sb.from('products').select('*').in('tenant_id', tenantIds);
    if (error) throw error;
    return (data as ProductRow[]).map(productFromRow);
  },

  async upsertProduct(p: Product): Promise<void> {
    const sb = await must(supabase);
    const { error } = await sb.from('products').upsert(productToRow(p));
    if (error) throw error;
  },

  async deleteProduct(id: string): Promise<void> {
    const sb = await must(supabase);
    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  async setProductStock(id: string, stock: number): Promise<void> {
    const sb = await must(supabase);
    const { error } = await sb.from('products').update({ stock: Math.max(0, stock) }).eq('id', id);
    if (error) throw error;
  },

  async listSales(tenantIds: string[]): Promise<Sale[]> {
    const sb = await must(supabase);
    if (tenantIds.length === 0) return [];
    const { data, error } = await sb.from('sales').select('*').in('tenant_id', tenantIds).order('date', { ascending: false });
    if (error) throw error;
    return (data as SaleRow[]).map(saleFromRow);
  },

  /** Registra venta con número de comprobante atómico (RPC record_sale) y descuento de stock vía trigger. */
  async recordSale(sale: Sale): Promise<Sale> {
    const sb = await must(supabase);
    const payload = { p_sale: { ...saleToRow(sale), id: null, receipt_number: '' } };
    const { data, error } = await sb.rpc('record_sale', payload);
    if (error) throw error;
    return saleFromRow(data as SaleRow);
  },

  async listOrders(tenantIds: string[]): Promise<WhatsAppOrder[]> {
    const sb = await must(supabase);
    if (tenantIds.length === 0) return [];
    const { data, error } = await sb.from('orders').select('*').in('tenant_id', tenantIds).order('created_at', { ascending: false });
    if (error) throw error;
    return (data as OrderRow[]).map(orderFromRow);
  },

  async upsertOrder(o: WhatsAppOrder): Promise<void> {
    const sb = await must(supabase);
    const { error } = await sb.from('orders').upsert(orderToRow(o));
    if (error) throw error;
  },

  /** Pedido creado por un cliente anónimo desde el catálogo público (Edge Function). */
  async createPublicOrder(body: Record<string, unknown>): Promise<{ id: string; orderNumber: string; total: number }> {
    const sb = await must(supabase);
    const { data, error } = await sb.functions.invoke('create-order', { body });
    if (error) throw error;
    const res = data as { ok?: boolean; order?: { id: string; orderNumber: string; total: number }; error?: string };
    if (!res?.ok || !res.order) throw new Error(res?.error || 'No se pudo registrar el pedido');
    return res.order;
  },
};

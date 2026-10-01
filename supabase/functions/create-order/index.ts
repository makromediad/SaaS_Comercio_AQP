// Edge Function: create-order
// Permite que un CLIENTE ANÓNIMO (visto desde el catálogo público) registre un
// pedido WhatsApp sin exponer la tabla `orders` mediante RLS.
// Validaciones: tenant activo, items existentes del tenant, stock disponible,
// números de pedido únicos generados en el servidor.
// Desplegar con: supabase functions deploy create-order --no-verify-jwt

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface OrderItem { productId: string; quantity: number }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json();
    const tenantId: string = body.tenantId;
    const items: OrderItem[] = body.items ?? [];
    const customerName: string = (body.customerName || '').trim();
    const customerPhone: string = (body.customerPhone || '').trim();
    const district: string = (body.district || '').trim();
    const address: string = (body.address || '').trim();
    const reference: string = (body.reference || '').trim();
    const paymentMethod: string = body.paymentMethod || 'efectivo_contraentrega';
    const deliveryFee: number = Number(body.deliveryFee) || 0;
    const notes: string = (body.notes || '').trim();

    // --- Validaciones básicas ---
    if (!tenantId || !customerName || !customerPhone || !district || items.length === 0) {
      return json({ error: 'Datos incompletos' }, 400);
    }

    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants').select('*').eq('id', tenantId).eq('active', true).single();
    if (tenantErr || !tenant) return json({ error: 'Tienda no encontrada o inactiva' }, 404);

    // --- Revalidar productos y stock en servidor ---
    const ids = items.map((i) => i.productId);
    const { data: products, error: prodErr } = await supabase
      .from('products').select('*').in('id', ids).eq('tenant_id', tenantId).eq('is_active', true);
    if (prodErr || !products) return json({ error: 'Error consultando productos' }, 500);

    const enriched: Record<string, unknown>[] = [];
    let subtotal = 0;
    for (const it of items) {
      const p = products.find((x) => x.id === it.productId);
      const qty = Number(it.quantity);
      if (!p || !Number.isFinite(qty) || qty <= 0) {
        return json({ error: `Producto no disponible: ${it.productId}` }, 400);
      }
      if (Number(p.stock) < qty) {
        return json({ error: `Stock insuficiente para "${p.name}" (disponible: ${p.stock})` }, 409);
      }
      const lineTotal = Number(p.sale_price) * qty;
      subtotal += lineTotal;
      enriched.push({
        productId: p.id,
        productName: p.name,
        quantity: qty,
        unitPrice: Number(p.sale_price),
        subtotal: lineTotal,
      });
    }

    const total = Math.max(0, subtotal + deliveryFee);

    // --- Número de pedido único en servidor ---
    const { data: seqRow } = await supabase
      .from('orders').select('order_number').eq('tenant_id', tenantId)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    const lastNum = seqRow ? parseInt(seqRow.order_number.replace(/\D/g, ''), 10) || 0 : 1000;
    const orderNumber = `ORD-${lastNum + 1}`;

    const { data: order, error: insertErr } = await supabase.from('orders').insert({
      tenant_id: tenantId,
      order_number: orderNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      district,
      address,
      reference,
      items: enriched,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      payment_method: paymentMethod,
      status: 'pendiente',
      notes,
    }).select().single();

    if (insertErr) return json({ error: insertErr.message }, 500);

    return json({ ok: true, order: { id: order.id, orderNumber, total } }, 200);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

function json(payload: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

-- ============================================================
-- Mitra POS Arequipa — Esquema Supabase (Postgres + RLS)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Tablas ----------

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  slug text not null unique,
  tagline text not null default '',
  district text not null default 'Cercado de Arequipa',
  address text not null default '',
  whatsapp_number text not null default '',
  yape_phone text,
  plin_phone text,
  owner_name text not null default '',
  banner_image text,
  currency text not null default 'S/.',
  default_delivery_fee numeric(10,2) not null default 5,
  free_delivery_threshold numeric(10,2) not null default 40,
  delivery_coverage text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  sku text not null default '',
  barcode text,
  category text not null default 'General',
  description text not null default '',
  cost_price numeric(10,2) not null default 0 check (cost_price >= 0),
  sale_price numeric(10,2) not null default 0 check (sale_price >= 0),
  stock numeric(10,3) not null default 0 check (stock >= 0),
  min_stock_alert numeric(10,3) not null default 5,
  unit text not null default 'unid',
  image_url text not null default '',
  is_active boolean not null default true,
  featured_in_catalog boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_tenant_idx on public.products (tenant_id);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  receipt_number text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  cost_total numeric(10,2) not null default 0,
  profit numeric(10,2) not null default 0,
  payment_method text not null default 'efectivo_contraentrega',
  amount_paid numeric(10,2) not null default 0,
  change_due numeric(10,2) not null default 0,
  customer_name text not null default 'Cliente Final',
  customer_dni text not null default '',
  source text not null default 'pos',
  notes text,
  date timestamptz not null default now()
);

create index if not exists sales_tenant_date_idx on public.sales (tenant_id, date desc);

create sequence if not exists public.sale_counter_seq;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  order_number text not null,
  customer_name text not null,
  customer_phone text not null,
  district text not null,
  address text not null default '',
  reference text not null default '',
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_method text not null default 'efectivo_contraentrega',
  status text not null default 'pendiente',
  notes text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists orders_tenant_created_idx on public.orders (tenant_id, created_at desc);

-- ---------- RPC: registrar venta con número de comprobante atómico ----------
-- Corre el contador dentro de una transacción: sin números duplicados.

create or replace function public.record_sale(p_sale public.sales)
returns public.sales
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num bigint;
  v_result public.sales;
begin
  -- Solo dueños del tenant pueden registrar ventas
  if not exists (select 1 from public.tenants t where t.id = p_sale.tenant_id and t.owner_id = auth.uid()) then
    raise exception 'No autorizado';
  end if;

  select nextval('public.sale_counter_seq') into v_num;
  p_sale.receipt_number := 'B001-' || lpad(v_num::text, 6, '0');

  insert into public.sales (
    id, tenant_id, receipt_number, items, subtotal, discount, total,
    cost_total, profit, payment_method, amount_paid, change_due,
    customer_name, customer_dni, source, notes, date
  ) values (
    coalesce(p_sale.id, gen_random_uuid()), p_sale.tenant_id, p_sale.receipt_number,
    coalesce(p_sale.items, '[]'::jsonb), p_sale.subtotal, p_sale.discount, p_sale.total,
    p_sale.cost_total, p_sale.profit, p_sale.payment_method, p_sale.amount_paid,
    p_sale.change_due, p_sale.customer_name, p_sale.customer_dni,
    coalesce(p_sale.source, 'pos'), p_sale.notes, coalesce(p_sale.date, now())
  ) returning * into v_result;

  return v_result;
end;
$$;

-- Descontar stock de forma atómica al registrar la venta (evita inventario negativo)
create or replace function public.deduct_stock_for_sale()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(new.items) loop
    update public.products
       set stock = greatest(0, stock - (item->>'quantity')::numeric)
     where id = (item->>'productId')::uuid
       and tenant_id = new.tenant_id;
  end loop;
  return new;
end;
$$;

drop trigger if exists trg_deduct_stock on public.sales;
create trigger trg_deduct_stock
  after insert on public.sales
  for each row execute function public.deduct_stock_for_sale();

-- ---------- Row Level Security ----------

alter table public.tenants enable row level security;
alter table public.products enable row level security;
alter table public.sales  enable row level security;
alter table public.orders enable row level security;

-- Helper: ids de los tenants del usuario autenticado
create or replace function public.auth_tenant_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.tenants where owner_id = (select auth.uid());
$$;

-- Tenants: el dueño gestiona sus tiendas; cualquiera puede leer una tienda activa
-- (necesario para que los clientes accedan al catálogo público por ?tienda=slug)
drop policy if exists "tenants_select_public" on public.tenants;
create policy "tenants_select_public" on public.tenants
  for select using (active = true or owner_id = (select auth.uid()));

drop policy if exists "tenants_insert_own" on public.tenants;
create policy "tenants_insert_own" on public.tenants
  for insert with check (owner_id = (select auth.uid()));

drop policy if exists "tenants_update_own" on public.tenants;
create policy "tenants_update_own" on public.tenants
  for update using (owner_id = (select auth.uid()));

drop policy if exists "tenants_delete_own" on public.tenants;
create policy "tenants_delete_own" on public.tenants
  for delete using (owner_id = (select auth.uid()));

-- Productos: lectura pública solo para catálogo (activos); escritura solo del dueño
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public" on public.products
  for select using (is_active = true or tenant_id in (select public.auth_tenant_ids()));

drop policy if exists "products_write_owner" on public.products;
create policy "products_write_owner" on public.products
  for all using (tenant_id in (select public.auth_tenant_ids()))
  with check (tenant_id in (select public.auth_tenant_ids()));

-- Ventas y pedidos: solo el dueño.
drop policy if exists "sales_owner_all" on public.sales;
create policy "sales_owner_all" on public.sales
  for all using (tenant_id in (select public.auth_tenant_ids()))
  with check (tenant_id in (select public.auth_tenant_ids()));

drop policy if exists "orders_owner_all" on public.orders;
create policy "orders_owner_all" on public.orders
  for all using (tenant_id in (select public.auth_tenant_ids()))
  with check (tenant_id in (select public.auth_tenant_ids()));

grant usage, select on sequence public.sale_counter_seq to authenticated, anon, service_role;
revoke all on function public.record_sale(public.sales) from anon;
grant execute on function public.record_sale(public.sales) to authenticated;

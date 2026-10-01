/**
 * StoreProvider — modo SUPABASE (backend real, multi-tenant con RLS y auth).
 * Misma interfaz pública que el provider local, por lo que los componentes
 * no necesitan conocer el modo de persistencia.
 */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, db, isSupabaseEnabled } from '../lib/supabase';
import { uid } from '../lib/utils';
import type {
  Tenant, Product, Sale, WhatsAppOrder, CartItem, OrderStatus, PaymentMethod,
} from '../types';

interface StoreContextType {
  tenants: Tenant[];
  currentTenant: Tenant;
  switchTenant: (tenantId: string) => void;
  createTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>) => void;
  updateTenant: (tenant: Tenant) => void;

  products: Product[];
  allProducts: Product[];
  addProduct: (product: Omit<Product, 'id' | 'tenantId'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  adjustStock: (productId: string, delta: number) => void;

  sales: Sale[];
  recordSale: (saleData: {
    items: { product: Product; quantity: number }[];
    paymentMethod: PaymentMethod;
    discount?: number;
    amountPaid?: number;
    customerName?: string;
    customerDni?: string;
    source?: 'pos' | 'catalogo_whatsapp';
    notes?: string;
  }) => Sale;

  orders: WhatsAppOrder[];
  createWhatsAppOrder: (orderData: Omit<WhatsAppOrder, 'id' | 'tenantId' | 'orderNumber' | 'createdAt' | 'status'>) => WhatsAppOrder;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemsCount: number;

  viewMode: 'admin' | 'catalog';
  setViewMode: (mode: 'admin' | 'catalog') => void;
  adminTab: 'dashboard' | 'pos' | 'inventory' | 'reports' | 'orders' | 'settings';
  setAdminTab: (tab: 'dashboard' | 'pos' | 'inventory' | 'reports' | 'orders' | 'settings') => void;
  isCustomerDirectAccess: boolean;
  setIsCustomerDirectAccess: (isCustomer: boolean) => void;
  getTenantCatalogUrl: (tenantSlug?: string) => string;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;

  lastSale: Sale | null;
  setLastSale: (sale: Sale | null) => void;

  notification: { message: string; type: 'success' | 'info' | 'warning' } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'warning') => void;

  // Auth (solo en modo Supabase)
  session: Session | null;
  authUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, fullName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const EMPTY_TENANT: Tenant = {
  id: 'pending', name: 'Cargando…', slug: 'pending', tagline: '', district: 'Cercado de Arequipa',
  address: '', whatsappNumber: '', ownerName: '', currency: 'S/.', defaultDeliveryFee: 0,
  freeDeliveryThreshold: 999999, deliveryCoverage: [], active: true, createdAt: new Date().toISOString(),
};

export const SupabaseStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string>('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [allOrders, setAllOrders] = useState<WhatsAppOrder[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [viewMode, setViewMode] = useState<'admin' | 'catalog'>('admin');
  const [adminTab, setAdminTab] = useState<StoreContextType['adminTab']>('dashboard');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCustomerDirectAccess, setIsCustomerDirectAccess] = useState(false);
  const [notification, setNotification] = useState<StoreContextType['notification']>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3800);
  }, []);

  // ---------- Sesión / URL del catálogo ----------
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthUser(data.session?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setAuthUser(s?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Detectar acceso directo de cliente (?tienda=slug) — se resuelve tras cargar datos
  const urlSlug = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const p = new URLSearchParams(window.location.search);
    return p.get('tienda') || p.get('catalogo') || p.get('store');
  }, []);

  // ---------- Carga de datos ----------
  const loadOwnerData = useCallback(async (user: User) => {
    const myTenants = await db.listTenantsByOwner(user.id);
    setTenants(myTenants);
    const ids = myTenants.map((t) => t.id);
    const [prods, sales, orders] = await Promise.all([
      db.listProducts(ids), db.listSales(ids), db.listOrders(ids),
    ]);
    setAllProducts(prods);
    setAllSales(sales);
    setAllOrders(orders);
    setLoading(false);
    return myTenants;
  }, []);

  useEffect(() => {
    if (!isSupabaseEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        if (urlSlug) {
          // Vista de CLIENTE: catálogo público sin necesidad de sesión
          const t = await db.findTenantBySlug(urlSlug);
          if (cancelled) return;
          if (t) {
            setTenants([t]);
            setActiveTenantId(t.id);
            setAllProducts(await db.listProducts([t.id]));
            setViewMode('catalog');
            setIsCustomerDirectAccess(true);
          } else {
            showNotification(`No encontramos la tienda "${urlSlug}"`, 'warning');
          }
          setLoading(false);
          return;
        }
        if (authUser) {
          const myTenants = await loadOwnerData(authUser);
          if (cancelled) return;
          setActiveTenantId((prev) => prev || myTenants[0]?.id || '');
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        if (!cancelled) { setLoading(false); showNotification('Error al cargar datos desde Supabase', 'warning'); }
      }
    })();
    return () => { cancelled = true; };
  }, [authUser?.id, urlSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Suscripción en tiempo real a pedidos (el merchant ve pedidos nuevos al instante)
  useEffect(() => {
    if (!supabase || !authUser || viewMode !== 'admin') return;
    const channel = supabase
      .channel('orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        db.listOrders(tenants.map((t) => t.id)).then(setAllOrders).catch(() => {});
      })
      .subscribe();
    return () => { if (supabase) supabase.removeChannel(channel); };
  }, [authUser?.id, tenants.map((t) => t.id).join(','), viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentTenant = useMemo<Tenant>(
    () => tenants.find((t) => t.id === activeTenantId) || tenants[0] || EMPTY_TENANT,
    [tenants, activeTenantId],
  );

  const products = useMemo(() => allProducts.filter((p) => p.tenantId === currentTenant.id), [allProducts, currentTenant.id]);
  const sales = useMemo(() => allSales.filter((s) => s.tenantId === currentTenant.id), [allSales, currentTenant.id]);
  const orders = useMemo(() => allOrders.filter((o) => o.tenantId === currentTenant.id), [allOrders, currentTenant.id]);

  // Sincroniza la URL con la vista
  useEffect(() => {
    if (typeof window === 'undefined' || loading) return;
    try {
      const url = new URL(window.location.href);
      if (viewMode === 'catalog' && currentTenant.slug !== 'pending') url.searchParams.set('tienda', currentTenant.slug);
      else if (viewMode === 'admin') { url.searchParams.delete('tienda'); url.searchParams.delete('catalogo'); url.searchParams.delete('store'); }
      window.history.replaceState({}, '', url.toString());
    } catch { /* noop */ }
  }, [viewMode, currentTenant.slug, loading]);

  const getTenantCatalogUrl = (slug?: string): string => {
    const s = slug || currentTenant.slug;
    if (typeof window === 'undefined') return `?tienda=${s}`;
    return `${window.location.origin}${window.location.pathname}?tienda=${s}`;
  };

  // ---------- Mutaciones ----------
  const switchTenant = (tenantId: string) => {
    setActiveTenantId(tenantId);
    setCart([]);
    const target = tenants.find((t) => t.id === tenantId);
    showNotification(`Cambiado a: ${target?.name || 'Tienda'}`, 'info');
  };

  const createTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => {
    if (!authUser) { showNotification('Inicia sesión para crear tiendas', 'warning'); return; }
    const newTenant: Tenant = { ...tenantData, id: uid(), createdAt: new Date().toISOString() };
    db.upsertTenant(newTenant, authUser.id)
      .then(() => {
        setTenants((prev) => [...prev, newTenant]);
        setActiveTenantId(newTenant.id);
        showNotification(`¡Comercio "${newTenant.name}" creado! Ya está en la nube ☁️`, 'success');
      })
      .catch((e) => showNotification(`No se pudo crear la tienda: ${e.message}`, 'warning'));
  };

  const updateTenant = (updated: Tenant) => {
    db.updateTenant(updated)
      .then(() => {
        setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        showNotification('Ajustes del comercio actualizados', 'success');
      })
      .catch((e) => showNotification(`Error al guardar: ${e.message}`, 'warning'));
  };

  const addProduct = (productData: Omit<Product, 'id' | 'tenantId'>) => {
    if (productData.salePrice < productData.costPrice) {
      showNotification('⚠️ El precio de venta es menor al costo: margen negativo', 'warning');
    }
    const newProduct: Product = { ...productData, id: uid(), tenantId: currentTenant.id };
    db.upsertProduct(newProduct)
      .then(() => {
        setAllProducts((prev) => [newProduct, ...prev]);
        showNotification(`Producto "${newProduct.name}" agregado al inventario`, 'success');
      })
      .catch((e) => showNotification(`Error al guardar producto: ${e.message}`, 'warning'));
  };

  const updateProduct = (updated: Product) => {
    db.upsertProduct(updated)
      .then(() => {
        setAllProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showNotification(`Producto "${updated.name}" actualizado`, 'success');
      })
      .catch((e) => showNotification(`Error al actualizar: ${e.message}`, 'warning'));
  };

  const deleteProduct = (productId: string) => {
    db.deleteProduct(productId)
      .then(() => {
        setAllProducts((prev) => prev.filter((p) => p.id !== productId));
        showNotification('Producto eliminado del inventario', 'info');
      })
      .catch((e) => showNotification(`Error al eliminar: ${e.message}`, 'warning'));
  };

  const adjustStock = (productId: string, delta: number) => {
    const prod = allProducts.find((p) => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    db.setProductStock(productId, newStock)
      .then(() => {
        setAllProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)));
        showNotification(`Stock ajustado (${delta > 0 ? `+${delta}` : delta})`, 'info');
      })
      .catch((e) => showNotification(`Error al ajustar stock: ${e.message}`, 'warning'));
  };

  /** Construye la venta y la persiste vía RPC record_sale (número atómico + trigger de stock). */
  const buildAndPersistSale = useCallback((args: {
    items: { product: Product; quantity: number }[];
    paymentMethod: PaymentMethod;
    discount?: number;
    amountPaid?: number;
    customerName?: string;
    customerDni?: string;
    source?: 'pos' | 'catalogo_whatsapp';
    notes?: string;
    tenantId?: string;
  }): Sale => {
    let subtotal = 0; let costTotal = 0;
    const saleItems = args.items.map(({ product, quantity }) => {
      const lineSubtotal = product.salePrice * quantity;
      subtotal += lineSubtotal; costTotal += product.costPrice * quantity;
      return { productId: product.id, productName: product.name, quantity, unitPrice: product.salePrice, costPrice: product.costPrice, subtotal: lineSubtotal };
    });
    const discount = args.discount ?? 0;
    const total = Math.max(0, subtotal - discount);
    const paid = args.amountPaid !== undefined ? args.amountPaid : total;
    const draft: Sale = {
      id: uid(), tenantId: args.tenantId || currentTenant.id, receiptNumber: '',
      items: saleItems, subtotal, discount, total, costTotal,
      profit: Math.max(0, total - costTotal), paymentMethod: args.paymentMethod,
      amountPaid: paid, changeDue: Math.max(0, paid - total),
      customerName: args.customerName || 'Cliente Final', customerDni: args.customerDni || '',
      source: args.source || 'pos', date: new Date().toISOString(), notes: args.notes,
    };
    // Optimista en UI; la confirmación llega del servidor
    db.recordSale(draft)
      .then((saved) => {
        setAllSales((prev) => [saved, ...prev]);
        setAllProducts((prev) => prev.map((prod) => {
          const sold = args.items.find((i) => i.product.id === prod.id);
          return sold ? { ...prod, stock: Math.max(0, prod.stock - sold.quantity) } : prod;
        }));
        setLastSale(saved);
        showNotification(`¡Venta registrada! Boleta ${saved.receiptNumber} emitida`, 'success');
      })
      .catch((e) => showNotification(`No se pudo registrar la venta: ${e.message}`, 'warning'));
    return draft;
  }, [currentTenant.id, showNotification]);

  const recordSale = buildAndPersistSale;

  const createWhatsAppOrder = (
    orderData: Omit<WhatsAppOrder, 'id' | 'tenantId' | 'orderNumber' | 'createdAt' | 'status'>,
  ): WhatsAppOrder => {
    // En modo Supabase, los clientes anónimos crean el pedido vía Edge Function;
    // esta ruta se usa como fallback local (optimista) cuando falla la función.
    const newOrder: WhatsAppOrder = {
      ...orderData, id: uid(), tenantId: currentTenant.id,
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`, status: 'pendiente',
      createdAt: new Date().toISOString(),
    };
    db.upsertOrder(newOrder)
      .then(() => setAllOrders((prev) => [newOrder, ...prev]))
      .catch((e) => console.warn('Pedido guardado solo localmente:', e.message));
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const order = allOrders.find((o) => o.id === orderId);
    if (!order) return;
    const updated: WhatsAppOrder = {
      ...order, status,
      completedAt: status === 'entregado' ? new Date().toISOString() : order.completedAt,
    };
    db.upsertOrder(updated)
      .then(() => {
        setAllOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        showNotification(`Pedido ${order.orderNumber} actualizado a: ${status.replace('_', ' ')}`, 'info');
        if (status === 'entregado' && order.status !== 'entregado') {
          const saleItems = order.items.map((item) => {
            const prod = allProducts.find((p) => p.id === item.productId);
            return {
              product: prod || {
                id: item.productId, name: item.productName, salePrice: item.unitPrice,
                costPrice: item.unitPrice * 0.7, tenantId: order.tenantId, sku: 'ORD',
                category: 'General', description: '', stock: 0, minStockAlert: 1,
                unit: 'unid' as const, imageUrl: '', isActive: true, featuredInCatalog: true,
              },
              quantity: item.quantity,
            };
          });
          buildAndPersistSale({
            items: saleItems, paymentMethod: order.paymentMethod, amountPaid: order.total,
            customerName: `${order.customerName} (${order.district})`,
            source: 'catalogo_whatsapp', notes: `Pedido WhatsApp ${order.orderNumber} - Ref: ${order.reference}`,
            tenantId: order.tenantId,
          });
        }
      })
      .catch((e) => showNotification(`Error al actualizar pedido: ${e.message}`, 'warning'));
  };

  // ---------- Carrito ----------
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: Math.min(product.stock, i.quantity + quantity) } : i);
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
    showNotification(`Agregado al carrito: ${product.name}`);
  };
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)));
  };
  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((i) => i.product.id !== productId));
  const clearCart = () => setCart([]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.product.salePrice * i.quantity, 0), [cart]);
  const cartItemsCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  // ---------- Auth ----------
  const signIn = async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase no configurado';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };
  const signUp = async (email: string, password: string, fullName: string): Promise<string | null> => {
    if (!supabase) return 'Supabase no configurado';
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    return error ? error.message : null;
  };
  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setTenants([]); setAllProducts([]); setAllSales([]); setAllOrders([]); setActiveTenantId('');
  };

  return (
    <StoreContext.Provider value={{
      tenants, currentTenant, switchTenant, createTenant, updateTenant,
      products, allProducts, addProduct, updateProduct, deleteProduct, adjustStock,
      sales, recordSale, orders, createWhatsAppOrder, updateOrderStatus,
      cart, addToCart, updateCartQuantity, removeFromCart, clearCart, cartTotal, cartItemsCount,
      viewMode, setViewMode, adminTab, setAdminTab,
      isCustomerDirectAccess, setIsCustomerDirectAccess,
      getTenantCatalogUrl, isShareModalOpen, setIsShareModalOpen,
      lastSale, setLastSale, notification, showNotification,
      session, authUser, loading, signIn, signUp, signOut,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useSupabaseStore = () => useContext(StoreContext);

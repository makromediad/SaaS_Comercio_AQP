import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Tenant, 
  Product, 
  Sale, 
  WhatsAppOrder, 
  CartItem, 
  OrderStatus, 
  PaymentMethod,
  Customer,
  WhatsAppAiConfig,
  AiChatMessage,
  AdminTab,
  ViewMode
} from '../types';
import { 
  INITIAL_TENANTS, 
  INITIAL_PRODUCTS, 
  INITIAL_SALES, 
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_AI_CONFIG
} from '../data/initialData';

interface StoreContextType {
  tenants: Tenant[];
  currentTenant: Tenant;
  switchTenant: (tenantId: string) => void;
  createTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>, seedDemoProducts?: boolean) => void;
  updateTenant: (tenant: Tenant) => void;
  deleteTenant: (tenantId: string) => boolean;
  toggleTenantStatus: (tenantId: string) => void;
  
  products: Product[];
  allProducts: Product[];
  addProduct: (product: Omit<Product, 'id' | 'tenantId'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  adjustStock: (productId: string, delta: number) => void;

  sales: Sale[];
  allSales: Sale[];
  recordSale: (saleData: {
    items: { product: Product; quantity: number }[];
    paymentMethod: PaymentMethod;
    discount?: number;
    amountPaid?: number;
    customerName?: string;
    customerDni?: string;
    customerPhone?: string;
    source?: 'pos' | 'catalogo_whatsapp';
    notes?: string;
  }) => Sale;

  orders: WhatsAppOrder[];
  allOrders: WhatsAppOrder[];
  createWhatsAppOrder: (orderData: Omit<WhatsAppOrder, 'id' | 'tenantId' | 'orderNumber' | 'createdAt' | 'status'>) => WhatsAppOrder;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // CRM Module
  customers: Customer[];
  allCustomers: Customer[];
  addCustomer: (customerData: Omit<Customer, 'id' | 'tenantId' | 'createdAt' | 'totalOrders' | 'totalSpent' | 'averageTicket' | 'lastOrderDate'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  generateCustomerAiInsight: (customerId: string) => Promise<Customer['aiInsights']>;

  // WhatsApp AI Automation Module
  whatsappAiConfig: WhatsAppAiConfig;
  updateAiConfig: (config: Partial<WhatsAppAiConfig>) => void;
  chatMessages: AiChatMessage[];
  sendChatMessageToAi: (text: string) => Promise<string>;
  clearChatMessages: () => void;
  isAiThinking: boolean;

  // Catalog Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemsCount: number;

  // Navigation & View
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  isCustomerDirectAccess: boolean;
  setIsCustomerDirectAccess: (isCustomer: boolean) => void;
  getTenantCatalogUrl: (tenantSlug?: string) => string;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;

  // Receipt Modal
  lastSale: Sale | null;
  setLastSale: (sale: Sale | null) => void;

  // Notifications
  notification: { message: string; type: 'success' | 'info' | 'warning' } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TENANTS: 'arequipa_pos_tenants_v1',
  ACTIVE_TENANT_ID: 'arequipa_pos_active_tenant_id_v1',
  PRODUCTS: 'arequipa_pos_products_v1',
  SALES: 'arequipa_pos_sales_v1',
  ORDERS: 'arequipa_pos_orders_v1',
  CUSTOMERS: 'arequipa_pos_customers_v1',
  AI_CONFIG: 'arequipa_pos_ai_config_v1'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Tenants State
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TENANTS);
      return stored ? JSON.parse(stored) : INITIAL_TENANTS;
    } catch {
      return INITIAL_TENANTS;
    }
  });

  // Check URL parameters for customer catalog direct access (?tienda=slug or ?catalogo=slug)
  const [isCustomerDirectAccess, setIsCustomerDirectAccess] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    return params.has('tienda') || params.has('catalogo') || params.has('store') || hash.includes('tienda=') || hash.includes('/catalogo/');
  });

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlStore = params.get('tienda') || params.get('catalogo') || params.get('store');
      if (urlStore) {
        const storedTenantsRaw = localStorage.getItem(STORAGE_KEYS.TENANTS);
        const tenantList: Tenant[] = storedTenantsRaw ? JSON.parse(storedTenantsRaw) : INITIAL_TENANTS;
        const matched = tenantList.find((t) => t.slug === urlStore || t.id === urlStore);
        if (matched) return matched.id;
      }
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_TENANT_ID);
      return stored || 'tenant-characato';
    } catch {
      return 'tenant-characato';
    }
  });

  // Current Tenant
  const currentTenant = useMemo(() => {
    return tenants.find((t) => t.id === activeTenantId) || tenants[0] || INITIAL_TENANTS[0];
  }, [tenants, activeTenantId]);

  // 2. Products State
  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Filtered products for active tenant
  const products = useMemo(() => {
    return allProducts.filter((p) => p.tenantId === currentTenant.id);
  }, [allProducts, currentTenant.id]);

  // 3. Sales State
  const [allSales, setAllSales] = useState<Sale[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SALES);
      return stored ? JSON.parse(stored) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  // Filtered sales for active tenant
  const sales = useMemo(() => {
    return allSales.filter((s) => s.tenantId === currentTenant.id);
  }, [allSales, currentTenant.id]);

  // 4. WhatsApp Orders State
  const [allOrders, setAllOrders] = useState<WhatsAppOrder[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Filtered orders for active tenant
  const orders = useMemo(() => {
    return allOrders.filter((o) => o.tenantId === currentTenant.id);
  }, [allOrders, currentTenant.id]);

  // 5. CRM Customers State
  const [allCustomers, setAllCustomers] = useState<Customer[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return stored ? JSON.parse(stored) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const customers = useMemo(() => {
    return allCustomers.filter((c) => c.tenantId === currentTenant.id);
  }, [allCustomers, currentTenant.id]);

  // 6. WhatsApp AI Config State
  const [aiConfigMap, setAiConfigMap] = useState<Record<string, WhatsAppAiConfig>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
      return stored ? JSON.parse(stored) : INITIAL_AI_CONFIG;
    } catch {
      return INITIAL_AI_CONFIG;
    }
  });

  const whatsappAiConfig = useMemo(() => {
    return aiConfigMap[currentTenant.id] || INITIAL_AI_CONFIG[currentTenant.id] || {
      enabled: true,
      botName: `${currentTenant.name.split(' ')[0]} Bot`,
      personality: 'amable_arequipeno',
      customPrompt: 'Atención personalizada para comerciantes en Arequipa.',
      welcomeMessage: `¡Hola! Bienvenido a ${currentTenant.name}. ¿En qué podemos ayudarte casero?`,
      autoReplyPriceStock: true,
      autoSendCatalogLink: true,
      autoSendPaymentInfo: true
    };
  }, [aiConfigMap, currentTenant]);

  // 7. Interactive WhatsApp AI Chat Simulation
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: whatsappAiConfig.welcomeMessage,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      status: 'read'
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Reset welcome message on tenant switch
  useEffect(() => {
    setChatMessages([
      {
        id: `welcome-${currentTenant.id}`,
        sender: 'bot',
        text: whatsappAiConfig.welcomeMessage,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      }
    ]);
  }, [currentTenant.id, whatsappAiConfig.welcomeMessage]);

  // 8. Cart State (Customer View)
  const [cart, setCart] = useState<CartItem[]>([]);

  // 9. Navigation View Mode
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('tienda') || params.has('catalogo') || params.has('store')) {
        return 'catalog';
      }
      if (params.get('view') === 'superadmin' || window.location.hash.includes('superadmin')) {
        return 'superadmin';
      }
    }
    return 'admin';
  });
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  // 10. Share Catalog Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Generates absolute public URL for customer
  const getTenantCatalogUrl = (tenantSlug?: string): string => {
    const slug = tenantSlug || currentTenant.slug;
    if (typeof window === 'undefined') return `?tienda=${slug}`;
    const base = window.location.origin + window.location.pathname;
    return `${base}?tienda=${slug}`;
  };

  // Sync browser URL parameter when viewMode or currentTenant changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (viewMode === 'catalog') {
        url.searchParams.set('tienda', currentTenant.slug);
        url.searchParams.delete('view');
      } else if (viewMode === 'superadmin') {
        url.searchParams.set('view', 'superadmin');
        url.searchParams.delete('tienda');
      } else {
        url.searchParams.delete('tienda');
        url.searchParams.delete('catalogo');
        url.searchParams.delete('store');
        url.searchParams.delete('view');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // fallback
    }
  }, [viewMode, currentTenant.slug]);

  // Listen for browser navigation changes or query parameter updates
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const urlStore = params.get('tienda') || params.get('catalogo') || params.get('store');
      if (urlStore) {
        const matched = tenants.find((t) => t.slug === urlStore || t.id === urlStore);
        if (matched) {
          setActiveTenantId(matched.id);
          setViewMode('catalog');
        }
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [tenants]);

  // 8. Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3800);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, activeTenantId);
  }, [activeTenantId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(allProducts));
  }, [allProducts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(allSales));
  }, [allSales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(allOrders));
  }, [allOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(allCustomers));
  }, [allCustomers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(aiConfigMap));
  }, [aiConfigMap]);

  // Tenant Handlers
  const switchTenant = (tenantId: string) => {
    setActiveTenantId(tenantId);
    setCart([]); // clear cart when switching stores
    const target = tenants.find((t) => t.id === tenantId);
    showNotification(`Cambiado a: ${target?.name || 'Tienda'}`, 'info');
  };

  const createTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt'>, seedDemoProducts: boolean = true) => {
    const newId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      ...tenantData,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setTenants((prev) => [...prev, newTenant]);
    setActiveTenantId(newId);

    // Optional demo starter catalog based on company
    if (seedDemoProducts) {
      const demoProducts: Product[] = [
        {
          id: `prod-${Date.now()}-1`,
          tenantId: newId,
          name: 'Queso Paria Tradicional Arequipeño (1kg)',
          sku: 'QPAR-01',
          category: 'Lácteos & Tradición',
          description: 'Queso artesanal fresco elaborado en Majes, textura cremosa ideal para picar.',
          costPrice: 22.0,
          salePrice: 32.5,
          stock: 25,
          minStockAlert: 5,
          unit: 'kg',
          imageUrl: '/src/assets/images/product_cheese_arequipa_1790861651478.jpg',
          isActive: true,
          featuredInCatalog: true
        },
        {
          id: `prod-${Date.now()}-2`,
          tenantId: newId,
          name: 'Pan de Tres Puntas Tradicional (Bolsa x6)',
          sku: 'PAN-06',
          category: 'Panadería',
          description: 'Típico pan arequipeño horneado en piso artesanal, crujiente por fuera.',
          costPrice: 3.5,
          salePrice: 6.0,
          stock: 40,
          minStockAlert: 8,
          unit: 'pqte',
          imageUrl: '/src/assets/images/store_bodega_showcase_1790861644926.jpg',
          isActive: true,
          featuredInCatalog: true
        },
        {
          id: `prod-${Date.now()}-3`,
          tenantId: newId,
          name: 'Chocolates Surtidos La Ibérica (Caja 200g)',
          sku: 'CHOC-01',
          category: 'Dulces & Regalos',
          description: 'Selección de chocolates tradicionales finos de cacao selecto de Arequipa.',
          costPrice: 18.0,
          salePrice: 26.0,
          stock: 18,
          minStockAlert: 4,
          unit: 'unid',
          imageUrl: '/src/assets/images/artisan_product_chocolates_1790861657657.jpg',
          isActive: true,
          featuredInCatalog: true
        }
      ];
      setAllProducts((prev) => [...demoProducts, ...prev]);
    }

    showNotification(`¡Comercio "${newTenant.name}" creado con éxito en Arequipa!`, 'success');
  };

  const updateTenant = (updated: Tenant) => {
    setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showNotification('Ajustes del comercio actualizados', 'success');
  };

  const deleteTenant = (tenantId: string): boolean => {
    if (tenants.length <= 1) {
      showNotification('No se puede eliminar el único comercio registrado', 'warning');
      return false;
    }
    const tenantToDelete = tenants.find((t) => t.id === tenantId);
    setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    if (activeTenantId === tenantId) {
      const remaining = tenants.filter((t) => t.id !== tenantId);
      if (remaining.length > 0) {
        setActiveTenantId(remaining[0].id);
      }
    }
    showNotification(`Comercio "${tenantToDelete?.name || tenantId}" eliminado de la plataforma`, 'info');
    return true;
  };

  const toggleTenantStatus = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const nextActive = !t.active;
          const nextStatus = nextActive ? 'activo' : 'suspendido';
          return { ...t, active: nextActive, status: nextStatus };
        }
        return t;
      })
    );
    const target = tenants.find((t) => t.id === tenantId);
    showNotification(`Estado de "${target?.name}" actualizado`, 'info');
  };

  // Product Handlers
  const addProduct = (productData: Omit<Product, 'id' | 'tenantId'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      tenantId: currentTenant.id
    };
    setAllProducts((prev) => [newProduct, ...prev]);
    showNotification(`Producto "${newProduct.name}" agregado al inventario`, 'success');
  };

  const updateProduct = (updated: Product) => {
    setAllProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showNotification(`Producto "${updated.name}" actualizado`, 'success');
  };

  const deleteProduct = (productId: string) => {
    setAllProducts((prev) => prev.filter((p) => p.id !== productId));
    showNotification('Producto eliminado del inventario', 'info');
  };

  const adjustStock = (productId: string, delta: number) => {
    setAllProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
    showNotification(`Stock ajustado (${delta > 0 ? `+${delta}` : delta})`, 'info');
  };

  // Automatic CRM Upsert helper for Sales & Orders
  const upsertCustomerFromSaleOrOrder = (data: {
    name: string;
    phone?: string;
    dni?: string;
    district?: any;
    address?: string;
    reference?: string;
    orderTotal: number;
    productNames?: string[];
  }) => {
    if (!data.name || data.name.trim() === 'Cliente Final' || data.name.trim() === 'Cliente Mostrador') {
      return;
    }

    setAllCustomers((prev) => {
      const cleanPhone = (data.phone || '').replace(/\D/g, '');
      const existingIndex = prev.findIndex(
        (c) =>
          c.tenantId === currentTenant.id &&
          ((cleanPhone && c.phone && c.phone.replace(/\D/g, '') === cleanPhone) ||
            c.name.trim().toLowerCase() === data.name.trim().toLowerCase())
      );

      const now = new Date().toISOString();

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const newOrders = existing.totalOrders + 1;
        const newSpent = existing.totalSpent + data.orderTotal;
        const newAvg = newSpent / newOrders;
        const combinedFavs = Array.from(
          new Set([...(existing.favoriteProducts || []), ...(data.productNames || [])])
        ).slice(0, 5);

        let newTag = existing.tag;
        if (newOrders >= 5 || newSpent >= 250) newTag = 'vip';
        else if (newOrders >= 2) newTag = 'frecuente';

        const updatedCust: Customer = {
          ...existing,
          name: data.name || existing.name,
          phone: data.phone || existing.phone,
          dni: data.dni || existing.dni,
          district: data.district || existing.district,
          address: data.address || existing.address,
          reference: data.reference || existing.reference,
          totalOrders: newOrders,
          totalSpent: newSpent,
          averageTicket: newAvg,
          lastOrderDate: now,
          tag: newTag,
          favoriteProducts: combinedFavs
        };

        const copy = [...prev];
        copy[existingIndex] = updatedCust;
        return copy;
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          tenantId: currentTenant.id,
          name: data.name,
          phone: data.phone || '954000000',
          dni: data.dni || '',
          district: data.district || currentTenant.district,
          address: data.address || currentTenant.address,
          reference: data.reference || '',
          tag: 'nuevo',
          notes: 'Registrado automáticamente por pedido/venta',
          totalOrders: 1,
          totalSpent: data.orderTotal,
          averageTicket: data.orderTotal,
          lastOrderDate: now,
          createdAt: now,
          favoriteProducts: data.productNames || []
        };
        return [newCust, ...prev];
      }
    });
  };

  // Record Sale (POS or Manual)
  const recordSale = ({
    items,
    paymentMethod,
    discount = 0,
    amountPaid,
    customerName,
    customerDni,
    customerPhone,
    source = 'pos',
    notes
  }: {
    items: { product: Product; quantity: number }[];
    paymentMethod: PaymentMethod;
    discount?: number;
    amountPaid?: number;
    customerName?: string;
    customerDni?: string;
    customerPhone?: string;
    source?: 'pos' | 'catalogo_whatsapp';
    notes?: string;
  }): Sale => {
    let subtotal = 0;
    let costTotal = 0;

    const saleItems = items.map(({ product, quantity }) => {
      const lineSubtotal = product.salePrice * quantity;
      const lineCost = product.costPrice * quantity;
      subtotal += lineSubtotal;
      costTotal += lineCost;

      return {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.salePrice,
        costPrice: product.costPrice,
        subtotal: lineSubtotal
      };
    });

    const total = Math.max(0, subtotal - discount);
    const profit = Math.max(0, total - costTotal);
    const paid = amountPaid !== undefined ? amountPaid : total;
    const changeDue = Math.max(0, paid - total);

    // Generate consecutive receipt number
    const tenantSaleCount = allSales.filter((s) => s.tenantId === currentTenant.id).length + 1;
    const padded = String(tenantSaleCount).padStart(6, '0');
    const receiptNumber = `B001-${padded}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      tenantId: currentTenant.id,
      receiptNumber,
      items: saleItems,
      subtotal,
      discount,
      total,
      costTotal,
      profit,
      paymentMethod,
      amountPaid: paid,
      changeDue,
      customerName: customerName || 'Cliente Final',
      customerDni: customerDni || '',
      source,
      date: new Date().toISOString(),
      notes
    };

    // Deduct stock for all items
    setAllProducts((prev) =>
      prev.map((prod) => {
        const soldItem = items.find((i) => i.product.id === prod.id);
        if (soldItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - soldItem.quantity)
          };
        }
        return prod;
      })
    );

    setAllSales((prev) => [newSale, ...prev]);
    setLastSale(newSale);
    showNotification(`¡Venta registrada! Boleta ${receiptNumber} emitida`, 'success');

    // Auto update CRM customer profile
    if (customerName && customerName !== 'Cliente Final' && customerName !== 'Cliente Mostrador') {
      upsertCustomerFromSaleOrOrder({
        name: customerName,
        phone: customerPhone,
        dni: customerDni,
        district: currentTenant.district,
        orderTotal: total,
        productNames: saleItems.map((i) => i.productName)
      });
    }

    return newSale;
  };

  // WhatsApp Order Creation (from Public Catalog)
  const createWhatsAppOrder = (
    orderData: Omit<WhatsAppOrder, 'id' | 'tenantId' | 'orderNumber' | 'createdAt' | 'status'>
  ): WhatsAppOrder => {
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: WhatsAppOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      tenantId: currentTenant.id,
      orderNumber,
      status: 'pendiente',
      createdAt: new Date().toISOString()
    };

    setAllOrders((prev) => [newOrder, ...prev]);

    // Auto update CRM customer profile
    upsertCustomerFromSaleOrOrder({
      name: orderData.customerName,
      phone: orderData.customerPhone,
      district: orderData.district,
      address: orderData.address,
      reference: orderData.reference,
      orderTotal: orderData.total,
      productNames: orderData.items.map((i) => i.productName)
    });

    return newOrder;
  };

  // Order Status Progression
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setAllOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated: WhatsAppOrder = {
            ...order,
            status,
            completedAt: status === 'entregado' ? new Date().toISOString() : order.completedAt
          };

          // If transitioning to 'entregado', optionally register into sales if not already converted
          if (status === 'entregado' && order.status !== 'entregado') {
            // Find products
            const saleItems = order.items.map((item) => {
              const prod = allProducts.find((p) => p.id === item.productId);
              return {
                product: prod || {
                  id: item.productId,
                  name: item.productName,
                  salePrice: item.unitPrice,
                  costPrice: item.unitPrice * 0.7, // fallback
                  tenantId: currentTenant.id,
                  sku: 'ORD',
                  category: 'General',
                  description: '',
                  stock: 0,
                  minStockAlert: 1,
                  unit: 'unid' as const,
                  imageUrl: '',
                  isActive: true,
                  featuredInCatalog: true
                },
                quantity: item.quantity
              };
            });

            recordSale({
              items: saleItems,
              paymentMethod: order.paymentMethod,
              discount: 0,
              amountPaid: order.total,
              customerName: `${order.customerName} (${order.district})`,
              source: 'catalogo_whatsapp',
              notes: `Pedido WhatsApp ${order.orderNumber} - Ref: ${order.reference}`
            });
          }

          return updated;
        }
        return order;
      })
    );
    showNotification(`Pedido ${orderId} actualizado a: ${status.replace('_', ' ')}`, 'info');
  };

  // CRM Customer Management
  const addCustomer = (customerData: Omit<Customer, 'id' | 'tenantId' | 'createdAt' | 'totalOrders' | 'totalSpent' | 'averageTicket' | 'lastOrderDate'>): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      tenantId: currentTenant.id,
      totalOrders: 0,
      totalSpent: 0,
      averageTicket: 0,
      lastOrderDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    setAllCustomers((prev) => [newCust, ...prev]);
    showNotification(`Cliente "${newCust.name}" registrado en CRM`, 'success');
    return newCust;
  };

  const updateCustomer = (updated: Customer) => {
    setAllCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showNotification(`Cliente "${updated.name}" actualizado en CRM`, 'success');
  };

  const deleteCustomer = (customerId: string) => {
    setAllCustomers((prev) => prev.filter((c) => c.id !== customerId));
    showNotification('Cliente eliminado del CRM', 'info');
  };

  const generateCustomerAiInsight = async (customerId: string): Promise<Customer['aiInsights']> => {
    const cust = allCustomers.find((c) => c.id === customerId);
    if (!cust) return undefined;

    try {
      const res = await fetch('/api/ai/crm-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: cust,
          tenant: currentTenant
        })
      });
      const data = await res.json();
      const insights = {
        persona: data.persona || 'Cliente Frecuente',
        summary: data.summary || '',
        suggestedMessage: data.suggestedMessage || '',
        lastAnalyzedAt: new Date().toISOString()
      };

      setAllCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, aiInsights: insights } : c))
      );
      showNotification('Análisis de cliente generado por IA', 'success');
      return insights;
    } catch (err: any) {
      console.error(err);
      showNotification('No se pudo generar el análisis con IA', 'warning');
      return undefined;
    }
  };

  // WhatsApp AI Automation Controls
  const updateAiConfig = (configUpdates: Partial<WhatsAppAiConfig>) => {
    setAiConfigMap((prev) => {
      const current = prev[currentTenant.id] || INITIAL_AI_CONFIG[currentTenant.id];
      const updated = { ...current, ...configUpdates };
      return { ...prev, [currentTenant.id]: updated };
    });
    showNotification('Ajustes de IA WhatsApp actualizados', 'success');
  };

  const sendChatMessageToAi = async (userMessage: string): Promise<string> => {
    if (!userMessage.trim()) return '';

    const newMsg: AiChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      text: userMessage,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setIsAiThinking(true);

    try {
      const response = await fetch('/api/ai/whatsapp-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: currentTenant,
          incomingMessage: userMessage,
          conversationHistory: chatMessages,
          products,
          catalogUrl: getTenantCatalogUrl(),
          config: whatsappAiConfig
        })
      });

      const data = await response.json();
      const replyText = data.reply || '¡Hola! Gracias por comunicarte con nosotros.';

      const botReply: AiChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };

      setChatMessages((prev) => [...prev, botReply]);
      return replyText;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      const errorReply: AiChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: '¡Hola casero! Disculpa, tuvimos un problema de conexión momentáneo. Déjanos tu pedido contraentrega y en seguida te atendemos.',
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };
      setChatMessages((prev) => [...prev, errorReply]);
      return errorReply.text;
    } finally {
      setIsAiThinking(false);
    }
  };

  const clearChatMessages = () => {
    setChatMessages([
      {
        id: `welcome-${currentTenant.id}`,
        sender: 'bot',
        text: whatsappAiConfig.welcomeMessage,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      }
    ]);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(product.stock, i.quantity + quantity) }
            : i
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
    showNotification(`Agregado al carrito: ${product.name}`);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <StoreContext.Provider
      value={{
        tenants,
        currentTenant,
        switchTenant,
        createTenant,
        updateTenant,
        deleteTenant,
        toggleTenantStatus,
        products,
        allProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        sales,
        allSales,
        recordSale,
        orders,
        allOrders,
        createWhatsAppOrder,
        updateOrderStatus,
        customers,
        allCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        generateCustomerAiInsight,
        whatsappAiConfig,
        updateAiConfig,
        chatMessages,
        sendChatMessageToAi,
        clearChatMessages,
        isAiThinking,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartItemsCount,
        viewMode,
        setViewMode,
        adminTab,
        setAdminTab,
        isCustomerDirectAccess,
        setIsCustomerDirectAccess,
        getTenantCatalogUrl,
        isShareModalOpen,
        setIsShareModalOpen,
        lastSale,
        setLastSale,
        notification,
        showNotification
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

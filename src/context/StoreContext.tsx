import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Tenant, Product, Sale, WhatsAppOrder, CartItem, OrderStatus, PaymentMethod } from '../types';
import { INITIAL_TENANTS, INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_ORDERS } from '../data/initialData';

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

  // Catalog Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemsCount: number;

  // Navigation & View
  viewMode: 'admin' | 'catalog';
  setViewMode: (mode: 'admin' | 'catalog') => void;
  adminTab: 'pos' | 'inventory' | 'reports' | 'orders' | 'settings';
  setAdminTab: (tab: 'pos' | 'inventory' | 'reports' | 'orders' | 'settings') => void;

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

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
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

  // 5. Cart State (Customer View)
  const [cart, setCart] = useState<CartItem[]>([]);

  // 6. Navigation View Mode
  const [viewMode, setViewMode] = useState<'admin' | 'catalog'>('admin');
  const [adminTab, setAdminTab] = useState<'pos' | 'inventory' | 'reports' | 'orders' | 'settings'>('pos');
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  // 7. Notification Toast
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

  // Tenant Handlers
  const switchTenant = (tenantId: string) => {
    setActiveTenantId(tenantId);
    setCart([]); // clear cart when switching stores
    const target = tenants.find((t) => t.id === tenantId);
    showNotification(`Cambiado a: ${target?.name || 'Tienda'}`, 'info');
  };

  const createTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => {
    const newId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      ...tenantData,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setTenants((prev) => [...prev, newTenant]);
    setActiveTenantId(newId);
    showNotification(`¡Comercio "${newTenant.name}" creado con éxito en Arequipa!`, 'success');
  };

  const updateTenant = (updated: Tenant) => {
    setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showNotification('Ajustes del comercio actualizados', 'success');
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

  // Record Sale (POS or Manual)
  const recordSale = ({
    items,
    paymentMethod,
    discount = 0,
    amountPaid,
    customerName,
    customerDni,
    source = 'pos',
    notes
  }: {
    items: { product: Product; quantity: number }[];
    paymentMethod: PaymentMethod;
    discount?: number;
    amountPaid?: number;
    customerName?: string;
    customerDni?: string;
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
        products,
        allProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        sales,
        recordSale,
        orders,
        createWhatsAppOrder,
        updateOrderStatus,
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

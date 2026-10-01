import React, { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  MessageCircle, 
  ArrowUpRight, 
  Store, 
  Clock, 
  Truck, 
  Receipt, 
  Crown, 
  Smartphone, 
  Plus, 
  ChevronRight, 
  Sparkles,
  MapPin,
  ExternalLink,
  Coins,
  Share2,
  QrCode,
  Copy,
  Check,
  Users,
  Bot,
  HeartHandshake
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const { 
    currentTenant, 
    products, 
    sales, 
    orders, 
    customers,
    whatsappAiConfig,
    setAdminTab, 
    setViewMode, 
    setLastSale,
    adjustStock,
    tenants,
    switchTenant,
    setIsShareModalOpen,
    getTenantCatalogUrl,
    showNotification
  } = useStore();

  const [copiedLink, setCopiedLink] = useState(false);

  // Calculate today's metrics
  const todayStats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const todaySales = sales.filter((s) => new Date(s.date).getTime() >= startOfToday);

    let totalRevenue = 0;
    let totalProfit = 0;
    let efectivo = 0;
    let yape = 0;
    let plin = 0;
    let posCount = 0;
    let whatsappCount = 0;

    todaySales.forEach((s) => {
      totalRevenue += s.total;
      totalProfit += s.profit;
      if (s.paymentMethod === 'efectivo_contraentrega') efectivo += s.total;
      else if (s.paymentMethod === 'yape_contraentrega') yape += s.total;
      else if (s.paymentMethod === 'plin_contraentrega') plin += s.total;

      if (s.source === 'catalogo_whatsapp') whatsappCount++;
      else posCount++;
    });

    const activeOrders = orders.filter((o) => o.status === 'pendiente' || o.status === 'en_camino');
    const activeOrdersValue = activeOrders.reduce((sum, o) => sum + o.total, 0);

    const lowStockProducts = products.filter((p) => p.stock <= p.minStockAlert);
    const totalInventoryValue = products.reduce((sum, p) => sum + p.salePrice * p.stock, 0);

    return {
      todayRevenue: totalRevenue,
      todayProfit: totalProfit,
      todayCount: todaySales.length,
      averageTicket: todaySales.length > 0 ? totalRevenue / todaySales.length : 0,
      marginPct: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      efectivo,
      yape,
      plin,
      posCount,
      whatsappCount,
      activeOrdersCount: activeOrders.length,
      activeOrdersValue,
      activeOrders,
      lowStockProducts,
      totalInventoryValue,
      recentSales: sales.slice(0, 5)
    };
  }, [sales, orders, products]);

  const catalogUrl = getTenantCatalogUrl();

  const copyStoreLink = () => {
    navigator.clipboard.writeText(catalogUrl);
    setCopiedLink(true);
    showNotification('¡Enlace del catálogo copiado al portapapeles!', 'success');
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const shareOnWhatsApp = () => {
    const promo = `¡Hola! 🛍️ Te invitamos a conocer el catálogo digital de *${currentTenant.name}* (${currentTenant.district}, Arequipa).\n\n🛵 Mira nuestros productos y pide con *pago contraentrega* (Efectivo / Yape / Plin) al recibirlo.\n\n👉 Accede a nuestro catálogo aquí:\n${catalogUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(promo)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* 1. Executive Hero Header */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-md relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentTenant.name} · {currentTenant.district}, Arequipa</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bienvenido, {currentTenant.ownerName}
            </h1>

            <p className="text-sm text-slate-300 font-medium">
              Resumen ejecutivo en tiempo real de tu inventario, ventas mostrador y pedidos contraentrega por WhatsApp.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-300 pt-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{currentTenant.address}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-amber-300 font-semibold">WhatsApp: +{currentTenant.whatsappNumber}</span>
            </div>
          </div>

          {/* Quick Primary Actions in Header */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              title="Obtener link directo para clientes y código QR para mostrador"
            >
              <Share2 className="w-4 h-4 text-blue-950" />
              <span>Link Catálogo & QR</span>
            </button>

            <button
              onClick={() => setAdminTab('pos')}
              className="flex-1 sm:flex-initial px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Caja POS</span>
            </button>

            <button
              onClick={() => setViewMode('catalog')}
              className="flex-1 sm:flex-initial px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>Ver Tienda</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Customer Access Link & Online Storefront Hub */}
      <div className="bg-white rounded-2xl border-2 border-amber-400/50 p-5 shadow-xs transition-all">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-wider text-blue-950">
                Link de Acceso para Clientes (Catálogo Virtual Activo)
              </h2>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Comparte este enlace con tus clientes de Arequipa para que agreguen productos al carrito y te hagan pedidos directamente a tu WhatsApp con pago contraentrega.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-blue-950 select-all truncate max-w-xs sm:max-w-md">
                {catalogUrl}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={copyStoreLink}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-blue-950 hover:bg-blue-900 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              title="Copiar link al portapapeles"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              onClick={shareOnWhatsApp}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
              title="Enviar invitación con link por WhatsApp a tus contactos"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Difundir WhatsApp</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:border-amber-400 transition-colors"
              title="Descargar código QR para imprimir en tu mostrador o bolsas"
            >
              <QrCode className="w-4 h-4 text-amber-600" />
              <span>Ver QR</span>
            </button>

            <button
              onClick={() => setViewMode('catalog')}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              title="Abrir vista previa del cliente"
            >
              <ExternalLink className="w-4 h-4 text-amber-700" />
              <span>Abrir Tienda</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Top 4 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Ventas del Día */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-400/50 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Ventas de Hoy</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-950 border border-blue-100">
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-blue-950">
                S/. {todayStats.todayRevenue.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{todayStats.todayCount} comprobantes</span>
            <span className="font-mono text-amber-700 font-bold">Ticket prom: S/. {todayStats.averageTicket.toFixed(1)}</span>
          </div>
        </div>

        {/* Metric 2: Utilidad Neta Real */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-400/50 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Ganancia Neta (Hoy)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-amber-700">
                S/. {todayStats.todayProfit.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Margen sobre venta</span>
            <span className="font-mono text-amber-800 font-bold">+{todayStats.marginPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Metric 3: Pedidos WhatsApp por Despachar */}
        <div 
          onClick={() => setAdminTab('orders')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-400/50 transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Pedidos WhatsApp Activos</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-200 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-blue-950">
                {todayStats.activeOrdersCount}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">
                Por cobrar: S/. {todayStats.activeOrdersValue.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-950 font-bold group-hover:text-amber-700">
            <span>Gestionar despachos</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 4: Salud de Inventario & Alertas */}
        <div 
          onClick={() => setAdminTab('inventory')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-400/50 transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Inventario & Alertas</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-700 border border-rose-200 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-blue-950">
                {todayStats.lowStockProducts.length}
              </span>
              <span className="text-xs font-semibold text-rose-700">
                ítems con stock bajo
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-950 font-bold group-hover:text-amber-700">
            <span>Valorizado: S/. {todayStats.totalInventoryValue.toFixed(0)}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* 3. Operational Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setAdminTab('pos')}
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-500/60 hover:shadow-xs transition-all text-left flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-950 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/40 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-blue-950 truncate">Caja POS</p>
            <p className="text-[10px] text-slate-400 font-medium truncate">Cobro rápido</p>
          </div>
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-500/60 hover:shadow-xs transition-all text-left flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-950 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/40 group-hover:scale-105 transition-transform">
            <Truck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-blue-950 truncate">Despachos</p>
            <p className="text-[10px] text-slate-400 font-medium truncate">Contraentrega</p>
          </div>
        </button>

        <button
          onClick={() => setAdminTab('inventory')}
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-500/60 hover:shadow-xs transition-all text-left flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-950 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/40 group-hover:scale-105 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-blue-950 truncate">Inventario</p>
            <p className="text-[10px] text-slate-400 font-medium truncate">Control stock</p>
          </div>
        </button>

        <button
          onClick={() => setAdminTab('crm')}
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-500/60 hover:shadow-xs transition-all text-left flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-950 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/40 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-blue-950 truncate">CRM Clientes</p>
            <p className="text-[10px] text-slate-400 font-medium truncate">{customers.length} en cartera</p>
          </div>
        </button>

        <button
          onClick={() => setAdminTab('ai_automation')}
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-500/60 hover:shadow-xs transition-all text-left flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 border border-emerald-500/40 group-hover:scale-105 transition-transform">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-emerald-950 truncate">IA WhatsApp</p>
            <p className="text-[10px] text-emerald-700 font-medium truncate">Bot activo</p>
          </div>
        </button>

        <button
          onClick={() => setAdminTab('reports')}
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-500/60 hover:shadow-xs transition-all text-left flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-950 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/40 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-blue-950 truncate">Reportes</p>
            <p className="text-[10px] text-slate-400 font-medium truncate">Balances/Mes</p>
          </div>
        </button>
      </div>

      {/* 4. Two-Column Live Activity & Operational Heartbeat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Live Recent Sales & Channel Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Sales Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-blue-950">
                  Últimos Movimientos de Venta
                </h3>
              </div>
              <button
                onClick={() => setAdminTab('reports')}
                className="text-xs text-blue-950 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todo el historial</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {todayStats.recentSales.length === 0 ? (
                <p className="py-6 text-center text-slate-400">No se registran ventas recientes</p>
              ) : (
                todayStats.recentSales.map((sale) => (
                  <div key={sale.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                        {sale.source === 'pos' ? 'POS' : 'WA'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {sale.customerName || 'Cliente Mostrador'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {sale.receiptNumber} · {new Date(sale.date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} · {sale.paymentMethod.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-black text-blue-950 font-mono tabular-nums text-sm">
                          S/. {sale.total.toFixed(2)}
                        </span>
                        <p className="text-[10px] text-amber-700 font-bold font-mono">
                          +S/. {sale.profit.toFixed(1)} util.
                        </p>
                      </div>

                      <button
                        onClick={() => setLastSale(sale)}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-950 bg-slate-100 hover:bg-blue-950 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Ver comprobante"
                      >
                        Ticket
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sales Distribution & Payment Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Canales de Venta */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5 uppercase tracking-wider">
                <Store className="w-3.5 h-3.5 text-amber-600" />
                <span>Canales de Venta (Hoy)</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span>Mostrador Físico (POS):</span>
                  <span className="font-bold font-mono text-blue-950">{todayStats.posCount} ventas</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span>Catálogo Digital (WhatsApp):</span>
                  <span className="font-bold font-mono text-blue-950">{todayStats.whatsappCount} pedidos</span>
                </div>

                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex mt-2">
                  <div 
                    className="bg-blue-950 h-full transition-all" 
                    style={{ width: `${todayStats.todayCount > 0 ? (todayStats.posCount / todayStats.todayCount) * 100 : 50}%` }}
                    title="Mostrador POS"
                  />
                  <div 
                    className="bg-amber-500 h-full transition-all" 
                    style={{ width: `${todayStats.todayCount > 0 ? (todayStats.whatsappCount / todayStats.todayCount) * 100 : 50}%` }}
                    title="Catálogo WhatsApp"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-950 inline-block" /> POS</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Métodos de Pago Preferidos */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5 uppercase tracking-wider">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>Recaudación Contraentrega</span>
              </h4>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Efectivo recibido:</span>
                  <span className="font-mono font-bold text-blue-950">S/. {todayStats.efectivo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Yape móvil:</span>
                  <span className="font-mono font-bold text-[#732282]">S/. {todayStats.yape.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Plin móvil:</span>
                  <span className="font-mono font-bold text-emerald-800">S/. {todayStats.plin.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right 1 Column: Urgent Restock Alerts & Active WhatsApp Orders */}
        <div className="space-y-6">
          
          {/* Urgent Stock Replenishment */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-blue-950">
                  Reposición de Stock
                </h3>
              </div>
              <button
                onClick={() => setAdminTab('inventory')}
                className="text-xs text-blue-950 hover:text-amber-700 font-bold"
              >
                Ver inventario
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {todayStats.lowStockProducts.length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                  ✓ Todos los productos tienen stock saludable
                </div>
              ) : (
                todayStats.lowStockProducts.slice(0, 4).map((prod) => (
                  <div key={prod.id} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                      <p className="text-[11px] text-amber-800 font-mono font-bold">
                        Stock: {prod.stock} / Alerta: {prod.minStockAlert} {prod.unit}
                      </p>
                    </div>

                    <button
                      onClick={() => adjustStock(prod.id, 5)}
                      className="px-2 py-1 text-[11px] font-bold text-blue-950 bg-white border border-amber-300 hover:bg-amber-100 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                      title="Agregar 5 unidades de reposición inmediata"
                    >
                      +5 unid
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Incoming WhatsApp Orders Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-blue-950">
                  Despachos WhatsApp
                </h3>
              </div>
              <button
                onClick={() => setAdminTab('orders')}
                className="text-xs text-blue-950 hover:text-amber-700 font-bold"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {todayStats.activeOrders.length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                  No hay pedidos pendientes de entrega
                </div>
              ) : (
                todayStats.activeOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-blue-950">{order.orderNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.status === 'pendiente' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-950'
                      }`}>
                        {order.status === 'pendiente' ? 'Pendiente' : 'En camino'}
                      </span>
                    </div>

                    <p className="font-bold text-slate-900 truncate">{order.customerName}</p>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{order.address}, {order.district}</span>
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-mono font-black text-blue-950">
                      <span>Cobrar:</span>
                      <span>S/. {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CRM & WhatsApp AI Summary Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                <span>CRM & Asistente IA</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Bot activo" />
            </div>

            <div className="space-y-2 text-xs">
              <div 
                onClick={() => setAdminTab('crm')}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="font-bold text-blue-950">Cartera de Clientes</p>
                  <p className="text-[10px] text-slate-500">{customers.length} caseros en Arequipa</p>
                </div>
                <Users className="w-4 h-4 text-amber-600" />
              </div>

              <div 
                onClick={() => setAdminTab('ai_automation')}
                className="p-2.5 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-xl border border-emerald-200/80 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="font-bold text-emerald-950">Bot IA: {whatsappAiConfig.botName}</p>
                  <p className="text-[10px] text-emerald-700 capitalize">Tono {whatsappAiConfig.personality.replace('_', ' ')}</p>
                </div>
                <Bot className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
          </div>

          {/* Multi-Tenant Switcher Card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-600" />
                <span>Otros Comercios SaaS</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold font-mono">
                {tenants.length} tiendas
              </span>
            </div>

            <div className="space-y-1.5">
              {tenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => switchTenant(t.id)}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    t.id === currentTenant.id
                      ? 'bg-blue-950 text-amber-300 font-bold shadow-2xs'
                      : 'bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span className="truncate pr-2">{t.name}</span>
                  <span className="text-[10px] shrink-0 font-medium opacity-80">{t.district}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

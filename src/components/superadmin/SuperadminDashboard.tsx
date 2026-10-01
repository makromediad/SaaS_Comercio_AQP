import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { AREQUIPA_DISTRICTS } from '../../data/initialData';
import { Tenant, SaaSPlan, BusinessCategory, TenantStatus, ArequipaDistrict } from '../../types';
import { 
  ShieldCheck, 
  Building2, 
  Store, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  Power, 
  PowerOff, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  Bot, 
  ChevronRight, 
  Eye, 
  AlertTriangle,
  ArrowRight,
  Crown,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  X
} from 'lucide-react';

export const SuperadminDashboard: React.FC = () => {
  const { 
    tenants, 
    currentTenant, 
    switchTenant, 
    createTenant, 
    updateTenant, 
    deleteTenant, 
    toggleTenantStatus,
    allProducts, 
    allSales, 
    allOrders, 
    allCustomers, 
    setViewMode, 
    setAdminTab,
    getTenantCatalogUrl,
    showNotification 
  } = useStore();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | TenantStatus>('todos');
  const [planFilter, setPlanFilter] = useState<'todos' | SaaSPlan>('todos');
  const [districtFilter, setDistrictFilter] = useState<string>('todos');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenantId, setDeletingTenantId] = useState<string | null>(null);

  // Copied link feedback
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Global SaaS Platform Metrics
  const globalMetrics = useMemo(() => {
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter((t) => t.active !== false && t.status !== 'suspendido').length;
    const trialTenants = tenants.filter((t) => t.status === 'prueba').length;
    const suspendedTenants = tenants.filter((t) => t.active === false || t.status === 'suspendido').length;

    // Gross Merchandise Value (GMV): sum of all sales + orders across all companies
    const totalSalesGmv = allSales.reduce((acc, s) => acc + (s.total || 0), 0);
    const totalOrdersGmv = allOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const gmv = totalSalesGmv + totalOrdersGmv;

    // Total operations count
    const totalOperations = allSales.length + allOrders.length;

    // Total final customers registered in all CRMs
    const totalClients = allCustomers.length;

    // Total catalog products across the entire platform
    const totalCatalogProducts = allProducts.length;

    // Estimated Monthly Recurring Revenue (MRR) from SaaS subscriptions
    const mrr = tenants.reduce((acc, t) => {
      if (t.active === false || t.status === 'suspendido') return acc;
      if (t.monthlyFee) return acc + t.monthlyFee;
      if (t.plan === 'pro_ia') return acc + 149;
      if (t.plan === 'emprendedor') return acc + 89;
      return acc + 49; // basico
    }, 0);

    // Distribution by Plan
    const plansCount = {
      pro_ia: tenants.filter((t) => t.plan === 'pro_ia').length,
      emprendedor: tenants.filter((t) => t.plan === 'emprendedor').length,
      basico: tenants.filter((t) => !t.plan || t.plan === 'basico').length
    };

    // Distribution by District
    const districtsCount: Record<string, number> = {};
    tenants.forEach((t) => {
      districtsCount[t.district] = (districtsCount[t.district] || 0) + 1;
    });

    return {
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
      gmv,
      totalOperations,
      totalClients,
      totalCatalogProducts,
      mrr,
      plansCount,
      districtsCount
    };
  }, [tenants, allSales, allOrders, allCustomers, allProducts]);

  // Compute live statistics for a specific tenant
  const getCompanyStats = (tenantId: string) => {
    const companySales = allSales.filter((s) => s.tenantId === tenantId);
    const companyOrders = allOrders.filter((o) => o.tenantId === tenantId);
    const companyProducts = allProducts.filter((p) => p.tenantId === tenantId);
    const companyCustomers = allCustomers.filter((c) => c.tenantId === tenantId);

    const totalRevenue = 
      companySales.reduce((sum, s) => sum + s.total, 0) + 
      companyOrders.reduce((sum, o) => sum + o.total, 0);

    return {
      totalRevenue,
      salesCount: companySales.length,
      ordersCount: companyOrders.length,
      productsCount: companyProducts.length,
      customersCount: companyCustomers.length
    };
  };

  // Filtered tenants list
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchesSearch = 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.ruc && t.ruc.includes(searchTerm)) ||
        t.whatsappNumber.includes(searchTerm) ||
        t.district.toLowerCase().includes(searchTerm.toLowerCase());

      const tenantEffectiveStatus = t.status || (t.active ? 'activo' : 'suspendido');
      const matchesStatus = statusFilter === 'todos' || tenantEffectiveStatus === statusFilter;

      const tenantEffectivePlan = t.plan || 'basico';
      const matchesPlan = planFilter === 'todos' || tenantEffectivePlan === planFilter;

      const matchesDistrict = districtFilter === 'todos' || t.district === districtFilter;

      return matchesSearch && matchesStatus && matchesPlan && matchesDistrict;
    });
  }, [tenants, searchTerm, statusFilter, planFilter, districtFilter]);

  const handleCopyLink = (slug: string) => {
    const url = getTenantCatalogUrl(slug);
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    showNotification(`Link público copiado: ${url}`, 'success');
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleEnterCompanyAsAdmin = (tenantId: string) => {
    switchTenant(tenantId);
    setViewMode('admin');
    setAdminTab('dashboard');
    showNotification(`Iniciando sesión como administrador en: ${tenants.find(t => t.id === tenantId)?.name}`, 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* 1. Executive Top Hero for Superadmin */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white p-6 sm:p-8 shadow-xl border border-amber-500/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Consola Master · Superusuario SaaS MitraPOS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              Administración Central de Empresas
              <Crown className="w-6 h-6 text-amber-400 shrink-0" />
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Gestión multi-empresa para la ciudad de Arequipa. Registra nuevos clientes corporativos, configura planes de suscripción con IA, monitorea el volumen transaccional (GMV) y administra el acceso a catálogos en línea.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-blue-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer active:scale-95 border border-amber-300"
            >
              <Plus className="w-4 h-4 text-blue-950" />
              <span>+ Registrar Nueva Empresa</span>
            </button>

            <button
              onClick={() => {
                setViewMode('admin');
                setAdminTab('dashboard');
              }}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95 backdrop-blur-xs"
              title="Volver a la vista del comerciante activo"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>Tienda Activa: {currentTenant.name.split(' ')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Global SaaS KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Total Empresas */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Empresas Registradas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center border border-blue-200">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-950">{globalMetrics.totalTenants}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {globalMetrics.activeTenants} activas
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2 font-medium">
            <span>{globalMetrics.trialTenants} en prueba</span>
            <span>·</span>
            <span>{globalMetrics.suspendedTenants} pausadas</span>
          </div>
        </div>

        {/* Metric 2: Global GMV (Ventas Totales Plataforma) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Volumen Global (GMV)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-blue-950">
              S/. {globalMetrics.gmv.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">
            Transaccionado en POS y WhatsApp
          </p>
        </div>

        {/* Metric 3: Estimated SaaS MRR */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">MRR Suscripciones</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-700">
              S/. {globalMetrics.mrr.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">
            Ingreso recurrente mensual SaaS
          </p>
        </div>

        {/* Metric 4: Global Operations */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Operaciones Procesadas</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-950">{globalMetrics.totalOperations}</span>
            <span className="text-xs text-slate-500 font-medium">órdenes</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">
            {allSales.length} en mostrador · {allOrders.length} WhatsApp
          </p>
        </div>

        {/* Metric 5: Customers Reached in Arequipa */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Clientes en CRM</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-950">{globalMetrics.totalClients}</span>
            <span className="text-xs text-slate-500 font-medium">compradores</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">
            Registrados en bodegas de Arequipa
          </p>
        </div>

      </div>

      {/* 3. Breakdown Insights: Subscription Plans & Districts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Plans Distribution Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Distribución por Planes de Suscripción</span>
            </h3>
            <span className="text-xs font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {tenants.length} empresas
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-amber-600" />
                  <strong>Plan Pro con IA WhatsApp</strong> (S/. 149/mes)
                </span>
                <span className="text-blue-950 font-bold">{globalMetrics.plansCount.pro_ia} empresas</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(globalMetrics.plansCount.pro_ia / Math.max(tenants.length, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                  <strong>Plan Emprendedor</strong> (S/. 89/mes)
                </span>
                <span className="text-blue-950 font-bold">{globalMetrics.plansCount.emprendedor} empresas</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-800 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(globalMetrics.plansCount.emprendedor / Math.max(tenants.length, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-slate-500" />
                  <strong>Plan Básico POS</strong> (S/. 49/mes)
                </span>
                <span className="text-blue-950 font-bold">{globalMetrics.plansCount.basico} empresas</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-slate-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(globalMetrics.plansCount.basico / Math.max(tenants.length, 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* District Coverage in Arequipa */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Presencia por Distritos en Arequipa</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {Object.keys(globalMetrics.districtsCount).length} distritos con comercios
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(globalMetrics.districtsCount).map(([district, count]) => (
              <div 
                key={district}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2 hover:border-amber-400 transition-colors"
              >
                <span>{district}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-950 text-white font-bold text-[10px]">
                  {count}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tarifa promedio de delivery: <strong>S/. 5.00</strong></span>
            <span className="text-emerald-700 font-bold">Cobertura activa en Arequipa</span>
          </div>
        </div>

      </div>

      {/* 4. Filter and Action Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre de empresa, RUC, dueño, WhatsApp o distrito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-950 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-950"
            >
              <option value="todos">Todos los Estados</option>
              <option value="activo">Solo Activas</option>
              <option value="prueba">En Periodo de Prueba</option>
              <option value="suspendido">Suspendidas / Inactivas</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-950"
            >
              <option value="todos">Todos los Planes</option>
              <option value="pro_ia">Plan Pro con IA WhatsApp</option>
              <option value="emprendedor">Plan Emprendedor</option>
              <option value="basico">Plan Básico POS</option>
            </select>

            {/* District Filter */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-950"
            >
              <option value="todos">Todos los Distritos</option>
              {AREQUIPA_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Mostrando <strong>{filteredTenants.length}</strong> de <strong>{tenants.length}</strong> empresas registradas</span>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Comercios 100% operativos con URL independiente</span>
          </div>
        </div>
      </div>

      {/* 5. Directory & Management Table of Companies */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/90 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-blue-950" />
            <h2 className="text-sm font-extrabold text-blue-950 tracking-tight">
              Directorio de Empresas y Clientes SaaS
            </h2>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/40"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Nueva Empresa</span>
          </button>
        </div>

        {filteredTenants.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Building2 className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-800 text-sm">No se encontraron empresas con los filtros aplicados</h3>
            <p className="text-xs text-slate-500">Prueba ajustando el término de búsqueda o los filtros de distrito y estado.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
                setPlanFilter('todos');
                setDistrictFilter('todos');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/80">
            {filteredTenants.map((tenant) => {
              const stats = getCompanyStats(tenant.id);
              const isCurrent = tenant.id === currentTenant.id;
              const effectiveStatus = tenant.status || (tenant.active ? 'activo' : 'suspendido');
              const effectivePlan = tenant.plan || 'basico';
              const publicUrl = getTenantCatalogUrl(tenant.slug);

              return (
                <div 
                  key={tenant.id} 
                  className={`p-5 sm:p-6 transition-all hover:bg-slate-50/70 ${
                    isCurrent ? 'bg-amber-50/20 border-l-4 border-amber-500' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Company Info Left */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-blue-950 flex items-center gap-2">
                          {tenant.name}
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-400 text-blue-950 border border-amber-500/50">
                              Activa en Sesión
                            </span>
                          )}
                        </h3>

                        {/* Status Badge */}
                        {effectiveStatus === 'activo' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Activa
                          </span>
                        )}
                        {effectiveStatus === 'prueba' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            En Prueba (Trial)
                          </span>
                        )}
                        {effectiveStatus === 'suspendido' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Suspendida
                          </span>
                        )}

                        {/* Plan Badge */}
                        {effectivePlan === 'pro_ia' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-400/20 text-amber-800 border border-amber-400/60">
                            <Bot className="w-3 h-3 text-amber-700" />
                            Plan Pro IA (S/. 149/m)
                          </span>
                        )}
                        {effectivePlan === 'emprendedor' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                            <TrendingUp className="w-3 h-3 text-blue-700" />
                            Emprendedor (S/. 89/m)
                          </span>
                        )}
                        {effectivePlan === 'basico' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Store className="w-3 h-3 text-slate-600" />
                            Básico POS (S/. 49/m)
                          </span>
                        )}
                      </div>

                      {/* Details row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{tenant.district}</span>
                          <span className="text-slate-400 truncate">({tenant.address})</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                          <span>Dueño: <strong className="text-slate-800">{tenant.ownerName}</strong></span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>WhatsApp: </span>
                          <a 
                            href={`https://wa.me/${tenant.whatsappNumber}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-bold text-emerald-700 hover:underline"
                          >
                            +{tenant.whatsappNumber}
                          </a>
                        </div>
                      </div>

                      {tenant.ruc && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>RUC: <strong className="text-slate-700 font-mono">{tenant.ruc}</strong></span>
                          <span>·</span>
                          <span>Slug oficial: <strong className="text-blue-950 font-mono">/tienda={tenant.slug}</strong></span>
                          {tenant.ownerEmail && (
                            <>
                              <span>·</span>
                              <span>Email: <strong className="text-slate-700">{tenant.ownerEmail}</strong></span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Live metrics strip */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        <div className="px-2.5 py-1 bg-slate-100/90 rounded-md font-semibold text-slate-800 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                          <span>Ventas: <strong>S/. {stats.totalRevenue.toFixed(2)}</strong></span>
                        </div>
                        <div className="px-2.5 py-1 bg-slate-100/90 rounded-md font-semibold text-slate-800 flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-blue-900" />
                          <span>Transacciones: <strong>{stats.salesCount + stats.ordersCount}</strong></span>
                        </div>
                        <div className="px-2.5 py-1 bg-slate-100/90 rounded-md font-semibold text-slate-800 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-purple-700" />
                          <span>Productos: <strong>{stats.productsCount}</strong></span>
                        </div>
                        <div className="px-2.5 py-1 bg-slate-100/90 rounded-md font-semibold text-slate-800 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-indigo-700" />
                          <span>Clientes CRM: <strong>{stats.customersCount}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Right */}
                    <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      
                      {/* Enter store as Admin */}
                      <button
                        onClick={() => handleEnterCompanyAsAdmin(tenant.id)}
                        className="px-3.5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer border border-amber-500/40 active:scale-95"
                        title="Iniciar sesión directamente en el panel de esta empresa"
                      >
                        <Store className="w-3.5 h-3.5 text-amber-400" />
                        <span>Gestionar Tienda</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </button>

                      {/* Public Catalog Link actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyLink(tenant.slug)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                          title="Copiar URL del catálogo público para clientes"
                        >
                          {copiedSlug === tenant.slug ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Link Cliente</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            switchTenant(tenant.id);
                            setViewMode('catalog');
                          }}
                          className="p-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-blue-950 border border-amber-400/50 transition-colors cursor-pointer"
                          title="Ver cómo ve el cliente el catálogo web"
                        >
                          <ExternalLink className="w-4 h-4 text-amber-700" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingTenant(tenant)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                          title="Editar datos de la empresa y plan"
                        >
                          <Edit3 className="w-4 h-4 text-slate-600" />
                        </button>

                        {/* Toggle Status */}
                        <button
                          onClick={() => toggleTenantStatus(tenant.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            tenant.active 
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' 
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                          }`}
                          title={tenant.active ? 'Suspender comercio' : 'Activar comercio'}
                        >
                          {tenant.active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingTenantId(tenant.id)}
                          disabled={tenants.length <= 1}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title={tenants.length <= 1 ? 'No se puede eliminar el único comercio' : 'Eliminar empresa'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Modal: Create New Tenant (SaaS Enterprise Onboarding) */}
      {isCreateModalOpen && (
        <CreateCompanyModal 
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={(tenantData, seedProducts) => {
            createTenant(tenantData, seedProducts);
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {/* 7. Modal: Edit Existing Tenant */}
      {editingTenant && (
        <EditCompanyModal 
          tenant={editingTenant}
          onClose={() => setEditingTenant(null)}
          onSave={(updated) => {
            updateTenant(updated);
            setEditingTenant(null);
          }}
        />
      )}

      {/* 8. Confirmation Modal: Delete Tenant */}
      {deletingTenantId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-rose-300 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-extrabold text-base text-slate-900">¿Eliminar empresa del sistema?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Esta acción eliminará a <strong>{tenants.find(t => t.id === deletingTenantId)?.name}</strong> de la plataforma SaaS. Si esta tienda tiene ventas o productos registrados, se desvinculará del panel.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingTenantId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteTenant(deletingTenantId);
                  setDeletingTenantId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Sí, Eliminar Empresa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

/* =========================================================================
   SUB-COMPONENT: CreateCompanyModal
   ========================================================================= */
interface CreateCompanyModalProps {
  onClose: () => void;
  onCreate: (tenantData: Omit<Tenant, 'id' | 'createdAt'>, seedProducts: boolean) => void;
}

const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [ruc, setRuc] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [district, setDistrict] = useState<ArequipaDistrict>('Yanahuara');
  const [address, setAddress] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('51954');
  const [yapePhone, setYapePhone] = useState('954');
  const [category, setCategory] = useState<BusinessCategory>('bodega');
  const [plan, setPlan] = useState<SaaSPlan>('pro_ia');
  const [tagline, setTagline] = useState('');
  const [seedDemoProducts, setSeedDemoProducts] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const monthlyFee = plan === 'pro_ia' ? 149 : plan === 'emprendedor' ? 89 : 49;

    onCreate({
      name,
      slug,
      tagline: tagline || `Atención de primera y productos selectos en ${district}, Arequipa`,
      district,
      address: address || `Calle Principal 123, ${district}, Arequipa`,
      whatsappNumber: whatsappNumber.replace(/\D/g, ''),
      yapePhone: yapePhone || whatsappNumber.slice(-9),
      plinPhone: yapePhone || whatsappNumber.slice(-9),
      ownerName: ownerName || 'Emprendedor Arequipeño',
      ownerEmail,
      ruc,
      plan,
      businessCategory: category,
      status: 'activo',
      monthlyFee,
      bannerImage: '/src/assets/images/hero_arequipa_market_1790861630483.jpg',
      currency: 'S/.',
      defaultDeliveryFee: 5.0,
      freeDeliveryThreshold: 50.0,
      deliveryCoverage: [district, 'Cercado de Arequipa', 'Yanahuara', 'Cayma'],
      active: true
    }, seedDemoProducts);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-amber-500/40 my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between border-b border-amber-500/40">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">
                Registrar Nueva Empresa / Cliente SaaS
              </h2>
              <p className="text-[11px] text-amber-200/80">
                Alta de negocio comercial en la plataforma MitraPOS Arequipa
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: General Company Data */}
          <div>
            <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-600" />
              <span>1. Identificación Comercial y RUC</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Comercial / Tienda *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Bodega Santa Rosa, Minimarket Majes..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">RUC (Opcional - 11 dígitos)</label>
                <input
                  type="text"
                  maxLength={11}
                  placeholder="Ej. 20601234567"
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Categoría del Negocio</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium"
                >
                  <option value="bodega">Bodega & Abarrotes</option>
                  <option value="minimarket">Minimarket & Tienda de Conveniencia</option>
                  <option value="panaderia">Panadería & Pastelería</option>
                  <option value="licoreria">Licorería & Snacks</option>
                  <option value="artesania">Artesanías & Chocolates Típicos</option>
                  <option value="botica">Botica & Farmacia</option>
                  <option value="restaurante">Restaurante & Cafetería</option>
                  <option value="otro">Otro Comercio</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Eslogan o Frase Promocional</label>
                <input
                  type="text"
                  placeholder="Ej. La mejor atención y productos frescos en Yanahuara"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact and Location */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>2. Ubicación en Arequipa y Contacto</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Distrito en Arequipa *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value as ArequipaDistrict)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium"
                >
                  {AREQUIPA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dirección Exacta</label>
                <input
                  type="text"
                  placeholder="Ej. Av. Cayma 450, Urb. La Campiña"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Propietario / Administrador</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Valdivia"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Correo Electrónico de Contacto</label>
                <input
                  type="email"
                  placeholder="contacto@empresa.pe"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">WhatsApp de Pedidos * (Código 51)</label>
                <input
                  type="text"
                  required
                  placeholder="51954123456"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-mono font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teléfono para Yape / Plin</label>
                <input
                  type="text"
                  placeholder="954 123 456"
                  value={yapePhone}
                  onChange={(e) => setYapePhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-mono font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: SaaS Subscription Plan */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>3. Plan SaaS Asignado a la Empresa</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Básico */}
              <div 
                onClick={() => setPlan('basico')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  plan === 'basico' 
                    ? 'border-blue-950 bg-blue-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-blue-950 text-xs">Plan Básico</span>
                  <input type="radio" checked={plan === 'basico'} onChange={() => setPlan('basico')} />
                </div>
                <div className="text-base font-black text-slate-800">S/. 49<span className="text-[10px] font-normal text-slate-500">/mes</span></div>
                <p className="text-[10px] text-slate-500 mt-1">
                  POS mostrador + Catálogo web público con link para clientes.
                </p>
              </div>

              {/* Option 2: Emprendedor */}
              <div 
                onClick={() => setPlan('emprendedor')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  plan === 'emprendedor' 
                    ? 'border-blue-950 bg-blue-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-blue-950 text-xs">Emprendedor</span>
                  <input type="radio" checked={plan === 'emprendedor'} onChange={() => setPlan('emprendedor')} />
                </div>
                <div className="text-base font-black text-blue-900">S/. 89<span className="text-[10px] font-normal text-slate-500">/mes</span></div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Todo Básico + CRM de Clientes, Reportes Avanzados y Control de Stock.
                </p>
              </div>

              {/* Option 3: Pro IA */}
              <div 
                onClick={() => setPlan('pro_ia')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all relative ${
                  plan === 'pro_ia' 
                    ? 'border-amber-500 bg-amber-50/40 shadow-xs' 
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                <span className="absolute -top-2 right-2 text-[9px] font-black uppercase bg-amber-400 text-blue-950 px-1.5 py-0.2 rounded-full border border-amber-500">
                  Recomendado
                </span>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-blue-950 text-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Pro con IA
                  </span>
                  <input type="radio" checked={plan === 'pro_ia'} onChange={() => setPlan('pro_ia')} />
                </div>
                <div className="text-base font-black text-amber-700">S/. 149<span className="text-[10px] font-normal text-slate-500">/mes</span></div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Todo + Automatización WhatsApp con IA Gemini, Respuestas automáticas y análisis.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Seed starter catalog */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="space-y-0.5">
              <label className="font-bold text-slate-800 text-xs block cursor-pointer" htmlFor="seed-demo">
                Inicializar catálogo con productos tradicionales de Arequipa
              </label>
              <p className="text-[11px] text-slate-500">
                Carga automáticamente Queso Paria, Pan de Tres Puntas y Chocolates para pruebas inmediatas.
              </p>
            </div>
            <input
              id="seed-demo"
              type="checkbox"
              checked={seedDemoProducts}
              onChange={(e) => setSeedDemoProducts(e.target.checked)}
              className="w-4 h-4 text-blue-950 rounded cursor-pointer"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-blue-950 font-black rounded-xl shadow-md transition-all cursor-pointer border border-amber-300 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-950" />
              <span>Crear Empresa y Generar Acceso</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

/* =========================================================================
   SUB-COMPONENT: EditCompanyModal
   ========================================================================= */
interface EditCompanyModalProps {
  tenant: Tenant;
  onClose: () => void;
  onSave: (updatedTenant: Tenant) => void;
}

const EditCompanyModal: React.FC<EditCompanyModalProps> = ({ tenant, onClose, onSave }) => {
  const [name, setName] = useState(tenant.name);
  const [ruc, setRuc] = useState(tenant.ruc || '');
  const [ownerName, setOwnerName] = useState(tenant.ownerName);
  const [ownerEmail, setOwnerEmail] = useState(tenant.ownerEmail || '');
  const [district, setDistrict] = useState<ArequipaDistrict>(tenant.district);
  const [address, setAddress] = useState(tenant.address);
  const [whatsappNumber, setWhatsappNumber] = useState(tenant.whatsappNumber);
  const [yapePhone, setYapePhone] = useState(tenant.yapePhone || '');
  const [plan, setPlan] = useState<SaaSPlan>(tenant.plan || 'pro_ia');
  const [status, setStatus] = useState<TenantStatus>(tenant.status || (tenant.active ? 'activo' : 'suspendido'));
  const [category, setCategory] = useState<BusinessCategory>(tenant.businessCategory || 'bodega');
  const [tagline, setTagline] = useState(tenant.tagline);
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState(tenant.defaultDeliveryFee || 5.0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const monthlyFee = plan === 'pro_ia' ? 149 : plan === 'emprendedor' ? 89 : 49;

    onSave({
      ...tenant,
      name,
      ruc,
      ownerName,
      ownerEmail,
      district,
      address,
      whatsappNumber: whatsappNumber.replace(/\D/g, ''),
      yapePhone,
      plinPhone: yapePhone,
      plan,
      status,
      businessCategory: category,
      tagline,
      defaultDeliveryFee: Number(defaultDeliveryFee),
      monthlyFee,
      active: status !== 'suspendido'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-300 my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between border-b border-amber-500/40">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white">
              Editar Datos de la Empresa: {tenant.name}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nombre Comercial *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-950"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">RUC</label>
              <input
                type="text"
                maxLength={11}
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-blue-950"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Estado de la Cuenta</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TenantStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="activo">Activo (Operativo)</option>
                <option value="prueba">En Periodo de Prueba (Trial)</option>
                <option value="suspendido">Suspendido / Pausado</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Plan SaaS</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as SaaSPlan)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="basico">Plan Básico (S/. 49/mes)</option>
                <option value="emprendedor">Plan Emprendedor (S/. 89/mes)</option>
                <option value="pro_ia">Plan Pro con IA WhatsApp (S/. 149/mes)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Distrito en Arequipa</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value as ArequipaDistrict)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {AREQUIPA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Dirección Exacta</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Dueño / Representante</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email de Contacto</label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">WhatsApp de Pedidos</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Teléfono Yape / Plin</label>
              <input
                type="text"
                value={yapePhone}
                onChange={(e) => setYapePhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Eslogan o Descripción Comercial</label>
            <textarea
              rows={2}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl cursor-pointer shadow-xs border border-amber-500/40"
            >
              Guardar Cambios
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

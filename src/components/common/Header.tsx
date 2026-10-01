import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/store';
import { 
  Store, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Plus, 
  Check, 
  ChevronDown,
  ExternalLink,
  Store as StoreIcon,
  MapPin,
  Crown,
  LayoutDashboard,
  Share2
} from 'lucide-react';

interface HeaderProps {
  onOpenNewTenantModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTenantModal }) => {
  const { 
    tenants, 
    currentTenant, 
    switchTenant, 
    viewMode, 
    setViewMode, 
    adminTab, 
    setAdminTab,
    orders,
    setIsShareModalOpen
  } = useStore();

  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTenantDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pendiente' || o.status === 'en_camino').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setViewMode('admin'); setAdminTab('dashboard'); }}
            className="text-left group cursor-pointer focus-visible:outline-none flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex items-center justify-center shadow-xs border border-amber-500/40">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-blue-950 group-hover:text-blue-900 transition-colors">
              Mitra<span className="text-amber-600 font-black">POS</span>
            </span>
          </button>

          {/* Tenant Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100/90 rounded-lg transition-all cursor-pointer border border-slate-200 hover:border-amber-400/60 max-w-[230px] shadow-2xs"
              title="Cambiar comercio en Arequipa"
            >
              <StoreIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{currentTenant.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-auto" />
            </button>

            {tenantDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-sm">
                <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Comercios Registrados en Arequipa
                  </p>
                  <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                    SaaS Multi-tenant: {currentTenant.district}
                  </p>
                </div>

                <div className="max-h-60 overflow-y-auto py-1">
                  {tenants.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        switchTenant(t.id);
                        setTenantDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-blue-50/60 transition-colors cursor-pointer ${
                        t.id === currentTenant.id ? 'bg-blue-50 font-bold text-blue-950 border-l-3 border-amber-500' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{t.name}</div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          <span>{t.district}</span>
                        </div>
                      </div>
                      {t.id === currentTenant.id && (
                        <Check className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 p-2 bg-slate-50/40 rounded-b-xl">
                  <button
                    onClick={() => {
                      setTenantDropdownOpen(false);
                      onOpenNewTenantModal();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-950 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-700" />
                    <span>Registrar Nuevo Comercio</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        {viewMode === 'admin' ? (
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setAdminTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                adminTab === 'dashboard'
                  ? 'bg-blue-950 text-white font-bold shadow-xs border border-amber-500/30'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${adminTab === 'dashboard' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setAdminTab('pos')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                adminTab === 'pos'
                  ? 'bg-blue-950 text-white font-bold shadow-xs border border-amber-500/30'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
              }`}
            >
              <ShoppingCart className={`w-4 h-4 ${adminTab === 'pos' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Punto de Venta</span>
            </button>

            <button
              onClick={() => setAdminTab('inventory')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                adminTab === 'inventory'
                  ? 'bg-blue-950 text-white font-bold shadow-xs border border-amber-500/30'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
              }`}
            >
              <Package className={`w-4 h-4 ${adminTab === 'inventory' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Inventario</span>
            </button>

            <button
              onClick={() => setAdminTab('reports')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                adminTab === 'reports'
                  ? 'bg-blue-950 text-white font-bold shadow-xs border border-amber-500/30'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${adminTab === 'reports' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Reportes</span>
            </button>

            <button
              onClick={() => setAdminTab('orders')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 relative ${
                adminTab === 'orders'
                  ? 'bg-blue-950 text-white font-bold shadow-xs border border-amber-500/30'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${adminTab === 'orders' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Pedidos WhatsApp</span>
              {pendingOrdersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" title={`${pendingOrdersCount} pedidos activos`} />
              )}
            </button>

            <button
              onClick={() => setAdminTab('settings')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                adminTab === 'settings'
                  ? 'bg-blue-950 text-white font-bold shadow-xs border border-amber-500/30'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
              }`}
            >
              <Settings className={`w-4 h-4 ${adminTab === 'settings' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Ajustes</span>
            </button>
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="text-blue-950 font-bold">Catálogo Digital Oficial</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Distrito: <strong className="text-slate-700">{currentTenant.district}</strong></span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-amber-800 font-semibold">Pago Contraentrega en Arequipa</span>
          </div>
        )}

        {/* Zone 3: Primary action buttons */}
        <div className="flex items-center gap-2">
          {/* Share Catalog Link Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-3 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs hover:border-amber-400"
            title="Compartir link del catálogo y código QR con clientes"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Link Clientes</span>
          </button>

          {viewMode === 'admin' ? (
            <button
              onClick={() => setViewMode('catalog')}
              className="px-3.5 py-2 text-xs font-bold text-blue-950 bg-gradient-to-r from-amber-400/20 to-amber-300/30 hover:from-amber-400/30 hover:to-amber-300/40 border border-amber-400/70 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
              title="Abrir el catálogo digital público de esta tienda"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
              <span>Ver Catálogo</span>
            </button>
          ) : (
            <button
              onClick={() => setViewMode('admin')}
              className="px-3.5 py-2 text-xs font-bold text-white bg-blue-950 hover:bg-blue-900 border border-amber-500/40 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm active:scale-[0.99]"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Panel Comerciante</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile navigation tab bar for admin */}
      {viewMode === 'admin' && (
        <div className="md:hidden border-t border-slate-200/80 px-4 py-2 flex items-center justify-between overflow-x-auto text-xs bg-slate-50/80">
          <button
            onClick={() => setAdminTab('dashboard')}
            className={`px-2.5 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              adminTab === 'dashboard' ? 'bg-blue-950 text-white' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setAdminTab('pos')}
            className={`px-2.5 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              adminTab === 'pos' ? 'bg-blue-950 text-white' : 'text-slate-600'
            }`}
          >
            POS
          </button>
          <button
            onClick={() => setAdminTab('inventory')}
            className={`px-2.5 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              adminTab === 'inventory' ? 'bg-blue-950 text-white' : 'text-slate-600'
            }`}
          >
            Inventario
          </button>
          <button
            onClick={() => setAdminTab('reports')}
            className={`px-2.5 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              adminTab === 'reports' ? 'bg-blue-950 text-white' : 'text-slate-600'
            }`}
          >
            Reportes
          </button>
          <button
            onClick={() => setAdminTab('orders')}
            className={`px-2.5 py-1.5 rounded-md font-semibold whitespace-nowrap flex items-center gap-1 ${
              adminTab === 'orders' ? 'bg-blue-950 text-white' : 'text-slate-600'
            }`}
          >
            <span>WhatsApp</span>
            {pendingOrdersCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </button>
          <button
            onClick={() => setAdminTab('settings')}
            className={`px-2.5 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              adminTab === 'settings' ? 'bg-blue-950 text-white' : 'text-slate-600'
            }`}
          >
            Ajustes
          </button>
        </div>
      )}
    </header>
  );
};




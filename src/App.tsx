/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { PointOfSale } from './components/pos/PointOfSale';
import { InventoryManager } from './components/inventory/InventoryManager';
import { ReportsView } from './components/reports/ReportsView';
import { WhatsAppOrders } from './components/orders/WhatsAppOrders';
import { CustomerCRM } from './components/crm/CustomerCRM';
import { WhatsAppAIHub } from './components/automation/WhatsAppAIHub';
import { DigitalCatalog } from './components/catalog/DigitalCatalog';
import { TenantSettings } from './components/tenant/TenantSettings';
import { SuperadminDashboard } from './components/superadmin/SuperadminDashboard';
import { ReceiptModal } from './components/pos/ReceiptModal';
import { NewTenantModal } from './components/tenant/NewTenantModal';
import { ShareCatalogModal } from './components/catalog/ShareCatalogModal';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

const MainApp: React.FC = () => {
  const { 
    viewMode, 
    adminTab, 
    lastSale, 
    setLastSale, 
    currentTenant, 
    notification 
  } = useStore();

  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* Top Header Contract */}
      <Header onOpenNewTenantModal={() => setIsNewTenantModalOpen(true)} />

      {/* Main View Area */}
      <main className="flex-1">
        {viewMode === 'catalog' ? (
          <DigitalCatalog />
        ) : viewMode === 'superadmin' ? (
          <SuperadminDashboard />
        ) : (
          <div>
            {adminTab === 'dashboard' && <ExecutiveDashboard />}
            {adminTab === 'pos' && <PointOfSale />}
            {adminTab === 'inventory' && <InventoryManager />}
            {adminTab === 'reports' && <ReportsView />}
            {adminTab === 'orders' && <WhatsAppOrders />}
            {adminTab === 'crm' && <CustomerCRM />}
            {adminTab === 'ai_automation' && <WhatsAppAIHub />}
            {adminTab === 'settings' && <TenantSettings />}
          </div>
        )}
      </main>

      {/* Printable Thermal Receipt Modal */}
      {lastSale && (
        <ReceiptModal
          sale={lastSale}
          tenant={currentTenant}
          onClose={() => setLastSale(null)}
        />
      )}

      {/* New Tenant Creation Modal */}
      <NewTenantModal
        isOpen={isNewTenantModalOpen}
        onClose={() => setIsNewTenantModalOpen(false)}
      />

      {/* Public Catalog Link & QR Share Modal */}
      <ShareCatalogModal />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-950 to-blue-900 text-white rounded-xl shadow-2xl text-xs border border-amber-500/50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
          {notification.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
          {notification.type === 'info' && <Info className="w-4 h-4 text-blue-300 shrink-0" />}
          <span className="font-semibold text-slate-100">{notification.message}</span>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}

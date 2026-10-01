import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Customer, CustomerTag, ArequipaDistrict } from '../../types';
import { AREQUIPA_DISTRICTS } from '../../data/initialData';
import { 
  Users, 
  Search, 
  Plus, 
  MessageCircle, 
  MapPin, 
  Phone, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  Star, 
  Tag, 
  Sparkles, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Crown, 
  Send, 
  Copy, 
  BrainCircuit, 
  HeartHandshake, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText
} from 'lucide-react';

export const CustomerCRM: React.FC = () => {
  const { 
    currentTenant, 
    customers, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    generateCustomerAiInsight,
    sales,
    showNotification
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('todos');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('todos');
  
  // Selected customer for detail drawer
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // New / Edit Customer Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    dni: string;
    district: ArequipaDistrict;
    address: string;
    reference: string;
    tag: CustomerTag;
    notes: string;
  }>({
    name: '',
    phone: '',
    dni: '',
    district: currentTenant.district,
    address: '',
    reference: '',
    tag: 'nuevo',
    notes: ''
  });

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        (c.dni && c.dni.includes(searchTerm));
      const matchTag = selectedTag === 'todos' || c.tag === selectedTag;
      const matchDistrict = selectedDistrict === 'todos' || c.district === selectedDistrict;
      return matchSearch && matchTag && matchDistrict;
    });
  }, [customers, searchTerm, selectedTag, selectedDistrict]);

  // Aggregate CRM KPIs
  const stats = useMemo(() => {
    const total = customers.length;
    const vips = customers.filter((c) => c.tag === 'vip').length;
    const frecuentes = customers.filter((c) => c.tag === 'frecuente').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgSpent = total > 0 ? totalRevenue / total : 0;
    const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);

    return {
      total,
      vips,
      frecuentes,
      totalRevenue,
      avgSpent,
      totalOrders
    };
  }, [customers]);

  const tagBadge = (tag: CustomerTag) => {
    const map: Record<CustomerTag, { label: string; bg: string; text: string; border: string }> = {
      vip: { label: 'Cliente VIP', bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
      frecuente: { label: 'Frecuente', bg: 'bg-blue-100', text: 'text-blue-950', border: 'border-blue-300' },
      nuevo: { label: 'Nuevo', bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
      ocasional: { label: 'Ocasional', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
      inactivo: { label: 'Inactivo', bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' }
    };
    const t = map[tag] || map.nuevo;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${t.bg} ${t.text} ${t.border}`}>
        {t.label}
      </span>
    );
  };

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '954',
      dni: '',
      district: currentTenant.district,
      address: '',
      reference: '',
      tag: 'nuevo',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      phone: cust.phone,
      dni: cust.dni || '',
      district: cust.district,
      address: cust.address,
      reference: cust.reference || '',
      tag: cust.tag,
      notes: cust.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        ...formData
      });
      if (activeCustomer?.id === editingCustomer.id) {
        setActiveCustomer({ ...editingCustomer, ...formData });
      }
    } else {
      addCustomer(formData);
    }
    setIsModalOpen(false);
  };

  const handleGenerateAiInsight = async (cust: Customer) => {
    setIsGeneratingInsight(true);
    const insight = await generateCustomerAiInsight(cust.id);
    setIsGeneratingInsight(false);
    if (insight && activeCustomer?.id === cust.id) {
      setActiveCustomer((prev) => (prev ? { ...prev, aiInsights: insight } : null));
    }
  };

  const handleOpenWhatsAppChat = (cust: Customer, prefillText?: string) => {
    const clean = cust.phone.replace(/\D/g, '');
    const phoneWith51 = clean.startsWith('51') ? clean : `51${clean}`;
    const text = prefillText || `¡Hola ${cust.name}! Te saludamos de ${currentTenant.name} (${currentTenant.district}). ¿En qué podemos ayudarte hoy casero?`;
    window.open(`https://wa.me/${phoneWith51}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    showNotification('Mensaje copiado al portapapeles', 'success');
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/10 border border-blue-900/20 text-blue-950 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
            <span>CRM Clientes Arequipa · {currentTenant.name}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-950">
            Directorio & Gestión de Clientes
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Historial de compras, tickets promedio, segmentación por distritos y automatización con IA
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-indigo-950 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold cursor-pointer shadow-md transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Registrar Cliente</span>
        </button>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Clientes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-950 flex items-center justify-center border border-blue-100">
              <Users className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-blue-950 mt-3 tabular-nums">
            {stats.total}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {stats.totalOrders} pedidos registrados
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Clientes VIP / Frecuentes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-amber-700 mt-3 tabular-nums">
            {stats.vips + stats.frecuentes}
          </p>
          <p className="text-[11px] text-amber-800 font-bold mt-1">
            {stats.vips} VIP · {stats.frecuentes} Frecuentes
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Valor Histórico (LTV)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-950 flex items-center justify-center border border-blue-100">
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-blue-950 mt-3 tabular-nums">
            S/. {stats.totalRevenue.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Facturación clientes en cartera
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Gasto Promedio / Cliente</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-blue-950 mt-3 tabular-nums">
            S/. {stats.avgSpent.toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-800 font-bold mt-1">
            Promedio de compras por cliente
          </p>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, celular o DNI en Arequipa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-950 cursor-pointer"
          >
            <option value="todos">Todos los segmentos</option>
            <option value="vip">⭐ Clientes VIP</option>
            <option value="frecuente">🔷 Frecuentes</option>
            <option value="nuevo">🟢 Nuevos</option>
            <option value="ocasional">⚪ Ocasionales</option>
            <option value="inactivo">🔴 Inactivos</option>
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-950 cursor-pointer"
          >
            <option value="todos">Todos los distritos</option>
            {AREQUIPA_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Customer Directory List & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No se encontraron clientes</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Intenta cambiar los filtros o registra un nuevo casero con el botón superior.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCustomers.map((cust) => (
              <div 
                key={cust.id} 
                className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Left: Customer Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-950 to-blue-900 text-amber-300 border border-amber-500/30 flex items-center justify-center font-black text-sm shrink-0">
                    {cust.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-blue-950 text-sm hover:text-amber-700 transition-colors cursor-pointer"
                        onClick={() => setActiveCustomer(cust)}
                      >
                        {cust.name}
                      </h3>
                      {tagBadge(cust.tag)}
                      {cust.dni && (
                        <span className="text-[10px] text-slate-400 font-mono">DNI: {cust.dni}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1 font-mono text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        <span>{cust.phone}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span className="truncate">{cust.district} · {cust.address}</span>
                      </span>
                    </div>

                    {cust.notes && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                        "{cust.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Center: Purchase Stats */}
                <div className="flex items-center gap-4 text-xs font-mono shrink-0 pl-14 md:pl-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                      Compras
                    </span>
                    <span className="font-black text-blue-950 text-sm">
                      {cust.totalOrders} pedidos
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                      Total Gastado
                    </span>
                    <span className="font-black text-amber-700 text-sm">
                      S/. {cust.totalSpent.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleOpenWhatsAppChat(cust)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    title="Abrir chat en WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setActiveCustomer(cust)}
                    className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors border border-amber-500/30"
                    title="Ver perfil completo e inteligencia artificial"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
                    <span>Perfil & IA</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(cust)}
                    className="p-1.5 text-slate-400 hover:text-blue-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Editar datos"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar al cliente ${cust.name} del CRM?`)) {
                        deleteCustomer(cust.id);
                        if (activeCustomer?.id === cust.id) setActiveCustomer(null);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Customer Detail & AI Intelligence Drawer / Modal */}
      {activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden border border-amber-500/40 flex flex-col">
            
            {/* Drawer Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex items-center justify-between border-b border-amber-500/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black">
                  {activeCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>{activeCustomer.name}</span>
                    {tagBadge(activeCustomer.tag)}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">
                    {activeCustomer.phone} · {activeCustomer.district}, Arequipa
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveCustomer(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs bg-slate-50/50">
              
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Pedidos</p>
                  <p className="text-lg font-black text-blue-950 font-mono">{activeCustomer.totalOrders}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Gastado</p>
                  <p className="text-lg font-black text-amber-700 font-mono">S/. {activeCustomer.totalSpent.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Ticket Promedio</p>
                  <p className="text-lg font-black text-blue-950 font-mono">S/. {activeCustomer.averageTicket.toFixed(1)}</p>
                </div>
              </div>

              {/* Delivery Address & Details */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <h4 className="font-bold text-blue-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ubicación de Entrega Contraentrega</span>
                </h4>
                <p className="text-slate-800 font-medium">
                  <strong>Dirección:</strong> {activeCustomer.address}, {activeCustomer.district}
                </p>
                {activeCustomer.reference && (
                  <p className="text-slate-600 font-medium">
                    <strong>Referencia:</strong> {activeCustomer.reference}
                  </p>
                )}
                {activeCustomer.notes && (
                  <div className="pt-2 border-t border-slate-100 text-slate-600 italic">
                    <strong>Notas del comerciante:</strong> {activeCustomer.notes}
                  </div>
                )}
              </div>

              {/* AI Customer Intelligence Card */}
              <div className="p-5 bg-gradient-to-br from-blue-950 to-indigo-950 text-white rounded-2xl border border-amber-500/40 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">
                      Inteligencia Artificial para Fidelización
                    </h4>
                  </div>
                  <button
                    onClick={() => handleGenerateAiInsight(activeCustomer)}
                    disabled={isGeneratingInsight}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-blue-950 font-black rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>{isGeneratingInsight ? 'Analizando...' : 'Generar Análisis IA'}</span>
                  </button>
                </div>

                {activeCustomer.aiInsights ? (
                  <div className="space-y-3 pt-1">
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                          Perfil de Consumo:
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono">
                          {activeCustomer.aiInsights.lastAnalyzedAt ? new Date(activeCustomer.aiInsights.lastAnalyzedAt).toLocaleDateString('es-PE') : ''}
                        </span>
                      </div>
                      <p className="text-white font-extrabold text-sm">
                        {activeCustomer.aiInsights.persona}
                      </p>
                      <p className="text-slate-200 text-xs leading-relaxed">
                        {activeCustomer.aiInsights.summary}
                      </p>
                    </div>

                    <div className="p-3.5 bg-emerald-950/60 rounded-xl border border-emerald-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>Mensaje Sugerido para WhatsApp:</span>
                        </span>
                        <button
                          onClick={() => handleCopyText(activeCustomer.aiInsights!.suggestedMessage)}
                          className="text-[11px] text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedMessage ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedMessage ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>

                      <p className="text-slate-100 text-xs font-mono bg-black/30 p-2.5 rounded-lg whitespace-pre-wrap">
                        {activeCustomer.aiInsights.suggestedMessage}
                      </p>

                      <button
                        onClick={() => handleOpenWhatsAppChat(activeCustomer, activeCustomer.aiInsights!.suggestedMessage)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Mensaje Personalizado por WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300">
                    Presiona el botón superior para que la IA de Gemini analice los pedidos y preferencias de este cliente y elabore un mensaje de fidelización en tono arequipeño listo para WhatsApp.
                  </p>
                )}
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleOpenEdit(activeCustomer)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-blue-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Ficha</span>
              </button>

              <button
                onClick={() => setActiveCustomer(null)}
                className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. Customer Registration / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-500/40">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between border-b border-amber-500/40">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingCustomer ? 'Editar Ficha del Cliente' : 'Registrar Nuevo Cliente en CRM'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4 text-xs bg-slate-50/50">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Jorge Luis Barreda"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Celular / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="954 123 456"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-950 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">DNI (Opcional)</label>
                  <input
                    type="text"
                    placeholder="8 dígitos"
                    maxLength={8}
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-950 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Segmento / Etiqueta</label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value as CustomerTag })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-950 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="frecuente">Frecuente</option>
                    <option value="vip">Cliente VIP</option>
                    <option value="ocasional">Ocasional</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Distrito de Arequipa *</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value as ArequipaDistrict })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-950 focus:outline-none cursor-pointer"
                >
                  {AREQUIPA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dirección de Entrega</label>
                <input
                  type="text"
                  placeholder="Calle, número, urbanización..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Referencia</label>
                <input
                  type="text"
                  placeholder="Ej. Casa de reja blanca, frente al parque..."
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notas del Cliente</label>
                <textarea
                  rows={2}
                  placeholder="Gustos, horarios preferidos de entrega, método de pago habitual..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-950 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-amber-300 font-bold rounded-xl border border-amber-500/40 cursor-pointer shadow-xs"
                >
                  {editingCustomer ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

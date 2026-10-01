import React, { useState } from 'react';
import { useStore } from '../../context/store';
import { AREQUIPA_DISTRICTS } from '../../data/initialData';
import { ArequipaDistrict } from '../../types';
import { Store, MapPin, Phone, Truck, Save, Smartphone, Crown, Share2, Copy, Check, QrCode, ExternalLink } from 'lucide-react';

export const TenantSettings: React.FC = () => {
  const { currentTenant, updateTenant, getTenantCatalogUrl, setIsShareModalOpen } = useStore();

  const [formData, setFormData] = useState({
    name: currentTenant.name,
    tagline: currentTenant.tagline,
    district: currentTenant.district,
    address: currentTenant.address,
    whatsappNumber: currentTenant.whatsappNumber,
    yapePhone: currentTenant.yapePhone || '',
    plinPhone: currentTenant.plinPhone || '',
    ownerName: currentTenant.ownerName,
    defaultDeliveryFee: currentTenant.defaultDeliveryFee,
    freeDeliveryThreshold: currentTenant.freeDeliveryThreshold,
    deliveryCoverage: currentTenant.deliveryCoverage || ['Yanahuara', 'Cayma', 'Cercado de Arequipa']
  });

  const [saved, setSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const catalogUrl = getTenantCatalogUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(catalogUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenant({
      ...currentTenant,
      ...formData
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleToggleDistrictCoverage = (dist: string) => {
    setFormData((prev) => {
      const exists = prev.deliveryCoverage.includes(dist);
      const updated = exists
        ? prev.deliveryCoverage.filter((d) => d !== dist)
        : [...prev.deliveryCoverage, dist];
      return { ...prev, deliveryCoverage: updated };
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-blue-950 flex items-center gap-2">
          <Store className="w-5 h-5 text-amber-600" />
          <span>Configuración del Comercio (Tenant SaaS)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ajustes de identidad, número de WhatsApp para pedidos contraentrega y enlace de acceso para clientes
        </p>
      </div>

      {/* Customer Access Link Banner */}
      <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white rounded-2xl p-5 border border-amber-500/40 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Link Oficial para Clientes</h3>
              <p className="text-[11px] text-slate-300">Enlace directo para compartir en redes, estados de WhatsApp y volantes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-blue-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-blue-950" /> : <Copy className="w-3.5 h-3.5 text-blue-950" />}
              <span>{copiedLink ? '¡Link Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver QR & Difusión</span>
            </button>
          </div>
        </div>

        <div className="p-2.5 bg-black/25 rounded-xl font-mono text-xs text-amber-300 break-all border border-white/10 select-all">
          {catalogUrl}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs text-xs">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>1. Perfil del Negocio en Arequipa</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nombre Comercial *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nombre del Propietario / Encargado</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Eslogan o Lema Comercial</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Distrito Principal en Arequipa *</label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value as ArequipaDistrict })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium text-slate-800"
              >
                {AREQUIPA_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Dirección del Local / Tienda *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp & Contact for Orders */}
        <div className="space-y-4 pt-2">
          <h2 className="text-xs font-bold text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-600" />
            <span>2. Conexión de Pedidos WhatsApp & Pagos Móviles</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <span>Número WhatsApp Tienda *</span>
              </label>
              <input
                type="text"
                required
                placeholder="51954123456"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-mono font-bold text-blue-950"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Con código de país 51 (ej. 51954123456)</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-[#732282]" />
                <span>Teléfono para Yape</span>
              </label>
              <input
                type="text"
                placeholder="954 123 456"
                value={formData.yapePhone}
                onChange={(e) => setFormData({ ...formData, yapePhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-mono font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Teléfono para Plin</span>
              </label>
              <input
                type="text"
                placeholder="954 123 456"
                value={formData.plinPhone}
                onChange={(e) => setFormData({ ...formData, plinPhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-mono font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Delivery Contraentrega Policy */}
        <div className="space-y-4 pt-2">
          <h2 className="text-xs font-bold text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-amber-600" />
            <span>3. Políticas de Delivery Contraentrega en Arequipa</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Costo de Envío Estándar (S/.)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.defaultDeliveryFee}
                onChange={(e) => setFormData({ ...formData, defaultDeliveryFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-mono font-bold text-blue-950"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Monto Mínimo para Envío GRATIS (S/.)</label>
              <input
                type="number"
                step="5"
                min="0"
                value={formData.freeDeliveryThreshold}
                onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-mono font-bold text-blue-950"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Si la compra supera este monto, el delivery es S/. 0.00</p>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Distritos con Cobertura de Entrega en Arequipa:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AREQUIPA_DISTRICTS.map((dist) => {
                const isSelected = formData.deliveryCoverage.includes(dist);
                return (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => handleToggleDistrictCoverage(dist)}
                    className={`px-3 py-2 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 text-blue-950 border-amber-400/80 font-bold shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{dist}</span>
                    {isSelected && <span className="text-amber-600 font-black">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {saved ? (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              ✓ Cambios guardados correctamente
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium">
              Todos los pedidos nuevos llegarán a este WhatsApp
            </span>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-950 to-blue-900 text-amber-300 hover:from-blue-900 hover:to-indigo-950 border border-amber-500/40 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-[0.99]"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Guardar Ajustes del Comercio</span>
          </button>
        </div>

      </form>
    </div>
  );
};

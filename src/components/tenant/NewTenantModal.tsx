import React, { useState } from 'react';
import { useStore } from '../../context/store';
import { AREQUIPA_DISTRICTS } from '../../data/initialData';
import { ArequipaDistrict } from '../../types';
import { Store, X, Plus, Crown } from 'lucide-react';

interface NewTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTenantModal: React.FC<NewTenantModalProps> = ({ isOpen, onClose }) => {
  const { createTenant } = useStore();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [district, setDistrict] = useState<ArequipaDistrict>('Yanahuara');
  const [address, setAddress] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('51954');
  const [ownerName, setOwnerName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    createTenant({
      name,
      slug,
      tagline: tagline || `Productos selectos y atención de primera en ${district}, Arequipa`,
      district,
      address: address || `Calle Principal 123, ${district}, Arequipa`,
      whatsappNumber: whatsappNumber.replace(/\D/g, ''),
      yapePhone: whatsappNumber.slice(-9),
      plinPhone: whatsappNumber.slice(-9),
      ownerName: ownerName || 'Emprendedor Arequipeño',
      bannerImage: '/src/assets/images/hero_arequipa_market_1790861630483.jpg',
      currency: 'S/.',
      defaultDeliveryFee: 5.0,
      freeDeliveryThreshold: 50.0,
      deliveryCoverage: [district, 'Cercado de Arequipa', 'Yanahuara', 'Cayma'],
      active: true
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-500/30">
        
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white border-b border-amber-500/40">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Registrar Nuevo Comercio en Arequipa (Multi-Tenant)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs bg-white">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nombre del Comercio / Tienda *</label>
            <input
              type="text"
              required
              placeholder="Ej. Bodega Don Lucho, Quesería Majes..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nombre del Dueño / Administrador</label>
            <input
              type="text"
              placeholder="Ej. Luis Quispe"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Distrito en Arequipa *</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value as ArequipaDistrict)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium text-slate-800"
              >
                {AREQUIPA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Número de WhatsApp *</label>
              <input
                type="text"
                required
                placeholder="51954123456"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-mono font-bold text-blue-950"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Dirección de la Tienda</label>
            <input
              type="text"
              placeholder="Ej. Av. Cayma 415, Yanahuara..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Descripción o Eslogan</label>
            <input
              type="text"
              placeholder="Ej. Abarrotes frescos, quesos y bebidas al mejor precio"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-amber-300 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-indigo-950 border border-amber-500/40 rounded-xl font-bold cursor-pointer shadow-md active:scale-[0.99]"
            >
              Crear Comercio
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

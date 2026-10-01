import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import QRCode from 'qrcode';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  ExternalLink, 
  MessageCircle, 
  Download, 
  Sparkles,
  Store,
  MapPin,
  Crown
} from 'lucide-react';

export const ShareCatalogModal: React.FC = () => {
  const { currentTenant, getTenantCatalogUrl, isShareModalOpen, setIsShareModalOpen } = useStore();
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const catalogUrl = getTenantCatalogUrl();

  // Generate QR Code on open
  useEffect(() => {
    if (isShareModalOpen && catalogUrl) {
      QRCode.toDataURL(catalogUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a', // deep navy
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR:', err));
    }
  }, [isShareModalOpen, catalogUrl]);

  if (!isShareModalOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(catalogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShareWhatsApp = () => {
    const promoMessage = `¡Hola! 🛍️ Te invitamos a conocer el catálogo digital oficial de *${currentTenant.name}* (${currentTenant.district}, Arequipa).\n\n📦 Mira todos nuestros productos y haz tu pedido con *pago contraentrega* (Efectivo o Yape) al recibirlo en tu puerta.\n\n👉 Accede a nuestro catálogo aquí:\n${catalogUrl}`;
    const encoded = encodeURIComponent(promoMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr_catalogo_${currentTenant.slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-500/30 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between border-b border-amber-500/40">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Enlace Público del Catálogo Digital
            </h3>
          </div>
          <button
            onClick={() => setIsShareModalOpen(false)}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs bg-slate-50/50">
          
          {/* Store Identification Strip */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-950 shrink-0">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 truncate text-sm">
                {currentTenant.name}
              </h4>
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{currentTenant.district}, Arequipa · Pedidos contraentrega</span>
              </p>
            </div>
          </div>

          {/* Copyable Link Box */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Link de acceso directo para tus clientes:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-blue-950 truncate select-all shadow-2xs">
                {catalogUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-blue-950 hover:bg-blue-900 text-amber-300 border border-amber-500/40 rounded-xl font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs transition-all active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Al abrir este link, el cliente entra directamente a tu tienda virtual sin ver el panel de administración.
            </p>
          </div>

          {/* WhatsApp Share CTA */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <p className="font-bold text-emerald-950 text-xs">
                Difundir a tus contactos en WhatsApp
              </p>
            </div>
            <p className="text-[11px] text-emerald-800">
              Envía una invitación atractiva con el enlace de tu catálogo a tus estados o chats de clientes.
            </p>
            <button
              onClick={handleShareWhatsApp}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Compartir en WhatsApp</span>
            </button>
          </div>

          {/* QR Code Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-950">
              <QrCode className="w-4 h-4 text-amber-600" />
              <span>Código QR del Catálogo para Mostrador o Empaques</span>
            </div>

            {qrDataUrl ? (
              <div className="inline-block p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
                <img
                  src={qrDataUrl}
                  alt={`QR Catálogo ${currentTenant.name}`}
                  className="w-44 h-44 mx-auto"
                />
              </div>
            ) : (
              <div className="w-44 h-44 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                Generando QR...
              </div>
            )}

            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Imprímelo en tu mostrador o pégalo en tus bolsas de entrega para que los clientes escaneen y vuelvan a pedir.
            </p>

            <button
              onClick={handleDownloadQR}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-blue-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Descargar Imagen QR (PNG)</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <a
            href={catalogUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-blue-950 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Probar link en nueva pestaña</span>
          </a>

          <button
            onClick={() => setIsShareModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer text-xs"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

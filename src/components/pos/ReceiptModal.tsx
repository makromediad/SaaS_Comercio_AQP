import React, { useState } from 'react';
import { Sale, Tenant } from '../../types';
import { Printer, MessageCircle, X, Check, Copy, Crown } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale | null;
  tenant: Tenant;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, tenant, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!sale) return null;

  const paymentLabel = {
    efectivo_contraentrega: 'Efectivo Contraentrega',
    yape_contraentrega: 'Yape Contraentrega',
    plin_contraentrega: 'Plin Contraentrega'
  }[sale.paymentMethod];

  // Generate WhatsApp message text
  const itemsText = sale.items
    .map((item) => `• ${item.quantity}x ${item.productName} - S/. ${item.subtotal.toFixed(2)}`)
    .join('\n');

  const rawMessage = `*${tenant.name}*\n📍 ${tenant.address}\n\n🧾 *TICKET DE VENTA: ${sale.receiptNumber}*\n📅 Fecha: ${new Date(sale.date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}\n👤 Cliente: ${sale.customerName || 'Cliente'}\n----------------------------------\n${itemsText}\n----------------------------------\n*TOTAL: S/. ${sale.total.toFixed(2)}*\n💳 Método: ${paymentLabel}\n${sale.discount > 0 ? `Descuento: S/. ${sale.discount.toFixed(2)}\n` : ''}${sale.paymentMethod === 'efectivo_contraentrega' ? `Pagó con: S/. ${sale.amountPaid.toFixed(2)} | Vuelto: S/. ${sale.changeDue.toFixed(2)}\n` : ''}\n¡Muchas gracias por su preferencia en Arequipa! 🌋`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(rawMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-500/30">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white border-b border-amber-500/40">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold tracking-tight text-white">
              Venta Registrada Exitosamente
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 overflow-y-auto max-h-[70vh] bg-slate-50/50">
          <div 
            id="printable-receipt" 
            className="bg-white p-6 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 space-y-3 shadow-xs"
          >
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h3 className="text-sm font-black tracking-tight text-blue-950 uppercase">
                {tenant.name}
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">{tenant.address}</p>
              <p className="text-[11px] text-slate-600">Arequipa - Perú · WhatsApp: +{tenant.whatsappNumber}</p>
              <div className="mt-2 inline-block px-2.5 py-0.5 bg-blue-50 text-[10px] font-bold text-blue-950 border border-amber-400/40 rounded-full">
                COMPROBANTE ELECTRÓNICO SIMPLIFICADO
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>N° Ticket:</span>
                <span className="font-bold text-blue-950">{sale.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span>{new Date(sale.date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span className="truncate max-w-[180px] font-medium text-slate-800">{sale.customerName || 'Cliente Final'}</span>
              </div>
              {sale.customerDni && (
                <div className="flex justify-between">
                  <span>DNI / RUC:</span>
                  <span>{sale.customerDni}</span>
                </div>
              )}
            </div>

            {/* Items table */}
            <div className="pt-2 border-t border-dashed border-slate-300">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-200">
                    <th className="pb-1">Cant. / Prod</th>
                    <th className="pb-1 text-right">P.U.</th>
                    <th className="pb-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className="text-[11px]">
                      <td className="py-1.5 pr-2">
                        <span className="font-bold text-blue-950">{item.quantity}x</span> {item.productName}
                      </td>
                      <td className="py-1.5 text-right tabular-nums whitespace-nowrap text-slate-600">
                        S/. {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-1.5 text-right font-bold tabular-nums whitespace-nowrap text-blue-950">
                        S/. {item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="pt-2 border-t border-dashed border-slate-300 space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="tabular-nums">S/. {sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Descuento:</span>
                  <span className="tabular-nums">- S/. {sale.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-blue-950 pt-1.5 border-t border-slate-200">
                <span>TOTAL A PAGAR:</span>
                <span className="tabular-nums text-base text-blue-950">S/. {sale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="pt-2 border-t border-dashed border-slate-300 text-[11px] space-y-0.5 text-slate-600">
              <div className="flex justify-between">
                <span>Forma de Pago:</span>
                <span className="font-semibold text-slate-800">{paymentLabel}</span>
              </div>
              {sale.paymentMethod === 'efectivo_contraentrega' && (
                <>
                  <div className="flex justify-between">
                    <span>Efectivo Recibido:</span>
                    <span className="tabular-nums">S/. {sale.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-950">
                    <span>Vuelto:</span>
                    <span className="tabular-nums text-emerald-700">S/. {sale.changeDue.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 text-center text-[10px] text-slate-400 border-t border-dashed border-slate-300">
              ¡Gracias por preferir el comercio arequipeño! 🌋
              <br />
              <span className="text-amber-700 font-semibold">Mitra POS</span> · Sistema de Gestión Comercial
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-blue-950 bg-slate-50 border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-950" />
            <span>Imprimir Ticket</span>
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-white bg-blue-950 hover:bg-blue-900 border border-amber-500/40 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <MessageCircle className="w-4 h-4 text-amber-400" />
            <span>Enviar WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center p-2.5 text-slate-600 bg-slate-50 border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Copiar texto de ticket"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
          <button
            onClick={onClose}
            className="text-xs text-blue-950 hover:text-amber-800 font-bold underline cursor-pointer"
          >
            Iniciar Nueva Venta
          </button>
        </div>

      </div>
    </div>
  );
};

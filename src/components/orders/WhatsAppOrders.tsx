import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { WhatsAppOrder, OrderStatus } from '../../types';
import { 
  MessageCircle, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  PackageCheck,
  AlertCircle
} from 'lucide-react';

export const WhatsAppOrders: React.FC = () => {
  const { currentTenant, orders, updateOrderStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter === 'todos') return true;
      return o.status === statusFilter;
    });
  }, [orders, statusFilter]);

  const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
    pendiente: { label: 'Pendiente', color: 'text-amber-800 bg-amber-50 border-amber-300', icon: Clock },
    confirmado: { label: 'En Preparación', color: 'text-blue-950 bg-blue-50 border-blue-200', icon: PackageCheck },
    en_camino: { label: 'En Camino (Reparto)', color: 'text-blue-900 bg-indigo-50 border-indigo-200', icon: Truck },
    entregado: { label: 'Entregado & Cobrado', color: 'text-emerald-800 bg-emerald-50 border-emerald-300', icon: CheckCircle },
    cancelado: { label: 'Cancelado', color: 'text-slate-500 bg-slate-100 border-slate-200', icon: XCircle },
  };

  const sendWhatsAppUpdate = (order: WhatsAppOrder, messageType: 'confirmado' | 'en_camino' | 'entregado') => {
    let text = '';
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;

    if (messageType === 'confirmado') {
      text = `¡Hola ${order.customerName}! 🛍️ Confirmamos tu pedido *#${order.orderNumber}* en *${currentTenant.name}*.\nLo estamos empacando con mucho cuidado. Total a pagar contraentrega: *S/. ${order.total.toFixed(2)}* (${order.paymentMethod.replace('_', ' ')}).`;
    } else if (messageType === 'en_camino') {
      text = `¡Hola ${order.customerName}! 🛵 Tu pedido *#${order.orderNumber}* ya va en camino hacia *${order.address}* (${order.district}).\nPor favor ten listo el pago contraentrega de *S/. ${order.total.toFixed(2)}*. ¡Muchas gracias!`;
    } else {
      text = `¡Hola ${order.customerName}! 🎉 Confirmamos la entrega de tu pedido *#${order.orderNumber}* de *${currentTenant.name}*. ¡Esperamos que lo disfrutes y que tengas un excelente día en Arequipa! 🌋`;
    }

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${phoneWithCountry}?text=${encoded}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-blue-950 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-amber-600" />
            <span>Gestión de Pedidos WhatsApp</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pedidos recibidos desde el catálogo digital público con entrega contraentrega en Arequipa
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-200/80 rounded-xl text-xs font-bold shadow-2xs">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'todos' ? 'bg-blue-950 text-amber-300 shadow-xs border border-amber-500/30' : 'text-slate-600 hover:text-blue-950'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('pendiente')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'pendiente' ? 'bg-blue-950 text-amber-300 shadow-xs border border-amber-500/30' : 'text-slate-600 hover:text-blue-950'
            }`}
          >
            Pendientes ({orders.filter(o => o.status === 'pendiente').length})
          </button>
          <button
            onClick={() => setStatusFilter('en_camino')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'en_camino' ? 'bg-blue-950 text-amber-300 shadow-xs border border-amber-500/30' : 'text-slate-600 hover:text-blue-950'
            }`}
          >
            En Camino ({orders.filter(o => o.status === 'en_camino').length})
          </button>
          <button
            onClick={() => setStatusFilter('entregado')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'entregado' ? 'bg-blue-950 text-amber-300 shadow-xs border border-amber-500/30' : 'text-slate-600 hover:text-blue-950'
            }`}
          >
            Entregados ({orders.filter(o => o.status === 'entregado').length})
          </button>
        </div>
      </div>

      {/* Orders Grid / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-blue-950">No hay pedidos en esta sección</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Cuando los clientes hagan un pedido en tu Catálogo Digital de WhatsApp, aparecerán aquí para coordinar el despacho contraentrega.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between hover:shadow-md hover:border-amber-400/50 transition-all shadow-2xs"
              >
                <div>
                  {/* Top: Order number & Status Badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-mono font-black text-sm text-blue-950">
                        {order.orderNumber}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(order.createdAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>

                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${statusConfig[order.status].color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusConfig[order.status].label}</span>
                    </div>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="py-3 space-y-2 text-xs border-b border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                      <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-mono font-medium">{order.customerPhone}</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl text-slate-700 space-y-1 border border-slate-100">
                      <p className="font-semibold flex items-start gap-1.5 text-blue-950">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{order.address}, {order.district}</span>
                      </p>
                      {order.reference && (
                        <p className="text-[11px] text-slate-500 pl-5">
                          Ref: {order.reference}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Items Breakdown */}
                  <div className="py-3 text-xs space-y-1.5 border-b border-slate-100">
                    <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Productos Solicitados</p>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-800">
                          <span className="truncate pr-2 font-medium">
                            <strong className="font-mono text-blue-950">{item.quantity}x</strong> {item.productName}
                          </span>
                          <span className="font-mono tabular-nums text-slate-600 shrink-0 font-bold">
                            S/. {item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financials & Payment method */}
                  <div className="py-3 text-xs space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-mono tabular-nums">S/. {order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Delivery ({order.district}):</span>
                      <span className="font-mono tabular-nums font-semibold">
                        {order.deliveryFee === 0 ? <strong className="text-emerald-700">Gratis</strong> : `S/. ${order.deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-black text-sm text-blue-950 pt-1 border-t border-slate-100">
                      <span>Total Contraentrega:</span>
                      <span className="font-mono tabular-nums text-base text-blue-950">
                        S/. {order.total.toFixed(2)}
                      </span>
                    </div>

                    {order.paymentDetail && (
                      <p className="text-[11px] text-amber-900 bg-amber-50/90 border border-amber-200/60 p-2 rounded-lg mt-2 font-medium">
                        💳 {order.paymentDetail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Changing Actions & WhatsApp messaging */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-bold text-slate-600 shrink-0">Estado:</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-blue-950 focus:outline-none focus:border-blue-950"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmado">Confirmar (En preparación)</option>
                      <option value="en_camino">En Camino (Reparto)</option>
                      <option value="entregado">Entregado & Cobrado (Registra Venta)</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => sendWhatsAppUpdate(order, 'en_camino')}
                      className="px-2 py-2 text-[11px] font-bold text-blue-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Avisar que el repartidor va en camino"
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Avisar En Camino</span>
                    </button>

                    <button
                      onClick={() => sendWhatsAppUpdate(order, 'confirmado')}
                      className="px-2 py-2 text-[11px] font-bold text-amber-300 bg-blue-950 hover:bg-blue-900 border border-amber-500/40 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                      title="Chatear con el cliente en WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>WhatsApp Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

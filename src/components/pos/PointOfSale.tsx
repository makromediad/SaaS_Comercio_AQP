import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, PaymentMethod } from '../../types';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  DollarSign, 
  Smartphone, 
  AlertCircle,
  Receipt,
  Tag,
  Coins,
  ShieldCheck,
  Users
} from 'lucide-react';

export const PointOfSale: React.FC = () => {
  const { currentTenant, products, recordSale } = useStore();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Ticket Cart State
  const [ticketItems, setTicketItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerDni, setCustomerDni] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo_contraentrega');
  const [cashTendered, setCashTendered] = useState<string>('');

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['todos', ...Array.from(set)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm));
      const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Ticket totals
  const subtotal = useMemo(() => {
    return ticketItems.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  }, [ticketItems]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  const tenderedAmount = parseFloat(cashTendered) || total;
  const changeDue = Math.max(0, tenderedAmount - total);

  // Ticket Actions
  const addToTicket = (product: Product) => {
    if (product.stock <= 0) return;

    setTicketItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromTicket(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const finalQty = Math.min(product.stock, qty);
    setTicketItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: finalQty } : item))
    );
  };

  const removeFromTicket = (productId: string) => {
    setTicketItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearTicket = () => {
    setTicketItems([]);
    setDiscount(0);
    setCustomerName('');
    setCustomerDni('');
    setCashTendered('');
  };

  const handleQuickCash = (amount: number) => {
    setCashTendered(amount.toString());
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const found = products.find(
        (p) =>
          p.barcode === searchTerm.trim() ||
          p.sku.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      if (found) {
        addToTicket(found);
        setSearchTerm('');
      }
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketItems.length === 0) return;

    recordSale({
      items: ticketItems,
      paymentMethod,
      discount,
      amountPaid: paymentMethod === 'efectivo_contraentrega' ? tenderedAmount : total,
      customerName: customerName || 'Cliente Mostrador',
      customerDni: customerDni || undefined,
      customerPhone: customerPhone || undefined,
      source: 'pos'
    });

    clearTicket();
    setCustomerName('');
    setCustomerPhone('');
    setCustomerDni('');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-slate-100/70">
      
      {/* LEFT SECTION: Catalog & Product Selector */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-hidden">
        
        {/* Top Controls: Search Bar & Info Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto por nombre, SKU o código de barra (Enter para ingresar)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-950 transition-all shadow-2xs font-medium text-slate-800"
            />
          </div>

          {/* Quick Info Box */}
          <div className="flex items-center gap-2 text-xs text-slate-600 whitespace-nowrap px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="font-bold text-blue-950">{currentTenant.name}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono font-semibold text-amber-700">{products.length} productos</span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer capitalize ${
                selectedCategory === cat
                  ? 'bg-blue-950 text-amber-300 shadow-xs border border-amber-500/40'
                  : 'bg-white text-slate-600 hover:text-blue-950 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'todos' ? 'Todos los rubros' : cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto mt-2 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-200">
              <AlertCircle className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-sm font-bold text-blue-950">No se encontraron productos</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                No hay coincidencias para "{searchTerm}". Prueba buscando por otra palabra o agrega nuevos ítems en Inventario.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
                const inTicketCount = ticketItems.find((i) => i.product.id === product.id)?.quantity || 0;

                return (
                  <button
                    key={product.id}
                    disabled={isOutOfStock}
                    onClick={() => addToTicket(product)}
                    className={`group text-left bg-white rounded-xl border p-3 flex flex-col justify-between transition-all duration-150 cursor-pointer ${
                      isOutOfStock
                        ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                        : 'border-slate-200 hover:border-amber-500/70 hover:shadow-md active:scale-[0.99]'
                    }`}
                  >
                    <div>
                      {/* Product Image */}
                      <div className="w-full aspect-4/3 rounded-lg overflow-hidden bg-slate-100 mb-2.5 relative border border-slate-100">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 text-xs font-mono">
                            {product.sku}
                          </div>
                        )}

                        {/* In ticket badge */}
                        {inTicketCount > 0 && (
                          <div className="absolute top-1.5 right-1.5 bg-blue-950 text-amber-300 border border-amber-500/40 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                            {inTicketCount} en ticket
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider truncate">
                        {product.category}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5 leading-snug group-hover:text-blue-950 transition-colors">
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-black text-blue-950 font-mono tabular-nums">
                          S/. {product.salePrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-0.5">/{product.unit}</span>
                      </div>

                      <div className="text-right">
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-rose-600">Agotado</span>
                        ) : (
                          <span className={`text-[10px] font-mono tabular-nums ${isLowStock ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
                            Stock: {product.stock}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Ticket / POS Register Terminal */}
      <div className="w-full lg:w-96 xl:w-104 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-full shadow-lg">
        
        {/* Terminal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Ticket de Venta (Caja)</h3>
          </div>
          {ticketItems.length > 0 && (
            <button
              onClick={clearTicket}
              className="text-xs text-amber-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title="Vaciar ticket"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Customer Quick Inputs */}
        <div className="px-5 py-2.5 bg-slate-50/90 border-b border-slate-200 grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Cliente (Opcional)</label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-950 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">DNI / RUC</label>
            <input
              type="text"
              placeholder="Ej. 29481923"
              value={customerDni}
              onChange={(e) => setCustomerDni(e.target.value)}
              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-950 font-mono"
            />
          </div>
        </div>

        {/* Ticket Item List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-slate-100">
          {ticketItems.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center text-slate-400">
              <Receipt className="w-8 h-8 mb-2 stroke-1 text-amber-600" />
              <p className="text-xs font-bold text-slate-600">El ticket de venta está vacío</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Haz clic en cualquier producto de la izquierda para agregarlo
              </p>
            </div>
          ) : (
            ticketItems.map(({ product, quantity }) => (
              <div key={product.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{product.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                    S/. {product.salePrice.toFixed(2)} c/u
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden shadow-2xs">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2 py-1 text-slate-600 hover:bg-slate-200 hover:text-blue-950 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 py-1 font-mono font-bold text-xs tabular-nums min-w-[24px] text-center text-blue-950">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="px-2 py-1 text-slate-600 hover:bg-slate-200 hover:text-blue-950 disabled:opacity-30 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="w-16 text-right font-black text-blue-950 font-mono tabular-nums">
                    S/. {(product.salePrice * quantity).toFixed(2)}
                  </div>

                  <button
                    onClick={() => removeFromTicket(product.id)}
                    className="text-slate-300 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                    title="Quitar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Payment Checkout Panel */}
        <form onSubmit={handleCheckout} className="p-5 border-t border-slate-200 bg-slate-50/80 space-y-3">
          
          {/* Customer CRM data inputs (Optional) */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>Cliente (CRM & Boleta)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                placeholder="Nombre del cliente..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:border-blue-950 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="WhatsApp (954...)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:border-blue-950 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Subtotal & Discount row */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                S/. {subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium">
                <Tag className="w-3 h-3 text-amber-600" />
                <span>Descuento (S/.):</span>
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                max={subtotal}
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0.00"
                className="w-20 px-2 py-0.5 text-right font-mono text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-950 font-bold text-amber-700"
              />
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-blue-950">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">TOTAL A COBRAR:</span>
              <span className="text-2xl font-black font-mono tabular-nums text-blue-950">
                S/. {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-1">
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Forma de Pago Contraentrega
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo_contraentrega')}
                className={`py-2 px-1 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  paymentMethod === 'efectivo_contraentrega'
                    ? 'bg-blue-950 text-amber-300 border-amber-500/50 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Coins className="w-3.5 h-3.5 mx-auto mb-0.5 text-amber-500" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('yape_contraentrega')}
                className={`py-2 px-1 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  paymentMethod === 'yape_contraentrega'
                    ? 'bg-[#732282] text-white border-[#732282] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 mx-auto mb-0.5" />
                <span>Yape</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('plin_contraentrega')}
                className={`py-2 px-1 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  paymentMethod === 'plin_contraentrega'
                    ? 'bg-[#00d09c] text-neutral-950 border-[#00d09c] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 mx-auto mb-0.5" />
                <span>Plin</span>
              </button>
            </div>
          </div>

          {/* Cash Tender & Change Calculator (if Efectivo selected) */}
          {paymentMethod === 'efectivo_contraentrega' ? (
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Paga con billete (S/.):</span>
                <input
                  type="number"
                  step="0.5"
                  min={total}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder={total.toFixed(2)}
                  className="w-24 px-2 py-1 text-right font-mono font-black text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-950 text-blue-950"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex items-center gap-1">
                {[total, 10, 20, 50, 100].filter(v => v >= total).slice(0, 4).map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickCash(amt)}
                    className="flex-1 py-1 text-[10px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-blue-950 rounded transition-colors cursor-pointer"
                  >
                    S/. {amt.toFixed(0)}
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-1.5 border-t border-slate-100 font-bold text-slate-800">
                <span>Vuelto a entregar:</span>
                <span className="font-mono tabular-nums text-emerald-700 font-black text-sm">
                  S/. {changeDue.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-100/90 rounded-xl text-xs text-slate-600 space-y-1 border border-slate-200">
              <p className="font-bold text-blue-950 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                <span>Pago móvil {paymentMethod === 'yape_contraentrega' ? 'Yape' : 'Plin'}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Número registrado de {currentTenant.name}: <strong className="font-mono text-blue-950">{currentTenant.yapePhone || currentTenant.whatsappNumber}</strong>
              </p>
            </div>
          )}

          {/* Submit Sale CTA */}
          <button
            type="submit"
            disabled={ticketItems.length === 0}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 hover:from-blue-900 hover:to-indigo-900 disabled:opacity-50 text-amber-300 border border-amber-500/50 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>Emitir Venta y Boleta (S/. {total.toFixed(2)})</span>
          </button>
        </form>

      </div>

    </div>
  );
};

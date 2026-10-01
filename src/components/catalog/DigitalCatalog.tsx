import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/store';
import { db, isSupabaseEnabled } from '../../lib/supabase';
import { Product, ArequipaDistrict, PaymentMethod } from '../../types';
import { AREQUIPA_DISTRICTS } from '../../data/initialData';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Truck, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  MessageCircle, 
  Smartphone, 
  ChevronRight, 
  Crown, 
  Coins, 
  Share2, 
  Copy, 
  QrCode 
} from 'lucide-react';

export const DigitalCatalog: React.FC = () => {
  const { 
    currentTenant, 
    products, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    cartTotal, 
    cartItemsCount,
    createWhatsAppOrder,
    getTenantCatalogUrl,
    setIsShareModalOpen,
    showNotification
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [orderConfirmedData, setOrderConfirmedData] = useState<{
    orderNumber: string;
    waUrl: string;
    waMessage: string;
  } | null>(null);

  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<ArequipaDistrict>(currentTenant.district);
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerReference, setCustomerReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo_contraentrega');
  const [cashBillAmount, setCashBillAmount] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.featuredInCatalog) set.add(p.category);
    });
    return ['todos', ...Array.from(set)];
  }, [products]);

  // Catalog visible products
  const catalogProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.featuredInCatalog || !p.isActive) return false;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === 'todos' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCategory]);

  // Calculate delivery fee
  const deliveryFee = useMemo(() => {
    if (cartTotal === 0) return 0;
    if (cartTotal >= currentTenant.freeDeliveryThreshold) return 0;
    return currentTenant.defaultDeliveryFee;
  }, [cartTotal, currentTenant]);

  const finalTotal = cartTotal + deliveryFee;

  // Handle Checkout via WhatsApp
  const handleSendOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      showNotification('Por favor completa tu nombre, teléfono y dirección de entrega.', 'warning');
      return;
    }

    const itemsSummary = cart.map((i) => ({
      productId: i.product.id,
      productName: i.product.name,
      quantity: i.quantity,
      unitPrice: i.product.salePrice,
      subtotal: i.product.salePrice * i.quantity
    }));

    let paymentDetail = '';
    if (paymentMethod === 'efectivo_contraentrega') {
      const bill = parseFloat(cashBillAmount);
      if (bill && bill > finalTotal) {
        paymentDetail = `Efectivo contraentrega (Paga con billete de S/. ${bill.toFixed(2)}, Llevar vuelto S/. ${(bill - finalTotal).toFixed(2)})`;
      } else {
        paymentDetail = 'Efectivo contraentrega monto exacto';
      }
    } else if (paymentMethod === 'yape_contraentrega') {
      paymentDetail = `Yape contraentrega al recibir el pedido (Yape tienda: ${currentTenant.yapePhone || currentTenant.whatsappNumber})`;
    } else {
      paymentDetail = `Plin contraentrega al recibir el pedido (Plin tienda: ${currentTenant.plinPhone || currentTenant.whatsappNumber})`;
    }

    // Register the order. En modo Supabase se crea en el servidor vía Edge
    // Function (cliente anónimo, stock revalidado); en modo local va al store.
    let createdOrder: { orderNumber: string };
    if (isSupabaseEnabled) {
      try {
        const serverOrder = await db.createPublicOrder({
          tenantId: currentTenant.id,
          items: itemsSummary.map(({ productId, quantity }) => ({ productId, quantity })),
          customerName,
          customerPhone,
          district: selectedDistrict,
          address: customerAddress,
          reference: customerReference,
          paymentMethod,
          deliveryFee,
          notes: orderNotes,
        });
        createdOrder = { orderNumber: serverOrder.orderNumber };
      } catch (err) {
        showNotification(`No se pudo registrar el pedido en la tienda: ${(err as Error).message}`, 'warning');
        return;
      }
    } else {
      createdOrder = createWhatsAppOrder({
        customerName,
        customerPhone,
        district: selectedDistrict,
        address: customerAddress,
        reference: customerReference,
        items: itemsSummary,
        subtotal: cartTotal,
        deliveryFee,
        total: finalTotal,
        paymentMethod,
        paymentDetail,
        notes: orderNotes
      });
    }

    // Format WhatsApp message text
    const itemsFormatted = cart
      .map((i) => `• ${i.quantity}x ${i.product.name} (S/. ${(i.product.salePrice * i.quantity).toFixed(2)})`)
      .join('\n');

    const message = `*¡HOLA! NUEVO PEDIDO CONTRAENTREGA*\n*${currentTenant.name}*\n\n` +
      `🧾 *Pedido:* #${createdOrder.orderNumber}\n` +
      `👤 *Cliente:* ${customerName}\n` +
      `📱 *Teléfono:* ${customerPhone}\n` +
      `📍 *Entrega en Arequipa:* ${customerAddress}, *${selectedDistrict}*\n` +
      (customerReference ? `📌 *Referencia:* ${customerReference}\n` : '') +
      `----------------------------------\n` +
      `🛒 *PRODUCTOS:* \n${itemsFormatted}\n` +
      `----------------------------------\n` +
      `Subtotal: S/. ${cartTotal.toFixed(2)}\n` +
      `🛵 Delivery (${selectedDistrict}): ${deliveryFee === 0 ? '¡GRATIS!' : `S/. ${deliveryFee.toFixed(2)}`}\n` +
      `*TOTAL A PAGAR CONTRAENTREGA: S/. ${finalTotal.toFixed(2)}*\n` +
      `----------------------------------\n` +
      `💳 *Pago:* ${paymentDetail}\n` +
      (orderNotes ? `📝 *Nota adicional:* ${orderNotes}\n` : '') +
      `\nQuedo atento a la confirmación de la tienda. ¡Muchas gracias! 🌋`;

    const encoded = encodeURIComponent(message);
    const cleanWa = currentTenant.whatsappNumber.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanWa}?text=${encoded}`;

    setOrderConfirmedData({
      orderNumber: createdOrder.orderNumber,
      waUrl,
      waMessage: message
    });

    clearCart();
    setIsCartOpen(false);

    try {
      window.open(waUrl, '_blank');
    } catch {
      // Ignored if browser prevents popup; confirmation modal has direct button
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 pb-20">
      
      {/* Storefront Hero Banner */}
      <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden border-b border-amber-500/30">
        {currentTenant.bannerImage && (
          <div className="absolute inset-0 opacity-20">
            <img
              src={resolveImageUrl(currentTenant.bannerImage)}
              alt={currentTenant.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-9 sm:py-14">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentTenant.district} · Arequipa, Perú</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              {currentTenant.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium">
              {currentTenant.tagline}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs text-slate-200 font-medium">
              <span className="flex items-center gap-1.5 bg-blue-900/60 px-3 py-1.5 rounded-lg border border-amber-500/30">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Delivery contraentrega a domicilio</span>
              </span>
              <span className="flex items-center gap-1.5 bg-blue-900/60 px-3 py-1.5 rounded-lg border border-amber-500/30">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Pagas al recibir (Efectivo / Yape / Plin)</span>
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getTenantCatalogUrl());
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                className="flex items-center gap-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-400/50 cursor-pointer transition-colors shadow-2xs"
                title="Copiar link de acceso para compartir con amigos"
              >
                {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                <span>{linkCopied ? '¡Link Copiado!' : 'Copiar Link Tienda'}</span>
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 cursor-pointer transition-colors"
                title="Ver QR y compartir por WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Compartir Catálogo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Search & Categories Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar productos en el catálogo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium text-slate-800"
              />
            </div>

            {/* Delivery Alert info */}
            <div className="text-xs text-blue-950 bg-blue-50/80 border border-amber-400/40 px-3.5 py-2 rounded-xl flex items-center gap-2 font-medium">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {currentTenant.freeDeliveryThreshold > 0 
                  ? `¡Envío GRATIS en Arequipa a partir de S/. ${currentTenant.freeDeliveryThreshold.toFixed(2)}!`
                  : `Costo delivery contraentrega: S/. ${currentTenant.defaultDeliveryFee.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer capitalize ${
                  selectedCategory === cat
                    ? 'bg-blue-950 text-amber-300 shadow-xs border border-amber-500/40'
                    : 'bg-slate-100 text-slate-600 hover:text-blue-950 hover:bg-slate-200/80'
                }`}
              >
                {cat === 'todos' ? 'Todos los productos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {catalogProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-sm font-bold text-blue-950">No encontramos productos en esta búsqueda</p>
            <p className="text-xs text-slate-500 mt-1">Prueba seleccionando otra categoría o borra el texto de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {catalogProducts.map((product) => {
              const inCart = cart.find((i) => i.product.id === product.id);
              const isOut = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-amber-400/60 transition-all group shadow-2xs"
                >
                  <div>
                    {/* Image */}
                    <div className="aspect-4/3 w-full bg-slate-100 overflow-hidden relative">
                      {product.imageUrl ? (
                        <img
                          src={resolveImageUrl(product.imageUrl)}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                          {product.category}
                        </div>
                      )}

                      {/* Stock badge */}
                      {isOut && (
                        <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-2xs flex items-center justify-center text-amber-300 font-bold text-xs uppercase tracking-wider">
                          Agotado Temporalmente
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-1">
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                        {product.category}
                      </p>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-950 transition-colors">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 pt-0.5">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Price & Add CTA */}
                  <div className="p-4 pt-0">
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-blue-950 font-mono tabular-nums">
                          S/. {product.salePrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-0.5 font-medium">/{product.unit}</span>
                      </div>

                      {inCart ? (
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                          <button
                            onClick={() => updateCartQuantity(product.id, inCart.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-blue-950 hover:bg-white rounded cursor-pointer transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-bold px-1 tabular-nums text-blue-950">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(product, 1)}
                            disabled={inCart.quantity >= product.stock}
                            className="w-6 h-6 flex items-center justify-center text-blue-950 hover:bg-white disabled:opacity-30 rounded cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={isOut}
                          onClick={() => addToCart(product, 1)}
                          className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-blue-950 hover:bg-blue-900 disabled:opacity-40 border border-amber-500/40 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-400" />
                          <span>Agregar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Customer Catalog Share & Footer Banner */}
        <div className="mt-12 p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-sm font-bold text-blue-950 flex items-center justify-center md:justify-start gap-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>{currentTenant.name} · Catálogo Oficial</span>
            </h4>
            <p className="text-xs text-slate-500">
              {currentTenant.address}, {currentTenant.district} · WhatsApp: +{currentTenant.whatsappNumber}
            </p>
            <p className="text-[11px] text-amber-800 font-medium">
              Link directo del catálogo: <span className="font-mono text-blue-950 font-bold select-all">{getTenantCatalogUrl()}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(getTenantCatalogUrl());
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-blue-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-600" />}
              <span>{linkCopied ? '¡Link Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2 bg-blue-950 hover:bg-blue-900 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver QR & Difusión</span>
            </button>
          </div>
        </div>

      </div>

      {/* Floating Bottom Cart Bar */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-2xl shadow-2xl p-3 px-4 flex items-center justify-between border border-amber-400/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-mono font-black text-xs shadow-xs">
                {cartItemsCount}
              </div>
              <div>
                <p className="text-[11px] text-slate-300 font-medium">Total de tu pedido</p>
                <p className="text-base font-black font-mono tabular-nums text-amber-300">
                  S/. {cartTotal.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <span>Ver Carrito & Pedir</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cart & Checkout Slide-Over Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-blue-950/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
            
            {/* Drawer Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between border-b border-amber-500/40">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Tu Carrito de Compras ({cartItemsCount} ítems)
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 divide-y divide-slate-100">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{product.name}</p>
                    <p className="text-slate-500 font-mono tabular-nums">
                      S/. {product.salePrice.toFixed(2)} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 py-1 font-mono font-bold text-blue-950">{quantity}</span>
                      <button
                        onClick={() => addToCart(product, 1)}
                        disabled={quantity >= product.stock}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-16 text-right font-mono font-black text-blue-950 tabular-nums">
                      S/. {(product.salePrice * quantity).toFixed(2)}
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-slate-300 hover:text-rose-600 cursor-pointer p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery & WhatsApp Order Checkout Form */}
            <form onSubmit={handleSendOrder} className="p-5 border-t border-slate-200 bg-slate-50/90 space-y-3.5 text-xs">
              <h3 className="font-bold text-blue-950 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Datos para la Entrega Contraentrega en Arequipa</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Tu Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Gabriela Nuñez"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Celular / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 954 123 456"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Distrito de Arequipa *</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value as ArequipaDistrict)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-medium text-slate-800"
                >
                  {AREQUIPA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d} {currentTenant.deliveryCoverage.includes(d) ? '✓' : '(Zona periférica)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Dirección Exacta *</label>
                <input
                  type="text"
                  required
                  placeholder="Calle, avenida, número y dpto..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Referencia de llegada</label>
                <input
                  type="text"
                  placeholder="Ej. Frente al parque, portón marrón..."
                  value={customerReference}
                  onChange={(e) => setCustomerReference(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-medium"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-[10px] font-bold text-slate-800 block mb-1">
                  Forma de Pago Contraentrega (Pagas al recibir)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo_contraentrega')}
                    className={`py-1.5 px-1 text-center rounded-lg border transition-all cursor-pointer text-[11px] font-bold ${
                      paymentMethod === 'efectivo_contraentrega'
                        ? 'bg-blue-950 text-amber-300 border-amber-500/50 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('yape_contraentrega')}
                    className={`py-1.5 px-1 text-center rounded-lg border transition-all cursor-pointer text-[11px] font-bold ${
                      paymentMethod === 'yape_contraentrega'
                        ? 'bg-[#732282] text-white border-[#732282] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Yape
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('plin_contraentrega')}
                    className={`py-1.5 px-1 text-center rounded-lg border transition-all cursor-pointer text-[11px] font-bold ${
                      paymentMethod === 'plin_contraentrega'
                        ? 'bg-[#00d09c] text-neutral-950 border-[#00d09c] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Plin
                  </button>
                </div>

                {paymentMethod === 'efectivo_contraentrega' && (
                  <div className="mt-2 bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                    <span className="text-[10px] text-slate-600 font-medium">¿Con cuánto billete pagas?</span>
                    <input
                      type="number"
                      placeholder={`Ej. ${(Math.ceil(finalTotal / 10) * 10).toFixed(0)}`}
                      value={cashBillAmount}
                      onChange={(e) => setCashBillAmount(e.target.value)}
                      className="w-20 px-2 py-0.5 text-right font-mono font-bold text-xs border border-slate-200 rounded text-blue-950"
                    />
                  </div>
                )}
              </div>

              {/* Order Totals Summary */}
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal productos:</span>
                  <span className="font-mono tabular-nums">S/. {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío a {selectedDistrict}:</span>
                  <span className="font-mono tabular-nums font-bold">
                    {deliveryFee === 0 ? <strong className="text-emerald-700 font-black">GRATIS</strong> : `S/. ${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-blue-950 pt-1 border-t border-slate-200">
                  <span>TOTAL CONTRAENTREGA:</span>
                  <span className="font-mono tabular-nums text-base text-blue-950">
                    S/. {finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Send WhatsApp CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 hover:from-blue-900 hover:to-indigo-900 text-amber-300 font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg border border-amber-400/50 cursor-pointer active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5 text-amber-400" />
                <span>Pedir por WhatsApp (Pago Contraentrega)</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Order Confirmation Success Modal */}
      {orderConfirmedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-500/40 p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-800">
              <Check className="w-6 h-6 stroke-3 text-amber-700" />
            </div>

            <div>
              <h3 className="text-lg font-black text-blue-950">
                ¡Pedido Generado con Éxito!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Orden <strong className="font-mono text-blue-950">#{orderConfirmedData.orderNumber}</strong> registrada en {currentTenant.name}.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-left text-xs font-mono text-slate-700 max-h-40 overflow-y-auto whitespace-pre-wrap border border-slate-200">
              {orderConfirmedData.waMessage}
            </div>

            <p className="text-xs text-slate-500">
              Si tu WhatsApp no se abrió automáticamente, presiona el botón inferior para enviar el pedido:
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={orderConfirmedData.waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-950 to-blue-900 text-amber-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md border border-amber-400/40"
              >
                <MessageCircle className="w-4 h-4 text-amber-400" />
                <span>Abrir Chat de WhatsApp</span>
              </a>

              <button
                onClick={() => setOrderConfirmedData(null)}
                className="py-2 text-xs font-bold text-slate-600 hover:text-blue-950 cursor-pointer"
              >
                Seguir explorando el catálogo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

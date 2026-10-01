import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BotPersonality } from '../../types';
import { 
  Bot, 
  MessageCircle, 
  Sparkles, 
  Send, 
  RotateCcw, 
  Settings2, 
  Smartphone, 
  Check, 
  CheckCheck, 
  Link, 
  Coins, 
  Truck, 
  Package, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Radio,
  Sliders,
  Crown
} from 'lucide-react';

export const WhatsAppAIHub: React.FC = () => {
  const { 
    currentTenant, 
    whatsappAiConfig, 
    updateAiConfig, 
    chatMessages, 
    sendChatMessageToAi, 
    clearChatMessages, 
    isAiThinking,
    getTenantCatalogUrl,
    showNotification
  } = useStore();

  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'simulator' | 'config' | 'campaigns' | 'webhook'>('simulator');
  
  // Campaign generator state
  const [campaignSegment, setCampaignSegment] = useState('vip');
  const [campaignTopic, setCampaignTopic] = useState('Llegada de productos frescos de fin de semana');
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
  const [generatedCampaigns, setGeneratedCampaigns] = useState<{ title: string; text: string }[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const catalogUrl = getTenantCatalogUrl();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiThinking) return;
    const msg = inputMessage;
    setInputMessage('');
    await sendChatMessageToAi(msg);
  };

  const handleQuickPrompt = async (promptText: string) => {
    if (isAiThinking) return;
    await sendChatMessageToAi(promptText);
  };

  const handleGenerateCampaigns = async () => {
    setIsGeneratingCampaign(true);
    try {
      const res = await fetch('/api/ai/bulk-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment: campaignSegment,
          offerTopic: campaignTopic,
          tenant: currentTenant,
          catalogUrl
        })
      });
      const data = await res.json();
      setGeneratedCampaigns(data.campaigns || []);
      showNotification('Propuestas de mensajes generadas por IA', 'success');
    } catch (err) {
      console.error(err);
      showNotification('No se pudo generar la campaña', 'warning');
    } finally {
      setIsGeneratingCampaign(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showNotification('Texto copiado al portapapeles', 'success');
    setTimeout(() => setCopiedText(null), 2200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Bot className="w-3.5 h-3.5 text-emerald-600" />
            <span>Automatización con IA para WhatsApp · {currentTenant.name}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-950">
            Asistente Virtual & IA para WhatsApp
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Responde automáticamente consultas de precios, stock, envíos contraentrega y links de catálogo con Google Gemini
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs font-bold">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-blue-950 text-amber-300 shadow-2xs'
                : 'text-slate-600 hover:text-blue-950'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulador de Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-blue-950 text-amber-300 shadow-2xs'
                : 'text-slate-600 hover:text-blue-950'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Personalidad & Reglas</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'campaigns'
                ? 'bg-blue-950 text-amber-300 shadow-2xs'
                : 'text-slate-600 hover:text-blue-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campañas IA</span>
          </button>

          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'webhook'
                ? 'bg-blue-950 text-amber-300 shadow-2xs'
                : 'text-slate-600 hover:text-blue-950'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Conexión Real</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE WHATSAPP SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Phone Screen / Chat Container */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[640px]">
            
            {/* WhatsApp Phone Top Bar */}
            <div className="bg-[#075e54] text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-sm">
                  {currentTenant.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{whatsappAiConfig.botName}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </h3>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                    <span>En línea · Asistente IA de {currentTenant.name}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearChatMessages}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reiniciar conversación"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reiniciar</span>
                </button>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#efeae2] text-xs">
              
              <div className="text-center my-2">
                <span className="px-3 py-1 bg-white/80 backdrop-blur-xs text-[10px] text-slate-500 rounded-full shadow-2xs font-semibold">
                  Hoy · Conversación en vivo simulada
                </span>
              </div>

              {chatMessages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs space-y-1 ${
                        isBot
                          ? 'bg-white text-slate-900 rounded-tl-xs border border-slate-200/80'
                          : 'bg-[#d9fdd3] text-slate-900 rounded-tr-xs border border-emerald-200/60'
                      }`}
                    >
                      {isBot && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 pb-0.5">
                          <Bot className="w-3 h-3 text-emerald-700" />
                          <span>{whatsappAiConfig.botName} (IA)</span>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap leading-relaxed text-[12px]">
                        {msg.text}
                      </p>

                      <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-0.5 font-mono">
                        <span>{msg.timestamp}</span>
                        {isBot ? (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        ) : (
                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-xs p-3 shadow-xs border border-slate-200/80 flex items-center gap-2 text-xs text-slate-500">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" />
                    </div>
                    <span className="font-medium text-emerald-800">
                      {whatsappAiConfig.botName} está escribiendo...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Test Prompt Chips */}
            <div className="p-2.5 bg-slate-100 border-t border-slate-200 overflow-x-auto flex items-center gap-2 text-[11px]">
              <span className="text-slate-400 font-bold shrink-0 text-[10px] uppercase">
                Probar pregunta:
              </span>
              <button
                type="button"
                onClick={() => handleQuickPrompt('¿Qué productos tienes hoy casero y cuánto cuestan?')}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-blue-950 font-semibold rounded-lg border border-slate-200 shrink-0 cursor-pointer shadow-2xs hover:border-amber-400 transition-colors"
              >
                ¿Precios y stock de hoy?
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt('¿Cuánto me cuesta el delivery a Cayma y cuánto demora?')}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-blue-950 font-semibold rounded-lg border border-slate-200 shrink-0 cursor-pointer shadow-2xs hover:border-amber-400 transition-colors"
              >
                ¿Delivery a mi distrito?
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt('¿Cómo es el pago contraentrega? ¿Puedo pagar con Yape al recibir?')}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-blue-950 font-semibold rounded-lg border border-slate-200 shrink-0 cursor-pointer shadow-2xs hover:border-amber-400 transition-colors"
              >
                ¿Aceptan Yape contraentrega?
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt('Quiero ver fotos y armar mi pedido con carrito')}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-blue-950 font-semibold rounded-lg border border-slate-200 shrink-0 cursor-pointer shadow-2xs hover:border-amber-400 transition-colors"
              >
                ¿Link del catálogo virtual?
              </button>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Escribe como si fueras un cliente en WhatsApp..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isAiThinking}
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium text-slate-800 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isAiThinking}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl cursor-pointer shadow-xs transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

          {/* Right 1 Col: Live AI Inspector & Store Capabilities */}
          <div className="space-y-4">
            
            {/* Status Card */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-emerald-600" />
                  <span>Estado del Bot</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Activo
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Modelo de IA:</span>
                  <span className="font-mono font-bold text-blue-950">Gemini 3.8 Flash</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Personalidad:</span>
                  <span className="font-bold text-amber-700 capitalize">
                    {whatsappAiConfig.personality.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Tienda vinculada:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[150px]">
                    {currentTenant.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Knowledge Base Live Injected */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Base de Conocimiento Activa</span>
              </h4>

              <div className="space-y-2 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-blue-950" />
                  <span>Acceso en vivo a tu inventario con precios en Soles (S/.)</span>
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-blue-950" />
                  <span>Cálculo automático de delivery en distritos de Arequipa</span>
                </p>
                <p className="flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5 text-blue-950" />
                  <span>Instrucciones de pago contraentrega (Efectivo / Yape / Plin)</span>
                </p>
                <p className="flex items-center gap-2">
                  <Link className="w-3.5 h-3.5 text-blue-950" />
                  <span>Envío directo de tu link de catálogo virtual</span>
                </p>
              </div>
            </div>

            {/* Customer Link Card */}
            <div className="p-4 bg-gradient-to-br from-blue-950 to-blue-900 text-white rounded-2xl border border-amber-500/40 shadow-xs space-y-2.5">
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Link de Catálogo Compartido por el Bot:
              </p>
              <div className="p-2 bg-white/10 rounded-lg text-xs font-mono select-all truncate text-slate-200">
                {catalogUrl}
              </div>
              <button
                onClick={() => handleCopy(catalogUrl)}
                className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-blue-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Enlace</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: BOT CONFIGURATION & PERSONALITY */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-blue-950">
              Personalidad y Comportamiento del Asistente
            </h3>
            <p className="text-xs text-slate-500">
              Modifica cómo saluda y responde tu bot de WhatsApp a tus clientes de Arequipa.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nombre del Asistente Virtual</label>
              <input
                type="text"
                value={whatsappAiConfig.botName}
                onChange={(e) => updateAiConfig({ botName: e.target.value })}
                className="w-full max-w-md px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-950 focus:outline-none font-medium"
              />
            </div>

            {/* Personality Radio Choices */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Estilo de Respuesta & Personalidad</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => updateAiConfig({ personality: 'amable_arequipeno' })}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-1 ${
                    whatsappAiConfig.personality === 'amable_arequipeno'
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="font-extrabold text-blue-950 text-xs">🌋 Amable Arequipeño</p>
                  <p className="text-[11px] text-slate-600">
                    Cálido, hospitalario, llama caserito/a y menciona el cariño por la tradición local.
                  </p>
                </div>

                <div
                  onClick={() => updateAiConfig({ personality: 'formal_comercial' })}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-1 ${
                    whatsappAiConfig.personality === 'formal_comercial'
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="font-extrabold text-blue-950 text-xs">👔 Formal & Directo</p>
                  <p className="text-[11px] text-slate-600">
                    Profesional, pulcro y ejecutivo. Ideal para atención rápida de negocios y oficinas.
                  </p>
                </div>

                <div
                  onClick={() => updateAiConfig({ personality: 'vendedor_proactivo' })}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-1 ${
                    whatsappAiConfig.personality === 'vendedor_proactivo'
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="font-extrabold text-blue-950 text-xs">⚡ Vendedor Proactivo</p>
                  <p className="text-[11px] text-slate-600">
                    Enfocado en cierre de ventas, sugiere combos, promociones y confirma el pedido.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mensaje de Bienvenida Automático</label>
              <textarea
                rows={2}
                value={whatsappAiConfig.welcomeMessage}
                onChange={(e) => updateAiConfig({ welcomeMessage: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Instrucciones Especiales del Comerciante (Prompt Extra)</label>
              <textarea
                rows={3}
                placeholder="Ejemplo: Si preguntan por queso majesino indícales que llegó hoy fresco. Recuerda siempre ofrecer vuelto si pagan en efectivo con billete de 100..."
                value={whatsappAiConfig.customPrompt || ''}
                onChange={(e) => updateAiConfig({ customPrompt: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-950 focus:outline-none"
              />
            </div>

            {/* Checkbox Triggers */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="font-bold text-slate-700 block">Funciones Automatizadas Activas:</label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappAiConfig.autoReplyPriceStock}
                  onChange={(e) => updateAiConfig({ autoReplyPriceStock: e.target.checked })}
                  className="rounded text-blue-950 focus:ring-0 cursor-pointer"
                />
                <span className="font-medium text-slate-800">Responder precios y stock de productos en tiempo real</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappAiConfig.autoSendCatalogLink}
                  onChange={(e) => updateAiConfig({ autoSendCatalogLink: e.target.checked })}
                  className="rounded text-blue-950 focus:ring-0 cursor-pointer"
                />
                <span className="font-medium text-slate-800">Enviar enlace al catálogo virtual con carrito de compras</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappAiConfig.autoSendPaymentInfo}
                  onChange={(e) => updateAiConfig({ autoSendPaymentInfo: e.target.checked })}
                  className="rounded text-blue-950 focus:ring-0 cursor-pointer"
                />
                <span className="font-medium text-slate-800">Recordar condiciones de pago contraentrega (Efectivo / Yape / Plin)</span>
              </label>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: AI CAMPAIGN & PROMOTIONAL GENERATOR */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-3xl">
            <div>
              <h3 className="text-base font-extrabold text-blue-950">
                Generador de Campañas & Mensajes Masivos con IA
              </h3>
              <p className="text-xs text-slate-500">
                Crea mensajes de difusión atractivos y personalizados para enviar por WhatsApp a los clientes registrados en tu CRM.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Segmento del CRM</label>
                <select
                  value={campaignSegment}
                  onChange={(e) => setCampaignSegment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-950 focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="vip">Clientes VIP (Mayor gasto)</option>
                  <option value="frecuente">Clientes Frecuentes</option>
                  <option value="inactivo">Clientes Inactivos (Reactivación)</option>
                  <option value="todos">Todos los Clientes en Arequipa</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tema u Oferta Destacada</label>
                <input
                  type="text"
                  value={campaignTopic}
                  onChange={(e) => setCampaignTopic(e.target.value)}
                  placeholder="Ej. Oferta en quesos y embutidos, delivery gratis..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-950 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateCampaigns}
              disabled={isGeneratingCampaign}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-indigo-950 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isGeneratingCampaign ? 'Generando propuestas...' : 'Generar Mensajes con Gemini'}</span>
            </button>
          </div>

          {generatedCampaigns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              {generatedCampaigns.map((camp, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-block">
                      Opción #{idx + 1}: {camp.title}
                    </span>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {camp.text}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleCopy(camp.text)}
                      className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedText === camp.text ? '¡Copiado!' : 'Copiar Texto'}</span>
                    </button>

                    <button
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(camp.text)}`, '_blank')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Abrir en WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REAL WHATSAPP CONNECTION & WEBHOOK GUIDE */}
      {activeTab === 'webhook' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-3xl space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-950 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Conexión de Producción</span>
            </div>
            <h3 className="text-xl font-extrabold text-blue-950">
              Cómo Conectar tu Número Real de WhatsApp al Bot de IA
            </h3>
            <p className="text-xs text-slate-500">
              Mitra POS incluye la lógica completa de backend en el endpoint <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-950">/api/ai/whatsapp-reply</code> listo para conectar a cualquier pasarela de WhatsApp.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Option A: Evolution API / Baileys (Recomendado para pequeños comerciantes) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                  <span>Opción A: Escaneo de Código QR (Evolution API / Baileys)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Más Popular</span>
                </h4>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Permite usar tu número de teléfono móvil actual de WhatsApp escaneando un código QR desde tu celular (igual que WhatsApp Web).
              </p>
              <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
                <p>1. Conecta tu instancia de Evolution API o Baileys.</p>
                <p>2. Configura el Webhook apuntando a tu backend:</p>
                <p className="text-blue-950 font-bold bg-slate-100 p-1.5 rounded select-all">
                  POST /api/ai/whatsapp-reply
                </p>
                <p>3. Cuando un casero te escriba, el bot responde automáticamente con datos de stock y contraentrega.</p>
              </div>
            </div>

            {/* Option B: WhatsApp Cloud API Oficial (Meta) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-blue-950 text-sm">
                Opción B: WhatsApp Business Cloud API (Meta Oficial)
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Para negocios consolidados que requieren la API oficial de Meta para alta escala de mensajes y plantillas verificadas.
              </p>
              <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700">
                <p>Webhook URL de recepción de eventos:</p>
                <p className="text-blue-950 font-bold bg-slate-100 p-1.5 rounded select-all mt-1">
                  POST /api/ai/whatsapp-reply
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

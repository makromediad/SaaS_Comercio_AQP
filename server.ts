import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI client according to AI Studio guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * 1. AI WhatsApp Reply Endpoint
 * Automates customer service chats for the Arequipa small merchant.
 */
app.post('/api/ai/whatsapp-reply', async (req: Request, res: Response) => {
  try {
    const { 
      tenant, 
      incomingMessage, 
      conversationHistory = [], 
      products = [], 
      catalogUrl = '',
      config = {}
    } = req.body;

    if (!incomingMessage || typeof incomingMessage !== 'string') {
      res.status(400).json({ error: 'incomingMessage es requerido.' });
      return;
    }

    // Format available stock summary for the model context
    const inventorySummary = products
      .slice(0, 30)
      .map((p: any) => `- ${p.name}: S/. ${p.salePrice.toFixed(2)} (${p.stock} disponibles en stock, categoría: ${p.category})`)
      .join('\n');

    const personalityInstructions: Record<string, string> = {
      amable_arequipeno: 'Tu tono es cálido, casero, muy amable y cercano, con toques respetuosos de la tradición arequipeña (puedes usar casero/caserita, vecino/a, hablar del volcán Misti si es propicio). Siempre cordial y hospitalario.',
      formal_comercial: 'Tu tono es profesional, pulcro, educado y directo. Brinda información ejecutiva clara y concisa.',
      vendedor_proactivo: 'Tu tono es enérgico, comercial, orientado al cierre de venta. Sugiere productos complementarios, destaca ofertas y anima a confirmar el pedido hoy mismo.'
    };

    const personalityText = personalityInstructions[config.personality] || personalityInstructions.amable_arequipeno;

    const systemInstruction = `Eres ${config.botName || 'el asistente virtual oficial'} de la tienda "${tenant.name}", ubicada en ${tenant.address} (${tenant.district}, Arequipa, Perú).

INFORMACIÓN DEL COMERCIO:
- Nombre: ${tenant.name}
- Distrito base: ${tenant.district}, Arequipa
- Cobertura de delivery contraentrega: ${tenant.deliveryCoverage ? tenant.deliveryCoverage.join(', ') : 'Distritos principales de Arequipa (Yanahuara, Cayma, Cercado, Cerro Colorado, J.L. Bustamante y Rivero)'}
- Costo de envío: S/. ${(tenant.defaultDeliveryFee || 5).toFixed(2)} (¡Gratis a partir de S/. ${(tenant.freeDeliveryThreshold || 50).toFixed(2)}!)
- Formas de pago CONTRAENTREGA: Efectivo (el cliente puede indicar con cuánto paga para llevarle vuelto), Yape (al número: ${tenant.yapePhone || tenant.whatsappNumber}) o Plin (al número: ${tenant.plinPhone || tenant.whatsappNumber}) al recibir el pedido en la puerta de su casa.
- Catálogo virtual oficial con carrito de compras: ${catalogUrl}

PRODUCTOS DISPONIBLES EN STOCK:
${inventorySummary || 'Productos variados tradicionales, abarrotes y delicias arequipeñas.'}

PERSONALIDAD & ESTILO:
${personalityText}
${config.customPrompt ? `Instrucciones adicionales del dueño: ${config.customPrompt}` : ''}

REGLAS DE RESPUESTA PARA WHATSAPP:
1. Responde en español peruano, usando formato adecuado para WhatsApp (*negrita* para nombres de productos y precios, viñetas •, emojis naturales).
2. Sé conciso y claro (entre 2 y 4 párrafos cortos). Los clientes en WhatsApp leen rápido en su celular.
3. Si el cliente pregunta por precios o disponibilidad, consulta la lista de productos y dile los precios exactos en Soles (S/.).
4. Si el cliente pregunta por delivery o pedidos, recuérdale que el pago es CONTRAENTREGA (al recibir en su casa paga en efectivo o con Yape/Plin).
5. Invita al cliente a ver o pedir por el catálogo con link: ${catalogUrl} si desea armar su carrito o ver fotos de los productos.
6. Nunca inventes promociones que no existan. Si un producto no está en la lista, indica amablemente que consultarás con almacén o sugiere una alternativa parecida.`;

    // Build chat conversation context
    const previousTurns = conversationHistory.slice(-6).map((msg: any) => ({
      role: msg.sender === 'customer' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // If there is only one message or history is empty
    const contents = [
      ...previousTurns,
      {
        role: 'user',
        parts: [{ text: incomingMessage }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95
      }
    });

    const replyText = response.text || '¡Hola casero! Gracias por escribirnos a ' + tenant.name + '. ¿En qué podemos ayudarte hoy?';

    res.json({
      reply: replyText,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error generating WhatsApp AI reply:', error);
    res.status(500).json({ 
      error: 'Error al procesar la respuesta con IA.', 
      details: error?.message || 'Error desconocido' 
    });
  }
});

/**
 * 2. AI CRM Customer Insights Endpoint
 * Analyzes customer history and gives deep buyer insights & recommended WhatsApp message.
 */
app.post('/api/ai/crm-summary', async (req: Request, res: Response) => {
  try {
    const { customer, tenant, recentSales = [] } = req.body;

    if (!customer) {
      res.status(400).json({ error: 'customer es requerido.' });
      return;
    }

    const prompt = `Analiza el siguiente perfil y comportamiento de compra de un cliente en un pequeño comercio de Arequipa ("${tenant.name}", ${tenant.district}).

DATOS DEL CLIENTE:
- Nombre: ${customer.name}
- Distrito de entrega: ${customer.district}
- Pedidos totales: ${customer.totalOrders}
- Gasto acumulado: S/. ${(customer.totalSpent || 0).toFixed(2)}
- Ticket promedio: S/. ${(customer.averageTicket || 0).toFixed(2)}
- Etiqueta actual: ${customer.tag}
- Notas previas: ${customer.notes || 'Ninguna'}
- Productos frecuentes: ${customer.favoriteProducts ? customer.favoriteProducts.join(', ') : 'Varios'}

TAREA:
Genera un análisis CRM profesional y conciso en formato JSON con las siguientes claves:
1. "persona": Una etiqueta o arquetipo de comprador breve (ej. "Gourmet Tradicional Arequipeño", "Compradora Familiar de Fin de Semana", "Consumidor Frecuente Express").
2. "summary": Un resumen de 2 líneas sobre sus patrones de consumo, lealtad y preferencias en Arequipa.
3. "churnRisk": Nivel de riesgo de abandono ("Bajo", "Medio", o "Alto").
4. "suggestedMessage": Un mensaje personalizado listo para enviar por WhatsApp para reactivarlo o fidelizarlo, con tono cálido arequipeño, mencionando sus gustos o sugiriendo un pedido contraentrega.

Responde ÚNICAMENTE un objeto JSON válido con estas 4 propiedades.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6
      }
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        persona: 'Cliente Frecuente Arequipeño',
        summary: `Cliente con ${customer.totalOrders} compras registradas en ${customer.district}.`,
        churnRisk: 'Bajo',
        suggestedMessage: `¡Hola ${customer.name}! 🌋 En ${tenant.name} tenemos productos frescos esperándote. ¿Deseas hacer tu pedido contraentrega para hoy?`
      };
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error generating CRM summary:', error);
    res.status(500).json({ 
      error: 'Error al generar análisis CRM con IA.',
      details: error?.message || 'Error desconocido'
    });
  }
});

/**
 * 3. AI Bulk Promotion Campaign Generator
 */
app.post('/api/ai/bulk-promo', async (req: Request, res: Response) => {
  try {
    const { segment, offerTopic, tenant, catalogUrl } = req.body;

    const prompt = `Crea 2 propuestas de mensajes publicitarios para difundir por WhatsApp a una lista de clientes en la ciudad de Arequipa.

DATOS:
- Tienda: ${tenant.name} (${tenant.district}, Arequipa)
- Segmento objetivo: ${segment}
- Tema o producto destacado: ${offerTopic || 'Novedades de la semana, delivery contraentrega y productos locales'}
- Enlace del catálogo virtual para pedir: ${catalogUrl}
- Modalidad: Pago contraentrega al recibir en Arequipa (Efectivo / Yape / Plin)

REGLAS:
- Formato optimizado para WhatsApp con emojis, negritas (*texto*) y llamado a la acción claro.
- Respeta la cultura de comercio arequipeña (cercanía, calidad, entrega puntual).
- Devuelve un JSON con un array "campaigns", donde cada elemento tiene "title" (título descriptivo) y "text" (mensaje completo).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });

    const parsed = JSON.parse(response.text || '{"campaigns":[]}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating promo campaigns:', error);
    res.status(500).json({ 
      error: 'Error al generar campañas.',
      details: error?.message || 'Error desconocido'
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Mitra POS Server running on port ${PORT}`);
  });
}

startServer();

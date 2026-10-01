export type ArequipaDistrict = 
  | 'Cercado de Arequipa'
  | 'Yanahuara'
  | 'Cayma'
  | 'Cerro Colorado'
  | 'José Luis Bustamante y Rivero'
  | 'Paucarpata'
  | 'Sachaca'
  | 'Miraflores'
  | 'Mariano Melgar'
  | 'Alto Selva Alegre'
  | 'Socabaya'
  | 'Tiabaya'
  | 'Jacobo Hunter'
  | 'Umacollo';

export type PaymentMethod = 'efectivo_contraentrega' | 'yape_contraentrega' | 'plin_contraentrega';

export type SaaSPlan = 'basico' | 'emprendedor' | 'pro_ia';
export type BusinessCategory = 'bodega' | 'minimarket' | 'licoreria' | 'restaurante' | 'panaderia' | 'botica' | 'artesania' | 'otro';
export type TenantStatus = 'activo' | 'prueba' | 'suspendido';
export type ViewMode = 'admin' | 'catalog' | 'superadmin';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  district: ArequipaDistrict;
  address: string;
  whatsappNumber: string; // e.g. "51954123456"
  yapePhone?: string;
  plinPhone?: string;
  ownerName: string;
  ownerEmail?: string;
  ruc?: string;
  plan?: SaaSPlan;
  businessCategory?: BusinessCategory;
  status?: TenantStatus;
  monthlyFee?: number; // in S/.
  notes?: string;
  bannerImage?: string;
  currency: string; // "S/."
  defaultDeliveryFee: number; // in S/.
  freeDeliveryThreshold: number; // in S/.
  deliveryCoverage: string[]; // list of districts covered
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  description: string;
  costPrice: number; // in S/.
  salePrice: number; // in S/.
  stock: number;
  minStockAlert: number;
  unit: 'unid' | 'kg' | 'pqte' | 'litro' | 'caja';
  imageUrl: string;
  isActive: boolean;
  featuredInCatalog: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  tenantId: string;
  receiptNumber: string; // e.g. "B001-000124"
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  costTotal: number;
  profit: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number;
  customerName?: string;
  customerDni?: string;
  source: 'pos' | 'catalogo_whatsapp';
  date: string; // ISO string
  notes?: string;
}

export type OrderStatus = 'pendiente' | 'confirmado' | 'en_camino' | 'entregado' | 'cancelado';

export interface WhatsAppOrder {
  id: string;
  tenantId: string;
  orderNumber: string; // e.g. "ORD-8941"
  customerName: string;
  customerPhone: string;
  district: ArequipaDistrict;
  address: string;
  reference: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentDetail?: string; // e.g. "Paga con S/. 50 (Vuelto: S/. 18)"
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string;
}

export type CustomerTag = 'vip' | 'frecuente' | 'nuevo' | 'ocasional' | 'inactivo';

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  dni?: string;
  district: ArequipaDistrict;
  address: string;
  reference?: string;
  tag: CustomerTag;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  averageTicket: number;
  lastOrderDate: string;
  createdAt: string;
  favoriteProducts?: string[];
  aiInsights?: {
    summary: string;
    suggestedMessage: string;
    persona: string;
    lastAnalyzedAt: string;
  };
}

export type BotPersonality = 'amable_arequipeno' | 'formal_comercial' | 'vendedor_proactivo';

export interface WhatsAppAiConfig {
  enabled: boolean;
  botName: string;
  personality: BotPersonality;
  customPrompt?: string;
  welcomeMessage: string;
  autoReplyPriceStock: boolean;
  autoSendCatalogLink: boolean;
  autoSendPaymentInfo: boolean;
}

export interface AiChatMessage {
  id: string;
  sender: 'customer' | 'bot' | 'merchant';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export type AdminTab = 'dashboard' | 'pos' | 'inventory' | 'reports' | 'orders' | 'crm' | 'ai_automation' | 'settings';

export type ReportPeriod = 'hoy' | 'semana' | 'mes' | 'historico';

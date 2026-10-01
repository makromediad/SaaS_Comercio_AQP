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

export type ReportPeriod = 'hoy' | 'semana' | 'mes' | 'historico';

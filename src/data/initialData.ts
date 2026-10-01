import { Tenant, Product, Sale, WhatsAppOrder } from '../types';

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-characato',
    name: 'Bodega & Delicatessen La Characata',
    slug: 'bodega-la-characata',
    tagline: 'Lo mejor del campo y la tradición arequipeña en tu mesa',
    district: 'Yanahuara',
    address: 'Calle Cuesta del Ángel 114, Yanahuara, Arequipa',
    whatsappNumber: '51954123456',
    yapePhone: '954 123 456',
    plinPhone: '954 123 456',
    ownerName: 'Doña Rosa Valdivia',
    bannerImage: '/src/assets/images/store_bodega_showcase_1790861644926.jpg',
    currency: 'S/.',
    defaultDeliveryFee: 5.0,
    freeDeliveryThreshold: 60.0,
    deliveryCoverage: ['Yanahuara', 'Cayma', 'Cercado de Arequipa', 'Cerro Colorado', 'Sachaca'],
    active: true,
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'tenant-sancamilo',
    name: 'Minimarket San Camilo Express',
    slug: 'sancamilo-express',
    tagline: 'Abarrotes, lácteos y productos frescos al mejor precio de Arequipa',
    district: 'José Luis Bustamante y Rivero',
    address: 'Av. Dolores 420, José Luis Bustamante y Rivero, Arequipa',
    whatsappNumber: '51959789012',
    yapePhone: '959 789 012',
    plinPhone: '959 789 012',
    ownerName: 'Carlos Mendoza',
    bannerImage: '/src/assets/images/hero_arequipa_market_1790861630483.jpg',
    currency: 'S/.',
    defaultDeliveryFee: 6.0,
    freeDeliveryThreshold: 50.0,
    deliveryCoverage: ['José Luis Bustamante y Rivero', 'Paucarpata', 'Cercado de Arequipa', 'Socabaya'],
    active: true,
    createdAt: '2026-02-01T09:30:00.000Z'
  },
  {
    id: 'tenant-mistiboutique',
    name: 'Boutique Tradición & Sillar',
    slug: 'boutique-sillar',
    tagline: 'Chocolates La Ibérica, dulces típicos y regalos tradicionales',
    district: 'Cercado de Arequipa',
    address: 'Calle Santa Catalina 208 (Frente al Monasterio), Cercado',
    whatsappNumber: '51958654321',
    yapePhone: '958 654 321',
    plinPhone: '958 654 321',
    ownerName: 'Mariana Bedregal',
    bannerImage: '/src/assets/images/artisan_product_chocolates_1790861657657.jpg',
    currency: 'S/.',
    defaultDeliveryFee: 5.0,
    freeDeliveryThreshold: 80.0,
    deliveryCoverage: ['Cercado de Arequipa', 'Yanahuara', 'Cayma', 'Miraflores', 'Umacollo'],
    active: true,
    createdAt: '2026-02-20T10:00:00.000Z'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Tenant Characato Products
  {
    id: 'prod-001',
    tenantId: 'tenant-characato',
    name: 'Queso Paria Arequipeño Majes (500g)',
    sku: 'QSO-PAR-500',
    barcode: '7750123001',
    category: 'Lácteos & Quesos',
    description: 'Queso madurado de pasta semidura, auténtico del Valle del Majes. Textura cremosa ideal para choclo con queso o pastel de papa.',
    costPrice: 14.50,
    salePrice: 22.00,
    stock: 24,
    minStockAlert: 5,
    unit: 'unid',
    imageUrl: '/src/assets/images/artisan_queso_helado_1790861669062.jpg',
    isActive: true,
    featuredInCatalog: true
  },
  {
    id: 'prod-002',
    tenantId: 'tenant-characato',
    name: 'Chocolates La Ibérica Tableta Tradicional 100g',
    sku: 'CHO-IBE-100',
    barcode: '7750123002',
    category: 'Chocolatería',
    description: 'El clásico chocolate con leche al 40% cacao puro de la emblemática fábrica arequipeña fundada en 1909.',
    costPrice: 6.20,
    salePrice: 9.50,
    stock: 45,
    minStockAlert: 10,
    unit: 'unid',
    imageUrl: '/src/assets/images/artisan_product_chocolates_1790861657657.jpg',
    isActive: true,
    featuredInCatalog: true
  },
  {
    id: 'prod-003',
    tenantId: 'tenant-characato',
    name: 'Bombones Surtidos La Ibérica Caja Especial 180g',
    sku: 'CHO-BOM-180',
    barcode: '7750123003',
    category: 'Chocolatería',
    description: 'Fina selección de bombones rellenos con manjar blanco, praliné de avellanas y trufa de pisco.',
    costPrice: 21.00,
    salePrice: 32.00,
    stock: 18,
    minStockAlert: 4,
    unit: 'caja',
    imageUrl: '/src/assets/images/artisan_product_chocolates_1790861657657.jpg',
    isActive: true,
    featuredInCatalog: true
  },
  {
    id: 'prod-004',
    tenantId: 'tenant-characato',
    name: 'Queso Helado Arequipeño Artesanal (Tarrina 500ml)',
    sku: 'POS-QHD-500',
    barcode: '7750123004',
    category: 'Postres & Dulces',
    description: 'Postre emblemático arequipeño a base de leche fresca, coco rayado, canela y clavo de olor, listo para disfrutar.',
    costPrice: 7.50,
    salePrice: 13.00,
    stock: 15,
    minStockAlert: 4,
    unit: 'unid',
    imageUrl: '/src/assets/images/artisan_queso_helado_1790861669062.jpg',
    isActive: true,
    featuredInCatalog: true
  },
  {
    id: 'prod-005',
    tenantId: 'tenant-characato',
    name: 'Kola Escocesa Arequipeña 1.5L',
    sku: 'BEB-KOL-150',
    barcode: '7750123005',
    category: 'Bebidas & Gaseosas',
    description: 'Gaseosa arequipeña elaborada con agua mineral de Yura desde la década de 1950. Sabor único frutal.',
    costPrice: 5.20,
    salePrice: 8.00,
    stock: 36,
    minStockAlert: 8,
    unit: 'unid',
    imageUrl: '/src/assets/images/store_bodega_showcase_1790861644926.jpg',
    isActive: true,
    featuredInCatalog: true
  },
  {
    id: 'prod-006',
    tenantId: 'tenant-characato',
    name: 'Pan de Tres Puntas Tradicional (Bolsa x 6 unid)',
    sku: 'PAN-3PT-006',
    barcode: '7750123006',
    category: 'Panadería',
    description: 'Horneado cada madrugada a leña. Crujiente por fuera y miga suave con anís, perfecto para adobo o queso.',
    costPrice: 3.50,
    salePrice: 5.50,
    stock: 20,
    minStockAlert: 5,
    unit: 'pqte',
    imageUrl: '/src/assets/images/hero_arequipa_market_1790861630483.jpg',
    isActive: true,
    featuredInCatalog: true
  },
  {
    id: 'prod-007',
    tenantId: 'tenant-characato',
    name: 'Miel de Abeja Pura Valle de Yarabamba 500g',
    sku: 'ABE-MIE-500',
    barcode: '7750123007',
    category: 'Abarrotes & Gourmet',
    description: 'Miel 100% pura y cruda recolectada en flores de eucalipto y molle de la campiña arequipeña.',
    costPrice: 13.00,
    salePrice: 20.00,
    stock: 12,
    minStockAlert: 3,
    unit: 'unid',
    imageUrl: '/src/assets/images/store_bodega_showcase_1790861644926.jpg',
    isActive: true,
    featuredInCatalog: true
  },
  {
    id: 'prod-008',
    tenantId: 'tenant-characato',
    name: 'Cerveza Arequipeña Doble Malta 650ml',
    sku: 'LIC-CRV-650',
    barcode: '7750123008',
    category: 'Licores & Cervezas',
    description: 'La cerveza nacida al pie del volcán Misti. Cuerpo balanceado, fresca y con carácter regional.',
    costPrice: 5.80,
    salePrice: 9.00,
    stock: 40,
    minStockAlert: 12,
    unit: 'unid',
    imageUrl: '/src/assets/images/store_bodega_showcase_1790861644926.jpg',
    isActive: true,
    featuredInCatalog: true
  },
  {
    id: 'prod-009',
    tenantId: 'tenant-characato',
    name: 'Té Sol de Arequipa (Caja x 25 sobres)',
    sku: 'BEB-TES-025',
    barcode: '7750123009',
    category: 'Infusiones',
    description: 'Infusión clásica de hierbas aromáticas andinas y canela para después de las comidas.',
    costPrice: 3.20,
    salePrice: 5.00,
    stock: 3, // low stock test
    minStockAlert: 6,
    unit: 'caja',
    imageUrl: '/src/assets/images/hero_arequipa_market_1790861630483.jpg',
    isActive: true,
    featuredInCatalog: true
  },

  // Tenant San Camilo Express Products
  {
    id: 'prod-101',
    tenantId: 'tenant-sancamilo',
    name: 'Aceite Primor Premium 1 Litro',
    sku: 'ACE-PRI-100',
    barcode: '7750123101',
    category: 'Abarrotes',
    description: 'Aceite vegetal comestible refinado, ideal para toda preparación gastronómica diaria.',
    costPrice: 7.20,
    salePrice: 10.50,
    stock: 50,
    minStockAlert: 10,
    unit: 'litro',
    imageUrl: '/src/assets/images/store_bodega_showcase_1790861644926.jpg',
    isActive: true,
    featuredInCatalog: true
  },
  {
    id: 'prod-102',
    tenantId: 'tenant-sancamilo',
    name: 'Arroz Costeño Extra Bolsa 5kg',
    sku: 'ARR-COS-005',
    barcode: '7750123102',
    category: 'Abarrotes',
    description: 'Arroz de grano largo seleccionado, rendidor y graneado garantizado.',
    costPrice: 19.50,
    salePrice: 25.00,
    stock: 22,
    minStockAlert: 5,
    unit: 'unid',
    imageUrl: '/src/assets/images/hero_arequipa_market_1790861630483.jpg',
    isActive: true,
    featuredInCatalog: true
  },
  {
    id: 'prod-103',
    tenantId: 'tenant-sancamilo',
    name: 'Leche Gloria Etiqueta Azul 400g (Pack x 6)',
    sku: 'LEC-GLO-006',
    barcode: '7750123103',
    category: 'Lácteos',
    description: 'Leche evaporada entera enriquecida con vitaminas A y D. Pack de 6 latas.',
    costPrice: 22.00,
    salePrice: 27.50,
    stock: 16,
    minStockAlert: 6,
    unit: 'pqte',
    imageUrl: '/src/assets/images/store_bodega_showcase_1790861644926.jpg',
    isActive: true,
    featuredInCatalog: true
  },
  {
    id: 'prod-104',
    tenantId: 'tenant-sancamilo',
    name: 'Queso Paria de Majes Kilo Fresco',
    sku: 'QSO-MAJ-1KG',
    barcode: '7750123104',
    category: 'Lácteos',
    description: 'Kilo de queso tradicional arequipeño para aderezos, sancochado o picadas familiares.',
    costPrice: 28.00,
    salePrice: 38.00,
    stock: 14,
    minStockAlert: 4,
    unit: 'kg',
    imageUrl: '/src/assets/images/artisan_queso_helado_1790861669062.jpg',
    isActive: true,
    featuredInCatalog: true
  },

  // Tenant Boutique Sillar Products
  {
    id: 'prod-201',
    tenantId: 'tenant-mistiboutique',
    name: 'Caja Regalo Arequipeña "Mi Arequipa Querida"',
    sku: 'REG-MIA-001',
    barcode: '7750123201',
    category: 'Regalos & Gourmet',
    description: 'Hermosa caja conmemorativa con chocolates La Ibérica, té de coca aromático y réplica de Claustros en sillar.',
    costPrice: 42.00,
    salePrice: 65.00,
    stock: 8,
    minStockAlert: 2,
    unit: 'caja',
    imageUrl: '/src/assets/images/artisan_product_chocolates_1790861657657.jpg',
    isActive: true,
    featuredInCatalog: true
  },
  {
    id: 'prod-202',
    tenantId: 'tenant-mistiboutique',
    name: 'Portarretrato Tallado en Piedra Sillar Artesanal',
    sku: 'ART-SIL-002',
    barcode: '7750123202',
    category: 'Artesanías en Sillar',
    description: 'Tallado a mano por maestros canteros de Añashuayco con motivos del Convento de Santa Catalina.',
    costPrice: 25.00,
    salePrice: 45.00,
    stock: 12,
    minStockAlert: 3,
    unit: 'unid',
    imageUrl: '/src/assets/images/hero_arequipa_market_1790861630483.jpg',
    isActive: true,
    featuredInCatalog: true
  }
];

export const INITIAL_SALES: Sale[] = [
  // Today's sales (2026-10-01)
  {
    id: 'sale-today-1',
    tenantId: 'tenant-characato',
    receiptNumber: 'B001-000142',
    items: [
      {
        productId: 'prod-001',
        productName: 'Queso Paria Arequipeño Majes (500g)',
        quantity: 2,
        unitPrice: 22.00,
        costPrice: 14.50,
        subtotal: 44.00
      },
      {
        productId: 'prod-006',
        productName: 'Pan de Tres Puntas Tradicional (Bolsa x 6 unid)',
        quantity: 1,
        unitPrice: 5.50,
        costPrice: 3.50,
        subtotal: 5.50
      }
    ],
    subtotal: 49.50,
    discount: 0,
    total: 49.50,
    costTotal: 32.50,
    profit: 17.00,
    paymentMethod: 'efectivo_contraentrega',
    amountPaid: 50.00,
    changeDue: 0.50,
    customerName: 'Manuel Guillén',
    customerDni: '29481923',
    source: 'pos',
    date: '2026-10-01T08:35:00.000Z'
  },
  {
    id: 'sale-today-2',
    tenantId: 'tenant-characato',
    receiptNumber: 'B001-000143',
    items: [
      {
        productId: 'prod-002',
        productName: 'Chocolates La Ibérica Tableta Tradicional 100g',
        quantity: 3,
        unitPrice: 9.50,
        costPrice: 6.20,
        subtotal: 28.50
      },
      {
        productId: 'prod-005',
        productName: 'Kola Escocesa Arequipeña 1.5L',
        quantity: 1,
        unitPrice: 8.00,
        costPrice: 5.20,
        subtotal: 8.00
      }
    ],
    subtotal: 36.50,
    discount: 1.50,
    total: 35.00,
    costTotal: 23.80,
    profit: 11.20,
    paymentMethod: 'yape_contraentrega',
    amountPaid: 35.00,
    changeDue: 0.00,
    customerName: 'Lucía Zegarra',
    source: 'pos',
    date: '2026-10-01T10:15:00.000Z'
  },
  {
    id: 'sale-today-3',
    tenantId: 'tenant-characato',
    receiptNumber: 'B001-000144',
    items: [
      {
        productId: 'prod-004',
        productName: 'Queso Helado Arequipeño Artesanal (Tarrina 500ml)',
        quantity: 2,
        unitPrice: 13.00,
        costPrice: 7.50,
        subtotal: 26.00
      },
      {
        productId: 'prod-003',
        productName: 'Bombones Surtidos La Ibérica Caja Especial 180g',
        quantity: 1,
        unitPrice: 32.00,
        costPrice: 21.00,
        subtotal: 32.00
      }
    ],
    subtotal: 58.00,
    discount: 0,
    total: 58.00,
    costTotal: 36.00,
    profit: 22.00,
    paymentMethod: 'plin_contraentrega',
    amountPaid: 58.00,
    changeDue: 0.00,
    customerName: 'Gonzalo Pinto',
    source: 'catalogo_whatsapp',
    date: '2026-10-01T12:45:00.000Z'
  },

  // Yesterday & This Week's sales
  {
    id: 'sale-week-1',
    tenantId: 'tenant-characato',
    receiptNumber: 'B001-000139',
    items: [
      {
        productId: 'prod-001',
        productName: 'Queso Paria Arequipeño Majes (500g)',
        quantity: 3,
        unitPrice: 22.00,
        costPrice: 14.50,
        subtotal: 66.00
      },
      {
        productId: 'prod-007',
        productName: 'Miel de Abeja Pura Valle de Yarabamba 500g',
        quantity: 1,
        unitPrice: 20.00,
        costPrice: 13.00,
        subtotal: 20.00
      }
    ],
    subtotal: 86.00,
    discount: 0,
    total: 86.00,
    costTotal: 56.50,
    profit: 29.50,
    paymentMethod: 'efectivo_contraentrega',
    amountPaid: 100.00,
    changeDue: 14.00,
    customerName: 'Patricia Chávez',
    source: 'pos',
    date: '2026-09-30T16:20:00.000Z'
  },
  {
    id: 'sale-week-2',
    tenantId: 'tenant-characato',
    receiptNumber: 'B001-000140',
    items: [
      {
        productId: 'prod-008',
        productName: 'Cerveza Arequipeña Doble Malta 650ml',
        quantity: 4,
        unitPrice: 9.00,
        costPrice: 5.80,
        subtotal: 36.00
      }
    ],
    subtotal: 36.00,
    discount: 0,
    total: 36.00,
    costTotal: 23.20,
    profit: 12.80,
    paymentMethod: 'yape_contraentrega',
    amountPaid: 36.00,
    changeDue: 0,
    customerName: 'Rodrigo Fuentes',
    source: 'pos',
    date: '2026-09-29T18:40:00.000Z'
  },
  {
    id: 'sale-week-3',
    tenantId: 'tenant-characato',
    receiptNumber: 'B001-000141',
    items: [
      {
        productId: 'prod-002',
        productName: 'Chocolates La Ibérica Tableta Tradicional 100g',
        quantity: 4,
        unitPrice: 9.50,
        costPrice: 6.20,
        subtotal: 38.00
      },
      {
        productId: 'prod-004',
        productName: 'Queso Helado Arequipeño Artesanal (Tarrina 500ml)',
        quantity: 3,
        unitPrice: 13.00,
        costPrice: 7.50,
        subtotal: 39.00
      }
    ],
    subtotal: 77.00,
    discount: 2.00,
    total: 75.00,
    costTotal: 47.30,
    profit: 27.70,
    paymentMethod: 'efectivo_contraentrega',
    amountPaid: 100.00,
    changeDue: 25.00,
    customerName: 'Valeria Cárdenas',
    source: 'catalogo_whatsapp',
    date: '2026-09-28T14:10:00.000Z'
  },

  // Earlier in month (September 2026)
  {
    id: 'sale-month-1',
    tenantId: 'tenant-characato',
    receiptNumber: 'B001-000120',
    items: [
      {
        productId: 'prod-003',
        productName: 'Bombones Surtidos La Ibérica Caja Especial 180g',
        quantity: 2,
        unitPrice: 32.00,
        costPrice: 21.00,
        subtotal: 64.00
      }
    ],
    subtotal: 64.00,
    discount: 0,
    total: 64.00,
    costTotal: 42.00,
    profit: 22.00,
    paymentMethod: 'yape_contraentrega',
    amountPaid: 64.00,
    changeDue: 0,
    customerName: 'Claudia Morales',
    source: 'pos',
    date: '2026-09-21T11:00:00.000Z'
  },
  {
    id: 'sale-month-2',
    tenantId: 'tenant-characato',
    receiptNumber: 'B001-000121',
    items: [
      {
        productId: 'prod-001',
        productName: 'Queso Paria Arequipeño Majes (500g)',
        quantity: 5,
        unitPrice: 22.00,
        costPrice: 14.50,
        subtotal: 110.00
      },
      {
        productId: 'prod-005',
        productName: 'Kola Escocesa Arequipeña 1.5L',
        quantity: 3,
        unitPrice: 8.00,
        costPrice: 5.20,
        subtotal: 24.00
      }
    ],
    subtotal: 134.00,
    discount: 4.00,
    total: 130.00,
    costTotal: 88.10,
    profit: 41.90,
    paymentMethod: 'efectivo_contraentrega',
    amountPaid: 150.00,
    changeDue: 20.00,
    customerName: 'Jorge Bellido',
    source: 'catalogo_whatsapp',
    date: '2026-09-15T15:30:00.000Z'
  }
];

export const INITIAL_ORDERS: WhatsAppOrder[] = [
  {
    id: 'ord-001',
    tenantId: 'tenant-characato',
    orderNumber: 'ORD-7421',
    customerName: 'Gabriela Nuñez',
    customerPhone: '958 442 119',
    district: 'Yanahuara',
    address: 'Calle León Velarde 312, 2do piso',
    reference: 'Frente al mirador de Yanahuara, portón de fierro negro',
    items: [
      {
        productId: 'prod-001',
        productName: 'Queso Paria Arequipeño Majes (500g)',
        quantity: 2,
        unitPrice: 22.00,
        subtotal: 44.00
      },
      {
        productId: 'prod-004',
        productName: 'Queso Helado Arequipeño Artesanal (Tarrina 500ml)',
        quantity: 2,
        unitPrice: 13.00,
        subtotal: 26.00
      }
    ],
    subtotal: 70.00,
    deliveryFee: 0.00, // free delivery over S/. 60
    total: 70.00,
    paymentMethod: 'yape_contraentrega',
    paymentDetail: 'Yape al momento de recibir el pedido',
    notes: 'Por favor traer bien congelado el queso helado.',
    status: 'pendiente',
    createdAt: '2026-10-01T06:15:00.000Z'
  },
  {
    id: 'ord-002',
    tenantId: 'tenant-characato',
    orderNumber: 'ORD-7419',
    customerName: 'Renzo Portugal',
    customerPhone: '959 110 334',
    district: 'Cayma',
    address: 'Av. Ejército 850 Dpto 402',
    reference: 'Al costado de Real Plaza Cayma',
    items: [
      {
        productId: 'prod-002',
        productName: 'Chocolates La Ibérica Tableta Tradicional 100g',
        quantity: 4,
        unitPrice: 9.50,
        subtotal: 38.00
      },
      {
        productId: 'prod-005',
        productName: 'Kola Escocesa Arequipeña 1.5L',
        quantity: 2,
        unitPrice: 8.00,
        subtotal: 16.00
      }
    ],
    subtotal: 54.00,
    deliveryFee: 5.00,
    total: 59.00,
    paymentMethod: 'efectivo_contraentrega',
    paymentDetail: 'Paga con S/. 100 (Llevar vuelto S/. 41)',
    notes: 'Tocar el timbre del dpto 402.',
    status: 'en_camino',
    createdAt: '2026-10-01T05:30:00.000Z'
  },
  {
    id: 'ord-003',
    tenantId: 'tenant-characato',
    orderNumber: 'ORD-7415',
    customerName: 'Milagros Vera',
    customerPhone: '957 881 229',
    district: 'Cercado de Arequipa',
    address: 'Calle San Francisco 220 int. 4',
    reference: 'A media cuadra de Plaza de Armas',
    items: [
      {
        productId: 'prod-003',
        productName: 'Bombones Surtidos La Ibérica Caja Especial 180g',
        quantity: 1,
        unitPrice: 32.00,
        subtotal: 32.00
      },
      {
        productId: 'prod-007',
        productName: 'Miel de Abeja Pura Valle de Yarabamba 500g',
        quantity: 1,
        unitPrice: 20.00,
        subtotal: 20.00
      }
    ],
    subtotal: 52.00,
    deliveryFee: 5.00,
    total: 57.00,
    paymentMethod: 'plin_contraentrega',
    paymentDetail: 'Plin contraentrega al número del delivery',
    status: 'entregado',
    createdAt: '2026-09-30T17:00:00.000Z',
    completedAt: '2026-09-30T18:15:00.000Z'
  }
];

export const AREQUIPA_DISTRICTS: string[] = [
  'Cercado de Arequipa',
  'Yanahuara',
  'Cayma',
  'Cerro Colorado',
  'José Luis Bustamante y Rivero',
  'Paucarpata',
  'Sachaca',
  'Miraflores',
  'Mariano Melgar',
  'Alto Selva Alegre',
  'Socabaya',
  'Tiabaya',
  'Jacobo Hunter',
  'Umacollo'
];

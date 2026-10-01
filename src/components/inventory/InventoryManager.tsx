import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  X, 
  Download,
  Eye,
  EyeOff,
  Coins,
  TrendingUp,
  Boxes
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const { currentTenant, products, addProduct, updateProduct, deleteProduct, adjustStock } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [stockStatusFilter, setStockStatusFilter] = useState<'todos' | 'bajo' | 'agotado' | 'normal'>('todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    sku: string;
    barcode: string;
    category: string;
    description: string;
    costPrice: number;
    salePrice: number;
    stock: number;
    minStockAlert: number;
    unit: Product['unit'];
    imageUrl: string;
    isActive: boolean;
    featuredInCatalog: boolean;
  }>({
    name: '',
    sku: '',
    barcode: '',
    category: 'Abarrotes',
    description: '',
    costPrice: 0,
    salePrice: 0,
    stock: 10,
    minStockAlert: 3,
    unit: 'unid',
    imageUrl: '',
    isActive: true,
    featuredInCatalog: true
  });

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['todos', ...Array.from(set)];
  }, [products]);

  // Inventory Metrics
  const metrics = useMemo(() => {
    let totalStockUnits = 0;
    let totalCostValuation = 0;
    let totalSaleValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      totalStockUnits += p.stock;
      totalCostValuation += p.costPrice * p.stock;
      totalSaleValuation += p.salePrice * p.stock;
      if (p.stock === 0) outOfStockCount++;
      else if (p.stock <= p.minStockAlert) lowStockCount++;
    });

    const projectedProfit = totalSaleValuation - totalCostValuation;

    return {
      totalProducts: products.length,
      totalStockUnits,
      totalCostValuation,
      totalSaleValuation,
      projectedProfit,
      lowStockCount,
      outOfStockCount
    };
  }, [products]);

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm));
      const matchCat = categoryFilter === 'todos' || p.category === categoryFilter;
      
      let matchStock = true;
      if (stockStatusFilter === 'agotado') matchStock = p.stock === 0;
      else if (stockStatusFilter === 'bajo') matchStock = p.stock > 0 && p.stock <= p.minStockAlert;
      else if (stockStatusFilter === 'normal') matchStock = p.stock > p.minStockAlert;

      return matchSearch && matchCat && matchStock;
    });
  }, [products, searchTerm, categoryFilter, stockStatusFilter]);

  // Open modal for new product
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `7750${Math.floor(100000 + Math.random() * 900000)}`,
      category: 'Abarrotes & Viveres',
      description: '',
      costPrice: 10.00,
      salePrice: 15.00,
      stock: 20,
      minStockAlert: 4,
      unit: 'unid',
      imageUrl: '/src/assets/images/store_bodega_showcase_1790861644926.jpg',
      isActive: true,
      featuredInCatalog: true
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      barcode: prod.barcode || '',
      category: prod.category,
      description: prod.description,
      costPrice: prod.costPrice,
      salePrice: prod.salePrice,
      stock: prod.stock,
      minStockAlert: prod.minStockAlert,
      unit: prod.unit,
      imageUrl: prod.imageUrl,
      isActive: prod.isActive,
      featuredInCatalog: prod.featuredInCatalog
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...formData
      });
    } else {
      addProduct(formData);
    }

    setIsModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['SKU', 'Nombre', 'Categoria', 'Costo_S/', 'Precio_Venta_S/', 'Stock', 'Unidad', 'Alerta_Min'];
    const rows = products.map((p) => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.costPrice.toFixed(2),
      p.salePrice.toFixed(2),
      p.stock,
      p.unit,
      p.minStockAlert
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario_${currentTenant.slug}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-blue-950">
            Control de Inventario
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de stock, costos de adquisición y precios para {currentTenant.name} ({currentTenant.district})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-950 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-300 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 hover:from-blue-900 hover:to-indigo-900 border border-amber-500/50 rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Total Productos</span>
            <Boxes className="w-4 h-4 text-amber-600" />
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-950 font-mono tabular-nums">
              {metrics.totalProducts}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums font-semibold">
              {metrics.totalStockUnits} unid.
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Inversión en Stock</span>
            <Coins className="w-4 h-4 text-blue-950" />
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-800 font-mono tabular-nums">
              S/. {metrics.totalCostValuation.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Valor Venta Estimado</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-950 font-mono tabular-nums">
              S/. {metrics.totalSaleValuation.toFixed(2)}
            </span>
            <span className="text-[11px] text-amber-800 font-bold">
              +S/. {metrics.projectedProfit.toFixed(0)} margen
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Alertas de Reposición</p>
          <div className="mt-1 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-bold font-mono tabular-nums">{metrics.lowStockCount}</span>
              <span>bajo stock</span>
            </div>
            {metrics.outOfStockCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-rose-600">
                <span className="font-bold font-mono tabular-nums">{metrics.outOfStockCount}</span>
                <span>agotados</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, código SKU o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none capitalize"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'todos' ? 'Todas las Categorías' : c}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
          >
            <option value="todos">Todos los Estados</option>
            <option value="bajo">⚠️ Stock Bajo</option>
            <option value="agotado">⛔ Agotados</option>
            <option value="normal">✅ Stock Normal</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-blue-950 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-right">Costo (S/.)</th>
                <th className="py-3 px-4 text-right">Venta (S/.)</th>
                <th className="py-3 px-4 text-right">Margen</th>
                <th className="py-3 px-4 text-center">Stock Actual</th>
                <th className="py-3 px-4 text-center">Alerta Min.</th>
                <th className="py-3 px-4 text-center">Catálogo</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Package className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <p className="font-bold text-blue-950">No hay productos en esta lista</p>
                    <p className="text-xs text-slate-400 mt-1">Prueba cambiando los filtros o registra uno nuevo.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const marginPct = product.salePrice > 0 
                    ? (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(0)
                    : '0';
                  const isLow = product.stock > 0 && product.stock <= product.minStockAlert;
                  const isOut = product.stock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-mono">
                                {product.sku}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-xs">
                              {product.name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">
                              SKU: {product.sku} {product.barcode ? `· Barras: ${product.barcode}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {product.category}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                        S/. {product.costPrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-blue-950">
                        S/. {product.salePrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-mono tabular-nums text-amber-900 font-bold bg-amber-100/60 border border-amber-300/60 px-1.5 py-0.5 rounded text-[11px]">
                          +{marginPct}%
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => adjustStock(product.id, -1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-blue-950 hover:text-white text-slate-700 font-bold transition-colors cursor-pointer"
                            title="Restar 1 unidad"
                          >
                            -
                          </button>

                          <span className={`min-w-[40px] text-center font-mono font-bold tabular-nums ${
                            isOut ? 'text-rose-600' : isLow ? 'text-amber-700' : 'text-blue-950'
                          }`}>
                            {product.stock} {product.unit}
                          </span>

                          <button
                            onClick={() => adjustStock(product.id, 1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-blue-950 hover:text-white text-slate-700 font-bold transition-colors cursor-pointer"
                            title="Sumar 1 unidad"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-500 font-medium">
                        {product.minStockAlert} {product.unit}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => updateProduct({ ...product, featuredInCatalog: !product.featuredInCatalog })}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            product.featuredInCatalog ? 'text-amber-700 hover:bg-amber-50' : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title={product.featuredInCatalog ? 'Visible en catálogo digital' : 'Oculto en catálogo digital'}
                        >
                          {product.featuredInCatalog ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 text-slate-500 hover:text-blue-950 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar producto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas eliminar "${product.name}"?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-500/30">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white border-b border-amber-500/40">
              <h3 className="text-sm font-bold text-white tracking-tight">
                {editingProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs bg-white">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Queso Paria de Majes 500g"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código de Barras</label>
                  <input
                    type="text"
                    placeholder="7750..."
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ej. Lácteos, Bebidas, Abarrotes"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unidad de Medida</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-medium"
                  >
                    <option value="unid">Unidad (unid)</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="pqte">Paquete (pqte)</option>
                    <option value="litro">Litro (litro)</option>
                    <option value="caja">Caja (caja)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Costo (S/.) *</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Venta (S/.) *</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-mono font-bold text-blue-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Inicial *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alerta Stock Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL o Foto del Producto</label>
                <input
                  type="text"
                  placeholder="/src/assets/images/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 text-[11px] font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción para el Catálogo</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles sobre el producto, origen o recomendaciones..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featuredInCatalog}
                    onChange={(e) => setFormData({ ...formData, featuredInCatalog: e.target.checked })}
                    className="rounded text-blue-950 focus:ring-blue-950"
                  />
                  <span className="font-bold text-slate-700">Mostrar en el Catálogo Digital de WhatsApp</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-amber-300 bg-blue-950 hover:bg-blue-900 border border-amber-500/40 rounded-lg font-bold cursor-pointer shadow-xs"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

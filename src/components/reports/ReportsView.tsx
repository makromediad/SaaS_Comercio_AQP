import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ReportPeriod } from '../../types';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Download, 
  Smartphone, 
  FileText, 
  Receipt,
  Crown,
  Coins
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { currentTenant, sales, setLastSale } = useStore();
  const [period, setPeriod] = useState<ReportPeriod>('hoy');

  // Filter sales by selected period
  const filteredSales = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of week (Monday)
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday).getTime();

    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return sales.filter((sale) => {
      const saleTime = new Date(sale.date).getTime();
      if (period === 'hoy') return saleTime >= startOfToday;
      if (period === 'semana') return saleTime >= startOfWeek;
      if (period === 'mes') return saleTime >= startOfMonth;
      return true; // historico
    });
  }, [sales, period]);

  // Aggregate Metrics
  const summary = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let efectivoTotal = 0;
    let yapeTotal = 0;
    let plinTotal = 0;
    let posCount = 0;
    let whatsappCount = 0;

    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number; profit: number }> = {};

    filteredSales.forEach((sale) => {
      totalRevenue += sale.total;
      totalCost += sale.costTotal;
      totalProfit += sale.profit;

      if (sale.paymentMethod === 'efectivo_contraentrega') efectivoTotal += sale.total;
      else if (sale.paymentMethod === 'yape_contraentrega') yapeTotal += sale.total;
      else if (sale.paymentMethod === 'plin_contraentrega') plinTotal += sale.total;

      if (sale.source === 'catalogo_whatsapp') whatsappCount++;
      else posCount++;

      sale.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
            profit: 0
          };
        }
        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].revenue += item.subtotal;
        productSalesMap[item.productId].profit += item.subtotal - (item.costPrice * item.quantity);
      });
    });

    const averageTicket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    const marginRate = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      averageTicket,
      marginRate,
      transactionCount: filteredSales.length,
      efectivoTotal,
      yapeTotal,
      plinTotal,
      posCount,
      whatsappCount,
      topProducts
    };
  }, [filteredSales]);

  // Daily / Weekly / Monthly simulated distribution bars
  const chartData = useMemo(() => {
    if (period === 'hoy') {
      return [
        { label: '08:00 - 11:00', value: filteredSales.filter(s => new Date(s.date).getHours() < 11).reduce((a, b) => a + b.total, 0) },
        { label: '11:00 - 14:00', value: filteredSales.filter(s => new Date(s.date).getHours() >= 11 && new Date(s.date).getHours() < 14).reduce((a, b) => a + b.total, 0) },
        { label: '14:00 - 17:00', value: filteredSales.filter(s => new Date(s.date).getHours() >= 14 && new Date(s.date).getHours() < 17).reduce((a, b) => a + b.total, 0) },
        { label: '17:00 - 20:00', value: filteredSales.filter(s => new Date(s.date).getHours() >= 17).reduce((a, b) => a + b.total, 0) },
      ];
    } else if (period === 'semana') {
      const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      return days.map((d, idx) => {
        const daySales = filteredSales.filter(s => {
          const wd = (new Date(s.date).getDay() + 6) % 7;
          return wd === idx;
        });
        return {
          label: d,
          value: daySales.reduce((a, b) => a + b.total, 0)
        };
      });
    } else {
      return [
        { label: 'Semana 1', value: filteredSales.slice(0, 3).reduce((a, b) => a + b.total, 0) },
        { label: 'Semana 2', value: filteredSales.slice(3, 6).reduce((a, b) => a + b.total, 0) },
        { label: 'Semana 3', value: filteredSales.slice(6, 9).reduce((a, b) => a + b.total, 0) },
        { label: 'Semana 4 (Actual)', value: filteredSales.slice(9).reduce((a, b) => a + b.total, 0) },
      ];
    }
  }, [filteredSales, period]);

  const maxChartValue = Math.max(...chartData.map(c => c.value), 1);

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = ['Nro_Ticket', 'Fecha', 'Cliente', 'Canal', 'Metodo_Pago', 'Total_S/', 'Ganancia_S/'];
    const rows = filteredSales.map((s) => [
      s.receiptNumber,
      `"${new Date(s.date).toLocaleString('es-PE')}"`,
      `"${(s.customerName || 'Cliente').replace(/"/g, '""')}"`,
      s.source === 'pos' ? 'Mostrador POS' : 'Catálogo WhatsApp',
      s.paymentMethod,
      s.total.toFixed(2),
      s.profit.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_${period}_${currentTenant.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header and Period Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-blue-950 flex items-center gap-2">
            <span>Reportes & Rendimiento Financiero</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analítica de facturación, rentabilidad real y canales de venta en Arequipa
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Period Tabs */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-xl text-xs font-bold shadow-2xs">
            <button
              onClick={() => setPeriod('hoy')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'hoy' ? 'bg-blue-950 text-amber-300 shadow-xs border border-amber-500/30' : 'text-slate-600 hover:text-blue-950'
              }`}
            >
              Hoy (Diario)
            </button>
            <button
              onClick={() => setPeriod('semana')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'semana' ? 'bg-blue-950 text-amber-300 shadow-xs border border-amber-500/30' : 'text-slate-600 hover:text-blue-950'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setPeriod('mes')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'mes' ? 'bg-blue-950 text-amber-300 shadow-xs border border-amber-500/30' : 'text-slate-600 hover:text-blue-950'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setPeriod('historico')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'historico' ? 'bg-blue-950 text-amber-300 shadow-xs border border-amber-500/30' : 'text-slate-600 hover:text-blue-950'
              }`}
            >
              Todo
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-950 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Exportar Reporte</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Facturado */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Ventas Totales</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-blue-950">
              S/. {summary.totalRevenue.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary.transactionCount} transacciones en el periodo
          </p>
        </div>

        {/* Ganancia Neta */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Ganancia Neta (Utilidad)</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-amber-700">
              S/. {summary.totalProfit.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Margen de ganancia: <strong className="text-amber-800 font-mono font-bold">{summary.marginRate.toFixed(1)}%</strong>
          </p>
        </div>

        {/* Ticket Promedio */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Ticket Promedio</span>
            <ShoppingBag className="w-4 h-4 text-blue-950" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-blue-950">
              S/. {summary.averageTicket.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Gasto promedio por cliente
          </p>
        </div>

        {/* Costo Mercadería */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Costo de Mercadería</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-slate-700">
              S/. {summary.totalCost.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Inversión en reposición
          </p>
        </div>

      </div>

      {/* Grid: Sales Bar Chart & Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Bar Visualizer for timeline */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-blue-950">
                Evolución de Ingresos ({period === 'hoy' ? 'Horario de Hoy' : period === 'semana' ? 'Días de la Semana' : 'Semanas del Mes'})
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-950 tabular-nums">
              Total: S/. {summary.totalRevenue.toFixed(2)}
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 pb-2 space-y-3">
            {chartData.map((item, idx) => {
              const heightPercent = maxChartValue > 0 ? (item.value / maxChartValue) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">{item.label}</span>
                    <span className="font-mono font-black text-blue-950 tabular-nums">
                      S/. {item.value.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-md overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-blue-950 via-blue-900 to-amber-500 rounded-md transition-all duration-500"
                      style={{ width: `${Math.max(2, heightPercent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Canales: {summary.posCount} Mostrador POS · {summary.whatsappCount} Catálogo WhatsApp</span>
            <span>Ciudad: Arequipa ({currentTenant.district})</span>
          </div>
        </div>

        {/* Right: Payment Method Breakdown & Top Sellers */}
        <div className="space-y-6">
          
          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3.5 shadow-2xs">
            <h3 className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Desglose por Forma de Pago</span>
            </h3>

            <div className="space-y-2.5 text-xs pt-1">
              {/* Efectivo */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-950">Efectivo Contraentrega</p>
                  <p className="text-[11px] text-slate-500">En mano al repartidor / cajero</p>
                </div>
                <div className="text-right font-mono font-black text-blue-950 tabular-nums">
                  S/. {summary.efectivoTotal.toFixed(2)}
                </div>
              </div>

              {/* Yape */}
              <div className="p-3 rounded-xl bg-[#732282]/5 border border-[#732282]/20 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#732282]">Yape Contraentrega</p>
                  <p className="text-[11px] text-slate-500">Pago móvil BCP</p>
                </div>
                <div className="text-right font-mono font-black text-[#732282] tabular-nums">
                  S/. {summary.yapeTotal.toFixed(2)}
                </div>
              </div>

              {/* Plin */}
              <div className="p-3 rounded-xl bg-[#00d09c]/10 border border-[#00d09c]/30 flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-950">Plin Contraentrega</p>
                  <p className="text-[11px] text-slate-500">BBVA / Scotiabank / Interbank</p>
                </div>
                <div className="text-right font-mono font-black text-emerald-950 tabular-nums">
                  S/. {summary.plinTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Top 5 Products */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3.5 shadow-2xs">
            <h3 className="text-sm font-bold text-blue-950">Top Productos Más Vendidos</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {summary.topProducts.length === 0 ? (
                <p className="text-slate-400 text-xs py-2">Sin ventas registradas en el periodo</p>
              ) : (
                summary.topProducts.map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="truncate pr-2">
                      <p className="font-bold text-slate-800 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {p.quantity} unid. vendidas
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-black text-blue-950 tabular-nums">
                        S/. {p.revenue.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-amber-700 font-mono font-bold tabular-nums">
                        +S/. {p.profit.toFixed(0)} ganancia
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Ledger of Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-blue-950">Historial Detallado de Ventas</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filteredSales.length} comprobantes emitidos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-blue-950 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">N° Boleta</th>
                <th className="py-2.5 px-4">Fecha y Hora</th>
                <th className="py-2.5 px-4">Cliente</th>
                <th className="py-2.5 px-4">Canal</th>
                <th className="py-2.5 px-4">Método de Pago</th>
                <th className="py-2.5 px-4 text-right">Total (S/.)</th>
                <th className="py-2.5 px-4 text-right">Ganancia Neta</th>
                <th className="py-2.5 px-4 text-center">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se registran ventas para este periodo
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-950">
                      {sale.receiptNumber}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(sale.date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800 truncate max-w-xs">
                      {sale.customerName || 'Cliente Final'}
                    </td>
                    <td className="py-2.5 px-4">
                      {sale.source === 'pos' ? (
                        <span className="text-slate-700 font-medium">Mostrador POS</span>
                      ) : (
                        <span className="text-blue-950 font-bold">Catálogo WhatsApp</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 capitalize text-slate-600 font-medium">
                      {sale.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-black text-blue-950 tabular-nums">
                      S/. {sale.total.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-amber-700 font-bold tabular-nums">
                      S/. {sale.profit.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => setLastSale(sale)}
                        className="px-2.5 py-1 bg-blue-950 text-amber-300 hover:bg-blue-900 border border-amber-500/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                        title="Ver e imprimir ticket"
                      >
                        Ver Boleta
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

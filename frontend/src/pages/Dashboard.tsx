import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { challanService } from '../services/challanService';
import { inventoryService } from '../services/inventoryService';
import { CustomerFollowUp, Product, ProductStockSummary, SalesChallan } from '../types';
import { 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  FileText, 
  ArrowUpRight, 
  IndianRupee, 
  TrendingUp,
  Eye,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Quantities count states
  const [custCount, setCustCount] = useState(0);
  const [prodCount, setProdCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [todayChallanCount, setTodayChallanCount] = useState(0);
  const [confirmedChallanCount, setConfirmedChallanCount] = useState(0);
  const [draftChallanCount, setDraftChallanCount] = useState(0);

  // Table lists states
  const [recentChallans, setRecentChallans] = useState<SalesChallan[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentFollowUps, setRecentFollowUps] = useState<Array<CustomerFollowUp & { customerName: string }>>([]);
  const [inventorySummary, setInventorySummary] = useState<ProductStockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chart data
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch counters in parallel
        const [customers, products, lowStock, challans, inventory] = await Promise.all([
          customerService.getCustomers(),
          productService.getProducts(),
          productService.getLowStock(),
          challanService.getChallans(),
          inventoryService.getInventorySummary(),
        ]);

        setCustCount(customers.length);
        setProdCount(products.length);
        setLowStockCount(lowStock.length);
        const today = new Date().toDateString();
        setTodayChallanCount(challans.filter((challan) => new Date(challan.createdAt).toDateString() === today).length);
        setConfirmedChallanCount(challans.filter((challan) => challan.status === 'CONFIRMED').length);
        setDraftChallanCount(challans.filter((challan) => challan.status === 'DRAFT').length);

        // Sort and select list slices
        setRecentChallans(challans.slice(0, 5));
        setLowStockProducts(lowStock.slice(0, 5));
        setInventorySummary(inventory.slice(0, 5));
        setRecentFollowUps(customers
          .flatMap((customer) => (customer.followUps || []).map((followUp) => ({ ...followUp, customerName: customer.customerName })))
          .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
          .slice(0, 5));

        // Format sales chart aggregates (grouped by date of confirmation)
        const dailyTotals: Record<string, number> = {};
        
        // Default past 5 days chart structure
        for (let i = 4; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          dailyTotals[dateStr] = 0;
        }

        challans.forEach(ch => {
          if (ch.status === 'CONFIRMED') {
            const dateStr = new Date(ch.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            // Calculate total price sum
            const challanTotal = ch.items?.reduce((acc, curr) => acc + curr.totalPrice, 0) || 0;
            if (dailyTotals[dateStr] !== undefined) {
              dailyTotals[dateStr] += challanTotal;
            } else {
              dailyTotals[dateStr] = challanTotal;
            }
          }
        });

        const formattedChart = Object.keys(dailyTotals).map(key => ({
          date: key,
          Sales: dailyTotals[key],
        }));
        setChartData(formattedChart);

      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to sync dashboard metrics. Verify database connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kpis = [
    { name: 'Customers', value: custCount, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { name: 'Products', value: prodCount, icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Low Stock Items', value: lowStockCount, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', alert: lowStockCount > 0 },
    { name: "Today's Challans", value: todayChallanCount, icon: FileSpreadsheet, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
    { name: 'Confirmed', value: confirmedChallanCount, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Drafts', value: draftChallanCount, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  ];

  const challanStatusColors: Record<string, string> = {
    DRAFT: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    CANCELLED: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-zinc-800 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease] text-left">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">ERP CRM Dashboard</h2>
        <p className="text-sm text-zinc-400">Real-time summaries of client accounts, inventory alerts, and sales analytics.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30 text-sm flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`p-4 sm:p-5 rounded-2xl border bg-bg-surface glass glow-card flex items-center justify-between ${kpi.bg}`}>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{kpi.name}</span>
              <span className="text-xl sm:text-3xl font-extrabold text-white font-heading">{kpi.value.toLocaleString()}</span>
            </div>
            <div className={`p-3 rounded-lg ${kpi.color} bg-white/5`}>
              <kpi.icon size={22} className={kpi.alert ? 'animate-pulse text-amber-500' : ''} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Lists Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Challans & Low Stock */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          {/* Recent Challans Card */}
          <div className="p-5 rounded-2xl border border-border-color bg-bg-surface glass glow-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center gap-2">
                <FileText size={16} className="text-indigo-400" />
                <span>Recent Sales Challans</span>
              </h3>
              <button 
                onClick={() => navigate('/challans')}
                className="text-xs font-semibold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            {recentChallans.length === 0 ? (
              <div className="py-10 text-center text-zinc-500 text-xs italic">
                No Sales Challans recorded in history.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-color text-zinc-500 font-semibold uppercase">
                      <th className="px-4 py-3">Challan No.</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Total Value</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/10 text-zinc-300">
                    {recentChallans.map((ch) => {
                      const value = ch.items?.reduce((acc, curr) => acc + curr.totalPrice, 0) || 0;
                      return (
                        <tr key={ch.id} className="hover:bg-white/[0.01]">
                          <td className="px-4 py-3 font-mono text-[13px] font-bold text-teal-400 tracking-wider">
                            {ch.challanNumber}
                          </td>
                          <td className="px-4 py-3 font-semibold text-zinc-200">
                            {ch.customer?.customerName || 'Walk-in Client'}
                          </td>
                          <td className="px-4 py-3 font-bold text-zinc-300">
                            <span className="inline-flex items-center">
                              <IndianRupee size={11} className="mr-0.5" />
                              {value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider ${challanStatusColors[ch.status]}`}>
                              {ch.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => navigate(`/challans/details/${ch.id}`)}
                              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            >
                              <Eye size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Area Sales chart (Sparingly used chart!) */}
          <div className="p-5 rounded-2xl border border-border-color bg-bg-surface glass glow-card">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-heading flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <span>Confirmed Deliveries Value Trend</span>
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                    itemStyle={{ color: '#a5b4fc' }}
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Sales']}
                  />
                  <Area type="monotone" dataKey="Sales" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Low Stock Alerts list */}
        <div className="xl:col-span-1">
          <div className="p-5 rounded-2xl border border-border-color bg-bg-surface glass glow-card h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500 animate-pulse" />
                  <span>Low Stock Warnings</span>
                </h3>
                <button 
                  onClick={() => navigate('/inventory')}
                  className="text-xs font-semibold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Inventory</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-border-color/65 bg-bg-main/30 rounded-xl flex flex-col justify-center items-center">
                  <CheckCircle size={24} className="text-emerald-500 mb-1.5" />
                  <p className="text-zinc-400 text-xs font-semibold">All products stock counts are healthy.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((p) => {
                    const isOut = p.currentStock === 0;
                    return (
                      <div 
                        key={p.id} 
                        onClick={() => navigate('/products')}
                        className="p-3.5 rounded-xl border border-zinc-900/10 hover:border-zinc-800 bg-bg-main/30 hover:bg-bg-main/60 transition-colors text-left flex justify-between items-center cursor-pointer"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-zinc-200">{p.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono tracking-wider">{p.sku}</span>
                        </div>

                        <div className="text-right">
                          <span 
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isOut 
                                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30 animate-pulse' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {isOut ? 'OUT' : `${p.currentStock} Units`} / Min {p.minimumStock}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Helper notice */}
            {lowStockProducts.length > 0 && (
              <div className="mt-6 p-3 rounded-lg bg-amber-500/5 text-amber-400 border border-amber-500/10 text-[11px] leading-relaxed flex gap-2">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>Adjust items levels in the Inventory screen or confirm Purchase Orders to restock products.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl border border-border-color bg-bg-surface glass glow-card">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-heading">Recent Customer Follow-ups</h3>
          {recentFollowUps.length === 0 ? (
            <p className="py-7 text-center text-xs text-zinc-500">No follow-ups recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentFollowUps.map((followUp) => (
                <div key={followUp.id} className="border-b border-border-color/70 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between gap-3 text-xs"><span className="font-semibold text-zinc-200">{followUp.customerName}</span><span className="text-zinc-500">{new Date(followUp.createdAt).toLocaleDateString()}</span></div>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{followUp.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl border border-border-color bg-bg-surface glass glow-card">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-heading">Inventory Summary</h3>
          {inventorySummary.length === 0 ? (
            <p className="py-7 text-center text-xs text-zinc-500">No inventory records available.</p>
          ) : (
            <div className="space-y-3">
              {inventorySummary.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 border-b border-border-color/70 pb-3 last:border-0 last:pb-0">
                  <div><p className="text-xs font-semibold text-zinc-200">{product.name}</p><p className="mt-0.5 text-[10px] font-mono text-zinc-500">{product.sku} · {product.categoryName}</p></div>
                  <span className={`rounded px-2 py-1 text-xs font-bold ${product.currentStock === 0 ? 'bg-rose-500/15 text-rose-400' : 'bg-teal-500/10 text-teal-300'}`}>{product.currentStock} units</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { inventoryService } from '../../services/inventoryService';
import { ProductStockSummary, StockMovement } from '../../types';
import { 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Lock, 
  Calendar, 
  User, 
  AlertTriangle,
  X,
  AlertCircle
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const { user } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'LEDGER'>('SUMMARY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data lists state
  const [summaries, setSummaries] = useState<ProductStockSummary[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  // Filters State
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [ledgerProductFilter, setLedgerProductFilter] = useState<string>('');

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'IN' as 'IN' | 'OUT',
    quantity: '1',
    reason: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Derived state for modal real-time validation and preview
  const selectedProduct = summaries.find(p => p.id === formData.productId);
  const parsedQty = parseInt(formData.quantity) || 0;
  const currentStock = selectedProduct ? selectedProduct.currentStock : 0;
  const nextStock = formData.type === 'IN' ? currentStock + parsedQty : currentStock - parsedQty;
  const isOutStockAfterMovement = nextStock < 0;
  const isLowStockAfterMovement = nextStock <= 5;
  const quickReasons = formData.type === 'IN'
    ? ['Inventory Purchase Receipt', 'Customer Return Adjustment', 'Manual Stock Correction', 'Inventory Audit Count']
    : ['Sales Dispatch Delivery', 'Damaged Goods Write-off', 'Internal Usage', 'Inventory Audit Adjustment'];

  // Role Checks
  const canModify = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'SUMMARY') {
        const data = await inventoryService.getInventorySummary();
        setSummaries(data);
      } else {
        const filters: any = {};
        if (ledgerTypeFilter !== 'ALL') filters.type = ledgerTypeFilter;
        if (ledgerProductFilter) filters.productId = ledgerProductFilter;

        const data = await inventoryService.getStockMovements(filters);
        setMovements(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inventory data. Verify database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, ledgerTypeFilter, ledgerProductFilter]);

  // Open modal for recording movement
  const handleRecordMovementClick = async () => {
    setFormError(null);
    try {
      let currentSummaries = summaries;
      if (currentSummaries.length === 0) {
        currentSummaries = await inventoryService.getInventorySummary();
        setSummaries(currentSummaries);
      }

      setFormData({
        productId: currentSummaries[0]?.id || '',
        type: 'IN',
        quantity: '1',
        reason: '',
      });
      setModalOpen(true);
    } catch (err) {
      alert('Failed to initialize stock list.');
    }
  };

  // Form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError(null);
  };

  // Form submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const qty = parseInt(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      setFormError('Quantity must be greater than zero.');
      return;
    }

    const product = summaries.find(p => p.id === formData.productId);
    if (formData.type === 'OUT' && product && qty > product.currentStock) {
      setFormError(`Insufficient stock. Available: ${product.currentStock}, Requested: ${qty}.`);
      return;
    }

    setFormSubmitting(true);
    try {
      await inventoryService.createStockMovement({
        productId: formData.productId,
        type: formData.type,
        quantity: qty,
        reason: formData.reason.trim() || undefined,
      });
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Operation failed. Verify inputs.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease]">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">Inventory & Stock Control</h2>
          <p className="text-sm text-zinc-400">Monitor warehouse stocks, adjust items volumes, and view movement histories.</p>
        </div>

        {canModify ? (
          <button 
            onClick={handleRecordMovementClick}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-indigo-500/15 transition-all duration-150 active:scale-[0.98] self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Record Movement</span>
          </button>
        ) : (
          <div className="text-xs text-zinc-500 flex items-center gap-2 border border-border-color px-4 py-2.5 rounded-lg bg-bg-surface self-start sm:self-auto">
            <Lock size={12} />
            <span>Restricted: WAREHOUSE / ADMIN required to adjust stock</span>
          </div>
        )}
      </div>

      {/* Tabs and Navigation Panel */}
      <div className="flex border-b border-border-color">
        <button
          onClick={() => setActiveTab('SUMMARY')}
          className={`pb-3 text-sm font-semibold transition-colors mr-8 ${
            activeTab === 'SUMMARY' 
              ? 'border-b-2 border-primary text-white' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Stock Summary Levels
        </button>
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`pb-3 text-sm font-semibold transition-colors ${
            activeTab === 'LEDGER' 
              ? 'border-b-2 border-primary text-white' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Transaction Ledger History
        </button>
      </div>

      {/* Filter widgets (Ledger Tab only) */}
      {activeTab === 'LEDGER' && (
        <div className="p-4 rounded-xl border border-border-color bg-bg-surface glass glow-card flex flex-col md:flex-row gap-4 justify-between items-center">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Transaction Filters:</span>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            {/* Product selection filter */}
            <div className="flex items-center gap-2 flex-1 md:flex-initial">
              <label className="text-xs text-zinc-500">Product:</label>
              <select
                value={ledgerProductFilter}
                onChange={(e) => setLedgerProductFilter(e.target.value)}
                className="bg-bg-main border border-border-color text-white px-3 py-2 rounded-lg text-xs focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="">All Products</option>
                {summaries.map((p) => (
                  <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                ))}
              </select>
            </div>
            
            {/* Type selection filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">Type:</label>
              <select
                value={ledgerTypeFilter}
                onChange={(e) => setLedgerTypeFilter(e.target.value as any)}
                className="bg-bg-main border border-border-color text-white px-3 py-2 rounded-lg text-xs focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Movements</option>
                <option value="IN">IN (Stock Additions)</option>
                <option value="OUT">OUT (Stock Reductions)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main tables list */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-zinc-800 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'SUMMARY' ? (
        /* Tab 1: Stock levels list */
        summaries.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-border-color bg-bg-surface glass">
            <p className="text-zinc-400 text-sm">No products found in catalog to calculate summary.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border-color bg-bg-surface glass glow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border-color">
                    <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">SKU / Code</th>
                    <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Product Name</th>
                    <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Category</th>
                    <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4 text-center">Total IN</th>
                    <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4 text-center">Total OUT</th>
                    <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4 text-right">Current Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/20">
                  {summaries.map((summary) => {
                    const isLow = summary.currentStock <= 5;
                    const isMedium = summary.currentStock > 5 && summary.currentStock <= 15;

                    return (
                      <tr key={summary.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-5 py-4 font-mono text-[13px] font-semibold text-teal-400 tracking-wider">
                          {summary.sku}
                        </td>
                        <td className="px-5 py-4 font-semibold text-zinc-300">
                          {summary.name}
                        </td>
                        <td className="px-5 py-4 text-zinc-400">
                          {summary.categoryName}
                        </td>
                        <td className="px-5 py-4 text-zinc-400 text-center font-semibold text-emerald-400">
                          {summary.totalIn}
                        </td>
                        <td className="px-5 py-4 text-zinc-400 text-center font-semibold text-amber-500">
                          {summary.totalOut}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isLow && (
                              <span title="Low Stock Warning!" className="text-rose-500 flex items-center">
                                <AlertTriangle size={14} className="mr-1 animate-pulse" />
                              </span>
                            )}
                            <span 
                              className={`px-3 py-1 rounded text-sm font-bold ${
                                isLow 
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                                  : isMedium
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {summary.currentStock} units
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Tab 2: Ledger Movements list */
        movements.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-border-color bg-bg-surface glass">
            <p className="text-zinc-400 text-sm">No transaction movements recorded in history log.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border-color bg-bg-surface glass glow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border-color">
                    <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Date & Time</th>
                    <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">SKU / Code</th>
                    <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Product Name</th>
                    <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Type</th>
                    <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4 text-center">Quantity</th>
                    <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Reason / Notes</th>
                    <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4 text-right">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/20">
                  {movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-white/[0.01] transition-colors text-zinc-300">
                      {/* Log Timestamp */}
                      <td className="px-5 py-4 text-xs text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-zinc-650" />
                          {new Date(movement.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      {/* Product SKU */}
                      <td className="px-5 py-4 font-mono text-[13px] font-semibold text-teal-400 tracking-wider">
                        {movement.product?.sku}
                      </td>
                      {/* Product Name */}
                      <td className="px-5 py-4 font-semibold text-zinc-300">
                        {movement.product?.name}
                      </td>
                      {/* Movement Type Badge */}
                      <td className="px-5 py-4">
                        <span 
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold tracking-wider ${
                            movement.type === 'IN' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {movement.type === 'IN' ? (
                            <>
                              <ArrowDownLeft size={11} />
                              <span>STOCK IN</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight size={11} />
                              <span>STOCK OUT</span>
                            </>
                          )}
                        </span>
                      </td>
                      {/* Movement quantity count */}
                      <td className="px-5 py-4 text-center font-bold text-white">
                        {movement.quantity}
                      </td>
                      {/* Reason log details */}
                      <td className="px-5 py-4 text-xs text-zinc-400 italic">
                        {movement.reason || 'Manual stock adjustment'}
                      </td>
                      {/* Representative username */}
                      <td className="px-5 py-4 text-right text-xs text-zinc-400 font-medium">
                        <span className="inline-flex items-center gap-1 justify-end">
                          <User size={12} className="text-zinc-650" />
                          {movement.createdBy?.name || 'Warehouse Rep'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Record Stock Movement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="glass w-full max-w-md rounded-2xl bg-bg-surface border border-white/5 shadow-2xl p-6 sm:p-8 flex flex-col relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white font-heading">Record Stock Transaction</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/30 text-xs">
                {formError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[12px] font-semibold text-zinc-400">Select Catalog Product *</label>
                <select
                  name="productId"
                  required
                  value={formData.productId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white text-sm focus:border-primary focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="" disabled>Choose product...</option>
                  {summaries.map((p) => {
                    const statusLabel = p.currentStock === 0 
                      ? '🔴 OUT OF STOCK' 
                      : p.currentStock <= 5 
                      ? `🟡 Low Stock: ${p.currentStock}` 
                      : `🟢 In Stock: ${p.currentStock}`;
                    return (
                      <option key={p.id} value={p.id}>
                        [{p.sku}] {p.name} ({statusLabel})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[12px] font-semibold text-zinc-400">Movement Type *</label>
                  <div className="grid grid-cols-2 gap-2 bg-bg-main p-1 rounded-lg border border-border-color">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, type: 'IN' }));
                        setFormError(null);
                      }}
                      className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formData.type === 'IN'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm'
                          : 'text-zinc-400 hover:text-white border border-transparent'
                      }`}
                    >
                      <ArrowDownLeft size={14} />
                      <span>STOCK IN</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, type: 'OUT' }));
                        setFormError(null);
                      }}
                      className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formData.type === 'OUT'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/25 shadow-sm'
                          : 'text-zinc-400 hover:text-white border border-transparent'
                      }`}
                    >
                      <ArrowUpRight size={14} />
                      <span>STOCK OUT</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[12px] font-semibold text-zinc-400">Quantity (Units) *</label>
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="1"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white text-sm focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[12px] font-semibold text-zinc-400">Transaction Reason / Memo *</label>
                <input
                  type="text"
                  name="reason"
                  required
                  placeholder="e.g. Vendor PO delivery #5112, Sales Dispatch"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-600 text-sm focus:border-primary focus:outline-none transition-colors"
                />
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {quickReasons.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, reason: tag }))}
                      className={`px-2 py-1 rounded text-[10px] font-medium border transition-all cursor-pointer ${
                        formData.reason === tag
                          ? 'bg-primary/20 text-white border-primary/45 shadow'
                          : 'bg-bg-main text-zinc-400 border-border-color hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {selectedProduct && (
                <div className={`p-3.5 rounded-xl border text-xs flex flex-col gap-1.5 transition-all ${
                  isOutStockAfterMovement
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    : isLowStockAfterMovement
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-400">Stock Status Update:</span>
                    <span className="font-mono font-bold text-sm">
                      {currentStock} → {nextStock < 0 ? 0 : nextStock} units
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    {isOutStockAfterMovement 
                      ? `⚠️ Error: Cannot request STOCK OUT of ${parsedQty} units. Insufficient stock (Available: ${currentStock}).`
                      : isLowStockAfterMovement
                      ? `⚠️ Warning: Stock level will drop to ${nextStock} units, triggering a low-stock alert.`
                      : `✓ Valid transaction. New stock level will be ${nextStock} units.`
                    }
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border-color hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || (formData.type === 'OUT' && isOutStockAfterMovement)}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {formSubmitting ? 'Logging movement...' : 'Record Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { productService } from '../../services/productService';
import { challanService } from '../../services/challanService';
import { Customer, Product } from '../../types';
import { 
  Plus, 
  Trash2, 
  IndianRupee, 
  AlertCircle, 
  User, 
  ShoppingBag, 
  ArrowLeft,
  Boxes
} from 'lucide-react';

interface ChallanItemInput {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

export const CreateChallan: React.FC = () => {
  const navigate = useNavigate();

  // Database lists
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected customer
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Item builder states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState<string>('1');
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  // Added items ledger
  const [items, setItems] = useState<ChallanItemInput[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const custList = await customerService.getCustomers();
        setCustomers(custList);
        if (custList.length > 0) {
          setSelectedCustomerId(custList[0].id);
        }

        const prodList = await productService.getProducts();
        setProducts(prodList);
        if (prodList.length > 0) {
          setSelectedProductId(prodList[0].id);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to sync clients and products catalog.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Add item handler
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const parsedQty = parseInt(itemQty);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      alert('Quantity must be greater than zero.');
      return;
    }

    // Draft challans may contain items that are not yet in stock. The backend
    // checks stock atomically when the user confirms the challan.
    const existingIndex = items.findIndex(item => item.productId === selectedProductId);
    const currentQtyInList = existingIndex !== -1 ? items[existingIndex].quantity : 0;
    const requestedTotal = currentQtyInList + parsedQty;

    if (requestedTotal > product.currentStock) {
      setStockWarning(`Only ${product.currentStock} unit(s) are currently available. You can save this as a draft, but confirmation will require more stock.`);
    } else {
      setStockWarning(null);
    }

    if (existingIndex !== -1) {
      // Update quantity
      setItems(prev => {
        const copy = [...prev];
        copy[existingIndex].quantity = requestedTotal;
        return copy;
      });
    } else {
      // Add new item row
      const newItem: ChallanItemInput = {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
        quantity: parsedQty,
      };
      setItems(prev => [...prev, newItem]);
    }

    // Reset inputs
    setItemQty('1');
  };

  const selectedProduct = products.find(product => product.id === selectedProductId);

  // Remove item handler
  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Calculate totals
  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPrice = items.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);

  // Submit handler (Save as DRAFT or CONFIRM directly)
  const handleSaveChallan = async (shouldConfirm: boolean) => {
    if (!selectedCustomerId) {
      alert('Please select a customer.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one line item.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      customerId: selectedCustomerId,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      // 1. Create the Challan as DRAFT
      const challan = await challanService.createChallan(payload);

      // 2. If CONFIRM was clicked, execute confirmation pipeline immediately
      if (shouldConfirm) {
        try {
          await challanService.confirmChallan(challan.id);
        } catch (confirmErr: any) {
          // If confirmation fails (e.g. stock constraint), delete the draft challan or keep it and alert
          // The draft was saved successfully, so we navigate to its details to let them adjust it
          const failMsg = confirmErr.response?.data?.message || 'Challan created as draft, but stock confirmation failed.';
          alert(failMsg);
          navigate(`/challans/details/${challan.id}`);
          return;
        }
      }

      // Success
      navigate('/challans');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed. Verify stock levels or parameters.');
    } finally {
      setSubmitting(false);
    }
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
      <div>
        <button 
          onClick={() => navigate('/challans')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          <span>Back to Challans</span>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">Create Sales Challan</h2>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: customer and item selectors */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Customer select card */}
          <div className="p-6 rounded-2xl border border-border-color bg-bg-surface glass glow-card">
            <h4 className="text-sm font-bold text-white mb-4 font-heading flex items-center gap-2">
              <User size={16} className="text-primary" />
              <span>Select Customer</span>
            </h4>
            <div className="flex flex-col gap-1.5">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white text-sm focus:border-primary focus:outline-none transition-colors cursor-pointer"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerName} {c.businessName ? `(${c.businessName})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Item Card */}
          <div className="p-6 rounded-2xl border border-border-color bg-bg-surface glass glow-card">
            <h4 className="text-sm font-bold text-white mb-4 font-heading flex items-center gap-2">
              <ShoppingBag size={16} className="text-primary" />
              <span>Add Line Items</span>
            </h4>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-zinc-400">Choose Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setStockWarning(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white text-sm focus:border-primary focus:outline-none transition-colors cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name} - ₹{p.unitPrice.toLocaleString()} (Stock: {p.currentStock})
                    </option>
                  ))}
                </select>
                {selectedProduct && (
                  <p className={`text-[11px] font-medium ${selectedProduct.currentStock > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    Available now: {selectedProduct.currentStock} unit(s)
                  </p>
                )}
              </div>

              {stockWarning && (
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-300">
                  {stockWarning}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-zinc-400">Quantity (Units) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border-color bg-bg-main text-white text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-bg-main hover:bg-zinc-800 text-teal-400 hover:text-teal-300 border border-border-color text-xs font-semibold shadow transition-all duration-150"
              >
                <Plus size={14} />
                <span>Add Item to List</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Added items ledger */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-border-color bg-bg-surface glass glow-card flex-1 flex flex-col min-h-[400px]">
            <h4 className="text-sm font-bold text-white mb-4 font-heading flex items-center gap-2 pb-2 border-b border-border-color">
              <Boxes size={16} className="text-teal-400" />
              <span>Items Summary Ledger</span>
            </h4>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <ShoppingBag size={32} className="text-zinc-650 mb-2" />
                <p className="text-zinc-400 text-xs">No items added to the challan yet. Use the sidebar to add items.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="overflow-x-auto max-h-[300px] mb-6">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border-color text-zinc-500 font-semibold uppercase">
                        <th className="px-4 py-3">Product Name</th>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3">Unit Price</th>
                        <th className="px-4 py-3 text-right">Total Price</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/10 text-zinc-300">
                      {items.map((item, index) => (
                        <tr key={index} className="hover:bg-white/[0.01]">
                          <td className="px-4 py-3 font-semibold text-zinc-200">{item.productName}</td>
                          <td className="px-4 py-3 font-mono">{item.sku}</td>
                          <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center">
                              <IndianRupee size={11} />
                              {item.unitPrice.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-teal-400">
                            <span className="inline-flex items-center">
                              <IndianRupee size={11} />
                              {(item.unitPrice * item.quantity).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Sub totals and actions */}
                <div className="border-t border-border-color pt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-zinc-400 mb-6">
                    <div className="flex gap-4">
                      <span>Total Items: <strong className="text-white">{totalItems}</strong></span>
                      <span>Product Types: <strong className="text-white">{items.length}</strong></span>
                    </div>
                    <div className="text-lg font-bold text-white flex items-center">
                      <span>Total Value:</span>
                      <IndianRupee size={18} className="text-teal-400 ml-1.5" />
                      <span className="text-teal-400">{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border-color/50">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleSaveChallan(false)}
                      className="px-5 py-2.5 rounded-lg border border-border-color hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors text-xs font-bold"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleSaveChallan(true)}
                      className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow shadow-indigo-500/15"
                    >
                      {submitting ? 'Confirming...' : 'Confirm Challan'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

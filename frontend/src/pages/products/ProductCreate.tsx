import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { Category } from '../../types';
import { X, AlertCircle } from 'lucide-react';

export const ProductCreate: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    unitPrice: 0,
    minimumStock: 5,
    warehouseLocation: '',
    categoryId: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch categories list.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'unitPrice' 
        ? parseFloat(value) || 0 
        : name === 'minimumStock' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const submitData = {
      ...formData,
      description: formData.description.trim() || null,
      warehouseLocation: formData.warehouseLocation.trim() || null,
    };

    try {
      await productService.createProduct(submitData);
      navigate('/products');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Operation failed. Verify SKU or category.');
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
    <div className="flex justify-center items-center py-6 animate-[fadeIn_0.2s_ease]">
      <div className="glass w-full max-w-xl rounded-2xl bg-bg-surface border border-white/5 shadow-2xl p-6 sm:p-8 flex flex-col relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-border-color pb-4">
          <h3 className="text-lg font-bold text-white font-heading">Register New Product</h3>
          <button 
            onClick={() => navigate('/products')}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/30 text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[12px] font-semibold text-zinc-400">Product Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Fiber Optic Cable 10m"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] font-semibold text-zinc-400">SKU / Code *</label>
              <input
                type="text"
                name="sku"
                required
                placeholder="e.g. CAB-FIB-10M"
                value={formData.sku}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm focus:border-primary focus:outline-none transition-colors font-mono uppercase"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] font-semibold text-zinc-400">Category *</label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white text-sm focus:border-primary focus:outline-none transition-colors cursor-pointer"
              >
                <option value="" disabled>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] font-semibold text-zinc-400">Unit Price (₹) *</label>
              <input
                type="number"
                name="unitPrice"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.unitPrice || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] font-semibold text-zinc-400">Minimum Stock Limit *</label>
              <input
                type="number"
                name="minimumStock"
                required
                min="0"
                placeholder="5"
                value={formData.minimumStock}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[12px] font-semibold text-zinc-400">Warehouse Location / Bin</label>
            <input
              type="text"
              name="warehouseLocation"
              placeholder="e.g. Aisle 3, Shelf B, Bin 4"
              value={formData.warehouseLocation}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[12px] font-semibold text-zinc-400">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Provide specifications about product..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-4 py-2 rounded-lg border border-border-color hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow shadow-indigo-500/10 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productService, ProductFilters } from '../../services/productService';
import { Product, Category } from '../../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Lock, 
  Tag, 
  IndianRupee,
  AlertCircle,
  FolderPlus,
  MapPin,
  X
} from 'lucide-react';

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [catError, setCatError] = useState<string | null>(null);
  const [catSubmitting, setCatSubmitting] = useState(false);

  const canModify = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';
  const canDelete = user?.role === 'ADMIN';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const cats = await productService.getCategories();
      setCategories(cats);

      const filters: ProductFilters = {};
      if (search.trim()) filters.search = search;
      if (categoryFilter) filters.categoryId = categoryFilter;
      if (lowStockOnly) filters.lowStock = true;

      const prodList = await productService.getProducts(filters);
      setProducts(prodList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync catalog products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, lowStockOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await productService.deleteProduct(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    setCatSubmitting(true);
    try {
      await productService.createCategory(categoryForm);
      setCategoryModalOpen(false);
      setCategoryForm({ name: '', description: '' });
      fetchData();
    } catch (err: any) {
      setCatError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setCatSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease]">
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">Product Catalog</h2>
          <p className="text-sm text-zinc-400">Manage business goods, set category definitions, and configure price lists.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {canModify ? (
            <>
              <button 
                onClick={() => setCategoryModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border-color bg-bg-surface hover:bg-bg-surface-hover text-zinc-300 text-sm font-semibold transition-colors"
              >
                <FolderPlus size={16} className="text-teal-500" />
                <span>Add Category</span>
              </button>
              <button 
                onClick={() => navigate('/products/create')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-indigo-500/15 transition-all duration-150 active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            </>
          ) : (
            <div className="text-xs text-zinc-500 flex items-center gap-2 border border-border-color px-4 py-2.5 rounded-lg bg-bg-surface">
              <Lock size={12} />
              <span>Restricted: WAREHOUSE / ADMIN required to modify catalog</span>
            </div>
          )}
        </div>
      </div>

      {/* Query Filters */}
      <div className="p-4 rounded-xl border border-border-color bg-bg-surface glass glow-card flex flex-col md:flex-row justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Search by Name, SKU, Description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-500 text-sm focus:border-primary focus:outline-none transition-colors"
          />
          <Search size={18} className="absolute left-3.5 top-3 text-zinc-500" />
        </form>

        {/* Category selector filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Filter Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-bg-main border border-border-color text-white px-3 py-2 rounded-lg text-xs focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 whitespace-nowrap text-xs font-medium text-zinc-400">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(event) => setLowStockOnly(event.target.checked)}
            className="h-4 w-4 rounded border-border-color accent-indigo-500"
          />
          Low stock only
        </label>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main directory list */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-zinc-800 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-border-color bg-bg-surface glass">
          <p className="text-zinc-400 text-sm">No products catalogued matching the criteria.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border-color bg-bg-surface glass glow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">SKU / Code</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Product details</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Category</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Unit Price</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4 text-center">Stock Level</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Location</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/20">
                {products.map((product) => {
                  const isLowStock = product.currentStock <= product.minimumStock;
                  const isOutOfStock = product.currentStock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-5 py-4 font-mono text-[13px] font-semibold text-teal-400 tracking-wider">
                        {product.sku}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-300">{product.name}</span>
                          {product.description && (
                            <span className="text-xs text-zinc-500 mt-1 line-clamp-1">{product.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Tag size={13} className="text-zinc-650" />
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-zinc-300">
                        <span className="flex items-center">
                          <IndianRupee size={13} className="text-zinc-500 mr-0.5" />
                          {product.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      {/* Dynamic Stock Indicator */}
                      <td className="px-5 py-4 text-center">
                        <span 
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider ${
                            isOutOfStock
                              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                              : isLowStock 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isOutOfStock ? 'OUT OF STOCK' : isLowStock ? `LOW STOCK (${product.currentStock})` : `HEALTHY (${product.currentStock})`}
                        </span>
                      </td>
                      {/* Location details */}
                      <td className="px-5 py-4 text-zinc-400">
                        <span className="flex items-center gap-1.5 text-xs">
                          <MapPin size={12} className="text-zinc-650" />
                          {product.warehouseLocation || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canModify ? (
                            <button 
                              onClick={() => navigate(`/products/edit/${product.id}`)}
                              title="Edit Product"
                              className="p-1.5 rounded border border-border-color bg-bg-main hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            >
                              <Edit2 size={13} />
                            </button>
                          ) : (
                            <button 
                              disabled 
                              title="Warehouse or Admin role required to edit product details"
                              className="p-1.5 rounded border border-border-color bg-bg-main text-zinc-650 opacity-40 cursor-not-allowed inline-flex items-center"
                            >
                              <Lock size={13} />
                            </button>
                          )}

                          {canDelete ? (
                            <button 
                              onClick={() => handleDeleteClick(product.id, product.name)}
                              title="Delete Product"
                              className="p-1.5 rounded border border-border-color bg-bg-main hover:bg-rose-500/10 text-rose-500 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          ) : (
                            <button 
                              disabled 
                              title="Admin role required to delete product from database"
                              className="p-1.5 rounded border border-border-color bg-bg-main text-zinc-650 opacity-40 cursor-not-allowed inline-flex items-center"
                            >
                              <Lock size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Creation Overlay Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="glass w-full max-w-md rounded-2xl bg-bg-surface border border-white/5 shadow-2xl p-6 sm:p-8 flex flex-col relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white font-heading">Register Product Category</h3>
              <button 
                onClick={() => setCategoryModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {catError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/30 text-xs">
                {catError}
              </div>
            )}

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[12px] font-semibold text-zinc-400">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Networking Hardware"
                  value={categoryForm.name}
                  onChange={handleCategoryInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[12px] font-semibold text-zinc-400">Category Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Provide details about products in this category..."
                  value={categoryForm.description}
                  onChange={handleCategoryInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border-color hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={catSubmitting}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow shadow-indigo-500/10 disabled:opacity-50"
                >
                  {catSubmitting ? 'Creating category...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

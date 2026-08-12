import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerService, CustomerFilters } from '../../services/customerService';
import { Customer, CustomerStatus, CustomerType } from '../../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Lock, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  AlertCircle,
  Eye
} from 'lucide-react';

export const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('ALL');

  const canDelete = user?.role === 'ADMIN';
  const canModify = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: CustomerFilters = {};
      if (search.trim()) filters.search = search;
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (customerTypeFilter !== 'ALL') filters.customerType = customerTypeFilter;
      
      const data = await customerService.getCustomers(filters);
      setCustomers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter, customerTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) return;
    
    try {
      await customerService.deleteCustomer(id);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete operation failed.');
    }
  };

  const statusColors: Record<CustomerStatus, string> = {
    LEAD: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    INACTIVE: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  };

  const typeColors: Record<CustomerType, string> = {
    RETAIL: 'bg-zinc-800 text-zinc-300 border border-zinc-700/30',
    WHOLESALE: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    DISTRIBUTOR: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  };

  const filterTabs = ['ALL', 'LEAD', 'ACTIVE', 'INACTIVE'];

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease]">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">CRM Customers Directory</h2>
          <p className="text-sm text-zinc-400">Manage client classifications, monitor deals, and log follow-up timelines.</p>
        </div>
        {canModify && <button 
          onClick={() => navigate('/customers/create')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-indigo-500/15 transition-all duration-150 active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Customer</span>
        </button>}
      </div>

      {/* Query Filter panel */}
      <div className="p-4 rounded-xl border border-border-color bg-bg-surface glass glow-card flex flex-col md:flex-row justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Search by Name, Company, Email, GST..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-500 text-sm focus:border-primary focus:outline-none transition-colors"
          />
          <Search size={18} className="absolute left-3.5 top-3 text-zinc-500" />
        </form>

        {/* Filters Tabs */}
        <div className="flex overflow-x-auto gap-1 border border-border-color p-1 rounded-lg bg-bg-main">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                statusFilter === tab
                  ? 'bg-primary text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <select
          value={customerTypeFilter}
          onChange={(event) => setCustomerTypeFilter(event.target.value)}
          aria-label="Filter by customer type"
          className="rounded-lg border border-border-color bg-bg-main px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
        >
          <option value="ALL">All types</option>
          <option value="RETAIL">Retail</option>
          <option value="WHOLESALE">Wholesale</option>
          <option value="DISTRIBUTOR">Distributor</option>
        </select>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Listing Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-zinc-800 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : customers.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-border-color bg-bg-surface glass">
          <p className="text-zinc-400 text-sm">No customers found matching the criteria.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border-color bg-bg-surface glass glow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Client info</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Company & GST</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Class</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Status</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Next Follow-Up</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/20">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/[0.01] transition-colors">
                    {/* Name & Contact */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-300">{customer.customerName}</span>
                        <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1">
                          {customer.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={12} />
                              {customer.email}
                            </span>
                          )}
                          {customer.mobile && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {customer.mobile}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Business Name & GST */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col text-left">
                        {customer.businessName ? (
                          <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                            <Building size={14} className="text-zinc-650" />
                            {customer.businessName}
                          </span>
                        ) : (
                          <span className="text-zinc-650">—</span>
                        )}
                        {customer.gstNumber && (
                          <span className="text-[11px] text-zinc-500 mt-0.5 font-mono">GST: {customer.gstNumber}</span>
                        )}
                      </div>
                    </td>
                    {/* Customer Type Badge */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wider ${typeColors[customer.customerType]}`}>
                        {customer.customerType}
                      </span>
                    </td>
                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider ${statusColors[customer.status]}`}>
                        {customer.status}
                      </span>
                    </td>
                    {/* Next Follow-Up date */}
                    <td className="px-5 py-4 text-zinc-400">
                      {customer.followUpDate ? (
                        <span className="flex items-center gap-1.5 text-xs text-zinc-300">
                          <Calendar size={13} className="text-primary" />
                          {new Date(customer.followUpDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic text-xs">No pending items</span>
                      )}
                    </td>
                    {/* Action buttons */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Details & Follow-Ups button */}
                        <button 
                          onClick={() => navigate(`/customers/details/${customer.id}`)}
                          title="View customer timeline details"
                          className="p-1.5 rounded border border-border-color bg-bg-main hover:bg-zinc-800 text-teal-400 hover:text-teal-300 transition-colors"
                        >
                          <Eye size={13} />
                        </button>
                        
                        {/* Edit button */}
                        {canModify && <button 
                          onClick={() => navigate(`/customers/edit/${customer.id}`)}
                          title="Edit Customer"
                          className="p-1.5 rounded border border-border-color bg-bg-main hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>}
                        
                        {canDelete ? (
                          <button 
                            onClick={() => handleDeleteClick(customer.id, customer.customerName)}
                            title="Delete Customer"
                            className="p-1.5 rounded border border-border-color bg-bg-main hover:bg-rose-500/10 text-rose-500 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        ) : (
                          <button 
                            disabled 
                            title="Admin role required to delete customer record"
                            className="p-1.5 rounded border border-border-color bg-bg-main text-zinc-650 opacity-40 cursor-not-allowed inline-flex items-center"
                          >
                            <Lock size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

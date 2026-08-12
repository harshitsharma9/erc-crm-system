import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { CustomerStatus, CustomerType } from '../../types';
import { X, AlertCircle } from 'lucide-react';

export const CustomerEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL' as CustomerType,
    address: '',
    status: 'LEAD' as CustomerStatus,
    notes: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;
      try {
        const customer = await customerService.getCustomerById(id);
        setFormData({
          customerName: customer.customerName,
          mobile: customer.mobile || '',
          email: customer.email || '',
          businessName: customer.businessName || '',
          gstNumber: customer.gstNumber || '',
          customerType: customer.customerType,
          address: customer.address || '',
          status: customer.status,
          notes: customer.notes || '',
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch customer details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setSubmitting(true);

    const submitData = {
      ...formData,
      email: formData.email.trim() || null,
      mobile: formData.mobile.trim() || null,
      businessName: formData.businessName.trim() || null,
      gstNumber: formData.gstNumber.trim() || null,
      address: formData.address.trim() || null,
      notes: formData.notes.trim() || null,
    };

    try {
      await customerService.updateCustomer(id, submitData);
      navigate('/customers');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Operation failed. Verify inputs.');
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
          <h3 className="text-lg font-bold text-white font-heading">Update Customer Profile</h3>
          <button 
            onClick={() => navigate('/customers')}
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
            <label className="text-[12px] font-semibold text-zinc-400">Customer Name *</label>
            <input
              type="text"
              name="customerName"
              required
              placeholder="e.g. John Doe"
              value={formData.customerName}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] font-semibold text-zinc-400">Business Name (Company)</label>
              <input
                type="text"
                name="businessName"
                placeholder="e.g. Acme Corp"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] font-semibold text-zinc-400">GST Number</label>
              <input
                type="text"
                name="gstNumber"
                placeholder="e.g. 22AAAAA1111A1Z1"
                value={formData.gstNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm focus:border-primary focus:outline-none transition-colors font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] font-semibold text-zinc-400">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] font-semibold text-zinc-400">Mobile Number</label>
              <input
                type="text"
                name="mobile"
                placeholder="+91 99999-99999"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] font-semibold text-zinc-400">Customer Classification *</label>
              <select
                name="customerType"
                required
                value={formData.customerType}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white text-sm focus:border-primary focus:outline-none transition-colors cursor-pointer"
              >
                <option value="RETAIL">RETAIL</option>
                <option value="WHOLESALE">WHOLESALE</option>
                <option value="DISTRIBUTOR">DISTRIBUTOR</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] font-semibold text-zinc-400">Account Status *</label>
              <select
                name="status"
                required
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white text-sm focus:border-primary focus:outline-none transition-colors cursor-pointer"
              >
                <option value="LEAD">LEAD</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[12px] font-semibold text-zinc-400">Address Location</label>
            <input
              type="text"
              name="address"
              placeholder="Provide address details..."
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[12px] font-semibold text-zinc-400">General Notes</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Important client notes..."
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="px-4 py-2 rounded-lg border border-border-color hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow shadow-indigo-500/10 disabled:opacity-50"
            >
              {submitting ? 'Saving changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

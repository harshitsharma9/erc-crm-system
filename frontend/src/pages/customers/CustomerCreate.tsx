import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { CustomerStatus, CustomerType } from '../../types';
import { X, AlertCircle, CalendarClock, CalendarDays, UserRoundPlus } from 'lucide-react';

export const CustomerCreate: React.FC = () => {
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
    followUpDate: '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const followUpDateInput = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const submitData = {
      ...formData,
      followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : null,
      email: formData.email.trim() || null,
      mobile: formData.mobile.trim() || null,
      businessName: formData.businessName.trim() || null,
      gstNumber: formData.gstNumber.trim() || null,
      address: formData.address.trim() || null,
      notes: formData.notes.trim() || null,
    };

    try {
      await customerService.createCustomer(submitData);
      navigate('/customers');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Operation failed. Verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const openFollowUpPicker = () => {
    const input = followUpDateInput.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') input.showPicker();
    else input.focus();
  };

  return (
    <div className="flex justify-center items-center py-6 sm:py-10 animate-[fadeIn_0.25s_ease]">
      <div className="glass w-full max-w-2xl rounded-3xl bg-bg-surface/95 border border-white/7 shadow-2xl shadow-black/30 p-5 sm:p-8 flex flex-col relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-7 border-b border-border-color pb-5">
          <div className="flex items-center gap-3 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-primary/10 text-primary shadow-inner shadow-indigo-400/10">
              <UserRoundPlus size={19} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">Register CRM Customer</h3>
              <p className="mt-0.5 text-xs text-zinc-500">Create a customer profile and schedule the next action.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/customers')}
            aria-label="Close customer form"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
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
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Customer Name <span className="text-primary">*</span></label>
            <input
              type="text"
              name="customerName"
              required
              placeholder="e.g. John Doe"
              value={formData.customerName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm shadow-inner shadow-black/10 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Business Name</label>
              <input
                type="text"
                name="businessName"
                placeholder="e.g. Acme Corp"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm shadow-inner shadow-black/10 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">GST Number</label>
              <input
                type="text"
                name="gstNumber"
                placeholder="e.g. 22AAAAA1111A1Z1"
                value={formData.gstNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm shadow-inner shadow-black/10 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all font-mono uppercase"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-primary/10 bg-primary/[0.035] p-3 sm:p-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-400">
                <CalendarClock size={14} className="text-primary" aria-hidden="true" />
                First Follow-up Date
              </label>
              <div className="relative">
                <CalendarClock
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary"
                  aria-hidden="true"
                />
                <input
                  ref={followUpDateInput}
                  type="datetime-local"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleInputChange}
                  className="follow-up-picker w-full py-3 pl-10 pr-12 rounded-xl border border-border-color bg-bg-main text-white text-sm shadow-inner shadow-black/10 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all cursor-pointer"
                />
                <button
                  type="button"
                  onClick={openFollowUpPicker}
                  aria-label="Choose follow-up date and time"
                  title="Choose date and time"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-primary/10 hover:text-primary focus:outline-none"
                >
                  <CalendarDays size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">General Notes</label>
              <textarea
                name="notes"
                rows={1}
                placeholder="Important client notes..."
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-main text-white placeholder-zinc-650 text-sm shadow-inner shadow-black/10 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5 border-t border-border-color">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="px-5 py-2.5 rounded-xl border border-border-color hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

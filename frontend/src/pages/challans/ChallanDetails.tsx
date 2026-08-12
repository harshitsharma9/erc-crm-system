import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { challanService } from '../../services/challanService';
import { SalesChallan, ChallanStatus } from '../../types';
import { 
  Building, 
  Phone, 
  Calendar, 
  User, 
  ArrowLeft,
  FileText,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  XCircle,
  Printer
} from 'lucide-react';

export const ChallanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [challan, setChallan] = useState<SalesChallan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchChallan = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await challanService.getChallanById(id);
      setChallan(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync sales challan details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  // Action handlers
  const handleConfirm = async () => {
    if (!id || !challan) return;
    if (!window.confirm('Are you sure you want to CONFIRM this challan? This will reduce warehouse stocks.')) return;

    setSubmitting(true);
    try {
      const response = await challanService.confirmChallan(id);
      alert(response.message || 'Sales Challan confirmed successfully!');
      fetchChallan(); // Reload
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to confirm challan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!id || !challan) return;
    if (!window.confirm('Are you sure you want to CANCEL this challan? This status adjustment cannot be reverted.')) return;

    setSubmitting(true);
    try {
      const response = await challanService.cancelChallan(id);
      alert(response.message || 'Sales Challan cancelled successfully.');
      fetchChallan(); // Reload
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel challan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const statusColors: Record<ChallanStatus, string> = {
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

  if (error || !challan) {
    return (
      <div className="p-6 text-center">
        <div className="p-4 inline-flex items-center gap-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30 text-sm mb-4">
          <AlertCircle size={18} />
          <span>{error || 'Sales Challan not found.'}</span>
        </div>
        <br />
        <button 
          onClick={() => navigate('/challans')}
          className="px-4 py-2 bg-bg-surface border border-border-color rounded-lg text-zinc-300 hover:text-white transition-colors"
        >
          Back to Challans list
        </button>
      </div>
    );
  }

  const totalPrice = challan.items?.reduce((acc, curr) => acc + curr.totalPrice, 0) || 0;

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease] text-left print:p-0">
      {/* Top action header */}
      <div className="flex justify-between items-start print:hidden">
        <div>
          <button 
            onClick={() => navigate('/challans')}
            className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            <span>Back to Challans</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
            Delivery Challan details: <span className="font-mono text-teal-400">{challan.challanNumber}</span>
          </h2>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border-color bg-bg-surface hover:bg-bg-surface-hover text-zinc-300 text-sm font-semibold transition-colors"
        >
          <Printer size={15} />
          <span>Print invoice copy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Challan summary cards */}
        <div className="lg:col-span-1 flex flex-col gap-6 print:col-span-3">
          {/* Status info card */}
          <div className="p-6 rounded-2xl border border-border-color bg-bg-surface glass glow-card">
            <h4 className="text-sm font-bold text-white mb-4 font-heading">Dispatch Metadata</h4>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Challan Status</span>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider mt-1.5 self-start ${statusColors[challan.status]}`}>
                  {challan.status}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Issued On Date</span>
                <span className="text-sm text-zinc-200 mt-1 flex items-center gap-1.5">
                  <Calendar size={13} className="text-zinc-650" />
                  {new Date(challan.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Created Representative</span>
                <span className="text-sm text-zinc-200 mt-1 flex items-center gap-1.5 font-semibold">
                  <User size={13} className="text-zinc-650" />
                  {challan.createdBy?.name || 'Authorized Rep'}
                  <span className="text-[10px] text-zinc-500 font-normal font-mono">({challan.createdBy?.role})</span>
                </span>
              </div>
            </div>
          </div>

          {/* Customer info card */}
          <div className="p-6 rounded-2xl border border-border-color bg-bg-surface glass glow-card">
            <h4 className="text-sm font-bold text-white mb-4 font-heading">Customer profile</h4>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Client Name</span>
                <span className="text-sm text-zinc-200 font-semibold mt-0.5">{challan.customer?.customerName}</span>
              </div>
              {challan.customer?.businessName && (
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Company Name</span>
                  <span className="text-sm text-zinc-300 mt-0.5 flex items-center gap-1.5 font-medium">
                    <Building size={13} className="text-zinc-650" />
                    {challan.customer.businessName}
                  </span>
                </div>
              )}
              {challan.customer?.gstNumber && (
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">GST Registration</span>
                  <span className="text-sm text-teal-400 font-mono mt-0.5 uppercase tracking-wider font-semibold">
                    {challan.customer.gstNumber}
                  </span>
                </div>
              )}
              {challan.customer?.mobile && (
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Contact Number</span>
                  <span className="text-sm text-zinc-300 mt-0.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-zinc-650" />
                    {challan.customer.mobile}
                  </span>
                </div>
              )}
              {challan.customer?.address && (
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Billing Address</span>
                  <span className="text-sm text-zinc-300 mt-0.5 leading-relaxed">{challan.customer.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Snapshot items list */}
        <div className="lg:col-span-2 flex flex-col gap-6 print:col-span-3">
          <div className="p-6 rounded-2xl border border-border-color bg-bg-surface glass glow-card flex-1 flex flex-col justify-between min-h-[400px]">
            <div>
              <h4 className="text-sm font-bold text-white mb-4 font-heading flex items-center gap-2 pb-2 border-b border-border-color">
                <FileText size={16} className="text-teal-400" />
                <span>Frozen Snapshot Line Items</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-color text-zinc-500 font-semibold uppercase">
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3 text-center">Quantity</th>
                      <th className="px-4 py-3">Checked Unit Price</th>
                      <th className="px-4 py-3 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/10 text-zinc-300">
                    {challan.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.01]">
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
                            {item.totalPrice.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price values and Action buttons */}
            <div className="mt-6 border-t border-border-color pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-zinc-400 mb-6">
                <div className="flex gap-4">
                  <span>Total Quantities: <strong className="text-white">{challan.totalQuantity} items</strong></span>
                </div>
                <div className="text-lg font-bold text-white flex items-center">
                  <span>Total Value:</span>
                  <IndianRupee size={18} className="text-teal-400 ml-1.5" />
                  <span className="text-teal-400">{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Draft options confirmation workflow */}
              {challan.status === 'DRAFT' && (
                <div className="flex justify-end gap-3 pt-4 border-t border-border-color/50 print:hidden">
                  <button
                    onClick={handleCancel}
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg border border-border-color hover:bg-rose-500/10 text-rose-500 hover:text-rose-400 transition-colors text-xs font-bold flex items-center gap-1.5"
                  >
                    <XCircle size={14} />
                    <span>Cancel Challan</span>
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow shadow-indigo-500/15 flex items-center gap-1.5"
                  >
                    <CheckCircle size={14} />
                    <span>Confirm Dispatch</span>
                  </button>
                </div>
              )}

              {challan.status === 'CONFIRMED' && (
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs text-center flex items-center justify-center gap-2 print:hidden font-semibold">
                  <CheckCircle size={15} />
                  <span>This Sales Challan has been confirmed. Stock reductions have been committed to audit trail logs.</span>
                </div>
              )}

              {challan.status === 'CANCELLED' && (
                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs text-center flex items-center justify-center gap-2 print:hidden font-semibold">
                  <XCircle size={15} />
                  <span>This Sales Challan has been cancelled. No stock adjustments are registered.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

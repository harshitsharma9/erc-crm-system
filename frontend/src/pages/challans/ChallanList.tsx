import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { challanService } from '../../services/challanService';
import { SalesChallan, ChallanStatus } from '../../types';
import { 
  Plus, 
  Eye, 
  Calendar, 
  Lock, 
  AlertCircle
} from 'lucide-react';

export const ChallanList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchChallans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await challanService.getChallans();
      setChallans(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve Sales Challans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, []);

  const statusColors: Record<ChallanStatus, string> = {
    DRAFT: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    CANCELLED: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease]">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">Sales Delivery Challans</h2>
          <p className="text-sm text-zinc-400">Track item dispatches, audit customer deliveries, and manage transaction statuses.</p>
        </div>

        {canCreate ? (
          <button 
            onClick={() => navigate('/challans/create')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-indigo-500/15 transition-all duration-150 active:scale-[0.98] self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Create Challan</span>
          </button>
        ) : (
          <div className="text-xs text-zinc-500 flex items-center gap-2 border border-border-color px-4 py-2.5 rounded-lg bg-bg-surface self-start sm:self-auto">
            <Lock size={12} />
            <span>Restricted: SALES / ADMIN required to create challan</span>
          </div>
        )}
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
      ) : challans.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-border-color bg-bg-surface glass">
          <p className="text-zinc-400 text-sm">No Sales Challans recorded in database.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border-color bg-bg-surface glass glow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Challan No.</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Customer Name</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Company</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Total Qty</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Date</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4">Status</th>
                  <th className="px-5 py-4 text-[12px] font-semibold text-zinc-500 uppercase pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/20">
                {challans.map((challan) => (
                  <tr key={challan.id} className="hover:bg-white/[0.01] transition-colors text-zinc-300">
                    {/* Serial Number */}
                    <td className="px-5 py-4 font-mono text-[13px] font-bold text-teal-400 tracking-wider">
                      {challan.challanNumber}
                    </td>
                    {/* Customer */}
                    <td className="px-5 py-4 font-semibold text-zinc-200">
                      {challan.customer?.customerName || 'Walk-in Client'}
                    </td>
                    {/* Business Name */}
                    <td className="px-5 py-4 text-zinc-400">
                      {challan.customer?.businessName || '—'}
                    </td>
                    {/* Total Quantity */}
                    <td className="px-5 py-4 font-bold text-zinc-300">
                      {challan.totalQuantity} items
                    </td>
                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-zinc-650" />
                        {new Date(challan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider ${statusColors[challan.status]}`}>
                        {challan.status}
                      </span>
                    </td>
                    {/* Action button */}
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/challans/details/${challan.id}`)}
                        title="View Challan Details & Snapshot Line Items"
                        className="p-1.5 rounded border border-border-color bg-bg-main hover:bg-zinc-800 text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        <Eye size={13} />
                        <span>View Details</span>
                      </button>
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

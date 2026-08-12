import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { Customer, CustomerFollowUp, CustomerStatus, CustomerType } from '../../types';
import { 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  ArrowLeft,
  FileText,
  PlusCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<CustomerFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New follow-up input
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const data = await customerService.getCustomerById(id);
      setCustomer(data);
      setFollowUps(data.followUps || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync customer details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !note.trim()) return;

    setSubmitting(true);
    try {
      const formattedDate = followUpDate ? new Date(followUpDate).toISOString() : null;
      await customerService.createFollowUp(id, {
        note: note.trim(),
        followUpDate: formattedDate,
      });

      setNote('');
      setFollowUpDate('');
      fetchDetails(); // Refresh details list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to log follow-up.');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-zinc-800 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6 text-center">
        <div className="p-4 inline-flex items-center gap-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30 text-sm mb-4">
          <ShieldAlert size={18} />
          <span>{error || 'Customer not found.'}</span>
        </div>
        <br />
        <button 
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-bg-surface border border-border-color rounded-lg text-zinc-300 hover:text-white transition-colors"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease] text-left">
      {/* Top action header */}
      <div>
        <button 
          onClick={() => navigate('/customers')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          <span>Back to Customers</span>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">CRM Account Details</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Client profile card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-border-color bg-bg-surface glass glow-card flex flex-col">
            <span className={`inline-flex px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wider self-start mb-4 ${typeColors[customer.customerType]}`}>
              {customer.customerType}
            </span>

            <h3 className="text-xl font-bold text-white font-heading">{customer.customerName}</h3>
            
            {customer.businessName && (
              <span className="text-sm text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
                <Building size={14} className="text-zinc-650" />
                {customer.businessName}
              </span>
            )}

            <div className="border-t border-border-color my-6"></div>

            {/* Profile fields */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Mobile Number</span>
                <span className="text-sm text-zinc-200 mt-0.5 font-semibold flex items-center gap-1.5">
                  <Phone size={13} className="text-zinc-600" />
                  {customer.mobile || '—'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Email Address</span>
                <span className="text-sm text-zinc-200 mt-0.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-zinc-600" />
                  {customer.email || '—'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">GST Number</span>
                <span className="text-sm text-teal-400 mt-0.5 font-mono uppercase tracking-wider font-semibold">
                  {customer.gstNumber || '—'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Address Location</span>
                <span className="text-sm text-zinc-300 mt-0.5 leading-relaxed">
                  {customer.address || '—'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Account status</span>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider mt-1.5 self-start ${statusColors[customer.status]}`}>
                  {customer.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Timeline history logs and recorder */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Recorder form */}
          <div className="p-6 rounded-2xl border border-border-color bg-bg-surface glass glow-card">
            <h4 className="text-md font-bold text-white mb-4 font-heading flex items-center gap-2">
              <PlusCircle size={18} className="text-teal-400" />
              <span>Record Client Interaction</span>
            </h4>
            <form onSubmit={handleFollowUpSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Interaction Note *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Record details about call updates, price offers, or delivery schedules..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-main text-white placeholder-zinc-600 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Calendar size={14} className="text-zinc-500" />
                  <span className="text-xs text-zinc-400 whitespace-nowrap">Schedule Follow-up:</span>
                  <input
                    type="datetime-local"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="bg-bg-main border border-border-color rounded px-2.5 py-1 text-xs text-white focus:border-primary focus:outline-none cursor-pointer w-full sm:w-auto"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !note.trim()}
                  className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow transition-all disabled:opacity-50 w-full sm:w-auto self-end"
                >
                  {submitting ? 'Recording...' : 'Add Log Entry'}
                </button>
              </div>
            </form>
          </div>

          {/* Timeline listing */}
          <div className="p-6 rounded-2xl border border-border-color bg-bg-surface glass glow-card flex-1 flex flex-col">
            <h4 className="text-md font-bold text-white mb-4 font-heading flex items-center gap-2">
              <Clock size={18} className="text-teal-400" />
              <span>Interactions History Timeline</span>
            </h4>

            {followUps.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-border-color rounded-xl bg-bg-main/50 flex flex-col items-center justify-center">
                <FileText size={24} className="text-zinc-600 mb-2" />
                <p className="text-zinc-400 text-xs font-medium">No previous follow-up notes recorded. Register one above!</p>
              </div>
            ) : (
              <div className="relative border-l border-zinc-800 ml-3 space-y-6 pl-5">
                {followUps.map((log) => (
                  <div key={log.id} className="relative group animate-[fadeIn_0.2s_ease-out]">
                    {/* Dot dot indicator */}
                    <div className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-zinc-800 group-hover:bg-primary border-2 border-bg-surface transition-colors"></div>
                    
                    <div className="bg-bg-main/40 border border-border-color/50 hover:border-zinc-800 p-4 rounded-xl transition-colors">
                      <p className="text-sm text-zinc-300 leading-relaxed font-sans">{log.note}</p>
                      
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-zinc-900/40 text-[10px] text-zinc-500 font-medium">
                        <span className="flex items-center gap-1">
                          <User size={11} className="text-zinc-650" />
                          Logged by: <span className="text-zinc-400 font-semibold">{log.createdBy?.name || 'Representative'}</span>
                        </span>
                        <span>
                          {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {log.followUpDate && (
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-teal-400/80 font-semibold">
                          <Calendar size={10} />
                          Target Next follow-up: {new Date(log.followUpDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

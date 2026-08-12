import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UserRole } from '../types';
import { User, Mail, Lock, Eye, EyeOff, Loader2, X, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const ROLES: { key: UserRole; label: string }[] = [
  { key: 'ADMIN', label: 'Admin' },
  { key: 'SALES', label: 'Sales' },
  { key: 'WAREHOUSE', label: 'Warehouse' },
  { key: 'ACCOUNTS', label: 'Accounts' },
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('SALES');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, role });
      setSuccess(true);
      // Clear fields so Admin can add another employee
      setName('');
      setEmail('');
      setPassword('');
      setRole('SALES');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-6 sm:py-10 animate-[fadeIn_0.25s_ease]">
      <div className="glass w-full max-w-2xl rounded-3xl bg-bg-surface/95 border border-white/7 shadow-2xl shadow-black/30 p-5 sm:p-8 flex flex-col relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-7 border-b border-border-color pb-5">
          <div className="flex items-center gap-3 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-primary/10 text-primary shadow-inner shadow-indigo-400/10">
              <UserPlus size={19} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">Register Employee</h3>
              <p className="mt-0.5 text-xs text-zinc-500">Create an account for staff with specific roles.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            aria-label="Close employee registration form"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/30 text-xs flex items-center gap-2 text-left">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-2 text-left">
            <CheckCircle size={14} />
            <span>Employee account created successfully! You can register another or go back to Dashboard.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role tabs */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Role <span className="text-primary">*</span></label>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-bg-main/80 border border-border-color">
              {ROLES.map((r) => (
                <button key={r.key} type="button" onClick={() => setRole(r.key)}
                  className={`py-2 rounded-lg text-[11.5px] font-bold tracking-wide transition-all duration-200 cursor-pointer
                    ${role === r.key
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="r-name" className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Full Name <span className="text-primary">*</span></label>
            <div className="relative group">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" />
              <input id="r-name" type="text" required placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} autoComplete="name"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-color text-white text-[13px] placeholder-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all" />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="r-email" className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Email Address <span className="text-primary">*</span></label>
            <div className="relative group">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" />
              <input id="r-email" type="email" required placeholder="employee@company.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-color text-white text-[13px] placeholder-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="r-pw" className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Temporary Password <span className="text-primary">*</span></label>
            <div className="relative group">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" />
              <input id="r-pw" type={showPw ? 'text' : 'password'} required placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-bg-main border border-border-color text-white text-[13px] placeholder-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all" />
              <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl border border-border-color text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading
                ? <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Creating…</span>
                : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>

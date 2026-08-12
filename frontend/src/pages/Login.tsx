import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const ROLES: { key: UserRole; label: string }[] = [
  { key: 'ADMIN', label: 'Admin' },
  { key: 'SALES', label: 'Sales' },
  { key: 'WAREHOUSE', label: 'Warehouse' },
  { key: 'ACCOUNTS', label: 'Accounts' },
];


export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('SALES');
  const [email, setEmail] = useState('sales@company.com');
  const [password, setPassword] = useState('Password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setError(null);
    
    // Automatically pre-fill credentials for demo convenience
    const demoEmails: Record<UserRole, string> = {
      ADMIN: 'admin@company.com',
      SALES: 'sales@company.com',
      WAREHOUSE: 'warehouse@company.com',
      ACCOUNTS: 'accounts@company.com',
    };
    setEmail(demoEmails[selectedRole]);
    setPassword('Password123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-[fadeIn_0.25s_ease]">
      {/* Role tabs */}
      <div>
        <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Select Role</label>
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-bg-main/80 border border-border-color">
          {ROLES.map((r) => (
            <button key={r.key} type="button" onClick={() => handleRoleSelect(r.key)}
              className={`py-2 rounded-lg text-[11.5px] font-bold tracking-wide transition-all duration-200 cursor-pointer
                ${role === r.key
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-rose-500/8 border border-rose-500/20 text-rose-400 text-[12.5px] leading-snug">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="l-email" className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Email</label>
        <div className="relative group">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" />
          <input id="l-email" type="email" required placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-color text-white text-[13px] placeholder-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all" />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="l-pw" className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Password</label>
        <div className="relative group">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" />
          <input id="l-pw" type={showPw ? 'text' : 'password'} required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-bg-main border border-border-color text-white text-[13px] placeholder-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all" />
          <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer">
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading}
        className="mt-1.5 w-full py-3 rounded-lg bg-gradient-to-r from-primary to-indigo-600 text-white text-[13px] font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
        {loading
          ? <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" />Signing in…</span>
          : 'Sign In'}
      </button>
    </form>
  );
};

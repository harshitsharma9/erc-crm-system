import React from 'react';
import { IndianRupee } from 'lucide-react';

export const Accounts: React.FC = () => {
  const ledgerEntries = [
    { id: 'TXN-0012', desc: 'ABC Traders Challan CH-000001 Confirmation', type: 'INCOME', amount: 25400, date: '2026-08-11' },
    { id: 'TXN-0011', desc: 'Vendor Restocking Payment PO-9901', type: 'EXPENSE', amount: 15000, date: '2026-08-10' },
    { id: 'TXN-0010', desc: 'Kumar Distributors Challan CH-000003 Confirmation', type: 'INCOME', amount: 43500, date: '2026-08-09' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease] text-left">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">Accounts & Ledgers</h2>
        <p className="text-sm text-zinc-400">View incoming revenues, confirm vendor payments, and review financial books.</p>
      </div>

      {/* KPI summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-border-color bg-bg-surface glass flex flex-col gap-1">
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Total Revenue</span>
          <div className="flex items-center text-2xl font-bold text-emerald-400">
            <IndianRupee size={20} />
            <span>68,900.00</span>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border-color bg-bg-surface glass flex flex-col gap-1">
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Vendor Outflow</span>
          <div className="flex items-center text-2xl font-bold text-rose-400">
            <IndianRupee size={20} />
            <span>15,000.00</span>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border-color bg-bg-surface glass flex flex-col gap-1">
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Net Cash Balance</span>
          <div className="flex items-center text-2xl font-bold text-white">
            <IndianRupee size={20} />
            <span>53,900.00</span>
          </div>
        </div>
      </div>

      {/* Ledger history table */}
      <div className="p-5 rounded-2xl border border-border-color bg-bg-surface glass glow-card">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-heading">General Cash Book Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-color text-zinc-500 font-semibold uppercase">
                <th className="px-4 py-3">Txn ID</th>
                <th className="px-4 py-3">Transaction details</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/10 text-zinc-300">
              {ledgerEntries.map((txn) => (
                <tr key={txn.id} className="hover:bg-white/[0.01]">
                  <td className="px-4 py-3 font-mono text-teal-400 font-bold">{txn.id}</td>
                  <td className="px-4 py-3 text-zinc-200">{txn.desc}</td>
                  <td className="px-4 py-3">
                    <span 
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        txn.type === 'INCOME' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{txn.date}</td>
                  <td className={`px-4 py-3 text-right font-bold ${txn.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <span className="inline-flex items-center justify-end">
                      <IndianRupee size={11} className="mr-0.5" />
                      {txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

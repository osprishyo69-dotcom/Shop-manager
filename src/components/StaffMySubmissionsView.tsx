import React from 'react';
import { useApp } from '../context/AppContext';
import { ClipboardList, Lock, CheckCircle2, Pill, Wallet, Smartphone, ShieldCheck } from 'lucide-react';

export const StaffMySubmissionsView: React.FC = () => {
  const { currentUser, getStaffTodayEntries, formattedCurrency } = useApp();

  const myEntries = getStaffTodayEntries(currentUser.id);

  const totalMyEntriesSum = myEntries.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold">{currentUser.name}</h2>
              <span className="bg-emerald-950 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-800 font-semibold">
                Staff Entry View
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Your logged shop entries for today ({new Date().toLocaleDateString()})
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Total Entries Recorded
          </span>
          <span className="text-xl font-extrabold text-emerald-400">{myEntries.length} Records</span>
        </div>
      </div>

      {/* Security lock note */}
      <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-center gap-2">
        <Lock className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Security Policy:</strong> You can review your entries logged today. Edit and delete capabilities are restricted to the shop owner.
        </span>
      </div>

      {/* Table of Staff's own entries */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl">
        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-emerald-400" /> My Logged Entries Today
        </h3>

        {myEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 italic">
            You haven't logged any transactions yet today. Go to "+ Quick Entry" to record a sale or expense.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Details / Customer</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {myEntries.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono text-slate-400">{tx.time}</td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-800 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        {tx.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {tx.customerName && (
                        <p className="font-bold text-white">Customer: {tx.customerName}</p>
                      )}
                      <p className="text-slate-400 italic">{tx.note || 'No notes'}</p>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-emerald-400 text-sm">
                      {formattedCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[10px] bg-slate-950 text-emerald-400 px-2 py-0.5 rounded border border-slate-800 font-medium inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Saved (Locked)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffMySubmissionsView;

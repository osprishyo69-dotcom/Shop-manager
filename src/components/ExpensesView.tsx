import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Receipt, Plus, Trash2, Calendar, Coffee, Zap, Truck, ShoppingBag, ShieldCheck } from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, formattedCurrency, isOwner } = useApp();

  const [expenseType, setExpenseType] = useState<'shop_expense' | 'supplier_payment'>('shop_expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Tea & Snacks');

  const categories = [
    'Tea & Snacks',
    'Shop Rent',
    'Electricity & Utility',
    'Paper & Stationery',
    'Transport / Freight',
    'Pharma Supplier Payment',
    'Staff Advance',
    'Other Expense',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    addTransaction({
      category: expenseType,
      amount: num,
      note: `[${expenseCategory}] ${note.trim()}`,
      isCredit: false,
    });

    setAmount('');
    setNote('');
  };

  const expenseRecords = transactions.filter(
    (t) => t.category === 'shop_expense' || t.category === 'supplier_payment'
  );

  const totalExpenseSum = expenseRecords.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 border border-rose-800/60 rounded-2xl p-5 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-rose-400" />
            <h2 className="text-xl font-bold">Shop Expense & Supplier Payment Tracker</h2>
          </div>
          <p className="text-xs text-rose-200/80 mt-1">
            Log shop overheads, daily tea/snacks, electricity bills, and wholesaler payments.
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-rose-500/30 text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Recorded Expenses</span>
          <span className="text-xl font-extrabold text-rose-400">{formattedCurrency(totalExpenseSum)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Plus className="w-5 h-5 text-rose-400" /> Log Expense Record
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Expense Type</label>
              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
              >
                <option value="shop_expense">Daily Shop Expense</option>
                <option value="supplier_payment">Medicine Wholesaler Payment</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category Tag</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Expense Amount (BDT ৳)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 150"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-lg font-bold text-rose-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Details / Note</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Afternoon tea & biscuits for 4 staff"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-slate-950 font-extrabold text-sm py-3 rounded-xl transition shadow-lg"
            >
              SAVE EXPENSE RECORD
            </button>
          </form>
        </div>

        {/* Expenses Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl">
          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-400" /> Recorded Expense History
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Logged By</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  {isOwner && <th className="py-2.5 px-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenseRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                      No expense records logged yet.
                    </td>
                  </tr>
                ) : (
                  expenseRecords.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {t.date} {t.time}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                          {t.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-200">{t.note || 'N/A'}</td>
                      <td className="py-2.5 px-3 text-slate-400">{t.staffName}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-400 text-sm">
                        {formattedCurrency(t.amount)}
                      </td>
                      {isOwner && (
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="p-1 text-rose-400 hover:text-white hover:bg-rose-950 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesView;

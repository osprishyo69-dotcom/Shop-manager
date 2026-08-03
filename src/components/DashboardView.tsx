import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BookOpenCheck,
  Receipt,
  Pill,
  Users,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    transactions,
    customers,
    dailyCash,
    users,
    formattedCurrency,
    isOwner,
    deleteTransaction,
    updateDailyCash,
    closeDailyCash,
    setActiveTab,
  } = useApp();

  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter((t) => t.date === todayStr);

  // Calculations
  const medCashSales = todayTransactions
    .filter((t) => t.category === 'med_cash_sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const medCreditSales = todayTransactions
    .filter((t) => t.category === 'med_credit_sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const mfsCashOuts = todayTransactions
    .filter((t) => t.category === 'mfs_cash_out')
    .reduce((sum, t) => sum + t.amount, 0); // Customer paid MFS, shop paid physical cash

  const mfsCashIns = todayTransactions
    .filter((t) => t.category === 'mfs_cash_in')
    .reduce((sum, t) => sum + t.amount, 0); // Customer paid physical cash, shop sent MFS

  const flexiloadTotal = todayTransactions
    .filter((t) => t.category === 'mfs_flexiload')
    .reduce((sum, t) => sum + t.amount, 0);

  const duesCollected = todayTransactions
    .filter((t) => t.category === 'due_repayment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = todayTransactions
    .filter((t) => t.category === 'shop_expense' || t.category === 'supplier_payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutstandingDues = customers.reduce((sum, c) => sum + c.totalDue, 0);

  // Physical Cash in Drawer Math:
  // Opening Cash + Medicine Cash Sales + MFS Cash-In (Physical cash received) + Dues Collected - MFS Cash-Out (Physical cash paid out) - Expenses
  const cashInflow = medCashSales + mfsCashIns + duesCollected;
  const cashOutflow = mfsCashOuts + totalExpenses;
  const expectedClosingCash = dailyCash.openingCash + cashInflow - cashOutflow;

  // Digital MFS Balance Math:
  // Opening MFS + MFS Cash-Out (Received digital money) - MFS Cash-In (Sent digital money) - Flexiload
  const expectedClosingMfs =
    dailyCash.openingMfsBalance + mfsCashOuts - mfsCashIns - flexiloadTotal;

  const filteredTransactions = transactions.filter((t) => {
    if (selectedStaffFilter !== 'all' && t.staffId !== selectedStaffFilter) return false;
    if (selectedCategoryFilter !== 'all' && t.category !== selectedCategoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Owner Header / Disclaimer */}
      {!isOwner && (
        <div className="bg-amber-950/80 border border-amber-500/50 rounded-2xl p-4 text-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold">
              Restricted Preview Mode: Full owner reports are only visible to the shop owner admin.
            </span>
          </div>
        </div>
      )}

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Cash Flow Card */}
        <div className="bg-[#161618] border border-white/10 rounded-md p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">
              [ Physical Cash ]
            </span>
            <div className="w-8 h-8 rounded bg-[#00ffa3]/10 text-[#00ffa3] flex items-center justify-center border border-[#00ffa3]/30">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-syne font-extrabold text-[#00ffa3] tracking-tight my-1">
            {formattedCurrency(expectedClosingCash)}
          </p>
          <div className="mt-2 text-[11px] font-mono text-white/60 flex items-center justify-between pt-2 border-t border-white/10">
            <span>Opening: {formattedCurrency(dailyCash.openingCash)}</span>
            <span className="text-[#00ffa3] font-bold">+৳{cashInflow} In</span>
          </div>
        </div>

        {/* Digital MFS Float Balance */}
        <div className="bg-[#161618] border border-white/10 rounded-md p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">
              [ MFS Float Balance ]
            </span>
            <div className="w-8 h-8 rounded bg-teal-400/10 text-teal-300 flex items-center justify-center border border-teal-400/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-syne font-extrabold text-teal-300 tracking-tight my-1">
            {formattedCurrency(expectedClosingMfs)}
          </p>
          <div className="mt-2 text-[11px] font-mono text-white/60 flex items-center justify-between pt-2 border-t border-white/10">
            <span>bKash / Nagad / Upay</span>
            <span className="text-teal-300 font-bold">Live Wallet</span>
          </div>
        </div>

        {/* Total Outstanding Dues (TallyKhata) */}
        <div className="bg-[#161618] border border-white/10 rounded-md p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">
              [ Outstanding Dues ]
            </span>
            <div className="w-8 h-8 rounded bg-amber-400/10 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <BookOpenCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-syne font-extrabold text-amber-300 tracking-tight my-1">
            {formattedCurrency(totalOutstandingDues)}
          </p>
          <div className="mt-2 text-[11px] font-mono text-white/60 flex items-center justify-between pt-2 border-t border-white/10">
            <span>{customers.length} Customers</span>
            <button
              onClick={() => setActiveTab('alarms')}
              className="text-amber-300 font-bold hover:underline uppercase"
            >
              Call Alerts →
            </button>
          </div>
        </div>

        {/* Today's Sales & Expenses */}
        <div className="bg-[#161618] border border-white/10 rounded-md p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">
              [ Daily Expenses ]
            </span>
            <div className="w-8 h-8 rounded bg-rose-400/10 text-rose-300 flex items-center justify-center border border-rose-400/30">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-syne font-extrabold text-rose-300 tracking-tight my-1">
            {formattedCurrency(totalExpenses)}
          </p>
          <div className="mt-2 text-[11px] font-mono text-white/60 flex items-center justify-between pt-2 border-t border-white/10">
            <span>Medicine Sales: {formattedCurrency(medCashSales + medCreditSales)}</span>
          </div>
        </div>
      </div>

      {/* Daily Cash Reconciliation & MFS Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breakdown Panel */}
        <div className="lg:col-span-2 bg-[#12141d] border border-white/10 rounded-md p-5 text-[#e0e0e6] shadow-xl">
          <h3 className="font-syne font-bold text-base mb-4 flex items-center gap-2 uppercase tracking-wide">
            <Pill className="w-5 h-5 text-[#00ffa3]" /> Today's Business Activity Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#0b0c10] rounded border border-white/10">
              <span className="text-[11px] font-mono text-white/50 block uppercase">[ Med Cash ]</span>
              <span className="text-lg font-syne font-bold text-[#00ffa3]">
                {formattedCurrency(medCashSales)}
              </span>
            </div>

            <div className="p-3 bg-[#0b0c10] rounded border border-white/10">
              <span className="text-[11px] font-mono text-white/50 block uppercase">[ Med Credit ]</span>
              <span className="text-lg font-syne font-bold text-amber-300">
                {formattedCurrency(medCreditSales)}
              </span>
            </div>

            <div className="p-3 bg-[#0b0c10] rounded border border-white/10">
              <span className="text-[11px] font-mono text-white/50 block uppercase">[ Due Recovered ]</span>
              <span className="text-lg font-syne font-bold text-[#00ffa3]">
                {formattedCurrency(duesCollected)}
              </span>
            </div>

            <div className="p-3 bg-[#0b0c10] rounded border border-white/10">
              <span className="text-[11px] font-mono text-white/50 block uppercase">[ MFS Cash-Out ]</span>
              <span className="text-lg font-syne font-bold text-teal-300">
                {formattedCurrency(mfsCashOuts)}
              </span>
            </div>

            <div className="p-3 bg-[#0b0c10] rounded border border-white/10">
              <span className="text-[11px] font-mono text-white/50 block uppercase">[ MFS Cash-In ]</span>
              <span className="text-lg font-syne font-bold text-blue-300">
                {formattedCurrency(mfsCashIns)}
              </span>
            </div>

            <div className="p-3 bg-[#0b0c10] rounded border border-white/10">
              <span className="text-[11px] font-mono text-white/50 block uppercase">[ Flexiload ]</span>
              <span className="text-lg font-syne font-bold text-indigo-300">
                {formattedCurrency(flexiloadTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Staff Active Entry Status */}
        <div className="bg-[#12141d] border border-white/10 rounded-md p-5 text-[#e0e0e6] shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-syne font-bold text-base mb-3 flex items-center justify-between uppercase tracking-wide">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" /> Staff Duty Status
              </span>
              <span className="text-[10px] font-mono bg-[#00ffa3]/10 text-[#00ffa3] px-2 py-0.5 rounded border border-[#00ffa3]/30 uppercase">
                Protected
              </span>
            </h3>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {users
                .filter((u) => u.role === 'staff')
                .map((staff) => {
                  const staffTxCount = todayTransactions.filter(
                    (t) => t.staffId === staff.id
                  ).length;

                  return (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between p-2.5 bg-[#0b0c10] rounded border border-white/10 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-7 h-7 rounded-full object-cover border border-[#00ffa3]/30"
                        />
                        <div>
                          <p className="font-bold text-[#e0e0e6]">{staff.name}</p>
                          <p className="text-[10px] font-mono text-white/50">PIN: {staff.pin}</p>
                        </div>
                      </div>
                      <span className="bg-white/5 text-[#e0e0e6] px-2 py-1 rounded font-mono text-[11px] border border-white/10">
                        {staffTxCount} logs today
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-white/50 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00ffa3] shrink-0" />
            <span>Staff restricted from cash totals and log deletion.</span>
          </div>
        </div>
      </div>

      {/* Transaction History & Audit Table */}
      <div className="bg-[#12141d] border border-white/10 rounded-md p-5 text-[#e0e0e6] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-syne font-bold text-lg flex items-center gap-2 uppercase tracking-wide">
              <ShieldCheck className="w-5 h-5 text-[#00ffa3]" /> Logged Transactions Audit
            </h3>
            <p className="text-xs text-white/50 font-mono">
              Real-time audit log of entries created by staff and owner
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
              className="bg-[#0b0c10] border border-white/10 text-xs font-mono text-[#e0e0e6] rounded px-3 py-1.5 outline-none"
            >
              <option value="all">All Staff Members</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-[#0b0c10] border border-white/10 text-xs font-mono text-[#e0e0e6] rounded px-3 py-1.5 outline-none"
            >
              <option value="all">All Categories</option>
              <option value="med_cash_sale">Medicine Cash</option>
              <option value="med_credit_sale">Medicine Credit (Baki)</option>
              <option value="product_return">Product Return</option>
              <option value="mfs_cash_out">MFS Cash-Out</option>
              <option value="mfs_cash_in">MFS Cash-In</option>
              <option value="mfs_flexiload">Flexiload</option>
              <option value="due_repayment">Due Repayment</option>
              <option value="shop_expense">Expense</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#e0e0e6]">
            <thead className="bg-[#0b0c10] text-white/50 font-mono border-b border-white/10 uppercase tracking-widest text-[10px]">
              <tr>
                <th className="py-3 px-3">Time / Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Staff Creator</th>
                <th className="py-3 px-3">Details / Note</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/40 italic font-mono">
                    No transactions found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-3 font-mono text-white/60">
                      <div>{tx.time}</div>
                      <div className="text-[10px] text-white/40">{tx.date}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                          tx.category === 'med_cash_sale'
                            ? 'bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/30'
                            : tx.category === 'med_credit_sale'
                            ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                            : tx.category === 'product_return'
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                            : tx.category.startsWith('mfs')
                            ? 'bg-teal-400/10 text-teal-300 border border-teal-400/30'
                            : 'bg-white/10 text-white/70 border border-white/20'
                        }`}
                      >
                        {tx.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[#e0e0e6]">{tx.staffName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        {tx.customerName && (
                          <p className="font-bold text-white">
                            Customer: {tx.customerName} ({tx.customerPhone || 'N/A'})
                          </p>
                        )}
                        <p className="text-white/60 italic">{tx.note || 'No notes'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-syne font-extrabold text-sm text-[#e0e0e6]">
                      {formattedCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isOwner ? (
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-950 rounded transition"
                          title="Delete Record (Owner Only)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-white/40 italic flex items-center justify-end gap-1">
                          <Lock className="w-3 h-3 text-white/40" /> Locked
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;

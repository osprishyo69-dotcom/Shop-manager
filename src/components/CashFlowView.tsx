import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Coins,
  Receipt,
  Edit,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const CashFlowView: React.FC = () => {
  const {
    dailyCash,
    updateDailyCash,
    closeDailyCash,
    transactions,
    formattedCurrency,
    isOwner,
  } = useApp();

  const [openingCashInput, setOpeningCashInput] = useState(String(dailyCash.openingCash));
  const [openingMfsInput, setOpeningMfsInput] = useState(String(dailyCash.openingMfsBalance));
  const [isEditingOpening, setIsEditingOpening] = useState(false);

  // Closing Form
  const [actualCashCount, setActualCashCount] = useState('');
  const [actualMfsCount, setActualMfsCount] = useState('');
  const [closeNotes, setCloseNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter((t) => t.date === todayStr);

  const medCashSales = todayTransactions
    .filter((t) => t.category === 'med_cash_sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const mfsCashIns = todayTransactions
    .filter((t) => t.category === 'mfs_cash_in')
    .reduce((sum, t) => sum + t.amount, 0);

  const mfsCashOuts = todayTransactions
    .filter((t) => t.category === 'mfs_cash_out')
    .reduce((sum, t) => sum + t.amount, 0);

  const flexiloadTotal = todayTransactions
    .filter((t) => t.category === 'mfs_flexiload')
    .reduce((sum, t) => sum + t.amount, 0);

  const duesCollected = todayTransactions
    .filter((t) => t.category === 'due_repayment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = todayTransactions
    .filter((t) => t.category === 'shop_expense' || t.category === 'supplier_payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const productCashRefunds = todayTransactions
    .filter((t) => t.category === 'product_return' && !t.isCredit)
    .reduce((sum, t) => sum + t.amount, 0);

  const cashInflow = medCashSales + mfsCashIns + duesCollected;
  const cashOutflow = mfsCashOuts + totalExpenses + productCashRefunds;

  const expectedCashInDrawer = dailyCash.openingCash + cashInflow - cashOutflow;
  const expectedMfsFloat =
    dailyCash.openingMfsBalance + mfsCashOuts - mfsCashIns - flexiloadTotal;

  const handleSaveOpening = (e: React.FormEvent) => {
    e.preventDefault();
    updateDailyCash(parseFloat(openingCashInput) || 0, parseFloat(openingMfsInput) || 0);
    setIsEditingOpening(false);
  };

  const handleCloseDay = (e: React.FormEvent) => {
    e.preventDefault();
    const actCash = parseFloat(actualCashCount) || expectedCashInDrawer;
    const actMfs = parseFloat(actualMfsCount) || expectedMfsFloat;

    closeDailyCash(actCash, actMfs, closeNotes);
    alert('Day successfully reconciled and closed!');
  };

  const cashVariance =
    parseFloat(actualCashCount || '0') ? parseFloat(actualCashCount) - expectedCashInDrawer : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-800/60 rounded-2xl p-5 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold">Daily Cash Flow & MFS Reconciliation</h2>
          </div>
          <p className="text-xs text-emerald-200/80 mt-1">
            Track drawer cash vs bKash/Nagad digital balances and reconcile evening closing counts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bg-slate-950 text-emerald-300 text-xs px-3 py-1.5 rounded-xl border border-emerald-900 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Date: {todayStr}
          </span>
        </div>
      </div>

      {/* Opening Balances Config Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" /> Morning Starting Opening Balances
          </h3>
          {isOwner && !isEditingOpening && (
            <button
              onClick={() => setIsEditingOpening(true)}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Opening Cash
            </button>
          )}
        </div>

        {isEditingOpening ? (
          <form onSubmit={handleSaveOpening} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Morning Opening Cash (৳)</label>
              <input
                type="number"
                value={openingCashInput}
                onChange={(e) => setOpeningCashInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Morning MFS Balance (৳)</label>
              <input
                type="number"
                value={openingMfsInput}
                onChange={(e) => setOpeningMfsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition"
              >
                Save Opening Balances
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Morning Opening Cash</span>
                <span className="text-xl font-extrabold text-white">
                  {formattedCurrency(dailyCash.openingCash)}
                </span>
              </div>
              <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-1 rounded border border-emerald-800">
                Drawer Cash
              </span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Morning MFS Digital Float</span>
                <span className="text-xl font-extrabold text-teal-300">
                  {formattedCurrency(dailyCash.openingMfsBalance)}
                </span>
              </div>
              <span className="bg-teal-950 text-teal-300 text-[10px] font-bold px-2 py-1 rounded border border-teal-800">
                bKash / Nagad
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cash Flow Ledger Formula */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Cash Flow */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-5 h-5" /> Physical Cash Flow Equation
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-slate-950 rounded-lg">
              <span className="text-slate-400">+ Medicine Cash Sales:</span>
              <span className="font-bold text-emerald-400">+{formattedCurrency(medCashSales)}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded-lg">
              <span className="text-slate-400">+ MFS Cash-In (Cash Received):</span>
              <span className="font-bold text-emerald-400">+{formattedCurrency(mfsCashIns)}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded-lg">
              <span className="text-slate-400">+ Customer Dues Recovered:</span>
              <span className="font-bold text-emerald-400">+{formattedCurrency(duesCollected)}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded-lg">
              <span className="text-slate-400">- MFS Cash-Out (Cash Paid Out):</span>
              <span className="font-bold text-rose-400">-{formattedCurrency(mfsCashOuts)}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded-lg">
              <span className="text-slate-400">- Daily Shop Expenses & Wholesaler:</span>
              <span className="font-bold text-rose-400">-{formattedCurrency(totalExpenses)}</span>
            </div>
            {productCashRefunds > 0 && (
              <div className="flex justify-between p-2 bg-slate-950 rounded-lg">
                <span className="text-slate-400">- Product Return Cash Refunds:</span>
                <span className="font-bold text-rose-400">-{formattedCurrency(productCashRefunds)}</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300">EXPECTED DRAWER CASH:</span>
            <span className="text-2xl font-black text-emerald-400">
              {formattedCurrency(expectedCashInDrawer)}
            </span>
          </div>
        </div>

        {/* Digital MFS Float Equation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2 text-teal-300">
            <TrendingUp className="w-5 h-5" /> MFS Digital Wallet Float Equation
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-slate-950 rounded-lg">
              <span className="text-slate-400">Morning Starting MFS Float:</span>
              <span className="font-bold text-slate-200">{formattedCurrency(dailyCash.openingMfsBalance)}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded-lg">
              <span className="text-slate-400">+ MFS Cash-Out (Digital Recv):</span>
              <span className="font-bold text-teal-300">+{formattedCurrency(mfsCashOuts)}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded-lg">
              <span className="text-slate-400">- MFS Cash-In (Digital Sent):</span>
              <span className="font-bold text-rose-400">-{formattedCurrency(mfsCashIns)}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded-lg">
              <span className="text-slate-400">- Flexiload / Topup Sent:</span>
              <span className="font-bold text-rose-400">-{formattedCurrency(flexiloadTotal)}</span>
            </div>
          </div>

          <div className="p-4 bg-teal-950/60 border border-teal-500/40 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-teal-300">EXPECTED MFS FLOAT:</span>
            <span className="text-2xl font-black text-teal-300">
              {formattedCurrency(expectedMfsFloat)}
            </span>
          </div>
        </div>
      </div>

      {/* Evening Closing Reconciliation Form (Owner Only) */}
      {isOwner && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" /> Evening Shop Closing Cash Reconciliation
          </h3>

          <form onSubmit={handleCloseDay} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Actual Cash Counted in Register Drawer (BDT ৳)
                </label>
                <input
                  type="number"
                  value={actualCashCount}
                  onChange={(e) => setActualCashCount(e.target.value)}
                  placeholder={`Expected: ৳${expectedCashInDrawer}`}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-lg font-bold outline-none text-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Actual MFS Apps Float Balance Total (BDT ৳)
                </label>
                <input
                  type="number"
                  value={actualMfsCount}
                  onChange={(e) => setActualMfsCount(e.target.value)}
                  placeholder={`Expected: ৳${expectedMfsFloat}`}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-lg font-bold outline-none text-teal-300"
                />
              </div>
            </div>

            {actualCashCount && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                  cashVariance === 0
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : cashVariance > 0
                    ? 'bg-blue-950 border-blue-500 text-blue-300'
                    : 'bg-rose-950 border-rose-500 text-rose-300'
                }`}
              >
                <span>CASH DRAWER VARIANCE:</span>
                <span className="text-sm">
                  {cashVariance === 0
                    ? '✓ PERFECT MATCH (৳0 Deficit)'
                    : cashVariance > 0
                    ? `+৳${cashVariance} Surplus`
                    : `-৳${Math.abs(cashVariance)} Deficit`}
                </span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Closing Notes / Observations
              </label>
              <input
                type="text"
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                placeholder="e.g. Verified with 4 staff. All cash matches."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-sm py-3.5 rounded-xl transition shadow-lg"
            >
              CLOSE DAY & ARCHIVE DAILY CASH FLOW
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CashFlowView;

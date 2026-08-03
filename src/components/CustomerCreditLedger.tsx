import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerCreditAccount } from '../types';
import {
  BookOpenCheck,
  Search,
  Plus,
  PhoneCall,
  Bell,
  CheckCircle2,
  Clock,
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  MessageSquare,
  Sparkles,
  Calendar,
} from 'lucide-react';

export const CustomerCreditLedger: React.FC = () => {
  const {
    customers,
    addCustomer,
    addCustomerCreditEntry,
    createAlarm,
    formattedCurrency,
    isOwner,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCreditAccount | null>(
    customers[0] || null
  );

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);

  // New Customer Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');

  // Payment Form
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');

  // Alarm Schedule Form
  const [alarmDate, setAlarmDate] = useState(new Date().toISOString().split('T')[0]);
  const [alarmTime, setAlarmTime] = useState('17:00');
  const [alarmNote, setAlarmNote] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    const created = addCustomer(
      newCustName.trim(),
      newCustPhone.trim() || 'N/A',
      newCustAddress.trim(),
      newCustNotes.trim()
    );
    setSelectedCustomer(created);
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustNotes('');
  };

  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;

    addCustomerCreditEntry(selectedCustomer.id, amt, 'collected', payNote);
    setIsPaymentModalOpen(false);
    setPayAmount('');
    setPayNote('');

    // Refresh selected customer
    const updated = customers.find((c) => c.id === selectedCustomer.id);
    if (updated) setSelectedCustomer(updated);
  };

  const handleScheduleAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    createAlarm({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      amountDue: selectedCustomer.totalDue,
      scheduledDate: alarmDate,
      scheduledTime: alarmTime,
      note: alarmNote.trim() || `Call ${selectedCustomer.name} to collect ৳${selectedCustomer.totalDue} due`,
    });

    setIsAlarmModalOpen(false);
    alert(`Due Call Alarm Scheduled for ${selectedCustomer.name} on ${alarmDate} at ${alarmTime}!`);
  };

  const totalShopCredit = customers.reduce((sum, c) => sum + c.totalDue, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-800/60 rounded-2xl p-5 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpenCheck className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold">Customer Credit Ledger (TallyKhata)</h2>
          </div>
          <p className="text-xs text-amber-200/80 mt-1">
            Track customer due accounts, repayment history, and schedule phone call payment alarms.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-amber-500/30 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Total Market Credit
            </span>
            <span className="text-xl font-extrabold text-amber-400">
              {formattedCurrency(totalShopCredit)}
            </span>
          </div>

          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-950/40 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ New Account</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Search & Account List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name or phone..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredCustomers.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">No customer accounts found.</p>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-white">{cust.name}</h4>
                      <p className="text-[11px] text-slate-400">{cust.phone}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-extrabold text-amber-400">
                        {formattedCurrency(cust.totalDue)}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        Updated {cust.lastUpdated}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Customer Details Ledger */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-4">
          {selectedCustomer ? (
            <>
              {/* Account Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-white">{selectedCustomer.name}</h3>
                    <span className="bg-amber-950 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-amber-800 font-semibold">
                      TallyKhata Account
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Phone: <strong className="text-slate-200">{selectedCustomer.phone}</strong>
                    {selectedCustomer.address && ` | Address: ${selectedCustomer.address}`}
                  </p>
                  {selectedCustomer.notes && (
                    <p className="text-xs text-amber-200/80 italic mt-1">
                      "{selectedCustomer.notes}"
                    </p>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs py-2 px-3 rounded-xl flex items-center gap-1 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Collect Payment</span>
                  </button>

                  <button
                    onClick={() => setIsAlarmModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1 shadow-md"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Schedule Alarm Call</span>
                  </button>

                  <a
                    href={`tel:${selectedCustomer.phone.replace(/[^0-9+]/g, '')}`}
                    className="bg-slate-800 hover:bg-slate-700 text-emerald-400 p-2 rounded-xl border border-slate-700"
                    title="Call Phone"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Total Due Callout */}
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">
                    Current Outstanding Due Balance
                  </span>
                  <p className="text-2xl font-black text-amber-400">
                    {formattedCurrency(selectedCustomer.totalDue)}
                  </p>
                </div>

                {selectedCustomer.reminderDate && (
                  <div className="text-right text-xs bg-amber-950/60 p-2 rounded-lg border border-amber-800">
                    <span className="text-amber-300 font-semibold block flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Scheduled Alarm:
                    </span>
                    <span className="text-slate-200">
                      {selectedCustomer.reminderDate} at {selectedCustomer.reminderTime}
                    </span>
                  </div>
                )}
              </div>

              {/* Transaction History Ledger Table */}
              <div>
                <h4 className="font-bold text-sm text-slate-300 mb-2">
                  Ledger History (Credit Given vs Payments Collected)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Note / Medicine</th>
                        <th className="py-2.5 px-3">Staff</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {selectedCustomer.history.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                            No ledger transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        selectedCustomer.history.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-mono text-slate-400">
                              {h.date} {h.time}
                            </td>
                            <td className="py-2.5 px-3">
                              {h.type === 'given' ? (
                                <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                  + Credit Given
                                </span>
                              ) : (
                                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                  - Due Paid
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-200">{h.note || 'N/A'}</td>
                            <td className="py-2.5 px-3 text-slate-400">{h.staffName}</td>
                            <td
                              className={`py-2.5 px-3 text-right font-bold text-sm ${
                                h.type === 'given' ? 'text-amber-400' : 'text-emerald-400'
                              }`}
                            >
                              {formattedCurrency(h.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-500 italic">
              Select a customer account from the left list to view ledger records.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Add New Customer */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-white relative shadow-2xl">
            <button
              onClick={() => setIsAddCustomerOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" /> Create Customer Credit Account
            </h3>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Master Anwer Hossain"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="01712345678"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Address</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Village / Road / Shop No."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Notes</label>
                <input
                  type="text"
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  placeholder="Special instructions or payment terms"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm py-3 rounded-xl transition"
              >
                CREATE ACCOUNT
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Collect Due Payment */}
      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-white relative shadow-2xl">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Collect Payment from{' '}
              {selectedCustomer.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Current Due: <strong className="text-amber-400">{formattedCurrency(selectedCustomer.totalDue)}</strong>
            </p>

            <form onSubmit={handleCollectPayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Repayment Amount (BDT ৳)
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder={`Max ৳${selectedCustomer.totalDue}`}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-lg font-bold outline-none text-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Payment Note
                </label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Cash repayment / bKash payment"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm py-3 rounded-xl transition"
              >
                LOG REPAYMENT & DEDUCT DUE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Schedule Alarm Call */}
      {isAlarmModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-white relative shadow-2xl">
            <button
              onClick={() => setIsAlarmModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" /> Schedule Payment Call Alarm
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Trigger automated chime & popup call alert for <strong>{selectedCustomer.name}</strong>
            </p>

            <form onSubmit={handleScheduleAlarm} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Reminder Date
                  </label>
                  <input
                    type="date"
                    value={alarmDate}
                    onChange={(e) => setAlarmDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    value={alarmTime}
                    onChange={(e) => setAlarmTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Alarm Instruction Note
                </label>
                <input
                  type="text"
                  value={alarmNote}
                  onChange={(e) => setAlarmNote(e.target.value)}
                  placeholder={`Call ${selectedCustomer.name} for ৳${selectedCustomer.totalDue} payment`}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm py-3 rounded-xl transition"
              >
                SET REMINDER ALARM
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCreditLedger;

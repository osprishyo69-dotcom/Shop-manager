import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReminderAlarm } from '../types';
import {
  Bell,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  Clock,
  Plus,
  Volume2,
  AlertCircle,
  X,
  Calendar,
  Sparkles,
  PhoneForwarded,
} from 'lucide-react';

export const DueAlarmManager: React.FC = () => {
  const {
    alarms,
    customers,
    createAlarm,
    markAlarmStatus,
    playAlarmChimeSound,
    formattedCurrency,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'paid'>('today');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [selectedCustId, setSelectedCustId] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [amountDue, setAmountDue] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('17:00');
  const [note, setNote] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAlarms = alarms.filter((a) => {
    if (activeFilter === 'today') return a.scheduledDate === todayStr && a.status !== 'paid';
    if (activeFilter === 'upcoming') return a.scheduledDate > todayStr && a.status !== 'paid';
    if (activeFilter === 'paid') return a.status === 'paid' || a.status === 'dismissed';
    return true;
  });

  const handleSelectCustomer = (custId: string) => {
    setSelectedCustId(custId);
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setCustName(found.name);
      setCustPhone(found.phone);
      setAmountDue(String(found.totalDue));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) {
      alert('Customer Name and Phone are required!');
      return;
    }

    createAlarm({
      customerId: selectedCustId || `cust-temp-${Date.now()}`,
      customerName: custName,
      customerPhone: custPhone,
      amountDue: parseFloat(amountDue) || 0,
      scheduledDate,
      scheduledTime,
      note: note || `Call ${custName} for due clearance`,
    });

    setIsCreateModalOpen(false);
    setCustName('');
    setCustPhone('');
    setAmountDue('');
    setNote('');
  };

  const getSmsScript = (alarm: ReminderAlarm) => {
    return `Assalamu Alaikum ${alarm.customerName}, polite reminder from our Medicine & MFS shop regarding your scheduled due payment of ${formattedCurrency(
      alarm.amountDue
    )}. Please call us or visit the shop today. Thank you!`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 border border-amber-500/50 rounded-2xl p-5 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-amber-300 animate-pulse" />
            <h2 className="text-xl font-extrabold">Due Collection Reminder Alarm System</h2>
          </div>
          <p className="text-xs text-amber-100 mt-1">
            Automated customer call reminder alarms with direct phone dialer, SMS scripts, and audio alert sound.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={playAlarmChimeSound}
            className="bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/40 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            title="Test Sound Alarm"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Test Sound Alarm</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule Due Call</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-slate-900 p-2 rounded-2xl border border-slate-800">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveFilter('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === 'today'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Due Today ({alarms.filter((a) => a.scheduledDate === todayStr && a.status !== 'paid').length})
          </button>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === 'upcoming'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming Calls ({alarms.filter((a) => a.scheduledDate > todayStr && a.status !== 'paid').length})
          </button>
          <button
            onClick={() => setActiveFilter('paid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === 'paid'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cleared / Settled
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Alarms ({alarms.length})
          </button>
        </div>
      </div>

      {/* Alarm Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlarms.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 italic">
            No call alarms match this filter. Click "+ Schedule Due Call" to create one.
          </div>
        ) : (
          filteredAlarms.map((alm) => {
            const isToday = alm.scheduledDate === todayStr;
            const phoneClean = alm.customerPhone.replace(/[^0-9+]/g, '');
            const smsScript = getSmsScript(alm);
            const waLink = `https://wa.me/${phoneClean.startsWith('0') ? '88' + phoneClean : phoneClean}?text=${encodeURIComponent(
              smsScript
            )}`;

            return (
              <div
                key={alm.id}
                className={`bg-slate-900 border rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between space-y-3 ${
                  alm.status === 'triggered'
                    ? 'border-amber-400 ring-2 ring-amber-500/40 bg-gradient-to-b from-slate-900 to-amber-950/40'
                    : alm.status === 'paid'
                    ? 'border-emerald-800/50 opacity-70'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-base text-white">{alm.customerName}</h4>
                        {isToday && (
                          <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            DUE TODAY
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">Phone: {alm.customerPhone}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-amber-400">
                        {formattedCurrency(alm.amountDue)}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Scheduled: {alm.scheduledDate} @ {alm.scheduledTime}
                      </p>
                    </div>
                  </div>

                  {alm.note && (
                    <div className="mt-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
                      "{alm.note}"
                    </div>
                  )}

                  {/* Pre-written SMS Script box */}
                  <div className="mt-2 p-2 bg-slate-950/70 rounded-lg text-[11px] text-amber-200/80 border border-amber-900/40">
                    <strong className="text-amber-400">Suggested Script: </strong>
                    {smsScript}
                  </div>
                </div>

                {/* Call & Status Action Toolbar */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {/* Call Direct */}
                    <a
                      href={`tel:${phoneClean}`}
                      onClick={() => markAlarmStatus(alm.id, 'called')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs py-2 px-3 rounded-xl flex items-center gap-1 shadow"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>

                    {/* WhatsApp Direct */}
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markAlarmStatus(alm.id, 'called')}
                      className="bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs py-2 px-3 rounded-xl flex items-center gap-1 border border-emerald-700"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  <div className="flex items-center space-x-1">
                    {alm.status !== 'paid' && (
                      <button
                        onClick={() => markAlarmStatus(alm.id, 'paid')}
                        className="bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs py-2 px-2.5 rounded-xl border border-slate-700 flex items-center gap-1"
                        title="Mark Paid"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Paid</span>
                      </button>
                    )}

                    <button
                      onClick={() => markAlarmStatus(alm.id, 'dismissed')}
                      className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-xl"
                      title="Dismiss Alarm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE ALARM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-white relative shadow-2xl">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" /> Schedule Due Collection Call Alarm
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Optional Select from existing customers */}
              {customers.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Select Customer Account (Optional)
                  </label>
                  <select
                    value={selectedCustId}
                    onChange={(e) => handleSelectCustomer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                  >
                    <option value="">-- Choose Existing Tally Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({formattedCurrency(c.totalDue)} due)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Motin Mia"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="01712345678"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Amount Due (BDT ৳)
                </label>
                <input
                  type="number"
                  value={amountDue}
                  onChange={(e) => setAmountDue(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Alarm Note
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Reason / special note"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm py-3 rounded-xl transition"
              >
                SAVE DUE CALL ALARM
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DueAlarmManager;

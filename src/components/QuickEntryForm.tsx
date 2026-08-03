import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionCategory, MFSProvider } from '../types';
import {
  Pill,
  Wallet,
  Receipt,
  UserCheck,
  CheckCircle2,
  PlusCircle,
  Smartphone,
  ShieldAlert,
  Clock,
  Send,
  Calendar,
  Sparkles,
  Lock,
  Mic,
  MicOff,
  RotateCcw,
  Volume2,
  AlertCircle,
} from 'lucide-react';

export const QuickEntryForm: React.FC = () => {
  const { addTransaction, currentUser, customers, formattedCurrency, isOwner } = useApp();

  const [category, setCategory] = useState<TransactionCategory>('med_cash_sale');
  const [amount, setAmount] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [mfsProvider, setMfsProvider] = useState<MFSProvider>('bkash');
  const [mfsNumber, setMfsNumber] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [isReturnCredit, setIsReturnCredit] = useState(false);

  const [lastSubmittedTx, setLastSubmittedTx] = useState<any>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'bn-BD' | 'en-US'>('bn-BD');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micStatusMsg, setMicStatusMsg] = useState('');

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const startVoiceDictation = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setMicStatusMsg('Browser does not support native Speech API. Try Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
        setMicStatusMsg(
          speechLang === 'bn-BD'
            ? 'কথা বলুন (বাংলা)... Listening in Bangla...'
            : 'Speak now (English)... Listening...'
        );
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setMicStatusMsg(`Recognized: "${transcript}"`);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
        setMicStatusMsg(`Voice input status: ${event.error || 'Stopped'}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error(err);
      setIsListening(false);
      setMicStatusMsg('Microphone error or permission denied.');
    }
  };

  const stopVoiceDictation = () => {
    setIsListening(false);
    setMicStatusMsg('Voice recording stopped.');
  };

  const sampleDictations = [
    'Napa Extra 2 strip, Seclo 20 mg',
    'Sergel 20 mg 1 box, Ace 500 tablet',
    'Product return Napa Extra damaged 1 box',
    'Flexiload 01712345678 amount 100',
  ];

  const presets = [50, 100, 200, 500, 1000, 2000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid amount!');
      return;
    }

    if ((category === 'med_credit_sale' || (category === 'product_return' && isReturnCredit)) && !customerName.trim()) {
      alert('Customer Name is required for Credit / Baki entries!');
      return;
    }

    const createdTx = addTransaction({
      category,
      amount: numAmount,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      mfsProvider: category.startsWith('mfs') ? mfsProvider : undefined,
      mfsNumber: mfsNumber.trim() || undefined,
      note: category === 'product_return' ? `[Product Return - ${isReturnCredit ? 'Baki Deducted' : 'Cash Refunded'}] ${note.trim()}` : note.trim() || undefined,
      isCredit: category === 'med_credit_sale' || (category === 'product_return' && isReturnCredit),
      dueDate: category === 'med_credit_sale' ? dueDate : undefined,
    });

    setLastSubmittedTx(createdTx);
    setShowSuccessToast(true);

    // Reset fields
    setAmount('');
    setNote('');
    setMfsNumber('');
    if (category !== 'med_credit_sale' && category !== 'product_return') {
      setCustomerName('');
      setCustomerPhone('');
    }

    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  const selectExistingCustomer = (c: any) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner indicating security mode & app brand */}
      <div className="bg-[#161618] border border-white/10 rounded-md p-4 flex items-center justify-between text-[#f2f2f2] shadow-sm">
        <div className="flex items-center space-x-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#00ffa3]"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-[#f2f2f2]">{currentUser.name}</span>
              <span className="bg-[#00ffa3]/10 text-[#00ffa3] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#00ffa3]/30 uppercase">
                TRUST MEDICARE LOG ENTRY
              </span>
            </div>
            <p className="text-xs text-white/50 font-mono">
              {isOwner ? 'OWNER MODE: UNRESTRICTED ACCESS' : 'STAFF MODE: RESTRICTED ENTRY ONLY'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 text-xs font-mono text-white/60 bg-white/5 px-3 py-1.5 rounded border border-white/10">
          <Clock className="w-3.5 h-3.5 text-[#00ffa3]" />
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccessToast && lastSubmittedTx && (
        <div className="bg-emerald-950 border border-emerald-500/50 rounded-2xl p-4 text-emerald-200 flex items-start space-x-3 shadow-xl animate-in fade-in zoom-in duration-200">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-white">Entry Successfully Logged to Trust Medicare!</h4>
            <p className="text-xs text-emerald-300 mt-0.5">
              Category: <strong className="uppercase">{lastSubmittedTx.category.replace(/_/g, ' ')}</strong> | Amount: <strong className="text-white">{formattedCurrency(lastSubmittedTx.amount)}</strong>
            </p>
            <p className="text-[11px] text-emerald-400/80 mt-1">
              Logged by <strong>{currentUser.name}</strong> at {lastSubmittedTx.time}.
            </p>
          </div>
        </div>
      )}

      {/* Main Entry Card */}
      <div className="bg-[#12141d] border border-white/10 rounded-md p-5 md:p-6 text-[#e0e0e6] shadow-xl">
        <h3 className="text-lg font-syne font-bold mb-4 flex items-center justify-between uppercase tracking-wide">
          <span className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#00ffa3]" /> Daily Entry Recorder
          </span>
          <span className="text-xs text-white/50 font-mono">Select Category & Fill Form</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Selector Buttons */}
          <div>
            <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block mb-2">
              1. Select Transaction Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setCategory('med_cash_sale')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                  category === 'med_cash_sale'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Pill className="w-5 h-5 text-emerald-400 mb-1" />
                <span className="font-bold text-xs">Medicine Cash</span>
                <span className="text-[10px] text-slate-400">Direct cash sale</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('med_credit_sale')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                  category === 'med_credit_sale'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200 ring-2 ring-amber-500/30'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Clock className="w-5 h-5 text-amber-400 mb-1" />
                <span className="font-bold text-xs">Medicine Credit (Baki)</span>
                <span className="text-[10px] text-slate-400">TallyKhata due sale</span>
              </button>

              {/* Product Return Button */}
              <button
                type="button"
                onClick={() => setCategory('product_return')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                  category === 'product_return'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/30'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <RotateCcw className="w-5 h-5 text-rose-400 mb-1" />
                <span className="font-bold text-xs">Product Return</span>
                <span className="text-[10px] text-slate-400">Refund or Due Reduction</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('mfs_cash_out')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                  category === 'mfs_cash_out'
                    ? 'bg-teal-950/80 border-teal-500 text-teal-200 ring-2 ring-teal-500/30'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-5 h-5 text-teal-400 mb-1" />
                <span className="font-bold text-xs">MFS Cash-Out</span>
                <span className="text-[10px] text-slate-400">Cust gives MFS, take cash</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('mfs_cash_in')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                  category === 'mfs_cash_in'
                    ? 'bg-blue-950/80 border-blue-500 text-blue-200 ring-2 ring-blue-500/30'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Wallet className="w-5 h-5 text-blue-400 mb-1" />
                <span className="font-bold text-xs">MFS Cash-In</span>
                <span className="text-[10px] text-slate-400">Cust gives cash, send MFS</span>
              </button>
            </div>

            {/* Secondary Category Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setCategory('mfs_flexiload')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  category === 'mfs_flexiload'
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-200'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-semibold text-xs block">Flexiload / Recharge</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('due_repayment')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  category === 'due_repayment'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-semibold text-xs block">Collect Credit Due</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('shop_expense')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  category === 'shop_expense'
                    ? 'bg-rose-950 border-rose-500 text-rose-200'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-semibold text-xs block">Shop Expense (Tea/Rent)</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('supplier_payment')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  category === 'supplier_payment'
                    ? 'bg-purple-950 border-purple-500 text-purple-200'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-semibold text-xs block">Pharma Supplier Payment</span>
              </button>
            </div>
          </div>

          {/* Special Product Return Settlement Details */}
          {category === 'product_return' && (
            <div className="p-4 bg-slate-950 rounded-xl border border-rose-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-rose-400" /> Medicine / Item Return Settlement Mode
                </span>
                <span className="text-[10px] text-slate-400">Choose refund method</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsReturnCredit(false)}
                  className={`p-3 rounded-xl border text-left font-bold text-xs transition ${
                    !isReturnCredit
                      ? 'bg-rose-900/60 border-rose-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  💵 Cash Refund
                  <span className="block text-[10px] font-normal text-slate-300 mt-0.5">
                    Pay cash back to customer from drawer register
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReturnCredit(true)}
                  className={`p-3 rounded-xl border text-left font-bold text-xs transition ${
                    isReturnCredit
                      ? 'bg-amber-900/60 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  📜 Reduce Credit (Baki) Due
                  <span className="block text-[10px] font-normal text-slate-300 mt-0.5">
                    Deduct item amount from customer's outstanding due balance
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Amount Field with Presets */}
          <div>
            <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block mb-1">
              2. Transaction Amount (BDT ৳)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-extrabold text-[#00ffa3]">
                ৳
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (e.g. 500)"
                className="w-full bg-[#0b0c10] border border-white/10 focus:border-[#00ffa3] rounded-md py-3.5 pl-10 pr-4 text-2xl font-bold text-white placeholder-white/30 outline-none font-syne transition"
                required
              />
            </div>

            {/* Quick Amount Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className="bg-white/5 hover:bg-white/10 text-white/80 text-xs font-mono py-1 px-3 rounded border border-white/10 transition"
                >
                  +৳{val}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional MFS Fields */}
          {category.startsWith('mfs') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">MFS Service</label>
                <select
                  value={mfsProvider}
                  onChange={(e) => setMfsProvider(e.target.value as MFSProvider)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none"
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">Rocket</option>
                  <option value="upay">Upay</option>
                  <option value="flexiload">Flexiload / Mobile Topup</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Customer / Agent Phone No.
                </label>
                <input
                  type="text"
                  value={mfsNumber}
                  onChange={(e) => setMfsNumber(e.target.value)}
                  placeholder="01712xxxxxx"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-xs outline-none"
                />
              </div>
            </div>
          )}

          {/* Conditional Credit (Baki) / Customer Fields */}
          {(category === 'med_credit_sale' || category === 'due_repayment' || (category === 'product_return' && isReturnCredit)) && (
            <div className="p-4 bg-slate-950 rounded-xl border border-amber-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <UserCheck className="w-4 h-4" /> Customer Credit Ledger Info
                </span>
                <span className="text-[10px] text-slate-400">Auto-updates Trust Medicare TallyKhata balance</span>
              </div>

              {/* Quick Select Existing Customer */}
              {customers.length > 0 && (
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Select Existing Due Customer:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectExistingCustomer(c)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                          customerName.toLowerCase() === c.name.toLowerCase()
                            ? 'bg-amber-600 text-slate-950 font-bold border-amber-400'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {c.name} ({formattedCurrency(c.totalDue)} due)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Motin Mia (Driver)"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-xs outline-none"
                    required={category === 'med_credit_sale' || (category === 'product_return' && isReturnCredit)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Customer Phone Number
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-xs outline-none"
                  />
                </div>
              </div>

              {category === 'med_credit_sale' && (
                <div>
                  <label className="text-xs font-semibold text-amber-300 block mb-1">
                    Promised Payment Due Date (For Call Reminder Alarm)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Notes / Particulars with Voice-to-Text Input Feature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>3. Medicine List / Particulars / Description</span>
                <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-800 font-bold flex items-center gap-1">
                  <Mic className="w-3 h-3 text-emerald-400" /> Voice-to-Text Enabled
                </span>
              </label>

              {/* Language Switcher */}
              <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setSpeechLang('bn-BD')}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                    speechLang === 'bn-BD'
                      ? 'bg-emerald-600 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇧🇩 বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechLang('en-US')}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                    speechLang === 'en-US'
                      ? 'bg-emerald-600 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇺🇸 English
                </button>
              </div>
            </div>

            {/* Microphone Dictation Control Box */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={isListening ? stopVoiceDictation : startVoiceDictation}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition shadow-lg ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span>Stop Mic</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>🎤 Dictate Voice Note</span>
                      </>
                    )}
                  </button>

                  {isListening && (
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                      <span className="text-xs text-rose-400 font-bold">Recording voice...</span>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Click mic and speak medicine names or sales details
                </span>
              </div>

              {micStatusMsg && (
                <p className="text-[11px] text-emerald-300 italic bg-slate-900 p-2 rounded-lg border border-slate-800">
                  {micStatusMsg}
                </p>
              )}

              {/* Sample Quick Voice Templates for Instant Dictation */}
              <div className="pt-1 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-1">
                  Quick Dictation Samples (Click to auto-insert):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleDictations.map((txt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNote((prev) => (prev ? `${prev}, ${txt}` : txt))}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2 py-1 rounded-md transition text-left"
                    >
                      + {txt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Note Input Field */}
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Napa Extra 2 strip, Seclo 20 mg, Bandage (or use Voice Dictation above)"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3.5 text-xs outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#00ffa3] hover:bg-[#00e08f] active:scale-[0.99] text-[#0c0c0e] font-mono font-extrabold text-sm py-4 rounded-md shadow-lg shadow-[#00ffa3]/20 flex items-center justify-center space-x-2 transition uppercase tracking-wider cursor-pointer"
          >
            <Send className="w-5 h-5 stroke-[2.5]" />
            <span>CONFIRM & LOG ENTRY (TRUST MEDICARE - {currentUser.name.split(' ')[0].toUpperCase()})</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickEntryForm;


import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, ShieldCheck, UserCheck, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface PinLoginModalProps {
  targetUser?: any;
  onClose: () => void;
}

export const PinLoginModal: React.FC<PinLoginModalProps> = ({ targetUser, onClose }) => {
  const { users, currentUser, switchUserById, loginWithPin, formattedCurrency } = useApp();

  const [selectedUser, setSelectedUser] = useState<any>(targetUser || currentUser);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg(null);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const verifyPin = (pinToVerify: string) => {
    const success = switchUserById(selectedUser.id, pinToVerify);
    if (success) {
      onClose();
    } else {
      setErrorMsg('Incorrect PIN code for selected user!');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Role & PIN Authentication</h3>
          <p className="text-xs text-slate-400 mt-1">
            Select profile & enter 4-digit security PIN to switch active mode.
          </p>
        </div>

        {/* User Selection Chips */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Select Account
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {users.map((u) => {
              const isSelected = selectedUser.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u);
                    setPin('');
                    setErrorMsg(null);
                  }}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-600"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{u.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-400">
                      {u.role === 'owner' ? 'Owner (Full)' : 'Staff (Entry Only)'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PIN Display Dots */}
        <div className="mb-6 text-center">
          <div className="flex justify-center space-x-3 mb-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border transition-all ${
                  pin.length > idx
                    ? 'bg-emerald-400 border-emerald-300 scale-110 shadow-lg shadow-emerald-500/50'
                    : 'bg-slate-800 border-slate-700'
                }`}
              />
            ))}
          </div>
          {errorMsg ? (
            <p className="text-xs font-semibold text-rose-400 flex items-center justify-center gap-1 mt-2">
              <AlertTriangle className="w-3.5 h-3.5" /> {errorMsg}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">
              {selectedUser.role === 'owner'
                ? 'Owner Default PIN: 1234'
                : `Staff PIN: 1111 (Staff 1), 2222 (Staff 2)...`}
            </p>
          )}
        </div>

        {/* Numeric Touch Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-12 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl font-bold text-lg text-slate-100 transition border border-slate-700 shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-12 bg-slate-800/80 hover:bg-slate-700 text-rose-300 font-semibold text-xs rounded-xl transition border border-slate-700"
          >
            CLEAR
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-12 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl font-bold text-lg text-slate-100 transition border border-slate-700 shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-12 bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl transition border border-slate-700"
          >
            ⌫ DEL
          </button>
        </div>

        {/* Restricted info callout */}
        <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            {selectedUser.role === 'staff' ? (
              <strong className="text-emerald-300">
                Staff Mode Restriction: Staff cannot edit/delete transactions, see total cash, or view business profit reports.
              </strong>
            ) : (
              <strong className="text-amber-300">
                Owner Mode: Full control over cash flow, credit tally, staff accounts, and payment reminder alarms.
              </strong>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PinLoginModal;

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Pill,
  ShieldCheck,
  UserCheck,
  Bell,
  Sparkles,
  Lock,
  RefreshCw,
  LogOut,
  PhoneCall,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import PinLoginModal from './PinLoginModal';

export const Header: React.FC = () => {
  const {
    currentUser,
    users,
    isOwner,
    alarms,
    activeTab,
    setActiveTab,
    formattedCurrency,
    resetDemoData,
  } = useApp();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [targetUserToSwitch, setTargetUserToSwitch] = useState<any>(null);

  const pendingAlarmsCount = alarms.filter(
    (a) => a.status === 'pending' || a.status === 'triggered'
  ).length;

  const handleUserClick = (user: any) => {
    setTargetUserToSwitch(user);
    setIsPinModalOpen(true);
  };

  return (
    <>
      <header className="bg-[#12141d] text-[#e0e0e6] border-b border-white/10 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Brand & Mode Tag */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-[#00ffa3] text-[#0c0c0e] font-syne font-black text-xl flex items-center justify-center shadow-lg shadow-[#00ffa3]/20">
              M
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-syne font-extrabold text-xl tracking-tight text-[#f2f2f2]">
                  Trust <span className="text-[#00ffa3]">Medicare</span>
                </h1>
                <span className="bg-[#00ffa3]/10 text-[#00ffa3] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#00ffa3]/30 hidden sm:inline-flex items-center gap-1 uppercase">
                  <Smartphone className="w-3 h-3" /> Pharmacy & MFS
                </span>
              </div>
              <p className="text-xs text-[#f2f2f2]/60 flex items-center gap-1">
                Medicine & MFS Cash Flow, Dues & Returns System
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Alarm Button (Owner or Staff can see due alerts) */}
            <button
              onClick={() => setActiveTab('alarms')}
              className={`relative px-3 py-1.5 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition ${
                pendingAlarmsCount > 0
                  ? 'bg-amber-400/10 text-amber-300 border border-amber-400/40 animate-pulse'
                  : 'bg-white/5 text-[#f2f2f2]/80 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">DUE ALERTS</span>
              {pendingAlarmsCount > 0 && (
                <span className="bg-amber-400 text-[#0c0c0e] text-xs font-bold px-1.5 py-0.2 rounded-full">
                  {pendingAlarmsCount}
                </span>
              )}
            </button>

            {/* AI Advisor Button */}
            <button
              onClick={() => setActiveTab('advisor')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                activeTab === 'advisor'
                  ? 'bg-[#00ffa3]/20 text-[#00ffa3] border border-[#00ffa3]'
                  : 'bg-white/5 text-[#00ffa3] hover:bg-white/10 border border-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#00ffa3]" />
              <span className="hidden sm:inline uppercase">AI Advisor</span>
            </button>

            {/* User Profile Switcher */}
            <div className="flex items-center pl-2 border-l border-white/10 space-x-2">
              <div
                onClick={() => handleUserClick(currentUser)}
                className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded cursor-pointer border border-white/10 transition"
                title="Click to switch role or PIN lock"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#00ffa3]/40"
                />
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-[#f2f2f2] leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#00ffa3]">
                    {isOwner ? 'OWNER ACCESS' : 'STAFF ACCESS'}
                  </p>
                </div>
                <Lock className="w-3.5 h-3.5 text-white/40 ml-1" />
              </div>

              {/* Reset Demo Data button */}
              <button
                onClick={() => {
                  if (confirm('Reset application state back to initial sample shop records?')) {
                    resetDemoData();
                  }
                }}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded transition"
                title="Reset Demo Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Pin Login Modal */}
      {isPinModalOpen && (
        <PinLoginModal
          targetUser={targetUserToSwitch}
          onClose={() => setIsPinModalOpen(false)}
        />
      )}
    </>
  );
};

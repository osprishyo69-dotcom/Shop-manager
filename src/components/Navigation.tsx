import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  BookOpenCheck,
  BellRing,
  Wallet,
  Receipt,
  Users,
  Sparkles,
  ClipboardList,
  Lock,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, isOwner, currentUser } = useApp();

  const ownerTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'entry', label: '+ Add Entry', icon: PlusCircle, badge: 'Quick' },
    { id: 'cashflow', label: 'Cash & MFS Float', icon: Wallet },
    { id: 'credit', label: 'Customer Dues', icon: BookOpenCheck },
    { id: 'alarms', label: 'Call Alarms', icon: BellRing },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'staff', label: 'Staff PINs', icon: Users },
    { id: 'advisor', label: 'AI Advisor', icon: Sparkles },
  ];

  const staffTabs = [
    { id: 'entry', label: '+ Quick Entry', icon: PlusCircle, badge: 'Main' },
    { id: 'my_entries', label: 'My Submissions', icon: ClipboardList },
    { id: 'credit', label: 'Customer Dues', icon: BookOpenCheck },
    { id: 'alarms', label: 'Due Reminders', icon: BellRing },
    { id: 'advisor', label: 'AI Advisor', icon: Sparkles },
  ];

  const tabsToDisplay = isOwner ? ownerTabs : staffTabs;

  return (
    <>
      {/* Desktop Navigation Header Bar */}
      <nav className="bg-[#12141d]/90 backdrop-blur-md border-b border-white/10 text-[#e0e0e6]/70 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto py-2.5 scrollbar-none">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#f2f2f2]/40 mr-3 hidden lg:inline">
              [ NAVIGATION ]
            </span>
            {tabsToDisplay.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded text-xs font-semibold font-sans transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/40'
                      : 'hover:bg-white/5 text-[#f2f2f2]/70 hover:text-[#f2f2f2] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00ffa3]' : 'text-[#f2f2f2]/50'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-bold ${
                        isActive
                          ? 'bg-[#00ffa3] text-[#0c0c0e]'
                          : 'bg-white/10 text-[#00ffa3]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {!isOwner && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded font-medium">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>STAFF MODE ({currentUser.name.toUpperCase()}) - RESTRICTED</span>
            </div>
          )}
        </div>
      </nav>

      {/* Android Mobile Touch Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#12141d]/95 backdrop-blur-lg border-t border-white/10 text-[#e0e0e6]/60 md:hidden px-2 py-1.5 shadow-2xl">
        <div className="flex items-center justify-around">
          {tabsToDisplay.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded transition-all ${
                  isActive
                    ? 'text-[#00ffa3] font-bold bg-white/5 scale-105'
                    : 'hover:text-[#f2f2f2]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#00ffa3]' : 'text-[#f2f2f2]/60'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight font-sans">{tab.label.replace('+ ', '')}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

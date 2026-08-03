import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { AlarmBanner } from './components/AlarmBanner';
import { DashboardView } from './components/DashboardView';
import { QuickEntryForm } from './components/QuickEntryForm';
import { StaffMySubmissionsView } from './components/StaffMySubmissionsView';
import { CashFlowView } from './components/CashFlowView';
import { CustomerCreditLedger } from './components/CustomerCreditLedger';
import { DueAlarmManager } from './components/DueAlarmManager';
import { ExpensesView } from './components/ExpensesView';
import { StaffManagementView } from './components/StaffManagementView';
import { AdvisorAIView } from './components/AdvisorAIView';

function AppContent() {
  const { activeTab, isOwner } = useApp();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'entry':
        return <QuickEntryForm />;
      case 'my_entries':
        return <StaffMySubmissionsView />;
      case 'cashflow':
        return <CashFlowView />;
      case 'credit':
        return <CustomerCreditLedger />;
      case 'alarms':
        return <DueAlarmManager />;
      case 'expenses':
        return <ExpensesView />;
      case 'staff':
        return <StaffManagementView />;
      case 'advisor':
        return <AdvisorAIView />;
      default:
        return isOwner ? <DashboardView /> : <QuickEntryForm />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e0e0e6] flex flex-col font-sans grid-bg selection:bg-[#00ffa3] selection:text-[#0b0c10] pb-20 md:pb-8">
      {/* App Top Header Bar */}
      <Header />

      {/* Main Navigation Bar */}
      <Navigation />

      {/* Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {renderTabContent()}
      </main>

      {/* Floating Active Due Call Alarm Banner */}
      <AlarmBanner />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

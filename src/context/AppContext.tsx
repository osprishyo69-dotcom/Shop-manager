import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  TransactionRecord,
  CustomerCreditAccount,
  ReminderAlarm,
  DailyCashRecord,
  AuditLog,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_TRANSACTIONS,
  INITIAL_CUSTOMERS,
  INITIAL_ALARMS,
  INITIAL_DAILY_CASH,
} from '../data/mockData';

interface AppContextType {
  currentUser: UserProfile;
  users: UserProfile[];
  transactions: TransactionRecord[];
  customers: CustomerCreditAccount[];
  alarms: ReminderAlarm[];
  dailyCash: DailyCashRecord;
  auditLogs: AuditLog[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOwner: boolean;
  loginError: string | null;
  activeAlarmToBanner: ReminderAlarm | null;
  dismissBannerAlarm: () => void;
  // Actions
  loginWithPin: (pin: string) => boolean;
  logout: () => void;
  switchUserById: (userId: string, pin: string) => boolean;
  addTransaction: (
    data: Omit<
      TransactionRecord,
      'id' | 'timestamp' | 'date' | 'time' | 'staffId' | 'staffName' | 'status'
    >
  ) => TransactionRecord;
  deleteTransaction: (id: string) => boolean;
  addCustomer: (name: string, phone: string, address?: string, notes?: string) => CustomerCreditAccount;
  addCustomerCreditEntry: (
    customerId: string,
    amount: number,
    type: 'given' | 'collected',
    note?: string
  ) => void;
  createAlarm: (data: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    amountDue: number;
    scheduledDate: string;
    scheduledTime: string;
    note?: string;
  }) => ReminderAlarm;
  markAlarmStatus: (alarmId: string, status: ReminderAlarm['status']) => void;
  updateDailyCash: (openingCash: number, openingMfs: number) => void;
  closeDailyCash: (actualCash: number, actualMfs: number, notes?: string) => void;
  updateStaffPin: (staffId: string, newPin: string) => boolean;
  addNewStaff: (name: string, pin: string, phone?: string) => void;
  toggleStaffActive: (staffId: string) => void;
  playAlarmChimeSound: () => void;
  resetDemoData: () => void;
  getStaffTodayEntries: (staffId: string) => TransactionRecord[];
  formattedCurrency: (num: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'pharma_mfs_tally_v1_store';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_currentUser`);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Default to Owner for initial preview
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [customers, setCustomers] = useState<CustomerCreditAccount[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [alarms, setAlarms] = useState<ReminderAlarm[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_alarms`);
    return saved ? JSON.parse(saved) : INITIAL_ALARMS;
  });

  const [dailyCash, setDailyCash] = useState<DailyCashRecord>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_dailyCash`);
    return saved ? JSON.parse(saved) : INITIAL_DAILY_CASH;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeAlarmToBanner, setActiveAlarmToBanner] = useState<ReminderAlarm | null>(null);

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_alarms`, JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_dailyCash`, JSON.stringify(dailyCash));
  }, [dailyCash]);

  // If user switches to staff, enforce restricted default tab 'entry' or 'my_entries'
  useEffect(() => {
    if (currentUser.role === 'staff' && (activeTab === 'dashboard' || activeTab === 'cashflow' || activeTab === 'staff')) {
      setActiveTab('entry');
    }
  }, [currentUser, activeTab]);

  // Alarm Check Interval (Check every 15 seconds for triggered due reminders)
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      const triggered = alarms.find((a) => {
        if (a.status !== 'pending' && a.status !== 'triggered') return false;
        // Check if date matches or past, and time matches or past
        if (a.scheduledDate < currentDateStr) return true;
        if (a.scheduledDate === currentDateStr && a.scheduledTime <= currentTimeStr) return true;
        return false;
      });

      if (triggered && triggered.status === 'pending') {
        // Mark as triggered and pop banner
        setAlarms((prev) =>
          prev.map((alm) => (alm.id === triggered.id ? { ...alm, status: 'triggered' } : alm))
        );
        setActiveAlarmToBanner(triggered);
        playAlarmChimeSound();
      } else if (triggered && !activeAlarmToBanner) {
        setActiveAlarmToBanner(triggered);
      }
    };

    const interval = setInterval(checkAlarms, 10000);
    checkAlarms();
    return () => clearInterval(interval);
  }, [alarms, activeAlarmToBanner]);

  const isOwner = currentUser.role === 'owner';

  const logAudit = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action,
      user: currentUser.name,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  const playAlarmChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Play a dual-tone urgent reminder melody (Beep-Beep Beep-Beep)
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      playTone(880, 0, 0.2); // A5
      playTone(1046.5, 0.25, 0.2); // C6
      playTone(880, 0.5, 0.2);
      playTone(1318.5, 0.75, 0.4); // E6
    } catch (e) {
      console.log('Audio Context not allowed without interaction', e);
    }
  };

  const loginWithPin = (pin: string): boolean => {
    const found = users.find((u) => u.pin === pin && u.active);
    if (found) {
      setCurrentUser(found);
      setLoginError(null);
      logAudit('LOGIN', `Logged in as ${found.name} (${found.role})`);
      if (found.role === 'staff') {
        setActiveTab('entry');
      } else {
        setActiveTab('dashboard');
      }
      return true;
    } else {
      setLoginError('Invalid PIN code. Please try again.');
      return false;
    }
  };

  const logout = () => {
    // Switch to first staff or prompt PIN modal
    logAudit('LOGOUT', `Logged out user ${currentUser.name}`);
  };

  const switchUserById = (userId: string, pin: string): boolean => {
    const target = users.find((u) => u.id === userId);
    if (!target) return false;
    if (target.pin === pin) {
      setCurrentUser(target);
      setLoginError(null);
      logAudit('SWITCH_USER', `Switched active user to ${target.name}`);
      if (target.role === 'staff') {
        setActiveTab('entry');
      }
      return true;
    }
    return false;
  };

  const addTransaction = (
    data: Omit<
      TransactionRecord,
      'id' | 'timestamp' | 'date' | 'time' | 'staffId' | 'staffName' | 'status'
    >
  ): TransactionRecord => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTx: TransactionRecord = {
      ...data,
      id: `tx-${Date.now()}`,
      timestamp: now.toISOString(),
      date,
      time,
      staffId: currentUser.id,
      staffName: currentUser.name,
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
    logAudit(
      'NEW_TRANSACTION',
      `${data.category.toUpperCase()} of ৳${data.amount} by ${currentUser.name}`
    );

    // If it's a credit sale or due repayment, automatically reflect in Customer Account
    if (data.category === 'med_credit_sale' && data.customerName) {
      let cust = customers.find(
        (c) =>
          c.name.toLowerCase().trim() === data.customerName?.toLowerCase().trim() ||
          (data.customerPhone && c.phone === data.customerPhone)
      );

      if (cust) {
        addCustomerCreditEntry(cust.id, data.amount, 'given', data.note);
      } else {
        // Create new customer
        const newC = addCustomer(
          data.customerName,
          data.customerPhone || 'N/A',
          '',
          'Auto-created from credit entry'
        );
        addCustomerCreditEntry(newC.id, data.amount, 'given', data.note);
      }
    } else if (data.category === 'due_repayment' && data.customerName) {
      let cust = customers.find(
        (c) =>
          c.name.toLowerCase().trim() === data.customerName?.toLowerCase().trim() ||
          (data.customerPhone && c.phone === data.customerPhone)
      );
      if (cust) {
        addCustomerCreditEntry(cust.id, data.amount, 'collected', data.note);
      }
    } else if (data.category === 'product_return' && data.customerName) {
      let cust = customers.find(
        (c) =>
          c.name.toLowerCase().trim() === data.customerName?.toLowerCase().trim() ||
          (data.customerPhone && c.phone === data.customerPhone)
      );
      if (cust && data.isCredit) {
        // Return against credit reduces customer's due
        addCustomerCreditEntry(cust.id, data.amount, 'collected', `[Medicine/Item Return] ${data.note || ''}`);
      }
    }

    return newTx;
  };

  const deleteTransaction = (id: string): boolean => {
    if (!isOwner) {
      alert('Permission Denied: Only shop owner can delete transaction records!');
      return false;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    logAudit('DELETE_TX', `Owner deleted transaction #${id}`);
    return true;
  };

  const addCustomer = (
    name: string,
    phone: string,
    address?: string,
    notes?: string
  ): CustomerCreditAccount => {
    const newCust: CustomerCreditAccount = {
      id: `cust-${Date.now()}`,
      name,
      phone,
      address,
      totalDue: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      notes,
      history: [],
    };
    setCustomers((prev) => [newCust, ...prev]);
    logAudit('ADD_CUSTOMER', `Added credit account for ${name} (${phone})`);
    return newCust;
  };

  const addCustomerCreditEntry = (
    customerId: string,
    amount: number,
    type: 'given' | 'collected',
    note?: string
  ) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newTotal = type === 'given' ? c.totalDue + amount : Math.max(0, c.totalDue - amount);
          const newHistory = [
            {
              id: `h-${Date.now()}`,
              date: dateStr,
              time: timeStr,
              type,
              amount,
              note,
              staffName: currentUser.name,
            },
            ...c.history,
          ];
          return {
            ...c,
            totalDue: newTotal,
            lastUpdated: dateStr,
            history: newHistory,
          };
        }
        return c;
      })
    );
  };

  const createAlarm = (data: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    amountDue: number;
    scheduledDate: string;
    scheduledTime: string;
    note?: string;
  }): ReminderAlarm => {
    const newAlarm: ReminderAlarm = {
      id: `alm-${Date.now()}`,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setAlarms((prev) => [newAlarm, ...prev]);
    logAudit(
      'CREATE_ALARM',
      `Scheduled call reminder for ${data.customerName} on ${data.scheduledDate} ${data.scheduledTime}`
    );

    // Also update customer account reminder info
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === data.customerId
          ? {
              ...c,
              reminderDate: data.scheduledDate,
              reminderTime: data.scheduledTime,
              reminderStatus: 'scheduled',
            }
          : c
      )
    );

    return newAlarm;
  };

  const markAlarmStatus = (alarmId: string, status: ReminderAlarm['status']) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmId ? { ...a, status, triggeredAt: new Date().toISOString() } : a))
    );
    if (activeAlarmToBanner?.id === alarmId) {
      setActiveAlarmToBanner(null);
    }
    logAudit('ALARM_STATUS', `Marked alarm #${alarmId} as ${status}`);
  };

  const dismissBannerAlarm = () => {
    if (activeAlarmToBanner) {
      markAlarmStatus(activeAlarmToBanner.id, 'called');
    }
    setActiveAlarmToBanner(null);
  };

  const updateDailyCash = (openingCash: number, openingMfs: number) => {
    if (!isOwner) return;
    setDailyCash((prev) => ({
      ...prev,
      openingCash,
      openingMfsBalance: openingMfs,
    }));
    logAudit('UPDATE_DAILY_CASH', `Owner set opening cash to ৳${openingCash}, MFS ৳${openingMfs}`);
  };

  const closeDailyCash = (actualCash: number, actualMfs: number, notes?: string) => {
    if (!isOwner) return;
    setDailyCash((prev) => ({
      ...prev,
      actualClosingCash: actualCash,
      actualClosingMfs: actualMfs,
      isClosed: true,
      notes,
    }));
    logAudit('CLOSE_DAY', `Closed day. Cash: ৳${actualCash}, MFS: ৳${actualMfs}`);
  };

  const updateStaffPin = (staffId: string, newPin: string): boolean => {
    if (!isOwner) return false;
    setUsers((prev) => prev.map((u) => (u.id === staffId ? { ...u, pin: newPin } : u)));
    logAudit('UPDATE_PIN', `Owner updated PIN for user #${staffId}`);
    return true;
  };

  const addNewStaff = (name: string, pin: string, phone?: string) => {
    if (!isOwner) return;
    const newStaffUser: UserProfile = {
      id: `u-staff-${Date.now()}`,
      name,
      pin,
      role: 'staff',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      phone: phone || '01700000000',
      active: true,
    };
    setUsers((prev) => [...prev, newStaffUser]);
    logAudit('ADD_STAFF', `Added staff member: ${name}`);
  };

  const toggleStaffActive = (staffId: string) => {
    if (!isOwner) return;
    setUsers((prev) => prev.map((u) => (u.id === staffId ? { ...u, active: !u.active } : u)));
  };

  const resetDemoData = () => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_users`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_currentUser`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_transactions`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_customers`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_alarms`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_dailyCash`);

    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setTransactions(INITIAL_TRANSACTIONS);
    setCustomers(INITIAL_CUSTOMERS);
    setAlarms(INITIAL_ALARMS);
    setDailyCash(INITIAL_DAILY_CASH);
    setActiveTab('dashboard');
  };

  const getStaffTodayEntries = (staffId: string): TransactionRecord[] => {
    const todayStr = new Date().toISOString().split('T')[0];
    return transactions.filter((t) => t.staffId === staffId && t.date === todayStr);
  };

  const formattedCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    })
      .format(num)
      .replace('BDT', '৳');
  };

  const value = useMemo(
    () => ({
      currentUser,
      users,
      transactions,
      customers,
      alarms,
      dailyCash,
      auditLogs,
      activeTab,
      setActiveTab,
      isOwner,
      loginError,
      activeAlarmToBanner,
      dismissBannerAlarm,
      loginWithPin,
      logout,
      switchUserById,
      addTransaction,
      deleteTransaction,
      addCustomer,
      addCustomerCreditEntry,
      createAlarm,
      markAlarmStatus,
      updateDailyCash,
      closeDailyCash,
      updateStaffPin,
      addNewStaff,
      toggleStaffActive,
      playAlarmChimeSound,
      resetDemoData,
      getStaffTodayEntries,
      formattedCurrency,
    }),
    [
      currentUser,
      users,
      transactions,
      customers,
      alarms,
      dailyCash,
      auditLogs,
      activeTab,
      isOwner,
      loginError,
      activeAlarmToBanner,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

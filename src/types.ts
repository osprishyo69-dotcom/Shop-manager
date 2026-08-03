export type Role = 'owner' | 'staff';

export interface UserProfile {
  id: string;
  name: string;
  pin: string;
  role: Role;
  avatar: string;
  phone?: string;
  active: boolean;
}

export type TransactionCategory =
  | 'med_cash_sale'
  | 'med_credit_sale'
  | 'product_return'
  | 'mfs_cash_in'
  | 'mfs_cash_out'
  | 'mfs_flexiload'
  | 'due_repayment'
  | 'shop_expense'
  | 'supplier_payment';

export type MFSProvider = 'bkash' | 'nagad' | 'rocket' | 'upay' | 'flexiload' | 'other';

export interface TransactionRecord {
  id: string;
  timestamp: string; // ISO String
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  staffId: string;
  staffName: string;
  category: TransactionCategory;
  amount: number;
  customerName?: string;
  customerPhone?: string;
  mfsProvider?: MFSProvider;
  mfsNumber?: string;
  note?: string;
  status: 'completed' | 'pending_approval' | 'flagged';
  isCredit: boolean;
  dueDate?: string;
}

export interface CustomerCreditHistory {
  id: string;
  date: string;
  time: string;
  type: 'given' | 'collected';
  amount: number;
  note?: string;
  staffName: string;
}

export interface CustomerCreditAccount {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalDue: number;
  lastUpdated: string;
  notes?: string;
  reminderDate?: string; // YYYY-MM-DD
  reminderTime?: string; // HH:mm
  reminderStatus?: 'none' | 'scheduled' | 'triggered' | 'called' | 'resolved';
  history: CustomerCreditHistory[];
}

export interface ReminderAlarm {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amountDue: number;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  note?: string;
  status: 'pending' | 'triggered' | 'called' | 'paid' | 'dismissed';
  createdAt: string;
  triggeredAt?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface DailyCashRecord {
  date: string;
  openingCash: number;
  openingMfsBalance: number;
  actualClosingCash?: number;
  actualClosingMfs?: number;
  isClosed: boolean;
  notes?: string;
}

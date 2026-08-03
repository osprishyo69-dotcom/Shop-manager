import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  ShieldCheck,
  Key,
  UserPlus,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  EyeOff,
  Clock,
  Edit2,
  X,
  Smartphone,
} from 'lucide-react';

export const StaffManagementView: React.FC = () => {
  const {
    users,
    updateStaffPin,
    addNewStaff,
    toggleStaffActive,
    auditLogs,
    isOwner,
  } = useApp();

  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [newPinInput, setNewPinInput] = useState('');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // New Staff State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  const staffMembers = users.filter((u) => u.role === 'staff');

  const handleUpdatePin = (staffId: string) => {
    if (newPinInput.length !== 4) {
      alert('PIN must be exactly 4 digits!');
      return;
    }
    updateStaffPin(staffId, newPinInput);
    setEditingStaffId(null);
    setNewPinInput('');
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || newStaffPin.length !== 4) {
      alert('Name and 4-digit PIN are required!');
      return;
    }
    addNewStaff(newStaffName.trim(), newStaffPin, newStaffPhone.trim());
    setIsAddStaffOpen(false);
    setNewStaffName('');
    setNewStaffPin('');
    setNewStaffPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold">4 Staff Accounts & Security Policy</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage PIN codes, smartphone access rules, and enforce zero-edit/zero-delete restrictions for staff.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 shadow-lg transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Staff Member</span>
          </button>
        )}
      </div>

      {/* Staff Permission Matrix Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-5 h-5" /> Enforced Restricted Access Policy (Lowest Information Rule)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-900/60 space-y-1.5">
            <span className="font-bold text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> WHAT STAFF ARE ALLOWED TO DO:
            </span>
            <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
              <li>Log new Medicine Cash and Credit (Baki) sales.</li>
              <li>Log MFS Cash-In, Cash-Out & Flexiload recharge.</li>
              <li>Record daily shop expenses (Tea, Paper, Fuel).</li>
              <li>View ONLY their own submitted entries for the current day.</li>
            </ul>
          </div>

          <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-900/60 space-y-1.5">
            <span className="font-bold text-rose-300 flex items-center gap-1">
              <EyeOff className="w-4 h-4 text-rose-400" /> WHAT STAFF ARE STRICTLY FORBIDDEN FROM DOING:
            </span>
            <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
              <li>Edit or Delete ANY entry once submitted.</li>
              <li>View total shop cash in drawer or total daily profit.</li>
              <li>View total market credit dues or other staff's transactions.</li>
              <li>Modify alarm reminders or owner settings.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Staff User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {staffMembers.map((staff) => (
          <div
            key={staff.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-lg flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center space-x-3">
              <img
                src={staff.avatar}
                alt={staff.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-slate-700"
              />
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm text-slate-100 truncate">{staff.name}</h4>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-emerald-400" /> Android Smartphone User
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Security PIN:</span>
                {editingStaffId === staff.id ? (
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      maxLength={4}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="4 Digits"
                      className="w-16 bg-slate-900 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-white outline-none font-mono"
                    />
                    <button
                      onClick={() => handleUpdatePin(staff.id)}
                      className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 font-mono font-bold text-emerald-400">
                    <span>{staff.pin}</span>
                    {isOwner && (
                      <button
                        onClick={() => {
                          setEditingStaffId(staff.id);
                          setNewPinInput(staff.pin);
                        }}
                        className="text-slate-400 hover:text-white"
                        title="Change PIN"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Access Role:</span>
                <span className="text-emerald-300 font-semibold text-[10px] uppercase">
                  Entry Only (Restricted)
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Account Status:</span>
                <button
                  onClick={() => toggleStaffActive(staff.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    staff.active
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {staff.active ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Security Audit Trail Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" /> Security & Activity Audit Trail
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3">
              No audit activities recorded yet in current session.
            </p>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs"
              >
                <div>
                  <span className="font-bold text-emerald-400">{log.action}: </span>
                  <span className="text-slate-200">{log.details}</span>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <span>{log.user}</span> • <span>{log.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-white relative shadow-2xl">
            <button
              onClick={() => setIsAddStaffOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" /> Add New Staff Account
            </h3>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Staff Name *
                </label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Jamil Hossain"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  4-Digit Security PIN *
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={newStaffPin}
                  onChange={(e) => setNewStaffPin(e.target.value)}
                  placeholder="e.g. 5555"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="text"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="01712xxxxxx"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm py-3 rounded-xl transition"
              >
                REGISTER STAFF USER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementView;

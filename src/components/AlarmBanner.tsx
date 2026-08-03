import React from 'react';
import { useApp } from '../context/AppContext';
import { PhoneCall, Bell, CheckCircle2, MessageSquare, X, Clock, AlertCircle } from 'lucide-react';

export const AlarmBanner: React.FC = () => {
  const {
    activeAlarmToBanner,
    dismissBannerAlarm,
    markAlarmStatus,
    formattedCurrency,
    playAlarmChimeSound,
  } = useApp();

  if (!activeAlarmToBanner) return null;

  const phoneClean = activeAlarmToBanner.customerPhone.replace(/[^0-9+]/g, '');
  const whatsappMsg = encodeURIComponent(
    `Assalamu Alaikum ${activeAlarmToBanner.customerName}, polite reminder from our Medicine & MFS shop regarding your outstanding due of ${formattedCurrency(
      activeAlarmToBanner.amountDue
    )}. Please settle when convenient. Thank you!`
  );

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 animate-bounce duration-700">
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 border-2 border-amber-400 rounded-2xl p-4 text-white shadow-2xl shadow-amber-950/80">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center animate-spin">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <span className="bg-amber-900 text-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                ⏰ DUE COLLECTION ALARM
              </span>
              <h4 className="font-extrabold text-lg text-white leading-tight">
                {activeAlarmToBanner.customerName}
              </h4>
            </div>
          </div>
          <button
            onClick={dismissBannerAlarm}
            className="text-amber-200 hover:text-white p-1 rounded-lg hover:bg-amber-800/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3 bg-slate-950/50 rounded-xl p-3 border border-amber-500/30 text-xs space-y-1">
          <div className="flex justify-between items-center text-sm font-bold text-amber-300">
            <span>Outstanding Due:</span>
            <span className="text-emerald-400 text-base">
              {formattedCurrency(activeAlarmToBanner.amountDue)}
            </span>
          </div>
          <p className="text-slate-300">
            <strong>Phone:</strong> {activeAlarmToBanner.customerPhone}
          </p>
          {activeAlarmToBanner.note && (
            <p className="text-slate-300 italic">"{activeAlarmToBanner.note}"</p>
          )}
        </div>

        {/* Call & Action Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={`tel:${phoneClean}`}
            onClick={() => markAlarmStatus(activeAlarmToBanner.id, 'called')}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs shadow-md"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Customer</span>
          </a>

          <a
            href={`https://wa.me/${phoneClean.startsWith('0') ? '88' + phoneClean : phoneClean}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markAlarmStatus(activeAlarmToBanner.id, 'called')}
            className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs shadow-md border border-emerald-600"
          >
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span>WhatsApp</span>
          </a>
        </div>

        <div className="mt-2 flex justify-between items-center text-[11px] pt-2 border-t border-amber-600/50">
          <button
            onClick={() => markAlarmStatus(activeAlarmToBanner.id, 'paid')}
            className="text-emerald-300 hover:underline flex items-center gap-1 font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid & Clear
          </button>
          <button
            onClick={dismissBannerAlarm}
            className="text-amber-200 hover:underline flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5" /> Snooze Alarm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlarmBanner;

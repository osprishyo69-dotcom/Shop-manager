import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Send, Bot, Lightbulb, ShieldCheck, MessageSquare, RefreshCw, Copy, Check } from 'lucide-react';

export const AdvisorAIView: React.FC = () => {
  const { customers, dailyCash, transactions, formattedCurrency } = useApp();

  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const samplePrompts = [
    'How can I prevent cash leakage when 4 staff handle MFS Cash-In & Cash-Out?',
    'Generate a polite Bengali & English payment reminder script for customer Motin Mia who owes ৳2,350.',
    'How should I reconcile physical cash drawer with bKash/Nagad digital float every evening?',
    'What rules should I set for medicine credit (Baki) limits for local customers?',
  ];

  const handleAskAdvisor = async (customText?: string) => {
    const queryText = customText || promptInput;
    if (!queryText.trim()) return;

    setLoading(true);
    setAiResponse(null);

    try {
      const totalDue = customers.reduce((sum, c) => sum + c.totalDue, 0);

      const context = {
        shopType: 'Medicine Shop & Mobile Financial Service (bKash/Nagad/Rocket/Flexiload)',
        staffCount: 4,
        totalOutstandingDue: totalDue,
        customerCount: customers.length,
        dailyOpeningCash: dailyCash.openingCash,
        dailyOpeningMfs: dailyCash.openingMfsBalance,
      };

      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: queryText, context }),
      });

      const data = await res.json();
      if (data.advice) {
        setAiResponse(data.advice);
      } else {
        setAiResponse(data.error || 'Unable to connect to AI Advisor.');
      }
    } catch (err: any) {
      setAiResponse(`Error connecting to AI Advisor service: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 border border-teal-500/40 rounded-2xl p-5 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-pulse text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">AI Business Digitalization Advisor</h2>
            <p className="text-xs text-teal-200/80">
              Personalized guidance on medicine shop cash management, staff trust, MFS float, and due collection.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Quick Advisor Questions
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {samplePrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPromptInput(q);
                handleAskAdvisor(q);
              }}
              className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left rounded-xl text-xs text-slate-300 hover:text-white transition flex items-start gap-2 shadow-sm"
            >
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl space-y-3">
        <div className="relative">
          <textarea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Ask the Business Advisor anything regarding your shop operations, staff rules, or credit due scripts..."
            rows={3}
            className="w-full bg-slate-950 border border-slate-700 focus:border-teal-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => handleAskAdvisor()}
            disabled={loading || !promptInput.trim()}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 text-slate-950 font-extrabold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-lg transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Consulting Gemini AI...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Ask Advisor AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Response Box */}
      {aiResponse && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-2xl space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-sm text-white">Advisor Recommendation</h3>
            </div>
            <button
              onClick={copyToClipboard}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Advice'}</span>
            </button>
          </div>

          <div className="prose prose-invert prose-sm max-w-none text-slate-200 text-xs leading-relaxed whitespace-pre-line">
            {aiResponse}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorAIView;

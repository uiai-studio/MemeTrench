import React, { useState } from 'react';
import { Token, AiMarketingResponse } from '../types';
import { Sparkles, Twitter, Send, Copy, Check, X, RefreshCw, Flame, Rocket } from 'lucide-react';

interface AiMarketingModalProps {
  token: Token;
  onClose: () => void;
}

export const AiMarketingModal: React.FC<AiMarketingModalProps> = ({
  token,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [marketingData, setMarketingData] = useState<AiMarketingResponse | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateContent = async () => {
    setLoading(true);
    try {
      const stage = token.milestones?.m2?.reached
        ? "Raydium CPMM Graduated ($300k+ MC)"
        : token.milestones?.m1?.reached
        ? "Milestone 1 Achieved ($100k+ MC)"
        : "Early Bonding Curve Discovery";

      const res = await fetch('/api/ai/generate-token-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenName: token.name,
          symbol: token.symbol,
          description: token.description,
          marketCapUsd: token.marketCapUsd,
          milestoneStage: stage,
          customPrompt
        })
      });

      const data = await res.json();
      setMarketingData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-purple-800/60 bg-zinc-950 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-purple-500/10 p-2.5 text-purple-400 border border-purple-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                AI Meme Raid & Growth Hub
                <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono text-purple-300">
                  Gemini 3.7 Flash
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Generate viral Twitter threads, Telegram announcements & ASCII meme copypastas for ${token.symbol}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Trigger */}
        <div className="space-y-3 font-mono text-xs">
          <div className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Optional raid theme (e.g. 'Raid pump telegrams with diamond hands proof', 'Focus on 72h insurance')..."
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={generateContent}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 font-bold text-zinc-100 hover:bg-purple-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Rocket className="h-3.5 w-3.5" />
                  Generate Raids
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Container */}
        {marketingData && (
          <div className="space-y-4 font-mono text-xs">
            {/* Twitter Thread */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Twitter className="h-4 w-4" />
                  Viral Twitter / X Thread
                </div>
                <button
                  onClick={() => copyToClipboard(marketingData.tweetThread.join('\n\n---\n\n'), 'twitter')}
                  className="flex items-center gap-1 rounded-lg bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-700"
                >
                  {copiedKey === 'twitter' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedKey === 'twitter' ? 'Copied' : 'Copy Thread'}
                </button>
              </div>

              <div className="space-y-2 text-zinc-300">
                {marketingData.tweetThread.map((tweet, i) => (
                  <div key={i} className="rounded-xl bg-zinc-950 p-2.5 border border-zinc-800/80 leading-relaxed whitespace-pre-line">
                    <span className="text-zinc-500 font-bold mr-1">[{i + 1}/3]</span>
                    {tweet}
                  </div>
                ))}
              </div>
            </div>

            {/* Telegram Community Announcement */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <Send className="h-4 w-4" />
                  Telegram Pinned Announcement
                </div>
                <button
                  onClick={() => copyToClipboard(marketingData.telegramAnnouncement, 'tg')}
                  className="flex items-center gap-1 rounded-lg bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-700"
                >
                  {copiedKey === 'tg' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedKey === 'tg' ? 'Copied' : 'Copy Markdown'}
                </button>
              </div>

              <div className="rounded-xl bg-zinc-950 p-3 border border-zinc-800/80 text-zinc-300 whitespace-pre-line leading-relaxed">
                {marketingData.telegramAnnouncement}
              </div>
            </div>

            {/* ASCII Meme Art */}
            {marketingData.asciiMemeRaid && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    ASCII Meme Raid Copypasta
                  </span>
                  <button
                    onClick={() => copyToClipboard(marketingData.asciiMemeRaid, 'ascii')}
                    className="flex items-center gap-1 rounded-lg bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-700"
                  >
                    {copiedKey === 'ascii' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedKey === 'ascii' ? 'Copied' : 'Copy ASCII'}
                  </button>
                </div>

                <pre className="rounded-xl bg-zinc-950 p-3 border border-zinc-800 text-[11px] text-emerald-400 font-mono overflow-x-auto">
                  {marketingData.asciiMemeRaid}
                </pre>
              </div>
            )}
          </div>
        )}

        {!marketingData && !loading && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500 font-mono text-xs">
            Click "Generate Raids" to construct real-time meme marketing threads powered by Gemini AI.
          </div>
        )}
      </div>
    </div>
  );
};

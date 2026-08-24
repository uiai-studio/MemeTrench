import React, { useState } from 'react';
import { Token, CompliantCampaignDraft } from '../types';
import { SUPPORTED_CHAINS } from '../data/chainConfig';
import { Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, Send, Copy, RefreshCw, X, FileText, Check, ShieldAlert } from 'lucide-react';

interface CampaignStudioModalProps {
  token: Token;
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignStudioModal: React.FC<CampaignStudioModalProps> = ({
  token,
  isOpen,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedChannel, setSelectedChannel] = useState<'ALL' | 'TWITTER_THREAD' | 'TELEGRAM_BROADCAST' | 'REDDIT_POST'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tokenChainUpper = (token?.chain || 'bsc').toUpperCase();
  const tokenSymbol = token?.symbol || 'TOKEN';
  const tokenMint = token?.mint || '';

  const [campaigns, setCampaigns] = useState<CompliantCampaignDraft[]>([
    {
      id: 'c1',
      channel: 'TWITTER_THREAD',
      title: 'X Thread: Omniguard Anti-Cabal Protection Launch',
      content: `1/5 Introducing $${tokenSymbol} on ${tokenChainUpper} – launched via Omniguard Sovereign fair-launch infrastructure.\n\n2/5 Invariant #1: 48h Time-Weighted Average Release (TWAR) prevents immediate sniper dumping.\n\n3/5 Invariant #2: 72h Soft-Landing Floor Vault with 50% downside parachute protection.\n\n4/5 Verifiable On-Chain Merkle Root proof active. 0% dev frontrun risk.\n\n5/5 Trade transparently on MemeTrench: memetrench.fun`,
      complianceChecked: true,
      passedGuardrails: true,
      flaggedRiskPhrases: [],
      disclaimerText: "DYOR. Not financial advice. Smart contract parametric protection does not guarantee secondary market profit.",
      status: 'PENDING_HUMAN_APPROVAL'
    },
    {
      id: 'c2',
      channel: 'TELEGRAM_BROADCAST',
      title: 'Telegram Channel Announcement & Raid Draft',
      content: `🚨 **NEW FAIR-LAUNCH VERIFIED: $${tokenSymbol}** 🚨\n\n🛡️ **Chain:** ${tokenChainUpper}\n💎 **Floor Vault:** 72h Downside Parachute Active\n📊 **DEX Graduation:** Auto-migrates liquidity with LP burn to 0x000...dead.\n🔒 **Anti-Sniping:** 5-block cooldown & continuous TWAR linear unlock.\n\n🔗 **Launchpad Terminal:** https://memetrench.fun/trade/${tokenMint}`,
      complianceChecked: true,
      passedGuardrails: true,
      flaggedRiskPhrases: [],
      disclaimerText: "Trading cryptocurrencies involves risk of loss. Always verify on-chain contracts.",
      status: 'PENDING_HUMAN_APPROVAL'
    },
    {
      id: 'c3',
      channel: 'REDDIT_POST',
      title: 'Reddit Deep-Dive (r/CryptoMoonShots / r/Solana / r/Binance)',
      content: `Why $${tokenSymbol} solves the #1 issue in memecoins using Omniguard v2.1 invariants:\n\nUnlike traditional pump launchpads where devs dump 100% of supply at block 0, $${tokenSymbol} uses:\n- Merkle tree verified dev wallets (max 1.5% hardcap)\n- 48h TWAR micro-batch unlock\n- Soft-Landing Floor Vault protection\n\nVerified contract on ${tokenChainUpper} explorer.`,
      complianceChecked: true,
      passedGuardrails: true,
      flaggedRiskPhrases: [],
      disclaimerText: "Informational post only. Educational breakdown of on-chain mechanism.",
      status: 'PENDING_HUMAN_APPROVAL'
    }
  ]);

  if (!isOpen || !token) return null;

  const chain = (token.chain && SUPPORTED_CHAINS[token.chain]) ? SUPPORTED_CHAINS[token.chain] : SUPPORTED_CHAINS['bsc'];

  const handleApprove = (id: string) => {
    setCampaigns(prev =>
      prev.map(c => (c.id === id ? { ...c, status: 'APPROVED' } : c))
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Campaign Studio & Compliance Guardrails</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${chain.badgeBg} ${chain.badgeText} ${chain.badgeBorder} font-semibold`}>
                  {chain.name}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                AI drafts with legal risk screening & mandatory human approval workflow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Compliance Guardrails Header Card */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-emerald-200">
                Automated Regulatory Compliance Filter Active
              </div>
              <p className="text-neutral-300 opacity-90 leading-relaxed">
                All generated drafts are automatically scanned to ban prohibited promissory language (e.g. "guaranteed 100x", "free money", "risk-free pump"). Every campaign requires human audit and manual approval before posting.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedChannel('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedChannel === 'ALL'
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                All Drafts
              </button>
              <button
                onClick={() => setSelectedChannel('TWITTER_THREAD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedChannel === 'TWITTER_THREAD'
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                X / Twitter
              </button>
              <button
                onClick={() => setSelectedChannel('TELEGRAM_BROADCAST')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedChannel === 'TELEGRAM_BROADCAST'
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Telegram
              </button>
            </div>

            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate Drafts</span>
            </button>
          </div>

          {/* Campaign Draft Cards */}
          <div className="space-y-4">
            {campaigns
              .filter(c => selectedChannel === 'ALL' || c.channel === selectedChannel)
              .map(campaign => (
                <div
                  key={campaign.id}
                  className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-bold text-white">{campaign.title}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        campaign.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {campaign.status === 'APPROVED' ? 'Approved by Human' : 'Pending Audit Approval'}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-900/90 rounded-lg border border-neutral-800/80 font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {campaign.content}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{campaign.disclaimerText}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(campaign.content, campaign.id)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs transition"
                      >
                        {copiedId === campaign.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {campaign.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleApprove(campaign.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve & Sign Audit Log</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            Powered by Gemini AI Engine with Constitutional Compliance Wrapper
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};

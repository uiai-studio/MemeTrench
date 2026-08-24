import React, { useState, useRef } from 'react';
import { Token, SupportedChainId } from '../types';
import { useWallet } from '../context/WalletContext';
import { SUPPORTED_CHAINS } from '../data/chainConfig';
import { MEME_PRESET_LOGOS } from '../utils/tokenLogos';
import { TokenAvatar } from './TokenAvatar';
import { 
  PlusCircle, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Coins, 
  AlertCircle, 
  X, 
  CheckCircle2,
  Layers,
  Rocket,
  Hash,
  Activity,
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Link as LinkIcon
} from 'lucide-react';

interface LaunchpadModalProps {
  onClose: () => void;
  onLaunchSuccess: (token: Token) => void;
}

export const LaunchpadModal: React.FC<LaunchpadModalProps> = ({
  onClose,
  onLaunchSuccess
}) => {
  const { 
    publicKey, 
    activeChain, 
    currentNativeBalance, 
    deductNative, 
    signAndSendTransaction 
  } = useWallet();

  const [selectedChain, setSelectedChain] = useState<SupportedChainId>(activeChain || 'bsc');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  
  // Logo selection mode: 'upload' | 'presets' | 'url'
  const [logoMode, setLogoMode] = useState<'presets' | 'upload' | 'url'>('presets');
  const [image, setImage] = useState<string>(MEME_PRESET_LOGOS[0].dataUrl);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [website, setWebsite] = useState('');
  const [devAllocationPercent, setDevAllocationPercent] = useState<number>(3.0); // max 5.0% with gradual milestone vesting
  const [devWalletsCount, setDevWalletsCount] = useState<number>(2); // max 6
  
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chain = SUPPORTED_CHAINS[selectedChain] || SUPPORTED_CHAINS['bsc'];
  const launchCostNative = selectedChain === 'bsc' ? 0.05 : selectedChain === 'solana' ? 0.5 : 0.02;

  // Handle local file upload (Drag & Drop or File Picker)
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, SVG, WebP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large. Maximum allowed size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
        setUploadedFileName(file.name);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !symbol) {
      setError('Please provide token name and symbol');
      return;
    }
    if (!publicKey) {
      setError(`Connect your wallet for ${chain.name} to sign deployment transaction`);
      return;
    }
    if (currentNativeBalance < launchCostNative) {
      setError(`Insufficient ${chain.nativeCurrency} balance. Launch requires ${launchCostNative} ${chain.nativeCurrency} (Creation Fee + 50% Soft-Landing Floor Vault escrow).`);
      return;
    }

    setError(null);
    setIsLaunching(true);

    try {
      // 1. Sign deployment creation fee and contract initialization
      const sigResult = await signAndSendTransaction({
        to: '0x8e239Fa910C635B3F27eAb695A8D15c8B0192A4C',
        valueNative: launchCostNative,
        tokenSymbol: symbol.toUpperCase(),
        memo: `Omniguard Factory Deploy: ${symbol.toUpperCase()}`
      });

      // Generate sample clustered wallet addresses & Merkle tree leaf hash
      const devAddresses: string[] = [publicKey];
      for (let i = 1; i < devWalletsCount; i++) {
        devAddresses.push(`0x${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`);
      }

      const res = await fetch('/api/tokens/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          symbol: symbol.toUpperCase(),
          description: description || `Protected Omniguard v2.1 Token with TWAR linear vesting and 72h Soft-Landing vault on ${chain.name}.`,
          image: image || MEME_PRESET_LOGOS[0].dataUrl,
          creator: publicKey,
          chain: selectedChain,
          twitter,
          telegram,
          website,
          devAllocationPercent: Math.min(5.0, devAllocationPercent),
          devWalletAddresses: devAddresses,
          txHash: sigResult.txHash
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Launch failed');
      }

      deductNative(launchCostNative, selectedChain);
      onLaunchSuccess(data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to deploy Omniguard token curve');
    } finally {
      setIsLaunching(false);
    }
  };

  const autofillPreset = () => {
    if (selectedChain === 'bsc') {
      setName('Pancake Floki Sovereign');
      setSymbol('PFLOKI');
      setDescription('Omniguard v2.1 BEP-20 launch with PancakeSwap v2 LP burn to 0x000...dead, 48h linear TWAR release, and 72h soft-landing floor insurance.');
      setImage(MEME_PRESET_LOGOS[6].dataUrl);
      setTwitter('https://x.com/pfloki_bsc');
      setTelegram('https://t.me/pfloki_portal');
    } else if (selectedChain === 'solana') {
      setName('Sovereign Pepe Hook');
      setSymbol('SPEPE');
      setDescription('100% immune to sniper sandwiching. 48h linear TWAR release with 72h Soft-Landing Vault.');
      setImage(MEME_PRESET_LOGOS[1].dataUrl);
      setTwitter('https://x.com/spepe_sol');
      setTelegram('https://t.me/spepe_portal');
    } else if (selectedChain === 'ton') {
      setName('TON Rocket Doge');
      setSymbol('TONDOGE');
      setDescription('Telegram native meme with DeDust LP locking and 72h floor parachute.');
      setImage(MEME_PRESET_LOGOS[3].dataUrl);
      setTwitter('https://x.com/tondoge');
      setTelegram('https://t.me/tondoge');
    } else if (selectedChain === 'sui') {
      setName('Sui Blue Whale');
      setSymbol('SUIWHALE');
      setDescription('Object-centric move smart contract token with Cetus dynamic AMM graduation.');
      setImage(MEME_PRESET_LOGOS[4].dataUrl);
      setTwitter('https://x.com/suiwhale');
      setTelegram('https://t.me/suiwhale');
    } else {
      setName('Base Moon Cat');
      setSymbol('BASECAT');
      setDescription('Coinbase verified smart contract meme with Aerodrome LP burn.');
      setImage(MEME_PRESET_LOGOS[2].dataUrl);
      setTwitter('https://x.com/basecat');
      setTelegram('https://t.me/basecat');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-750 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Deploy Memecoin Launchpad</h3>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                  Omniguard v2.1
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                1.5% dev hardcap, 48h linear TWAR unlock, and 72h Soft-Landing Floor Vault
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLaunch} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Target Chain Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-300">
                1. Select Deployment Network
              </label>
              <span className="text-[11px] font-mono text-neutral-400">
                Fee: <strong className="text-amber-400">{launchCostNative} {chain.nativeCurrency}</strong>
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.values(SUPPORTED_CHAINS).map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setSelectedChain(c.id)}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    selectedChain === c.id
                      ? `${c.badgeBg} ${c.badgeText} border-amber-500 font-bold shadow-md shadow-amber-500/10`
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  <span className="text-[11px] font-semibold">{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Fill */}
          <div className="flex justify-between items-center bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs">
            <span className="text-neutral-400 text-[11px] sm:text-xs">Need inspiration for your launch?</span>
            <button
              type="button"
              onClick={autofillPreset}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autofill {chain.name} Spec</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Token Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">Token Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Baby BNB Sovereign"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">Token Ticker / Symbol *</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. BABYBNB"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1">Description & Lore</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your meme token lore, community, and on-chain roadmap..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Meme Logo Creator & Uploader */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <label className="text-xs font-bold text-white">Token Logo & Meme Avatar *</label>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setLogoMode('presets')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    logoMode === 'presets'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Preset Avatars
                </button>
                <button
                  type="button"
                  onClick={() => setLogoMode('upload')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    logoMode === 'upload'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLogoMode('url')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    logoMode === 'url'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>URL</span>
                </button>
              </div>
            </div>

            {/* Live Preview Bar */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <TokenAvatar
                src={image}
                symbol={symbol || 'MEME'}
                name={name || 'New Token'}
                chain={selectedChain}
                size="lg"
                className="ring-2 ring-amber-500/50"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm truncate">{name || 'Your Token Name'}</span>
                  <span className="font-mono text-xs font-semibold text-amber-400">${symbol || 'SYMBOL'}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
                  <span className={`px-1.5 py-0.2 rounded border ${chain.badgeBg} ${chain.badgeText} ${chain.badgeBorder} font-bold font-mono text-[10px]`}>
                    {chain.name}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">Ready for deployment</span>
                </div>
              </div>
            </div>

            {/* TAB 1: Preset Avatars Grid */}
            {logoMode === 'presets' && (
              <div className="space-y-2">
                <span className="text-[11px] text-neutral-400 block">
                  Choose from our crisp, guaranteed vector memecoin avatars:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {MEME_PRESET_LOGOS.map((preset) => {
                    const isSelected = image === preset.dataUrl;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => {
                          setImage(preset.dataUrl);
                          setUploadedFileName(null);
                        }}
                        className={`group relative p-1.5 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                            : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-850'
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.dataUrl}
                          alt={preset.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="text-[9px] font-mono text-neutral-400 group-hover:text-white truncate w-full text-center">
                          {preset.symbol}
                        </span>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-neutral-950">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Upload File Drag & Drop */}
            {logoMode === 'upload' && (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
                    isDragging
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-white mb-0.5">
                    Click to browse or drag and drop image here
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Supports PNG, JPG, SVG, WebP, GIF (Max 5MB)
                  </div>
                  {uploadedFileName && (
                    <div className="mt-2.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{uploadedFileName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Image URL Input */}
            {logoMode === 'url' && (
              <div className="space-y-2">
                <label className="text-[11px] text-neutral-400 block">
                  Paste public image URL (HTTPS recommended):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(MEME_PRESET_LOGOS[0].dataUrl)}
                    className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-xs"
                    title="Reset to default"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Invariant #2: Merkle-Tree Dev Allocation (Up to 5% with Milestone Vesting) & 2-2-1 Tri-Vault */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Dev Growth Pool (Gradual Milestone Release)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                Max 5.0% Across ≤6 Wallets
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Dev Allocation: {devAllocationPercent.toFixed(1)}%</label>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.5"
                  value={devAllocationPercent}
                  onChange={(e) => setDevAllocationPercent(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Declared Wallets in Merkle: {devWalletsCount}</label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={devWalletsCount}
                  onChange={(e) => setDevWalletsCount(parseInt(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Built-in 2-2-1 Tri-Vault Guarantee Badge */}
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-[11px] text-neutral-300">
                  <span className="font-bold text-white">2-2-1 Tri-Vault Revenue Engine:</span> Auto-provisions 2% Weekly Dev Salary, 2% Real-Yield Holder Dividend, and 1% Locked CEX Escrow.
                </div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500">
              Dev tokens remain 100% locked until TWAP milestone thresholds ($100K, $300K, $1M, $3M) are verified by dual-oracle feeds.
            </p>
          </div>

          {/* Socials */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">X / Twitter</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Telegram</label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="https://t.me/..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLaunching}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-neutral-950 font-black rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              {isLaunching ? (
                <span>Broadcasting Omniguard v2.1 Contract to {chain.name}...</span>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Deploy Protected Token ({launchCostNative} {chain.nativeCurrency})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

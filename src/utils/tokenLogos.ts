// Reusable, crisp SVG vector icons for default and fallback memecoins
export const MEME_PRESET_LOGOS: { id: string; name: string; symbol: string; category: string; dataUrl: string }[] = [
  {
    id: 'babybnb',
    name: 'Baby BNB Sovereign',
    symbol: 'BABYBNB',
    category: 'BSC',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bnbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F3BA2F"/>
            <stop offset="100%" stop-color="#CA8A04"/>
          </linearGradient>
          <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FEF08A"/>
            <stop offset="100%" stop-color="#EAB308"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="48" fill="#11141D"/>
        <circle cx="100" cy="100" r="82" fill="url(#bnbGrad)" opacity="0.15"/>
        <circle cx="100" cy="100" r="68" fill="url(#bnbGrad)"/>
        <!-- Crown -->
        <path d="M70 72 L85 92 L100 64 L115 92 L130 72 L124 104 L76 104 Z" fill="url(#glow)" stroke="#78350F" stroke-width="2"/>
        <circle cx="70" cy="70" r="4" fill="#FEF08A"/>
        <circle cx="100" cy="62" r="5" fill="#FEF08A"/>
        <circle cx="130" cy="70" r="4" fill="#FEF08A"/>
        <!-- Face -->
        <circle cx="85" cy="118" r="7" fill="#1E293B"/>
        <circle cx="115" cy="118" r="7" fill="#1E293B"/>
        <circle cx="87" cy="116" r="2.5" fill="#FFFFFF"/>
        <circle cx="117" cy="116" r="2.5" fill="#FFFFFF"/>
        <ellipse cx="100" cy="132" rx="14" ry="7" fill="#1E293B"/>
        <ellipse cx="100" cy="131" rx="10" ry="4" fill="#F43F5E"/>
        <!-- Cheek blush -->
        <circle cx="74" cy="126" r="6" fill="#FB7185" opacity="0.6"/>
        <circle cx="126" cy="126" r="6" fill="#FB7185" opacity="0.6"/>
      </svg>
    `)}`
  },
  {
    id: 'safepepe',
    name: 'SafePepe Token-2022',
    symbol: 'SPEPE',
    category: 'Solana',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#9945FF"/>
            <stop offset="50%" stop-color="#14F195"/>
            <stop offset="100%" stop-color="#00C2FF"/>
          </linearGradient>
          <linearGradient id="pepeSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4ADE80"/>
            <stop offset="100%" stop-color="#16A34A"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="48" fill="#0C1017"/>
        <circle cx="100" cy="100" r="80" fill="url(#solGrad)" opacity="0.2"/>
        <circle cx="100" cy="100" r="70" fill="url(#pepeSkin)"/>
        <!-- Pepe Eyes (Round big cartoon eyes) -->
        <ellipse cx="78" cy="80" rx="22" ry="18" fill="#FFFFFF" stroke="#064E3B" stroke-width="4"/>
        <ellipse cx="122" cy="80" rx="22" ry="18" fill="#FFFFFF" stroke="#064E3B" stroke-width="4"/>
        <circle cx="78" cy="80" r="9" fill="#0F172A"/>
        <circle cx="122" cy="80" r="9" fill="#0F172A"/>
        <circle cx="82" cy="76" r="3" fill="#FFFFFF"/>
        <circle cx="126" cy="76" r="3" fill="#FFFFFF"/>
        <!-- Pepe Lips -->
        <path d="M54 126 C75 148, 125 148, 146 126 C136 120, 118 116, 100 116 C82 116, 64 120, 54 126 Z" fill="#DC2626" stroke="#064E3B" stroke-width="3"/>
        <path d="M60 128 C80 138, 120 138, 140 128" stroke="#7F1D1D" stroke-width="2" fill="none"/>
        <!-- Cyber Visor / Shield badge -->
        <rect x="55" y="152" width="90" height="22" rx="11" fill="url(#solGrad)"/>
        <text x="100" y="167" font-size="11" font-family="monospace" font-weight="bold" fill="#000000" text-anchor="middle">TOKEN-2022</text>
      </svg>
    `)}`
  },
  {
    id: 'omnibased',
    name: 'OmniBased L2',
    symbol: 'OBASED',
    category: 'Base',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="baseBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0052FF"/>
            <stop offset="100%" stop-color="#0035A8"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="48" fill="#080C1A"/>
        <circle cx="100" cy="100" r="74" fill="url(#baseBlue)"/>
        <!-- Cool Cat in Base Blue -->
        <circle cx="100" cy="108" r="48" fill="#F8FAFC"/>
        <!-- Ears -->
        <polygon points="62,72 78,40 92,68" fill="#0052FF"/>
        <polygon points="66,70 78,48 88,68" fill="#93C5FD"/>
        <polygon points="108,68 122,40 138,72" fill="#0052FF"/>
        <polygon points="112,68 122,48 134,70" fill="#93C5FD"/>
        <!-- Sunglasses / Cyber Visor -->
        <rect x="68" y="94" width="28" height="20" rx="6" fill="#0F172A"/>
        <rect x="104" y="94" width="28" height="20" rx="6" fill="#0F172A"/>
        <rect x="94" y="99" width="12" height="6" fill="#0F172A"/>
        <!-- Reflection on sunglasses -->
        <line x1="72" y1="98" x2="88" y2="110" stroke="#38BDF8" stroke-width="2"/>
        <line x1="108" y1="98" x2="124" y2="110" stroke="#38BDF8" stroke-width="2"/>
        <!-- Nose and mouth -->
        <polygon points="100,122 96,128 104,128" fill="#FB7185"/>
        <path d="M96 130 Q100 135 104 130" stroke="#475569" stroke-width="2" fill="none"/>
      </svg>
    `)}`
  },
  {
    id: 'tondog',
    name: 'TON Diamond Dog',
    symbol: 'TONDOG',
    category: 'TON',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="tonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0098EA"/>
            <stop offset="100%" stop-color="#00669E"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="48" fill="#050B14"/>
        <circle cx="100" cy="100" r="74" fill="url(#tonGrad)"/>
        <!-- Diamond Crystal Gem Shape -->
        <polygon points="100,45 145,80 100,155 55,80" fill="#E0F2FE" stroke="#BAE6FD" stroke-width="3"/>
        <polygon points="100,45 100,155 145,80" fill="#7DD3FC" opacity="0.6"/>
        <polygon points="75,80 100,45 125,80" fill="#FFFFFF" opacity="0.8"/>
        <!-- Doge Face superimposed -->
        <circle cx="88" cy="98" r="5" fill="#0369A1"/>
        <circle cx="112" cy="98" r="5" fill="#0369A1"/>
        <polygon points="100,110 96,116 104,116" fill="#0369A1"/>
        <path d="M95 119 Q100 125 105 119" stroke="#0369A1" stroke-width="2" fill="none"/>
      </svg>
    `)}`
  },
  {
    id: 'suishiba',
    name: 'Sui Ocean Shiba',
    symbol: 'SUISHIBA',
    category: 'Sui',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="suiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4DA2FF"/>
            <stop offset="100%" stop-color="#0277FF"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="48" fill="#080F1D"/>
        <circle cx="100" cy="100" r="74" fill="url(#suiGrad)"/>
        <!-- Shiba Inu Doge -->
        <ellipse cx="100" cy="108" rx="48" ry="44" fill="#F59E0B"/>
        <polygon points="62,68 76,42 90,66" fill="#F59E0B"/>
        <polygon points="110,66 124,42 138,68" fill="#F59E0B"/>
        <polygon points="66,66 76,48 86,64" fill="#FEF3C7"/>
        <polygon points="114,64 124,48 134,66" fill="#FEF3C7"/>
        <!-- White Muzzle -->
        <ellipse cx="100" cy="120" rx="26" ry="20" fill="#FEF3C7"/>
        <circle cx="84" cy="98" r="6" fill="#1E293B"/>
        <circle cx="116" cy="98" r="6" fill="#1E293B"/>
        <circle cx="86" cy="96" r="2" fill="#FFFFFF"/>
        <circle cx="118" cy="96" r="2" fill="#FFFFFF"/>
        <!-- Doge Eyebrow Dots -->
        <circle cx="84" cy="86" r="4" fill="#FEF3C7"/>
        <circle cx="116" cy="86" r="4" fill="#FEF3C7"/>
        <!-- Nose and tongue -->
        <polygon points="100,112 94,118 106,118" fill="#0F172A"/>
        <ellipse cx="100" cy="128" rx="6" ry="8" fill="#F43F5E"/>
      </svg>
    `)}`
  },
  {
    id: 'ethpepe',
    name: 'Ethereum Sovereign Pepe',
    symbol: 'ETHPEPE',
    category: 'Ethereum',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="ethGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#627EEA"/>
            <stop offset="100%" stop-color="#3B4982"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="48" fill="#090B14"/>
        <circle cx="100" cy="100" r="74" fill="url(#ethGrad)"/>
        <!-- Ethereum Crystal with Pepe Smile -->
        <polygon points="100,40 140,95 100,120 60,95" fill="#FFFFFF" opacity="0.85"/>
        <polygon points="100,40 100,120 140,95" fill="#E0E7FF" opacity="0.6"/>
        <polygon points="100,128 140,104 100,160 60,104" fill="#FFFFFF" opacity="0.85"/>
        <polygon points="100,128 100,160 140,104" fill="#C7D2FE" opacity="0.6"/>
        <!-- Pepe Eyes inside ETH gem -->
        <circle cx="86" cy="90" r="5" fill="#10B981"/>
        <circle cx="114" cy="90" r="5" fill="#10B981"/>
        <circle cx="86" cy="90" r="2.5" fill="#047857"/>
        <circle cx="114" cy="90" r="2.5" fill="#047857"/>
      </svg>
    `)}`
  },
  {
    id: 'flokisovereign',
    name: 'Viking Floki Sovereign',
    symbol: 'FLOKI',
    category: 'Meme',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="goldViking" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F59E0B"/>
            <stop offset="100%" stop-color="#D97706"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="48" fill="#17120A"/>
        <circle cx="100" cy="100" r="74" fill="url(#goldViking)" opacity="0.2"/>
        <!-- Doge with Viking Helmet -->
        <ellipse cx="100" cy="116" rx="46" ry="40" fill="#FBBF24"/>
        <ellipse cx="100" cy="126" rx="26" ry="18" fill="#FEF3C7"/>
        <!-- Helmet -->
        <path d="M56 94 Q100 60 144 94 L140 102 L60 102 Z" fill="#64748B" stroke="#334155" stroke-width="2"/>
        <polygon points="48,70 60,94 48,94" fill="#E2E8F0"/>
        <polygon points="152,70 140,94 152,94" fill="#E2E8F0"/>
        <!-- Eyes & Nose -->
        <circle cx="84" cy="114" r="6" fill="#1E293B"/>
        <circle cx="116" cy="114" r="6" fill="#1E293B"/>
        <polygon points="100,122 95,128 105,128" fill="#1E293B"/>
      </svg>
    `)}`
  },
  {
    id: 'cyberbull',
    name: 'Omni Cyber Bull',
    symbol: 'BULL',
    category: 'Meme',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10B981"/>
            <stop offset="100%" stop-color="#047857"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="48" fill="#06130E"/>
        <circle cx="100" cy="100" r="74" fill="url(#cyberGrad)" opacity="0.2"/>
        <!-- Bull Horns -->
        <path d="M50 75 Q40 40 70 55 Q78 72 82 82 Z" fill="#F3BA2F"/>
        <path d="M150 75 Q160 40 130 55 Q122 72 118 82 Z" fill="#F3BA2F"/>
        <!-- Bull Head -->
        <polygon points="76,80 124,80 134,130 100,155 66,130" fill="#10B981"/>
        <!-- Cyber Eyes -->
        <rect x="80" y="98" width="16" height="6" rx="3" fill="#FEF08A"/>
        <rect x="104" y="98" width="16" height="6" rx="3" fill="#FEF08A"/>
        <!-- Bull Nose Ring -->
        <circle cx="100" cy="144" r="12" fill="none" stroke="#F3BA2F" stroke-width="4"/>
      </svg>
    `)}`
  }
];

// Helper to get fallback logo for any symbol or chain
export function getFallbackMemeLogo(symbol?: string, chain?: string): string {
  const sym = (symbol || '').toUpperCase();
  const found = MEME_PRESET_LOGOS.find(p => p.symbol === sym || sym.includes(p.symbol));
  if (found) return found.dataUrl;

  // Chain-based fallback
  if (chain === 'bsc') return MEME_PRESET_LOGOS[0].dataUrl;
  if (chain === 'solana') return MEME_PRESET_LOGOS[1].dataUrl;
  if (chain === 'base') return MEME_PRESET_LOGOS[2].dataUrl;
  if (chain === 'ton') return MEME_PRESET_LOGOS[3].dataUrl;
  if (chain === 'sui') return MEME_PRESET_LOGOS[4].dataUrl;
  if (chain === 'ethereum') return MEME_PRESET_LOGOS[5].dataUrl;

  return MEME_PRESET_LOGOS[0].dataUrl;
}

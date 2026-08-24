import React from 'react';
import { DevBadge, DevBadgeType } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Zap, 
  Award, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface DevBadgeDisplayProps {
  badges?: DevBadge[];
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onOpenBadgeModal?: (badge?: DevBadge) => void;
  className?: string;
}

export const DevBadgeDisplay: React.FC<DevBadgeDisplayProps> = ({
  badges = [],
  size = 'sm',
  showDetails = false,
  onOpenBadgeModal,
  className = ''
}) => {
  if (!badges || badges.length === 0) return null;

  const getBadgeIcon = (type: DevBadgeType, iconName?: string) => {
    const iconClass = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4';
    
    switch (type) {
      case 'doxxed':
      case 'kyc_verified':
        return <ShieldCheck className={`${iconClass} text-amber-400`} />;
      case 'staker_5pct':
        return <Lock className={`${iconClass} text-emerald-400`} />;
      case 'serial_builder':
        return <Zap className={`${iconClass} text-cyan-400`} />;
      case 'graduated':
        return <Award className={`${iconClass} text-yellow-400`} />;
      case 'multisig_safe':
        return <Layers className={`${iconClass} text-purple-400`} />;
      default:
        return <Sparkles className={`${iconClass} text-amber-400`} />;
    }
  };

  const getBadgeColors = (type: DevBadgeType) => {
    switch (type) {
      case 'doxxed':
      case 'kyc_verified':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20';
      case 'staker_5pct':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20';
      case 'serial_builder':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20';
      case 'graduated':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/20';
      case 'multisig_safe':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700';
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {badges.map((badge, idx) => (
        <button
          key={`${badge.type}-${idx}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenBadgeModal) onOpenBadgeModal(badge);
          }}
          title={`${badge.label}: ${badge.description}`}
          className={`group relative inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium transition-all ${
            size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs px-2.5 py-1' : 'text-xs px-3 py-1.5'
          } ${getBadgeColors(badge.type)} shadow-sm cursor-pointer`}
        >
          {getBadgeIcon(badge.type, badge.iconName)}
          <span className="font-semibold tracking-tight">
            {showDetails ? badge.label : badge.shortLabel}
          </span>
          <CheckCircle2 className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5 shrink-0" />
        </button>
      ))}
    </div>
  );
};

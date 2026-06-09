import React from 'react';
import { Professional } from '../types';
import { getTrustCopy, getVerificationCopy } from '../lib/trust';

interface TrustSignalProps {
  professional: Professional;
  compact?: boolean;
}

const toneClasses = {
  green: 'border-green-500/35 bg-green-500/10 text-green-300',
  yellow: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
  red: 'border-red-500/40 bg-red-500/10 text-red-300'
};

const dotClasses = {
  green: 'bg-green-400',
  yellow: 'bg-yellow-400',
  red: 'bg-red-400'
};

const TrustSignal: React.FC<TrustSignalProps> = ({ professional, compact = false }) => {
  const trust = getTrustCopy(professional.trustStatus);
  const verification = getVerificationCopy(professional.verificationLevel);

  return (
    <div className={`rounded-xl border ${toneClasses[trust.tone]} ${compact ? 'px-3 py-2' : 'p-4'}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dotClasses[trust.tone]}`}></span>
        <span className="text-xs font-black uppercase tracking-wide">{trust.label}</span>
      </div>
      {!compact && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-300 leading-relaxed">{trust.detail}</p>
          <p className="text-[11px] text-gray-400">{verification}</p>
        </div>
      )}
    </div>
  );
};

export default TrustSignal;

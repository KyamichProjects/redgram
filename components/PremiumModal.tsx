
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, Zap, Upload, Check, X } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  lang: Language;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onSubscribe, lang }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const t = translations[lang];

  if (!isOpen) return null;

  const handleBuy = () => {
    setIsSubscribed(true);
    setTimeout(() => {
        onSubscribe();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300 font-sans">
      <div className="bg-[#1c1c1e] text-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-ios-slide-up relative border border-white/10">
        
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
        >
            <X size={20} />
        </button>

        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 h-40 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
             <div className="relative z-10 flex flex-col items-center animate-in zoom-in duration-500">
                <Star size={64} fill="white" className="drop-shadow-lg mb-2" />
                <h1 className="text-2xl font-black tracking-wide uppercase drop-shadow-md">RedGram Premium</h1>
             </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
           <p className="text-center text-gray-300 text-sm font-medium">{t.premiumDesc}</p>
           
           <div className="space-y-4">
               <FeatureRow icon={<Star size={20} className="text-purple-400" />} title={t.featureStar} desc={t.featureStarDesc} />
               <FeatureRow icon={<Zap size={20} className="text-yellow-400" />} title={t.featureSpeed} desc={t.featureSpeedDesc} />
               <FeatureRow icon={<Upload size={20} className="text-blue-400" />} title={t.featureUpload} desc={t.featureUploadDesc} />
           </div>

           <button 
             onClick={handleBuy}
             disabled={isSubscribed}
             className={`
                w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all mt-4 relative overflow-hidden
                ${isSubscribed ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-purple-500/40 active:scale-95 text-white'}
             `}
           >
             {isSubscribed ? (
                 <>
                    <Check size={24} /> {t.premiumActivated}
                 </>
             ) : (
                 t.premiumButton
             )}
             {!isSubscribed && <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>}
           </button>
        </div>

      </div>
    </div>
  );
};

const FeatureRow: React.FC<{icon: React.ReactNode, title: string, desc: string}> = ({icon, title, desc}) => (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            {icon}
        </div>
        <div>
            <div className="font-bold text-white text-[15px]">{title}</div>
            <div className="text-xs text-gray-400">{desc}</div>
        </div>
    </div>
)

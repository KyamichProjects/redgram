
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, Check, AlertCircle, Sparkles } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { Theme } from '../utils/themes';

interface RegistrationScreenProps {
  onComplete: (name: string, username: string, phone: string) => void;
  takenUsernames: string[];
  lang: Language;
  theme: Theme;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onComplete, takenUsernames, lang, theme }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('+1');
  const [error, setError] = useState('');
  const t = translations[lang];

  const handleNextStep = () => {
    if (step === 1) {
      if (name.trim().length > 0) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateUsername(username)) {
        setStep(3);
      }
    } else if (step === 3) {
      if (phone.trim().length > 4) {
        onComplete(name, username, phone);
      }
    }
  };

  const validateUsername = (u: string) => {
    const clean = u.toLowerCase();
    if (clean.length < 3) {
        setError(t.usernameInvalid);
        return false;
    }
    // Regex: English letters, numbers, underscores only
    const regex = /^[a-z0-9_]+$/;
    if (!regex.test(clean)) {
        setError(t.usernameInvalid);
        return false;
    }
    if (takenUsernames.includes(clean)) {
        setError(t.usernameTaken);
        return false;
    }
    setError('');
    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/\s/g, '');
    setUsername(val);
    
    // Live validation
    if (val.length > 0) {
        if (takenUsernames.includes(val)) {
            setError(t.usernameTaken);
        } else if (!/^[a-z0-9_]+$/.test(val)) {
            setError(t.usernameInvalid);
        } else {
            setError('');
        }
    } else {
        setError('');
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f2f2f7] p-6 font-sans overflow-hidden`}>
      
      {/* Background Ambience */}
      <div className={`absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-red-400/20 to-orange-400/20 blur-3xl`} />
      <div className={`absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-400/20 blur-3xl`} />

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-[32px] p-8 border border-white/50 animate-in zoom-in-95 duration-500">
        
        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mb-8">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'w-8 bg-red-500' : 'w-2 bg-gray-200'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'w-8 bg-red-500' : 'w-2 bg-gray-200'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 3 ? 'w-8 bg-red-500' : 'w-2 bg-gray-200'}`} />
        </div>

        <div className="flex flex-col items-center text-center min-h-[300px] justify-between">
            
            {/* Step 1: Name */}
            {step === 1 && (
                <div className="w-full animate-in slide-in-from-right fade-in duration-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg mb-6 mx-auto">
                        <Sparkles size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.enterName}</h1>
                    <p className="text-gray-500 mb-8 text-sm px-4">{t.enterNameDesc}</p>
                    
                    <div className="relative group">
                        <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.yourName}
                            className="w-full bg-gray-100 border-2 border-transparent focus:bg-white focus:border-red-500 rounded-xl px-4 py-4 text-lg font-medium outline-none transition-all text-center text-gray-900"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleNextStep()}
                        />
                    </div>
                </div>
            )}

            {/* Step 2: Username */}
            {step === 2 && (
                <div className="w-full animate-in slide-in-from-right fade-in duration-300">
                     <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg mb-6 mx-auto">
                        <span className="text-3xl font-bold text-white">@</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.chooseUsername}</h1>
                    <p className="text-gray-500 mb-8 text-sm px-4">{t.chooseUsernameDesc}</p>

                    <div className="relative mb-2">
                        <span className="absolute left-4 top-4 text-gray-400 text-lg font-bold">@</span>
                        <input 
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder={t.yourUsername}
                            className={`w-full bg-gray-100 border-2 ${error ? 'border-red-400 bg-red-50' : (username.length > 2 ? 'border-green-400 bg-green-50' : 'border-transparent')} focus:bg-white rounded-xl pl-10 pr-4 py-4 text-lg font-bold outline-none transition-all text-gray-900`}
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && !error && username.length > 2 && handleNextStep()}
                        />
                    </div>
                    
                    {error ? (
                        <div className="text-red-500 text-xs font-bold flex items-center justify-center gap-1 animate-in fade-in">
                            <AlertCircle size={12} /> {error}
                        </div>
                    ) : (
                        username.length > 2 && (
                            <div className="text-green-600 text-xs font-bold flex items-center justify-center gap-1 animate-in fade-in">
                                <Check size={12} /> {t.usernameAvailable}
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Step 3: Phone */}
            {step === 3 && (
                <div className="w-full animate-in slide-in-from-right fade-in duration-300">
                     <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg mb-6 mx-auto">
                        <span className="text-3xl font-bold text-white">#</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.enterPhone}</h1>
                    <p className="text-gray-500 mb-8 text-sm px-4">{t.enterPhoneDesc}</p>

                    <input 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t.yourPhone}
                        className="w-full bg-gray-100 border-2 border-transparent focus:bg-white focus:border-green-500 rounded-xl px-4 py-4 text-lg font-medium outline-none transition-all text-center tracking-wider text-gray-900"
                        autoFocus
                        onKeyDown={e => e.key === 'Enter' && phone.length > 4 && handleNextStep()}
                    />
                </div>
            )}

            {/* Action Button */}
            <div className="w-full mt-8">
                <button 
                    onClick={handleNextStep}
                    disabled={
                        (step === 1 && name.length === 0) ||
                        (step === 2 && (!!error || username.length < 3)) ||
                        (step === 3 && phone.length < 5)
                    }
                    className={`
                        w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                        ${(step === 1 && name.length === 0) || (step === 2 && error) ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-red-500/30 active:scale-95'}
                    `}
                >
                    {step === 3 ? t.startMessaging : t.next}
                    {step !== 3 && <ArrowRight size={20} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

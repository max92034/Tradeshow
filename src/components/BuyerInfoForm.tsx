import { useState, useRef } from 'react';
import { User, ChevronDown, ChevronUp, Building2, Mail, Phone, Globe, FileText, Mic, Link } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { countries } from '../data/countries';
import { useDeepgramVoiceSearch } from '../hooks/useDeepgramVoiceSearch';
import { cn } from '../lib/utils';

export function BuyerInfoForm() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [nationalityOpen, setNationalityOpen] = useState(false);
  const [nationalityQuery, setNationalityQuery] = useState('');
  const buyer = useOrderStore(state => state.currentOrder.buyer);
  const setBuyer = useOrderStore(state => state.setBuyer);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isListening: isNoteListening, startListening: startNoteVoice, isSupported: voiceSupported } = useDeepgramVoiceSearch({
    onResult: (text) => {
      const current = buyer?.notes || '';
      setBuyer({ notes: current ? current + ' ' + text : text });
    },
  });

  const filteredCountries = nationalityQuery
    ? countries.filter(c => 
        c.name.toLowerCase().includes(nationalityQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(nationalityQuery.toLowerCase())
      )
    : countries;

  const selectedCountry = countries.find(c => c.code === buyer?.nationality);

  const handleSelectCountry = (code: string) => {
    setBuyer({ nationality: code });
    setNationalityOpen(false);
    setNationalityQuery('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-100 rounded-lg">
            <User size={18} className="text-cyan-700" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-800 text-sm flex items-center gap-1">
              Buyer Information
              <span className="text-red-500 text-xs">*required</span>
            </p>
            {buyer?.name && (
              <p className="text-xs text-slate-500 truncate max-w-[200px] flex items-center gap-1.5">
                {selectedCountry && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[10px] font-bold">
                    {selectedCountry.code}
                  </span>
                )}
                {buyer.company || buyer.name}
              </p>
            )}
          </div>
        </div>
        {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      
      <div className={cn(
        "grid transition-all duration-300",
        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="p-3 pt-0 space-y-2.5">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buyer Name *"
                value={buyer?.name || ''}
                onChange={(e) => setBuyer({ name: e.target.value })}
                className={cn(
                  "w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all",
                  buyer?.name
                    ? "border-slate-300 focus:ring-cyan-500 focus:border-transparent"
                    : "border-red-300 focus:ring-red-500 focus:border-transparent bg-red-50/50"
                )}
              />
            </div>
            
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Company *"
                value={buyer?.company || ''}
                onChange={(e) => setBuyer({ company: e.target.value })}
                className={cn(
                  "w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all",
                  buyer?.company
                    ? "border-slate-300 focus:ring-cyan-500 focus:border-transparent"
                    : "border-red-300 focus:ring-red-500 focus:border-transparent bg-red-50/50"
                )}
              />
            </div>
            
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="Email *"
                value={buyer?.email || ''}
                onChange={(e) => setBuyer({ email: e.target.value })}
                className={cn(
                  "w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all",
                  buyer?.email
                    ? "border-slate-300 focus:ring-cyan-500 focus:border-transparent"
                    : "border-red-300 focus:ring-red-500 focus:border-transparent bg-red-50/50"
                )}
              />
            </div>
            
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                placeholder="Phone"
                value={buyer?.phone || ''}
                onChange={(e) => setBuyer({ phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                placeholder="Website"
                value={buyer?.website || ''}
                onChange={(e) => setBuyer({ website: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <button
                type="button"
                onClick={() => setNationalityOpen(!nationalityOpen)}
                className={cn(
                  "w-full pl-9 pr-3 py-2 text-sm border rounded-lg text-left focus:outline-none focus:ring-2 transition-all flex items-center justify-between",
                  buyer?.nationality
                    ? "border-slate-300 focus:ring-cyan-500 focus:border-transparent bg-white"
                    : "border-red-300 focus:ring-red-500 focus:border-transparent bg-red-50/50"
                )}
              >
              <span className={cn("flex items-center gap-2", buyer?.nationality ? "text-slate-800" : "text-slate-400")}>
                {selectedCountry ? (
                  <>
                    <span className="inline-flex items-center justify-center px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-xs font-bold">
                      {selectedCountry.code}
                    </span>
                    <span>{selectedCountry.name}</span>
                  </>
                ) : (
                  'Nationality *'
                )}
              </span>
                <ChevronDown size={16} className={cn("text-slate-400 transition-transform", nationalityOpen && "rotate-180")} />
              </button>
              
              {nationalityOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-60 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-slate-100">
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={nationalityQuery}
                      onChange={(e) => setNationalityQuery(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {filteredCountries.length === 0 ? (
                      <div className="p-3 text-sm text-slate-500 text-center">No countries found</div>
                    ) : (
                      filteredCountries.map(country => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleSelectCountry(country.code)}
                          className={cn(
                            "w-full px-3 py-2 text-sm text-left hover:bg-cyan-50 flex items-center gap-2",
                            buyer?.nationality === country.code && "bg-cyan-50 text-cyan-700"
                          )}
                        >
                          <span className="inline-flex items-center justify-center w-10 px-1 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold flex-shrink-0">
                            {country.code}
                          </span>
                          <span className="truncate">{country.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div className="flex items-start gap-2">
                <div className="pt-2 pl-1">
                  <FileText size={16} className="text-slate-400" />
                </div>
                <div className="flex-1 relative">
                  <textarea
                    placeholder="Notes"
                    value={buyer?.notes || ''}
                    onChange={(e) => setBuyer({ notes: e.target.value })}
                    rows={3}
                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                  {voiceSupported && (
                    <button
                      onClick={startNoteVoice}
                      className={cn(
                        "absolute right-2 bottom-2 p-1.5 rounded-lg transition-all",
                        isNoteListening
                          ? "bg-red-500 text-white animate-pulse"
                          : "text-slate-400 hover:text-cyan-600 hover:bg-cyan-50"
                      )}
                      title="Voice note"
                    >
                      <Mic size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 pt-1">
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

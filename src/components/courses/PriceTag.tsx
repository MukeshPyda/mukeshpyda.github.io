'use client';
import { useState } from 'react';
import { Globe, RefreshCw } from 'lucide-react';
import { RATES_ATTRIBUTION, detectCurrency, formatMoney, getUsdRates, isFixedRate, roundNice } from '@/lib/currency';

/** USD price with an optional "≈ local currency" conversion. */
export default function PriceTag({ priceUsd, large = false }: { priceUsd: number; large?: boolean }) {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [status, setStatus] = useState<'idle' | 'loading' | 'failed'>('idle');

  if (priceUsd <= 0) {
    return <span className={`font-black text-green-400 ${large ? 'text-3xl md:text-5xl' : 'text-xl'}`}>Free</span>;
  }

  const showLocal = async () => {
    setStatus('loading');
    const loaded = await getUsdRates();
    if (!loaded) {
      setStatus('failed');
      return;
    }
    const guess = detectCurrency();
    setRates(loaded);
    setCurrency(loaded[guess] ? guess : 'USD');
    setStatus('idle');
  };

  const converted = rates && currency !== 'USD' && rates[currency] ? roundNice(priceUsd * rates[currency]) : null;
  const fixed = isFixedRate(currency);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={`font-black text-white ${large ? 'text-3xl md:text-5xl' : 'text-xl'}`}>{formatMoney(priceUsd, 'USD')}</span>
        <span className="text-green-500/60 text-xs uppercase tracking-widest">USD</span>
        {converted !== null && (
          <span className={`text-green-300 ${large ? 'text-lg md:text-2xl' : 'text-sm'}`}>
            {fixed ? '' : '≈ '}{formatMoney(converted, currency)}
            {!fixed && <span className="text-green-500/50 text-xs"> (approx.)</span>}
          </span>
        )}
      </div>

      {!rates ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            showLocal();
          }}
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-green-500 hover:text-green-300 border border-green-500/20 hover:border-green-500/60 rounded px-3 py-1.5 transition-colors"
        >
          {status === 'loading' ? <RefreshCw size={12} className="animate-spin" /> : <Globe size={12} />}
          {status === 'failed' ? 'Rates unavailable, try again' : 'Show in my currency'}
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-3 text-xs text-green-500/70" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <label className="flex items-center gap-2">
            <Globe size={12} />
            <select
              aria-label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-black border border-green-500/30 rounded px-2 py-1 text-green-300"
            >
              {Object.keys(rates).sort().map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <a href={RATES_ATTRIBUTION.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300">
            {RATES_ATTRIBUTION.label}
          </a>
        </div>
      )}
    </div>
  );
}

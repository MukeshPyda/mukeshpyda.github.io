// Approximate local-currency prices. Rates come from ExchangeRate-API's open
// endpoint (no key, updated daily; attribution required) and are cached for 24h.

const RATES_URL = 'https://open.er-api.com/v6/latest/USD';
const CACHE_KEY = 'fx_usd_v1';
const CACHE_MS = 24 * 60 * 60 * 1000;

const EURO = ['AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK'];

const REGION_CURRENCY: Record<string, string> = {
  ...Object.fromEntries(EURO.map((r) => [r, 'EUR'])),
  AE: 'AED', AR: 'ARS', AU: 'AUD', BD: 'BDT', BH: 'BHD', BR: 'BRL', CA: 'CAD', CH: 'CHF', CL: 'CLP', CN: 'CNY',
  CO: 'COP', CZ: 'CZK', DK: 'DKK', EG: 'EGP', GB: 'GBP', HK: 'HKD', HU: 'HUF', ID: 'IDR', IL: 'ILS', IN: 'INR',
  JP: 'JPY', KE: 'KES', KR: 'KRW', KW: 'KWD', LK: 'LKR', MA: 'MAD', MX: 'MXN', MY: 'MYR', NG: 'NGN', NO: 'NOK',
  NP: 'NPR', NZ: 'NZD', OM: 'OMR', PE: 'PEN', PH: 'PHP', PK: 'PKR', PL: 'PLN', QA: 'QAR', RO: 'RON', RU: 'RUB',
  SA: 'SAR', SE: 'SEK', SG: 'SGD', TH: 'THB', TR: 'TRY', TW: 'TWD', UA: 'UAH', US: 'USD', VN: 'VND', ZA: 'ZAR',
};

/** Best guess at the visitor's currency from their browser language region. */
export function detectCurrency(): string {
  const languages = typeof navigator === 'undefined' ? [] : [...(navigator.languages ?? []), navigator.language];
  for (const lang of languages) {
    try {
      const region = new Intl.Locale(lang).maximize().region;
      if (region && REGION_CURRENCY[region]) return REGION_CURRENCY[region];
    } catch {
      // ignore malformed language tags
    }
  }
  return 'USD';
}

type Rates = Record<string, number>;

/** Fixed, deliberate conversion rates that override the live ones (INR = ₹100 per $1). */
export const FIXED_RATES: Rates = { INR: 100 };

export function isFixedRate(currency: string) {
  return currency in FIXED_RATES;
}

const withFixed = (rates: Rates): Rates => ({ ...rates, ...FIXED_RATES });

function readCache(): Rates | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, rates } = JSON.parse(raw) as { at: number; rates: Rates };
    return Date.now() - at < CACHE_MS ? rates : null;
  } catch {
    return null;
  }
}

/** USD exchange rates (with the fixed overrides applied), or null if they can't be loaded. */
export async function getUsdRates(): Promise<Rates | null> {
  const cached = readCache();
  if (cached) return withFixed(cached);
  try {
    const res = await fetch(RATES_URL);
    const json = await res.json();
    if (json?.result !== 'success' || typeof json.rates !== 'object') return null;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rates: json.rates }));
    } catch {
      // caching is optional
    }
    return withFixed(json.rates as Rates);
  } catch {
    return null;
  }
}

/** Rounds a converted price to a clean figure (2 significant figures), e.g. 9401 → 9400, 14850 → 15000. */
export function roundNice(amount: number): number {
  if (amount <= 0) return 0;
  if (amount < 10) return Math.round(amount);
  const factor = Math.pow(10, Math.floor(Math.log10(amount)) - 1);
  return Math.round(amount / factor) * factor;
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export const RATES_ATTRIBUTION = { label: 'Rates by ExchangeRate-API', url: 'https://www.exchangerate-api.com' };

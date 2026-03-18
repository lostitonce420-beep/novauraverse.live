import { Hono } from 'hono';
import { env } from 'hono/adapter';
import type { Bindings } from '../index';

const domains = new Hono<{ Bindings: Bindings }>();

const NAMESILO_API = 'https://www.namesilo.com/api';

// ICANN mandatory fee per domain per year (always applies)
const ICANN_FEE = 0.18;

// NovAura platform service fee on top of registrar cost
// Configurable via DOMAIN_MARKUP_PCT env var (default 15%)
function getMarkupPct(envMarkup?: string): number {
  const raw = parseFloat(envMarkup ?? '15');
  return isNaN(raw) ? 0.15 : raw / 100;
}

// Apply markup + ICANN, round to 2 decimal places
function applyFees(registrarPrice: number): number {
  const markup = registrarPrice * getMarkupPct();
  return Math.round((registrarPrice + markup + ICANN_FEE) * 100) / 100;
}

// Wholesale/fallback prices (NameSilo reseller cost)
const TLD_PRICES: Record<string, number> = {
  com:    9.77,
  net:    11.27,
  org:    11.27,
  io:     34.99,
  dev:    13.99,
  app:    16.99,
  xyz:    1.49,
  online: 4.49,
  site:   4.49,
  store:  4.49,
  co:     26.99,
  ai:     69.99,
  tech:   8.99,
};

const TLDS = Object.keys(TLD_PRICES);

// Normalise NameSilo's domain field — can be string or { #text, price }
function parseDomainEntry(d: unknown): { domain: string; price?: number } {
  if (typeof d === 'string') return { domain: d };
  if (d && typeof d === 'object') {
    const obj = d as Record<string, any>;
    return {
      domain: obj['#text'] ?? obj.domain ?? '',
      price: obj.price ? parseFloat(obj.price) : undefined,
    };
  }
  return { domain: '' };
}

// Ensure value is always an array
function toArray<T>(val: T | T[] | undefined): T[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

// ── GET /domains/check?query=myname ──────────────────────────────────────────
domains.get('/check', async (c) => {
  const { query } = c.req.query();
  if (!query?.trim()) return c.json({ error: 'Query required' }, 400);

  const { NAMESILO_API_KEY: apiKey } = env<Bindings>(c);
  if (!apiKey) return c.json({ error: 'Domain API not configured' }, 503);

  // Sanitise: lowercase, strip anything that isn't alphanumeric or hyphen
  const name = query.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!name) return c.json({ error: 'Invalid domain name' }, 400);

  const domainsToCheck = TLDS.map(tld => `${name}.${tld}`).join(',');
  const url = `${NAMESILO_API}/checkRegisterAvailability?version=1&type=json&key=${apiKey}&domains=${domainsToCheck}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NameSilo HTTP ${res.status}`);
    const data = await res.json() as any;

    const reply = data?.reply ?? {};
    const availableRaw = toArray(reply.available?.domain);
    const unavailableRaw = toArray(reply.unavailable?.domain);

    const results = [
      ...availableRaw.map(d => {
        const { domain, price } = parseDomainEntry(d);
        const tld = domain.split('.').slice(1).join('.');
        const registrarPrice = price ?? TLD_PRICES[tld] ?? 9.99;
        return {
          domain,
          tld: `.${tld}`,
          registrarPrice,
          price: applyFees(registrarPrice),   // what the customer pays
          icannFee: ICANN_FEE,
          available: true,
        };
      }),
      ...unavailableRaw.map(d => {
        const { domain } = parseDomainEntry(d);
        const tld = domain.split('.').slice(1).join('.');
        const registrarPrice = TLD_PRICES[tld] ?? 9.99;
        return {
          domain,
          tld: `.${tld}`,
          registrarPrice,
          price: applyFees(registrarPrice),
          icannFee: ICANN_FEE,
          available: false,
        };
      }),
    ]
    .filter(r => r.domain)
    .sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return a.price - b.price;
    });

    return c.json({
      results,
      query: name,
      // Let the frontend know what's included in the price
      priceNote: `Prices include ICANN fee ($${ICANN_FEE}/yr) and NovAura service fee. Taxes calculated at checkout based on your location.`,
    });
  } catch (err: any) {
    console.error('NameSilo error:', err);
    return c.json({ error: 'Domain lookup failed', detail: err.message }, 502);
  }
});

// ── GET /domains/prices — retail TLD pricing ─────────────────────────────────
domains.get('/prices', (c) => {
  const prices = TLDS.map(tld => ({
    tld: `.${tld}`,
    price: applyFees(TLD_PRICES[tld]),
  })).sort((a, b) => a.price - b.price);

  return c.json({
    prices,
    priceNote: `All prices include ICANN fee ($${ICANN_FEE}/yr). Taxes calculated at checkout.`,
  });
});

export default domains;

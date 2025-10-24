// FLOWER → NPC Coin arbitraj analizi
// Metric: coinPerFC = coinPrice / lastSaleFC

import durations from '../data/durations.json';
import coinPrices from '../data/coinPrices.json';

export interface TradeRow {
  name: string;
  kind: string;
  lastSaleFC: number;   // pazardaki son satış (FLOWER)
  coinPrice: number;    // NPC coin satış (elle girdiğin)
  coinPerFC: number;    // coin / 1 FLOWER
}

// UI ile uyumlu kind normalizasyonu
const normKind = (k: string) => {
  const v = (k || '').toLowerCase();
  if (v === 'fruit' || v === 'fruits') return 'fruit';
  if (v === 'greenhouse') return 'greenhouse';
  return v;
};

// İsim normalize: küçük harf + harf/rakam dışını at
function normName(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')        // accent temizle
    .replace(/[\s_\-\.']/g, '')             // boşluk, _ - . ' sil
    .replace(/[^a-z0-9]/g, '');             // kalan özel karakterleri at
}

// Alternatif varyantlar: orijinal, boşluksuz, alt-çizgi, tire
function variants(s: string) {
  const raw = (s || '').trim();
  const lc = raw.toLowerCase();
  const cand = new Set<string>([
    raw, lc,
    raw.replace(/\s+/g, ''), lc.replace(/\s+/g, ''),
    raw.replace(/\s+/g, '_'), lc.replace(/\s+/g, '_'),
    raw.replace(/\s+/g, '-'), lc.replace(/\s+/g, '-'),
  ]);
  // normalize edilmiş sürümü de ekle
  cand.add(normName(raw));
  return Array.from(cand);
}

// durations.json'dan isim → kind haritası (orijinal isimle)
const KIND_BY_NAME: Record<string, string> = Object.fromEntries(
  (durations as any[]).map((d) => [d.name, normKind(d.kind ?? 'crop')])
);

// prices objesi için geniş eşleştirme indexi: tüm varyantlar → değer
function buildPriceIndex(prices: Record<string, number>) {
  const idx = new Map<string, { name: string; price: number }>();
  for (const [name, val] of Object.entries(prices)) {
    for (const v of variants(name)) {
      idx.set(v, { name, price: val });
    }
    // normalize edilmiş anahtar
    idx.set(normName(name), { name, price: val });
  }
  return idx;
}

/** prices: API'den gelen price book (name → lastSaleFC) */
export function evaluateCoinTrade(prices: Record<string, number>): TradeRow[] {
  const out: TradeRow[] = [];
  const priceIndex = buildPriceIndex(prices);

  for (const [rawName, coinPrice] of Object.entries(coinPrices as Record<string, number>)) {
    // coinPrices anahtarını da geniş aramada dene
    let match = null as { name: string; price: number } | null;
    for (const v of variants(rawName)) {
      match = priceIndex.get(v) ?? match;
      if (match) break;
    }
    if (!match) match = priceIndex.get(normName(rawName)) ?? null;

    if (!match || !match.price || match.price <= 0) {
      // Eşleşmeyenleri konsola yaz (geliştirirken faydalı)
      // console.warn('[coin-trade] no FLOWER price match for', rawName);
      continue;
    }

    const lastSaleFC = match.price;
    const coinPerFC = coinPrice / lastSaleFC;

    // kind: mümkünse durations içindeki orijinal isimle al
    const kind =
      KIND_BY_NAME[rawName] ??
      KIND_BY_NAME[match.name] ??
      'crop';

    out.push({
      name: rawName,          // listede coinPrices'taki görünen isim
      kind,
      lastSaleFC,
      coinPrice,
      coinPerFC,
    });
  }

  out.sort((a, b) => b.coinPerFC - a.coinPerFC);
  return out;
}

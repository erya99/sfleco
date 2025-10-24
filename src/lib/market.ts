/**
 * Market price provider (Sunflower Land)
 * Public: https://sfl.world/api/v1/prices
 * Desteklenen biçimler:
 *   A) { data: { p2p: { Name: num }, seq: { Name: num } }, updatedAt... }
 *   B) { prices: { p2p: { Name: num }, seq: { Name: num } } }
 *   C) { prices: { Name: { p2p, seq } } }
 *   D) { p2p: { Name: num }, seq: { Name: num } }  (kökte)
 * DÖNÜŞ: LOWERCASE { name: lastSaleFlower } (p2p tercihli, yoksa seq).
 */
type PriceMap = Record<string, number>;

function fetchInit() {
  const secs = Number(process.env.SFL_WORLD_CACHE_SECONDS ?? '900');
  return secs === 0 ? ({ cache: 'no-store' } as const)
                    : ({ next: { revalidate: secs } } as const);
}

function mergePreferP2P(p2p: Record<string, number> | undefined,
                        seq: Record<string, number> | undefined): PriceMap {
  const out: PriceMap = {};
  for (const [n, v] of Object.entries(p2p ?? {})) {
    const key = n.toString().trim().toLowerCase();
    if (typeof v === 'number' && v > 0) out[key] = Number(v);
  }
  for (const [n, v] of Object.entries(seq ?? {})) {
    const key = n.toString().trim().toLowerCase();
    if (!out[key] && typeof v === 'number' && v > 0) out[key] = Number(v);
  }
  return out;
}

async function fetchProtected(): Promise<PriceMap | null> {
  const base = process.env.SUNFLOWER_API_BASE;
  const token = process.env.SUNFLOWER_API_TOKEN;
  if (!base) return null;

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/resources`, {
      ...(fetchInit() as any),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) return null;

    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.items ?? []);
    const out: PriceMap = {};
    for (const item of list) {
      const name = (item.name ?? item.item ?? item.symbol ?? '')
        .toString().trim().toLowerCase();
      const val = Number(item.lastSaleFlower ?? item.lastSale ?? item.priceFlower ?? item.fc ?? 0);
      if (name && val > 0) out[name] = val;
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

export async function getPriceBook(): Promise<PriceMap> {
  // 1) Korumalı uç nokta varsa onu kullan
  const prot = await fetchProtected();
  if (prot && Object.keys(prot).length) return prot;

  // 2) Public uç nokta
  const url = (process.env.SFL_WORLD_PRICES_URL || 'https://sfl.world/api/v1/prices') + `?t=${Date.now()}`;
  const res = await fetch(url, fetchInit() as any);
  if (!res.ok) throw new Error(`Public prices fetch failed: ${res.status}`);

  const rawText = await res.text();
  let raw: any;
  try { raw = JSON.parse(rawText); }
  catch { console.error('Not JSON:', rawText.slice(0, 200)); return {}; }

  // HANGİ alanın altında olduğunu normalize et
  const container = raw?.prices ?? raw?.data ?? raw ?? {};

  // Biçim A/B/D tespiti
  // A/D: container.p2p / container.seq var
  if (container?.p2p || container?.seq) {
    const out = mergePreferP2P(container.p2p, container.seq);
    // console.log('Parsed p2p/seq container. keys:', Object.keys(out).slice(0, 10));
    return out;
  }

  // C: container = { Name: { p2p, seq } }
  if (typeof container === 'object') {
    const out: PriceMap = {};
    for (const [name, obj] of Object.entries<any>(container)) {
      if (!obj || typeof obj !== 'object') continue;
      const key = name.toString().trim().toLowerCase();
      const val = Number(obj.p2p ?? obj.seq ?? obj.floor ?? obj.last ?? 0);
      if (val > 0) out[key] = val;
    }
    if (Object.keys(out).length) return out;
  }

  // Uyumlu değilse ilk 200 char logla
  console.warn('Unknown prices shape keys:', Object.keys(raw));
  console.warn('RAW snippet:', rawText.slice(0, 200));
  return {};
}

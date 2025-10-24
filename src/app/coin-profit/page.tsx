import { getPriceBook } from '../../lib/market';           // mevcut API fetch fonksiyonun
import { evaluateCoinTrade } from '../../lib/evaluateCoinTrade';
import CoinTradeExplorer from '../../components/CoinTradeExplorer';

export const revalidate = Number(process.env.SFL_WORLD_CACHE_SECONDS) || 900;

export default async function CoinProfitPage() {
  // FLOWER fiyatlarını API’den çek
  const prices = await getPriceBook(); // name -> lastSaleFC

  // Coin/FC analizi
  const rows = evaluateCoinTrade(prices);

  // küçük özet
  const total = rows.length;
  const best = rows[0];
  const avg = rows.reduce((s, r) => s + r.coinPerFC, 0) / Math.max(1, total);

  return (
    <main className="min-h-screen">
      <section className="relative">
        <div className="absolute inset-0 -z-10 h-48 bg-gradient-to-r from-amber-400/30 via-rose-400/20 to-indigo-400/30 blur-3xl dark:opacity-60"></div>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Sunflower Land — <span className="text-amber-600 dark:text-amber-400">Coin per FLOWER</span>
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Buy from the market with FLOWER → sell to the NPC for coins. Metric: <strong>Coin / 1 FLOWER</strong>.
          </p>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
            <KPI label="Total resources" value={String(total)} />
            <KPI label="Average Coin/FC" value={avg.toFixed(4)} />
            {best && <KPI label="Most profitable" value={`${best.name} (${best.coinPerFC.toFixed(4)} Coin/FC)`} highlight />}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <CoinTradeExplorer rows={rows} />
      </section>
    </main>
  );
}

function KPI({ label, value, highlight=false }: {label:string; value:string; highlight?:boolean}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 p-4 backdrop-blur">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-xl font-semibold ${highlight ? "text-amber-600" : ""}`}>{value}</p>
    </div>
  );
}

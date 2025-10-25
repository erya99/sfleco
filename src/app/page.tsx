import { getPriceBook } from '../lib/market';
import durations from '../data/durations.json';
import { evaluateEfficiency } from '../lib/evaluate';
import ResourceExplorer from '../components/ResourceExplorer';

export const revalidate = Number(process.env.SFL_WORLD_CACHE_SECONDS ?? 300);
export const dynamic = (revalidate <= 0) ? 'force-dynamic' : 'auto';


export default async function Page() {
  const prices = await getPriceBook();
  const rows = evaluateEfficiency(durations as any, prices as any);

  const total = rows.length;
  const best = [...rows].sort((a,b)=>b.fcPerHour-a.fcPerHour)[0];
  const avgFcH = rows.reduce((s,r)=>s+r.fcPerHour,0)/Math.max(1,total);

  return (
    <main className="min-h-screen">
      {/* Hero / Header glow */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 h-48 bg-gradient-to-r from-amber-400/30 via-rose-400/20 to-indigo-400/30 blur-3xl dark:opacity-60"></div>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Sunflower Land — <span className="text-amber-600 dark:text-amber-400">Resource Efficiency</span>
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Metric = <strong>FLOWER (last sale) ÷ Duration (hours)</strong>.
          </p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
            <KPI label="Total resources" value={total.toString()} />
            <KPI label="Average FC/hour" value={avgFcH.toFixed(4)} />
            {best && <KPI label="Most efficient" value={`${best.name} (${best.fcPerHour.toFixed(4)})`} highlight />}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <ResourceExplorer rows={rows} />
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

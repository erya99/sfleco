'use client';

import React, { useMemo, useState } from 'react';
import type { TradeRow } from '../lib/evaluateCoinTrade';

type Kind = 'all' | 'crop' | 'animal' | 'mining' | 'fruit' | 'greenhouse';
type ViewMode = 'table' | 'cards';

function classNames(...a: (string | false | undefined)[]) {
  return a.filter(Boolean).join(' ');
}

/** /public/icons için esnek aday üretici (prod'da case-sensitive sorunlarını çözer) */
function localIconCandidates(name: string): string[] {
  const raw = name.trim();
  const lc = raw.toLowerCase();
  const variants = Array.from(new Set([
    raw, lc,
    raw.replace(/\s+/g, ''),  lc.replace(/\s+/g, ''),
    raw.replace(/\s+/g, '_'), lc.replace(/\s+/g, '_'),
    raw.replace(/\s+/g, '-'), lc.replace(/\s+/g, '-'),
  ]));
  const exts = ['.png', '.webp'];
  const out: string[] = [];
  for (const v of variants) for (const ext of exts) out.push(`/icons/${v}${ext}`);
  return out;
}

function Img({ name, size = 28 }: { name: string; size?: number }) {
  const [i, setI] = useState(0);
  const cands = useMemo(() => localIconCandidates(name), [name]);
  const src = cands[i];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setI(n => (n + 1 < cands.length ? n + 1 : n))}
      style={{ imageRendering: 'pixelated' }}
      className="rounded-sm ring-1 ring-slate-200 dark:ring-slate-700 bg-white/60 dark:bg-slate-800/60"
    />
  );
}

// kind normalizer (UI etiketi ile tutarlılık)
const normKind = (k: string) => {
  const v = (k || '').toLowerCase();
  if (v === 'fruit' || v === 'fruits') return 'fruit';
  if (v === 'greenhouse') return 'greenhouse';
  return v;
};

export default function CoinTradeExplorer({ rows }: { rows: TradeRow[] }) {
  const [kind, setKind] = useState<Kind>('all');
  const [q, setQ] = useState('');
  const [view, setView] = useState<ViewMode>('table');
  const [sort, setSort] = useState<'ratioDesc'|'ratioAsc'|'flower'|'coin'>('ratioDesc');

  const filtered = useMemo(() => {
    let x = rows.filter((r) => {
      const rk = normKind(r.kind);
      const passKind =
        kind === 'all'
          ? true
          : kind === 'fruit'
          ? rk === 'fruit'
          : kind === 'greenhouse'
          ? rk === 'greenhouse'
          : rk === kind;
      return passKind && r.name.toLowerCase().includes(q.toLowerCase());
    });

    switch (sort) {
      case 'ratioAsc': x.sort((a, b) => a.coinPerFC - b.coinPerFC); break;
      case 'flower':  x.sort((a, b) => b.lastSaleFC - a.lastSaleFC); break;
      case 'coin':    x.sort((a, b) => b.coinPrice - a.coinPrice); break;
      default:        x.sort((a, b) => b.coinPerFC - a.coinPerFC); break; // ratioDesc
    }
    return x;
  }, [rows, kind, q, sort]);

  return (
    <div className="mt-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between sticky top-0 z-20 bg-gradient-to-b from-white/85 to-white/60 dark:from-slate-900/85 dark:to-slate-900/60 backdrop-blur px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {(['all','crop','animal','mining','fruit','greenhouse'] as Kind[]).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={classNames(
                'px-3 py-1.5 rounded-full text-sm border transition',
                kind === k
                  ? 'bg-amber-500 text-white border-amber-500 shadow'
                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-white'
              )}
            >
              {k === 'all' ? 'All' : k === 'fruit' ? 'Fruit' : k === 'greenhouse' ? 'Greenhouse' : k[0].toUpperCase()+k.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search resource..."
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
            <span className="absolute left-2 top-1.5 text-slate-400">🔎</span>
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm"
          >
            <option value="ratioDesc">Sort: Coin/FC ↓</option>
            <option value="ratioAsc">Sort: Coin/FC ↑</option>
            <option value="coin">Sort: NPC Price (Coin)</option>
            <option value="flower">Sort: Last sale (FLOWER)</option>
          </select>

          <div className="ml-1 inline-flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setView('table')}
              className={classNames(
                'px-3 py-2 text-sm',
                view === 'table' ? 'bg-amber-500 text-white' : 'bg-white/70 dark:bg-slate-800/70'
              )}
              title="Table view"
            >
              ▦
            </button>
            <button
              onClick={() => setView('cards')}
              className={classNames(
                'px-3 py-2 text-sm',
                view === 'cards' ? 'bg-amber-500 text-white' : 'bg-white/70 dark:bg-slate-800/70'
              )}
              title="Card view"
            >
              ▤
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      {view === 'table' ? (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur">
          <table className="w-full text-sm">
            <thead className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
              <tr className="text-slate-600 dark:text-slate-300">
                <th className="p-3 text-left">Icon</th>
                <th className="p-3 text-left">Resource</th>
                <th className="p-3 text-left">Kind</th>
                <th className="p-3 text-right">Last sale (FLOWER)</th>
                <th className="p-3 text-right">NPC price (Coin)</th>
                <th className="p-3 text-right">Coin / FLOWER</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.name} className={i % 2 ? 'bg-slate-50/50 dark:bg-slate-800/30' : undefined}>
                  <td className="p-3"><Img name={r.name} /></td>
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{r.name}</td>
                  <td className="p-3 capitalize text-slate-700 dark:text-slate-300">{normKind(r.kind)}</td>
                  <td className="p-3 text-right tabular-nums">{r.lastSaleFC.toFixed(4)}</td>
                  <td className="p-3 text-right tabular-nums">{r.coinPrice.toFixed(4)}</td>
                  <td className="p-3 text-right tabular-nums font-semibold">{r.coinPerFC.toFixed(4)}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500">No rows.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // CARDS
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div key={r.name} className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-4 hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <Img name={r.name} />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{r.name}</div>
                  <div className="text-xs capitalize text-slate-500">{normKind(r.kind)}</div>
                </div>
                <div className="ml-auto font-semibold text-amber-600">
                  {(r.coinPerFC).toFixed(4)} Coin/FC
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-2">
                  <div className="text-slate-500">FLOWER</div>
                  <div className="font-semibold tabular-nums">{r.lastSaleFC.toFixed(4)}</div>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-2">
                  <div className="text-slate-500">Coin</div>
                  <div className="font-semibold tabular-nums">{r.coinPrice.toFixed(4)}</div>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-2">
                  <div className="text-slate-500">Coin/FC</div>
                  <div className="font-semibold tabular-nums">{r.coinPerFC.toFixed(4)}</div>
                </div>
              </div>
            </div>
          ))}
          {!filtered.length && (
            <div className="col-span-full text-center text-slate-500 py-10">No rows.</div>
          )}
        </div>
      )}
    </div>
  );
}

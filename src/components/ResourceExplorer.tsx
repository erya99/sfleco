'use client';

import React, { useMemo, useState } from 'react';
import type { Row } from '../lib/evaluate';

type Kind = 'all' | 'crop' | 'animal' | 'mining' | 'fruit' | 'greenhouse';
type ViewMode = 'table' | 'cards';

function classNames(...a: (string | false | undefined)[]) {
  return a.filter(Boolean).join(' ');
}

function localIconCandidates(name: string): string[] {
  const raw = name.trim();
  const lc = raw.toLowerCase();
  const vars = Array.from(new Set([
    raw, lc,
    raw.replace(/\s+/g, ''), lc.replace(/\s+/g, ''),
    raw.replace(/\s+/g, '_'), lc.replace(/\s+/g, '_'),
    raw.replace(/\s+/g, '-'), lc.replace(/\s+/g, '-'),
  ]));
  const out: string[] = [];
  for (const v of vars) out.push(`/icons/${v}.png`, `/icons/${v}.webp`);
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

function Pill({
  children, tone = 'default' as 'good' | 'warn' | 'default',
}: { children: React.ReactNode; tone?: 'good' | 'warn' | 'default' }) {
  const map = {
    good:    'text-emerald-700 bg-emerald-50 ring-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/30 dark:ring-emerald-800',
    warn:    'text-amber-700  bg-amber-50  ring-amber-200  dark:text-amber-300  dark:bg-amber-900/30  dark:ring-amber-800',
    default: 'text-slate-700  bg-slate-50  ring-slate-200  dark:text-slate-300  dark:bg-slate-800/50  dark:ring-slate-700',
  } as const;
  return <span className={`px-2 py-0.5 text-[11px] rounded-full ring-1 ${map[tone]}`}>{children}</span>;
}

/** kind normalizer */
const normKind = (k: string) => {
  const v = (k || '').toLowerCase();
  if (v === 'fruit' || v === 'fruits') return 'fruit';
  if (v === 'greenhouse') return 'greenhouse';
  return v;
};

export default function ResourceExplorer({ rows }: { rows: Row[] }) {
  const [kind, setKind] = useState<Kind>('all');
  const [q, setQ] = useState('');
  const [view, setView] = useState<ViewMode>('table');
  const [sort, setSort] = useState<'fcdesc'|'fcasc'|'price'|'duration'>('fcdesc');

  const filtered = useMemo(() => {
    let x = rows.filter(r => {
      const rk = normKind(r.kind);
      const passKind =
        kind === 'all' ? true :
        kind === 'fruit' ? rk === 'fruit' :
        kind === 'greenhouse' ? rk === 'greenhouse' :
        rk === kind;
      return passKind && r.name.toLowerCase().includes(q.toLowerCase());
    });

    switch (sort) {
      case 'fcasc':    x.sort((a,b)=>a.fcPerHour-b.fcPerHour); break;
      case 'price':    x.sort((a,b)=>b.lastSaleFC-a.lastSaleFC); break;
      case 'duration': x.sort((a,b)=>a.durationSec-b.durationSec); break;
      default:         x.sort((a,b)=>b.fcPerHour-a.fcPerHour); break;
    }
    return x;
  }, [rows, kind, q, sort]);

  return (
    <div className="mt-4">
      {/* Controls */}
      <div
        id="controls-bar"
        className="flex flex-col md:flex-row gap-3 md:items-center justify-between sticky top-0 z-20 bg-gradient-to-b from-white/85 to-white/60 dark:from-slate-900/85 dark:to-slate-900/60 backdrop-blur px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center gap-2">
          {(['all','crop','animal','mining','fruit','greenhouse'] as Kind[]).map(k => (
            <button
              key={k}
              onClick={()=>setKind(k)}
              className={classNames(
                'px-3 py-1.5 rounded-full text-sm border transition',
                kind===k
                  ? 'bg-amber-500 text-white border-amber-500 shadow'
                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-white'
              )}
            >
              {k === 'all'
                ? 'All'
                : k === 'fruit'
                  ? 'Fruit'
                  : k === 'greenhouse'
                    ? 'Greenhouse'
                    : k[0].toUpperCase()+k.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Search resource..."
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
            <span className="absolute left-2 top-1.5 text-slate-400">🔎</span>
          </div>

          <select
            value={sort}
            onChange={(e)=>setSort(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm"
          >
            <option value="fcdesc">Sort: FC/hour ↓</option>
            <option value="fcasc">Sort: FC/hour ↑</option>
            <option value="price">Sort: Last sale</option>
            <option value="duration">Sort: Duration</option>
          </select>

          <div className="ml-1 inline-flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <button
              onClick={()=>setView('table')}
              className={classNames(
                'px-3 py-2 text-sm',
                view==='table' ? 'bg-amber-500 text-white' : 'bg-white/70 dark:bg-slate-800/70'
              )}
              title="Table view"
            >
              ▦
            </button>
            <button
              onClick={()=>setView('cards')}
              className={classNames(
                'px-3 py-2 text-sm',
                view==='cards' ? 'bg-amber-500 text-white' : 'bg-white/70 dark:bg-slate-800/70'
              )}
              title="Card view"
            >
              ▤
            </button>
          </div>
        </div>
      </div>

      {view === 'table' ? <TableView rows={filtered} /> : <CardView rows={filtered} />}
    </div>
  );
}

function TableView({ rows }: { rows: Row[] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur">
      <table className="w-full text-sm">
        <thead className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
          <tr className="text-slate-600 dark:text-slate-300">
            <th className="p-3 text-left">Icon</th>
            <th className="p-3 text-left">Resource</th>
            <th className="p-3 text-left">Kind</th>
            <th className="p-3 text-right">Last sale (FLOWER)</th>
            <th className="p-3 text-right">Duration (h)</th>
            <th className="p-3 text-right">FC/hour</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name} className={i % 2 ? 'bg-slate-50/50 dark:bg-slate-800/30' : undefined}>
              <td className="p-3"><Img name={r.name} /></td>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{r.name}</td>
              <td className="p-3 capitalize text-slate-700 dark:text-slate-300">{normKind(r.kind)}</td>
              <td className="p-3 text-right tabular-nums">{r.lastSaleFC.toFixed(4)}</td>
              <td className="p-3 text-right tabular-nums">{(r.durationSec/3600).toFixed(2)}</td>
              <td className="p-3 text-right tabular-nums">
                <Pill tone={r.fcPerHour >= 0.05 ? 'good' : r.fcPerHour >= 0.02 ? 'default' : 'warn'}>
                  {r.fcPerHour.toFixed(4)} FC/h
                </Pill>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={6} className="p-6 text-center text-slate-500">No rows.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CardView({ rows }: { rows: Row[] }) {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rows.map((r) => (
        <div key={r.name} className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-4 hover:shadow-lg transition">
          <div className="flex items-center gap-3">
            <Img name={r.name} />
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{r.name}</div>
              <div className="text-xs capitalize text-slate-500">{normKind(r.kind)}</div>
            </div>
            <div className="ml-auto">
              <Pill tone={r.fcPerHour >= 0.05 ? 'good' : r.fcPerHour >= 0.02 ? 'default' : 'warn'}>
                {r.fcPerHour.toFixed(4)} FC/h
              </Pill>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-2">
              <div className="text-slate-500">Last sale</div>
              <div className="font-semibold tabular-nums">{r.lastSaleFC.toFixed(4)}</div>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-2">
              <div className="text-slate-500">Duration</div>
              <div className="font-semibold tabular-nums">{(r.durationSec/3600).toFixed(2)} h</div>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-2">
              <div className="text-slate-500">FC/hour</div>
              <div className="font-semibold tabular-nums">{r.fcPerHour.toFixed(4)}</div>
            </div>
          </div>
        </div>
      ))}
      {!rows.length && <div className="col-span-full text-center text-slate-500 py-10">No rows.</div>}
    </div>
  );
}
'use client';

import React, { useMemo, useState } from 'react';
import type { Row } from '../lib/evaluate';

/** Yerel ikon adayları (/public/icons/...); assets.ts yok. */
function localIconCandidates(name: string): string[] {
  const raw = name.trim();
  const lc = raw.toLowerCase();
  const variants = Array.from(new Set([
    raw, lc,
    raw.replace(/\s+/g, ''), lc.replace(/\s+/g, ''),
    raw.replace(/\s+/g, '_'), lc.replace(/\s+/g, '_'),
    raw.replace(/\s+/g, '-'), lc.replace(/\s+/g, '-'),
  ]));
  const exts = ['.png', '.webp'];
  const out: string[] = [];
  for (const v of variants) for (const ext of exts) out.push(`/icons/${v}${ext}`);
  return out;
}

function Img({ name }: { name: string }) {
  const [i, setI] = useState(0);
  const cands = useMemo(() => localIconCandidates(name), [name]);
  const src = cands[i];
  if (!src) return null;
  return (
    <img
      src={src}
      width={28}
      height={28}
      alt={name}
      loading="lazy"
      onError={() => setI((n) => (n + 1 < cands.length ? n + 1 : n))}
      style={{ imageRendering: 'pixelated' }}
      className="rounded-sm ring-1 ring-slate-200 dark:ring-slate-700 bg-white/60 dark:bg-slate-800/60"
    />
  );
}

/** kind normalize — lowercase ve çoğul düzeltmeleri */
const normalizeKind = (k: string) => {
  const v = (k || '').toLowerCase();
  if (v === 'fruit' || v === 'fruits') return 'fruit';
  if (v === 'greenhouse') return 'greenhouse';
  return v;
};

export default function Table({ rows }: { rows: Row[] }) {
  const [kind, setKind] = useState<'all'|'crop'|'animal'|'mining'|'fruit'|'greenhouse'>('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const rk = normalizeKind(r.kind);
      const passKind =
        kind === 'all' ? true :
        kind === 'fruit' ? rk === 'fruit' :
        kind === 'greenhouse' ? rk === 'greenhouse' :
        rk === kind;
      return passKind && r.name.toLowerCase().includes(q.toLowerCase());
    });
  }, [rows, kind, q]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        <select
          value={kind}
          onChange={(e)=>setKind(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="all">All</option>
          <option value="crop">Crops</option>
          <option value="animal">Animals</option>
          <option value="mining">Mining</option>
          <option value="fruit">Fruit</option>
          <option value="greenhouse">Greenhouse</option>
        </select>
        <input
          placeholder="Search..."
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Icon</th>
              <th className="p-2">Resource</th>
              <th className="p-2">Kind</th>
              <th className="p-2 text-right">Last sale (FLOWER)</th>
              <th className="p-2 text-right">Duration (h)</th>
              <th className="p-2 text-right">FC/hour</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const displayKind = normalizeKind(r.kind);
              return (
                <tr key={r.name} className={i % 2 ? 'bg-gray-50 dark:bg-slate-800/30' : ''}>
                  <td className="p-2"><Img name={r.name} /></td>
                  <td className="p-2 font-medium">{r.name}</td>
                  <td className="p-2 capitalize">{displayKind}</td>
                  <td className="p-2 text-right tabular-nums">{r.lastSaleFC.toFixed(4)}</td>
                  <td className="p-2 text-right tabular-nums">{(r.durationSec/3600).toFixed(2)}</td>
                  <td className="p-2 text-right tabular-nums font-semibold">{r.fcPerHour.toFixed(4)}</td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr><td className="p-4 text-gray-500" colSpan={6}>No rows.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

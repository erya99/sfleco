export type Duration = { name: string; kind: 'crop'|'animal'|'mining'; durationSec: number };
export type PriceBook = Record<string, number>; // keys must be LOWERCASE

export type Row = {
  name: string;
  kind: 'crop'|'animal'|'mining';
  lastSaleFC: number;
  durationSec: number;
  fcPerHour: number;
};

export function evaluateEfficiency(durations: Duration[], prices: PriceBook): Row[] {
  return durations
    .map(d => {
      const key = d.name.toLowerCase();
      const lastSaleFC = prices[key];
      if (!(lastSaleFC > 0) || !(d.durationSec > 0)) return null;

      const hours = d.durationSec / 3600;
      const fcPerHour = lastSaleFC / hours;

      return {
        name: d.name,
        kind: d.kind,
        lastSaleFC,
        durationSec: d.durationSec,
        fcPerHour,
      } as Row;
    })
    .filter((r): r is Row => r !== null)
    .sort((a, b) => b.fcPerHour - a.fcPerHour);
}

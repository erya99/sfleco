import durations from '../../../data/durations.json';
import { getPriceBook } from '../../../lib/market';
import { evaluateEfficiency } from '../../../lib/evaluate';

export const revalidate = Number(process.env.SFL_WORLD_CACHE_SECONDS) || 900;

export async function GET() {
  const prices = await getPriceBook();
  const rows = evaluateEfficiency(durations as any, prices as any);
  return new Response(JSON.stringify({ updatedAt: new Date().toISOString(), count: rows.length, rows }), {
    headers: { 'content-type': 'application/json' },
  });
}

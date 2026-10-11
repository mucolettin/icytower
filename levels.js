export const ZONES = [
  { name: 'BUZ AVLUSU', subtitle: 'Ritmini bul', top: '#12263d', bottom: '#234b60', accent: '#b6f0ec', stone: '#64a3b5', decor: 'ice' },
  { name: 'KRİSTAL GALERİ', subtitle: 'Zikzak rotasını izle', top: '#241d46', bottom: '#49366a', accent: '#ddc6ff', stone: '#967cc1', decor: 'crystal' },
  { name: 'SAAT KULESİ', subtitle: 'Geçişleri zamanla', top: '#30241d', bottom: '#5b4430', accent: '#ffe1a1', stone: '#ac8857', decor: 'clock' },
  { name: 'FIRTINA ZİRVESİ', subtitle: 'Durmadan yüksel', top: '#102f38', bottom: '#285866', accent: '#a3f5ff', stone: '#5babb7', decor: 'storm' },
];
export const zoneForFloor = floor => ZONES[Math.floor(floor / 20) % ZONES.length];
const ROUTE = [240,240,260,280,260,240,200,280,200,280,240,200,160,200,240,280,240,200,240,280];
export function createPlatform(floor, previous, random = Math.random) {
  const section = Math.floor(floor / 20), local = floor % 20;
  const rest = local === 0;
  const center = section % 2 ? 480 - ROUTE[local] : ROUTE[local];
  const jitter = local <= 2 ? 0 : (random() - .5) * 12;
  const w = rest ? 360 : local < 6 ? Math.max(145, 180 - section * 5) : Math.max(110, 150 - section * 4);
  const gap = rest ? 64 : local < 6 ? 70 : local < 10 ? 76 : local < 15 ? 80 : 86;
  const kind = rest ? 'rest' : local === 10 || local === 12 || (section >= 3 && local === 17) ? 'breakable' : local === 14 || (section >= 1 && local === 16) ? 'moving' : 'normal';
  // Place rewards on safe approach platforms, before the challenge they support.
  const rewards = { 6: 'rocket', 9: 'spring', 15: 'slow', 19: 'shield' };
  const x = rest ? 60 : center + jitter - w / 2;
  return { x, baseX: x, y: previous.y - gap, w, floor, kind, crumble: null, broken: false, item: rewards[local] || null, restClaimed: false, zone: section % ZONES.length };
}

export const ZONES = [
  { name: 'BUZ AVLUSU', subtitle: 'Ritmini bul', top: '#12263d', bottom: '#234b60', accent: '#b6f0ec', stone: '#64a3b5', decor: 'ice' },
  { name: 'KRİSTAL GALERİ', subtitle: 'Zikzak rotasını izle', top: '#241d46', bottom: '#49366a', accent: '#ddc6ff', stone: '#967cc1', decor: 'crystal' },
  { name: 'SAAT KULESİ', subtitle: 'Geçişleri zamanla', top: '#30241d', bottom: '#5b4430', accent: '#ffe1a1', stone: '#ac8857', decor: 'clock' },
  { name: 'FIRTINA ZİRVESİ', subtitle: 'Durmadan yüksel', top: '#102f38', bottom: '#285866', accent: '#a3f5ff', stone: '#5babb7', decor: 'storm' },
];
export const zoneForFloor = floor => ZONES[Math.floor(floor / 20) % ZONES.length];
// Bound every transition rather than replaying a fixed route. Moving platforms
// can each shift 24px, so leave room for both ends of a jump to move apart.
export function createPlatform(floor, previous, random = Math.random) {
  const roll = () => Math.max(0, Math.min(.999999, random()));
  const section = Math.floor(floor / 20);
  const nextRest = previous.nextRest ?? 18 + Math.floor(roll() * 7);
  const nextItem = previous.nextItem ?? 6 + Math.floor(roll() * 5);
  const rest = floor >= nextRest;
  const itemDue = !rest && floor >= nextItem;
  const difficulty = Math.min(1, floor / 120);
  const w = rest ? 360 : floor < 5 ? 180 : Math.round(165 - difficulty * 45 + roll() * 20);
  const gap = rest ? 64 : floor < 5 ? 70 : Math.round(64 + roll() * (12 + difficulty * 6));
  const previousCenter = (previous.baseX ?? previous.x) + previous.w / 2;
  const maxShift = floor < 5 ? 12 : 50;
  const center = Math.max(145, Math.min(335, previousCenter + (roll() * 2 - 1) * maxShift));
  const kindRoll = roll();
  const previousDanger = ['breakable', 'moving'].includes(previous.kind);
  const kind = rest ? 'rest' : floor < 8 || itemDue || previousDanger ? 'normal'
    : kindRoll < .18 + difficulty * .08 ? 'breakable'
    : kindRoll < .32 + difficulty * .12 ? 'moving' : 'normal';
  const items = ['rocket', 'spring', 'slow', 'shield'];
  const item = itemDue ? items[Math.floor(roll() * items.length)] : null;
  const x = rest ? 60 : center - w / 2;
  return { x, baseX: x, y: previous.y - gap, w, floor, kind, crumble: null,
    broken: false, item, restClaimed: false, zone: section % ZONES.length,
    nextRest: rest ? floor + 18 + Math.floor(roll() * 7) : nextRest,
    nextItem: itemDue ? floor + 14 + Math.floor(roll() * 9) : nextItem };
}

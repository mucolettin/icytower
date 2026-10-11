import { createPlatform, zoneForFloor } from './levels.js';
export const WIDTH = 480, HEIGHT = 640;
export const POWERUPS = {
  rocket: { label: 'ROKET', color: '#ffad66', symbol: '↑', duration: .65 },
  spring: { label: 'SÜPER ZIPLAMA', color: '#ad9bff', symbol: '↟', duration: 8 },
  slow: { label: 'ZAMAN FRENİ', color: '#78dafa', symbol: '◷', duration: 6 },
  shield: { label: 'KURTARMA KALKANI', color: '#9ae9d6', symbol: '◇', duration: 0 },
};
export function createGame(random = Math.random) {
  const g = { player: { x: 235, y: 560, vx: 0, vy: 0, grounded: true }, platforms: [], camera: 0, floor: 0, score: 0, bonus: 0, time: 0, dead: false, random, effects: { rocket: 0, spring: 0, slow: 0 }, shield: false, combo: 0, comboTime: 0, level: 1, pace: 1, notice: '', noticeTime: 0, restTime: 0, zoneIndex: 0, boostLocked: false, rocketCooldown: 0 };
  g.platforms.push({ x: 30, baseX: 30, y: 590, w: 420, floor: 0, kind: 'normal', crumble: null });
  for (let i = 1; i < 18; i++) g.platforms.push(createPlatform(i, g.platforms.at(-1), g.random));
  return g;
}
function announce(g, text) { g.notice = text; g.noticeTime = 2; }
export function collectPowerup(g, type) {
  if (!POWERUPS[type] || g.boostLocked || (type === 'rocket' && g.rocketCooldown > 0)) return false;
  if (type === 'shield') g.shield = true;
  else g.effects[type] = POWERUPS[type].duration;
  if (type === 'rocket') {
    g.player.vy = -700 * g.pace; g.player.grounded = false;
    g.boostLocked = true; g.rocketCooldown = 5;
  }
  g.bonus += 250;
  g.score = g.floor * 100 + g.bonus;
  announce(g, POWERUPS[type].label + '!');
  return true;
}
export function step(g, input, dt) {
  if (g.dead) return;
  dt = Math.min(dt, 1 / 30);
  const p = g.player;
  g.time += dt;
  g.rocketCooldown = Math.max(0, g.rocketCooldown - dt);
  const rocketWasActive = g.effects.rocket > 0;
  g.restTime = Math.max(0, g.restTime - dt);
  g.noticeTime = Math.max(0, g.noticeTime - dt);
  g.comboTime = Math.max(0, g.comboTime - dt);
  if (g.comboTime === 0) g.combo = 0;
  for (const effect of Object.keys(g.effects)) g.effects[effect] = Math.max(0, g.effects[effect] - dt);
  g.level = 1 + Math.floor(g.floor / 20);
  g.pace = Math.min(1.65, 1 + (g.level - 1) * .1);
  const pace = g.pace;
  if (rocketWasActive && g.effects.rocket === 0) p.vy = Math.max(p.vy, -250 * pace);
  // Keep the jump arc reachable at every pace: both velocity and gravity scale.
  p.vx += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 1500 * pace * dt;
  p.vx *= Math.pow(input.left || input.right ? .98 : .85, dt * 60);
  const maxSpeed = 360 * pace;
  p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));
  if (input.jump && p.grounded) {
    p.vy = (-620 * pace - Math.abs(p.vx) * .45) * (g.effects.spring > 0 ? 1.3 : 1);
    p.grounded = false;
  }
  for (const plat of g.platforms) {
    if (plat.crumble !== null && plat.crumble !== undefined) {
      plat.crumble -= dt;
      if (plat.crumble <= 0) plat.broken = true;
    }
    if (plat.kind === 'moving') {
      const previous = plat.x;
      plat.x = Math.max(25, Math.min(WIDTH - 25 - plat.w, plat.baseX + Math.sin(g.time * 1.5 + plat.floor) * 24));
      if (p.grounded && Math.abs(p.y + 30 - plat.y) < 1 && p.x + 24 > previous && p.x < previous + plat.w) p.x += plat.x - previous;
    }
  }
  const oldBottom = p.y + 30;
  if (g.effects.rocket > 0) p.vy = -700 * pace;
  else p.vy += 1700 * pace * pace * dt;
  p.x += p.vx * dt; p.y += p.vy * dt;
  if (p.x < 20) { p.x = 20; p.vx = Math.abs(p.vx) * .8; }
  if (p.x > WIDTH - 44) { p.x = WIDTH - 44; p.vx = -Math.abs(p.vx) * .8; }
  p.grounded = false;
  if (p.vy >= 0) for (const plat of g.platforms) {
    if (!plat.broken && oldBottom <= plat.y + .5 && p.y + 30 >= plat.y && p.x + 24 > plat.x && p.x < plat.x + plat.w) {
      p.y = plat.y - 30; p.vy = 0; p.grounded = true;
      g.boostLocked = false;
      if (plat.kind === 'rest' && !plat.restClaimed) {
        plat.restClaimed = true; g.restTime = 3; g.bonus += 300;
        announce(g, 'MOLA KATI · 3 SANİYE MOLA +300');
      }
      if (plat.kind === 'breakable' && plat.crumble === null) plat.crumble = .65;
      if (plat.floor > g.floor) {
        const skipped = plat.floor - g.floor;
        g.combo = g.comboTime > 0 ? g.combo + 1 : 1;
        g.comboTime = 3;
        g.bonus += Math.max(0, g.combo - 1) * 25 + Math.max(0, skipped - 1) * 50;
        g.floor = plat.floor;
        if (g.combo >= 3) announce(g, `KOMBO ×${g.combo}`);
      }
      break;
    }
  }
  for (const plat of g.platforms) {
    if (!g.boostLocked && plat.item && Math.abs(p.x + 12 - (plat.x + plat.w / 2)) < 28 && Math.abs(p.y + 15 - (plat.y - 32)) < 32) {
      if (collectPowerup(g, plat.item)) plat.item = null;
    }
  }
  // Rocket progress counts even when flying past platforms.
  if (g.effects.rocket > 0) for (const plat of g.platforms) {
    if (p.y + 30 <= plat.y) g.floor = Math.max(g.floor, plat.floor);
  }
  const zoneIndex = Math.floor(g.floor / 20);
  if (zoneIndex !== g.zoneIndex) {
    g.zoneIndex = zoneIndex; announce(g, zoneForFloor(g.floor).name);
  }
  g.score = g.floor * 100 + g.bonus;
  g.camera = Math.min(g.camera, p.y - 290);
  if (g.time > 6 && g.restTime === 0) g.camera -= Math.min(90, 12 + Math.min(55, g.time * .5) + (g.level - 1) * 8) * (g.effects.slow > 0 ? .25 : 1) * dt;
  while (g.platforms.at(-1).y > g.camera - 200) {
    const last = g.platforms.at(-1);
    g.platforms.push(createPlatform(last.floor + 1, last, g.random));
  }
  if (p.y - g.camera > HEIGHT + 20) {
    if (g.shield) {
      g.shield = false;
      p.y = g.camera + HEIGHT - 120; p.vy = -850 * pace; p.grounded = false;
      // Give the rescue enough lift to reach the surviving tower.
      g.effects.rocket = .65; g.boostLocked = true; g.rocketCooldown = 5;
      announce(g, 'KALKAN SENİ KURTARDI!');
    } else g.dead = true;
  }
  g.platforms = g.platforms.filter(plat => plat.y < g.camera + HEIGHT + 80);
}

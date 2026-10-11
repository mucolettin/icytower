export const WIDTH = 480, HEIGHT = 640;
export function createGame(random = Math.random) {
  const platforms = [{ x: 30, y: 590, w: 420, floor: 0 }];
  for (let i = 1; i < 18; i++) platforms.push({ x: 30 + random() * 270, y: 590 - i * 75, w: 140, floor: i });
  return { player: { x: 235, y: 560, vx: 0, vy: 0, grounded: true }, platforms, camera: 0, floor: 0, score: 0, time: 0, dead: false, random };
}
export function step(g, input, dt) {
  if (g.dead) return;
  dt = Math.min(dt, 1 / 30);
  const p = g.player;
  g.time += dt;
  p.vx += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 1500 * dt;
  p.vx *= Math.pow(input.left || input.right ? .98 : .85, dt * 60);
  p.vx = Math.max(-360, Math.min(360, p.vx));
  if (input.jump && p.grounded) { p.vy = -620 - Math.abs(p.vx) * .45; p.grounded = false; }
  const oldBottom = p.y + 30;
  p.vy += 1700 * dt;
  p.x += p.vx * dt; p.y += p.vy * dt;
  if (p.x < 20) { p.x = 20; p.vx = Math.abs(p.vx) * .8; }
  if (p.x > WIDTH - 44) { p.x = WIDTH - 44; p.vx = -Math.abs(p.vx) * .8; }
  p.grounded = false;
  if (p.vy >= 0) for (const platform of g.platforms) {
    if (oldBottom <= platform.y + .5 && p.y + 30 >= platform.y && p.x + 24 > platform.x && p.x < platform.x + platform.w) {
      p.y = platform.y - 30; p.vy = 0; p.grounded = true;
      g.floor = Math.max(g.floor, platform.floor); g.score = g.floor * 100; break;
    }
  }
  g.camera = Math.min(g.camera, p.y - 290);
  if (g.time > 6) g.camera -= (12 + Math.min(55, g.time * .5)) * dt;
  while (g.platforms.at(-1).y > g.camera - 200) {
    const last = g.platforms.at(-1);
    g.platforms.push({ x: 30 + g.random() * 290, y: last.y - 75, w: Math.max(95, 140 - last.floor * .25), floor: last.floor + 1 });
  }
  g.platforms = g.platforms.filter(platform => platform.y < g.camera + HEIGHT + 80);
  if (p.y - g.camera > HEIGHT + 20) g.dead = true;
}

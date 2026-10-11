import { zoneForFloor } from './levels.js';
import { createGame, step, WIDTH, HEIGHT, POWERUPS } from './physics.js';
const $ = id => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d');
let game = createGame(), mode = 'ready', last = 0, accumulator = 0, sound = false, audio;
let best = 0;
try { best = Number(localStorage.getItem('icy-best')) || 0; } catch {}
$('best').textContent = String(best).padStart(3, '0');
const keys = new Set();
function beep() {
  if (!sound) return;
  audio ||= new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audio.createOscillator(), gain = audio.createGain();
  oscillator.connect(gain); gain.connect(audio.destination); oscillator.frequency.setValueAtTime(420, audio.currentTime); oscillator.frequency.exponentialRampToValueAtTime(820, audio.currentTime + .1); gain.gain.setValueAtTime(.035, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .12); oscillator.start(); oscillator.stop(audio.currentTime + .12);
}
function start() { game = createGame(); mode = 'playing'; accumulator = 0; keys.clear(); $('overlay').classList.add('hidden'); $('status').textContent = 'TIRMANIYOR'; $('floor').textContent = '000'; $('score').textContent = '0'; }
function pause() {
  if (mode !== 'playing' && mode !== 'paused') return;
  mode = mode === 'playing' ? 'paused' : 'playing';
  $('overlay').classList.toggle('hidden', mode === 'playing');
  $('title').textContent = 'Bir nefes molası.'; $('message').textContent = 'Hazır olduğunda tırmanışa devam et.'; $('start').textContent = 'DEVAM ET ↗'; $('status').textContent = mode === 'paused' ? 'DURAKLATILDI' : 'TIRMANIYOR';
}
$('start').onclick = () => mode === 'paused' ? pause() : start();
$('pause').onclick = pause;
$('sound').onclick = () => { sound = !sound; $('sound').textContent = `SES: ${sound ? 'AÇIK' : 'KAPALI'}`; if (sound) beep(); };
window.addEventListener('keydown', e => {
  if (['ArrowLeft','ArrowRight','Space','KeyA','KeyD','KeyP'].includes(e.code)) e.preventDefault();
  if (e.repeat && (e.code === 'KeyP' || (e.code === 'Space' && mode !== 'playing'))) return;
  if (e.code === 'KeyP') pause();
  if (e.code === 'Space' && mode !== 'playing') { mode === 'paused' ? pause() : start(); return; }
  keys.add(e.code);
});
window.addEventListener('keyup', e => keys.delete(e.code));
window.addEventListener('blur', () => { keys.clear(); if (mode === 'playing') pause(); });
document.querySelectorAll('[data-key]').forEach(button => {
  button.addEventListener('pointerdown', e => { e.preventDefault(); button.setPointerCapture(e.pointerId); keys.add(button.dataset.key); });
  for (const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event, () => keys.delete(button.dataset.key));
});
function draw() {
  const zone = zoneForFloor(game.floor);
  const bg = ctx.createLinearGradient(0,0,0,HEIGHT); bg.addColorStop(0,zone.top); bg.addColorStop(1,zone.bottom); ctx.fillStyle=bg; ctx.fillRect(0,0,WIDTH,HEIGHT);
  // Stonework scrolls at a slower pace to give the tower depth.
  ctx.strokeStyle='#8cc2dc0b'; ctx.lineWidth=1;
  for(let row=-1;row<12;row++) { const y=row*64-(game.camera*.35%64); ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WIDTH,y);ctx.stroke(); for(let col=0;col<7;col++){const x=col*80+(row%2)*40;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+64);ctx.stroke();} }
  for(let i=0;i<35;i++){const x=(i*137+27)%WIDTH,y=((i*97+game.time*9-game.camera*.2)%HEIGHT+HEIGHT)%HEIGHT;ctx.fillStyle='#d9ffff55';ctx.fillRect(x,y,i%3===0?2:1,2);}
  ctx.save();ctx.globalAlpha=.16;ctx.strokeStyle=zone.accent;ctx.fillStyle=zone.accent;
  for(let i=0;i<4;i++){
    const dx=65+i*115,dy=((i*191-game.camera*.18)%800+800)%800-80;
    if(zone.decor==='crystal'||zone.decor==='ice'){ctx.beginPath();ctx.moveTo(dx,dy-45);ctx.lineTo(dx+16,dy);ctx.lineTo(dx,dy+45);ctx.lineTo(dx-16,dy);ctx.closePath();ctx.stroke();}
    if(zone.decor==='clock'){ctx.beginPath();ctx.arc(dx,dy,33,0,Math.PI*2);ctx.moveTo(dx,dy-24);ctx.lineTo(dx,dy);ctx.lineTo(dx+18,dy+10);ctx.stroke();}
    if(zone.decor==='storm'){ctx.beginPath();ctx.moveTo(dx+10,dy-35);ctx.lineTo(dx-12,dy);ctx.lineTo(dx+5,dy);ctx.lineTo(dx-10,dy+35);ctx.stroke();}
  }ctx.restore();
  ctx.fillStyle='#0b192c';ctx.fillRect(0,0,20,HEIGHT);ctx.fillRect(460,0,20,HEIGHT);
  for(const platform of game.platforms){
    const y=platform.y-game.camera;if(y < -70 || y > HEIGHT || platform.broken)continue;
    const cracking=platform.crumble !== null && platform.crumble !== undefined;
    ctx.save(); if(cracking) ctx.globalAlpha=.45+.55*Math.abs(Math.sin(game.time*25));
    ctx.fillStyle='#10283c';ctx.fillRect(platform.x,y+7,platform.w,12);
    ctx.fillStyle=platform.kind==='breakable'?'#dd9773':platform.kind==='moving'?'#a294df':platform.kind==='rest'?'#d5b760':zoneForFloor(platform.floor).stone;ctx.fillRect(platform.x,y,platform.w,9);
    ctx.fillStyle=platform.kind==='breakable'?'#ffd3ac':platform.kind==='rest'?'#fff0b4':zoneForFloor(platform.floor).accent;ctx.fillRect(platform.x,y,platform.w,3);
    if(platform.kind==='breakable'){ctx.strokeStyle='#753f34';ctx.beginPath();ctx.moveTo(platform.x+platform.w*.4,y);ctx.lineTo(platform.x+platform.w*.5,y+5);ctx.lineTo(platform.x+platform.w*.45,y+10);ctx.stroke();}
    ctx.fillStyle='#d1edf666';ctx.font='9px monospace';ctx.fillText(platform.kind==='rest'?`${platform.floor} · MOLA KATI`:String(platform.floor).padStart(2,'0'),platform.x+7,y+21);ctx.restore();
    if(platform.item){const item=POWERUPS[platform.item],ix=platform.x+platform.w/2,iy=y-32+Math.sin(game.time*4)*3;ctx.fillStyle=item.color;ctx.shadowColor=item.color;ctx.shadowBlur=15;ctx.beginPath();ctx.arc(ix,iy,14,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#102335';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText(item.symbol,ix,iy+7);ctx.textAlign='left';}
  }
  const p=game.player,x=Math.round(p.x),y=Math.round(p.y-game.camera), facing=p.vx<0?-1:1;
  if(game.effects.rocket>0){ctx.fillStyle='#ffb05c';ctx.beginPath();ctx.moveTo(x+3,y+28);ctx.lineTo(x+12,y+48+Math.sin(game.time*50)*8);ctx.lineTo(x+21,y+28);ctx.fill();}
  if(game.shield){ctx.strokeStyle='#9ae9d6';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+12,y+14,24,0,Math.PI*2);ctx.stroke();}
  ctx.save();ctx.translate(x+12,y);ctx.scale(facing,1);ctx.fillStyle='#091d30';ctx.fillRect(-9,26,8,5);ctx.fillRect(3,26,8,5);ctx.fillStyle='#62d8c0';ctx.fillRect(-10,12,20,15);ctx.fillStyle='#ffe1b8';ctx.fillRect(-8,2,17,13);ctx.fillStyle='#fcba59';ctx.fillRect(-10,-3,21,7);ctx.fillRect(-4,-7,12,5);ctx.fillStyle='#11263c';ctx.fillRect(4,7,3,3);ctx.fillStyle='#efffff';ctx.fillRect(-10,13,20,3);ctx.restore();
  ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillStyle=zone.accent;ctx.font='10px monospace';ctx.fillText(zone.name,WIDTH/2,90);
  ctx.font='bold 12px monospace';
  if(game.restTime>0){ctx.fillStyle='#fff0b4';ctx.fillText(`MOLA ${game.restTime.toFixed(1)}s`,WIDTH/2,HEIGHT-24);}
  if(game.noticeTime>0){ctx.fillStyle='#fff5d8';ctx.fillText(game.notice,WIDTH/2,125);}
  let offset=0;
  for(const [type,remaining] of Object.entries(game.effects)){if(remaining>0){ctx.fillStyle=POWERUPS[type].color;ctx.fillText(`${POWERUPS[type].label} ${remaining.toFixed(1)}s`,WIDTH/2,HEIGHT-48-offset);offset+=20;}}
  if(game.shield){ctx.fillStyle=POWERUPS.shield.color;ctx.fillText('◇ KALKAN HAZIR',WIDTH/2,HEIGHT-48-offset);}
  ctx.textAlign='left';
}
function frame(now) {
  const dt = Math.min((now-last)/1000 || 0, .1); last=now;
  if(mode==='playing') {
    accumulator+=dt;
    while(accumulator>=1/120){const grounded=game.player.grounded;step(game,{left:keys.has('ArrowLeft')||keys.has('KeyA'),right:keys.has('ArrowRight')||keys.has('KeyD'),jump:keys.has('Space')},1/120);if(grounded&&game.player.vy<0)beep();accumulator-=1/120;}
    $('floor').textContent=String(game.floor).padStart(3,'0');$('score').textContent=game.score; $('status').textContent=`${zoneForFloor(game.floor).name} · TEMPO ×${game.pace.toFixed(1)}`;
    if(game.dead){mode='over';best=Math.max(best,game.floor);try{localStorage.setItem('icy-best',best);}catch{}$('best').textContent=String(best).padStart(3,'0');$('title').textContent='Bir kat daha?';$('message').textContent=`${game.floor}. kata ulaştın · ${game.score} puan`;$('start').textContent='TEKRAR DENE ↗';$('overlay').classList.remove('hidden');$('status').textContent='TIRMANIŞ BİTTİ';}
  }
  draw();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

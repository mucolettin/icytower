import { createGame, step, WIDTH, HEIGHT } from './physics.js';
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
function start() { game = createGame(); mode = 'playing'; accumulator = 0; keys.clear(); $('overlay').classList.add('hidden'); $('status').textContent = 'TIRMANIYOR'; }
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
  const bg = ctx.createLinearGradient(0,0,0,HEIGHT); bg.addColorStop(0,'#12263d'); bg.addColorStop(1,'#23435a'); ctx.fillStyle=bg; ctx.fillRect(0,0,WIDTH,HEIGHT);
  // Stonework scrolls at a slower pace to give the tower depth.
  ctx.strokeStyle='#8cc2dc0b'; ctx.lineWidth=1;
  for(let row=-1;row<12;row++) { const y=row*64-(game.camera*.35%64); ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WIDTH,y);ctx.stroke(); for(let col=0;col<7;col++){const x=col*80+(row%2)*40;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+64);ctx.stroke();} }
  for(let i=0;i<35;i++){const x=(i*137+27)%WIDTH,y=((i*97+game.time*9-game.camera*.2)%HEIGHT+HEIGHT)%HEIGHT;ctx.fillStyle='#d9ffff55';ctx.fillRect(x,y,i%3===0?2:1,2);}
  ctx.fillStyle='#0b192c';ctx.fillRect(0,0,20,HEIGHT);ctx.fillRect(460,0,20,HEIGHT);
  for(const platform of game.platforms){const y=platform.y-game.camera;if(y < -30 || y > HEIGHT)continue;ctx.fillStyle='#10283c';ctx.fillRect(platform.x,y+7,platform.w,12);ctx.fillStyle='#64a3b5';ctx.fillRect(platform.x,y,platform.w,9);ctx.fillStyle='#b6f0ec';ctx.fillRect(platform.x,y,platform.w,3);ctx.fillStyle='#d1edf666';ctx.font='9px monospace';ctx.fillText(String(platform.floor).padStart(2,'0'),platform.x+7,y+21);}
  const p=game.player,x=Math.round(p.x),y=Math.round(p.y-game.camera), facing=p.vx<0?-1:1;
  ctx.save();ctx.translate(x+12,y);ctx.scale(facing,1);ctx.fillStyle='#091d30';ctx.fillRect(-9,26,8,5);ctx.fillRect(3,26,8,5);ctx.fillStyle='#62d8c0';ctx.fillRect(-10,12,20,15);ctx.fillStyle='#ffe1b8';ctx.fillRect(-8,2,17,13);ctx.fillStyle='#fcba59';ctx.fillRect(-10,-3,21,7);ctx.fillRect(-4,-7,12,5);ctx.fillStyle='#11263c';ctx.fillRect(4,7,3,3);ctx.fillStyle='#efffff';ctx.fillRect(-10,13,20,3);ctx.restore();
}
function frame(now) {
  const dt = Math.min((now-last)/1000 || 0, .1); last=now;
  if(mode==='playing') {
    accumulator+=dt;
    while(accumulator>=1/120){const grounded=game.player.grounded;step(game,{left:keys.has('ArrowLeft')||keys.has('KeyA'),right:keys.has('ArrowRight')||keys.has('KeyD'),jump:keys.has('Space')},1/120);if(grounded&&game.player.vy<0)beep();accumulator-=1/120;}
    $('floor').textContent=String(game.floor).padStart(3,'0');$('score').textContent=game.score;
    if(game.dead){mode='over';best=Math.max(best,game.floor);try{localStorage.setItem('icy-best',best);}catch{}$('best').textContent=String(best).padStart(3,'0');$('title').textContent='Bir kat daha?';$('message').textContent=`${game.floor}. kata ulaştın · ${game.score} puan`;$('start').textContent='TEKRAR DENE ↗';$('overlay').classList.remove('hidden');$('status').textContent='TIRMANIŞ BİTTİ';}
  }
  draw();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

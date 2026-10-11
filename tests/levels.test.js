import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlatform, zoneForFloor, ZONES } from '../levels.js';
import { createGame, step } from '../physics.js';
function tower(random, count=240) {
  const platforms=[{x:30,baseX:30,y:590,w:420,floor:0,kind:'normal',crumble:null}];
  for(let i=1;i<=count;i++) platforms.push(createPlatform(i,platforms.at(-1),random));
  return platforms;
}
test('routes remain inside the tower and jump gaps are safe at randomness extremes',()=>{
  for(const random of [()=>0,()=>.5,()=>1]){
    const platforms=tower(random);
    for(let i=1;i<platforms.length;i++){
      const p=platforms[i],previous=platforms[i-1];
      assert.ok(p.x>=25 && p.x+p.w<=455);
      assert.ok(previous.y-p.y<=86 && previous.y-p.y>=64);
      assert.ok(Math.abs(p.x+p.w/2-previous.x-previous.w/2)<=100);
      if(i%20===0){assert.equal(p.kind,'rest');assert.equal(p.w,360);assert.equal(p.item,null);}
      if(p.item) assert.ok(!['breakable','moving'].includes(p.kind));
    }
  }
});
test('four zones rotate and later sections mirror the route',()=>{
  assert.equal(new Set([0,20,40,60].map(f=>zoneForFloor(f).name)).size,4);
  assert.equal(zoneForFloor(80),ZONES[0]);
  const platforms=tower(()=>.5);assert.equal(platforms[7].x+platforms[7].w/2,480-platforms[27].x-platforms[27].w/2);
});
test('real physics can traverse each adjacent gap across 120 floors without powerups',()=>{
  const platforms=tower(()=>.5,120);
  for(let i=1;i<platforms.length;i++){
    const previous={...platforms[i-1],item:null},next={...platforms[i],item:null};
    const g=createGame(()=>.5);g.platforms=[previous,next];g.floor=previous.floor;
    g.player.x=previous.x+previous.w/2-12;g.player.y=previous.y-30;g.camera=g.player.y-290;
    let landed=false;
    for(let frame=0;frame<180;frame++){
      const distance=next.x+next.w/2-g.player.x-12;
      step(g,{left:distance < -8,right:distance > 8,jump:frame===0},1/120);
      if(g.player.grounded && g.floor>=next.floor){landed=true;break;}
    }
    assert.ok(landed,`floor ${i} should be reachable`);
  }
});
test('rest landing pauses camera pressure and awards bonus only once',()=>{
  const platforms=tower(()=>.5,21),g=createGame(()=>.5),rest=platforms[20];
  g.platforms=platforms;g.time=10;g.floor=19;g.player.x=240;g.player.y=rest.y-31;g.player.vy=120;g.player.grounded=false;g.camera=rest.y-320;
  step(g,{},1/120);assert.equal(g.restTime,3);assert.equal(g.bonus,300);assert.equal(rest.restClaimed,true);
  const camera=g.camera,score=g.score;
  for(let i=0;i<120;i++)step(g,{},1/120);
  assert.equal(g.camera,camera);assert.equal(g.score,score);
  for(let i=0;i<250;i++)step(g,{},1/120);
  assert.equal(g.restTime,0);assert.ok(g.camera<camera);
});
test('rocket progress follows variable-height floors rather than a fixed gap formula',()=>{
  const g=createGame(()=>.5),target=g.platforms[8];
  for(const p of g.platforms)p.item=null;
  g.player.y=target.y-30;g.effects.rocket=.5;step(g,{},1/120);assert.equal(g.floor,8);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, step } from '../physics.js';
const tick = (game, input = {}, count = 1) => { for(let i=0;i<count;i++) step(game,input,1/120); };
test('player stays on the initial platform and jumps onto the next floor',()=>{
  const g=createGame(()=>.5);tick(g,{},60);assert.equal(g.player.y,560);assert.equal(g.player.grounded,true);
  tick(g,{jump:true});assert.ok(g.player.vy<0);tick(g,{},100);assert.equal(g.floor,1);assert.equal(g.score,100);assert.equal(g.player.grounded,true);
});
test('horizontal momentum increases jump height and walls contain the player',()=>{
  const g=createGame(()=>.5);tick(g,{right:true},20);const speed=g.player.vx;assert.ok(speed>100);tick(g,{right:true,jump:true});assert.ok(g.player.vy < -620);tick(g,{right:true},60);assert.ok(g.player.x<=436);
});
test('camera never descends, generates platforms and falling ends the game',()=>{
  const g=createGame(()=>.5);g.player.y=-1500;g.player.vy=-10;tick(g);assert.ok(g.camera < -1700);assert.ok(g.platforms.at(-1).y < g.camera-200);
  const camera=g.camera;g.player.y=camera+700;tick(g);assert.equal(g.dead,true);assert.ok(g.camera<=camera);
});

test('powerups are collected by touching their platform pickup and expire',()=>{
  const g=createGame(()=>.5), plat=g.platforms[6];
  g.player.x=plat.x+plat.w/2-12;g.player.y=plat.y-47;g.player.vy=0;g.player.grounded=false;
  tick(g);assert.equal(plat.item,null);assert.ok(g.effects.rocket>0);assert.ok(g.player.vy<0);assert.equal(g.bonus,250);
  // Isolate expiry from the next rocket pickup during a long flight.
  for(let i=0;i<210;i++){for(const platform of g.platforms) platform.item=null;tick(g);}
  assert.equal(g.effects.rocket,0);
});

test('breakable platforms collapse after landing and cannot hold the player',()=>{
  const g=createGame(()=>.5), plat=g.platforms[10];
  g.player.x=plat.x+10;g.player.y=plat.y-31;g.player.vy=120;g.player.grounded=false;
  tick(g);assert.equal(g.player.grounded,true);assert.ok(plat.crumble>0);
  tick(g,{},85);assert.equal(plat.broken,true);assert.ok(g.player.y>plat.y-30);
});

test('moving platforms carry the standing player',()=>{
  const g=createGame(()=>.5), plat=g.platforms[14];
  g.player.x=plat.x+20;g.player.y=plat.y-30;g.player.grounded=true;
  const x=g.player.x;tick(g);assert.notEqual(g.player.x,x);assert.equal(g.player.grounded,true);
});

test('higher floors speed up play, while slow powerup reduces camera pressure',()=>{
  const fast=createGame(()=>.5);fast.floor=100;tick(fast);assert.equal(fast.level,6);assert.equal(fast.pace,1.5);
  const normal=createGame(()=>.5), slow=createGame(()=>.5);normal.time=slow.time=10;slow.effects.slow=6;
  tick(normal);tick(slow);assert.ok(slow.camera>normal.camera);tick(slow,{},730);assert.equal(slow.effects.slow,0);
});

test('spring increases lift and one shield rescues exactly one fall',()=>{
  const normal=createGame(()=>.5), spring=createGame(()=>.5);spring.effects.spring=8;
  tick(normal,{jump:true});tick(spring,{jump:true});assert.ok(spring.player.vy<normal.player.vy);
  const g=createGame(()=>.5);g.shield=true;g.player.y=700;tick(g);assert.equal(g.dead,false);assert.equal(g.shield,false);assert.ok(g.player.vy<0);
  g.effects.rocket=0;g.player.y=g.camera+700;tick(g);assert.equal(g.dead,true);
});

test('quick consecutive new-floor landings award combo points without farming old floors',()=>{
  const g=createGame(()=>.5);
  for (const i of [1,2,3]){const plat=g.platforms[i];g.player.x=plat.x+10;g.player.y=plat.y-31;g.player.vy=120;tick(g);}
  assert.equal(g.combo,3);assert.equal(g.score,375);
  const score=g.score;tick(g,{},30);assert.equal(g.score,score);
  tick(g,{},400);assert.equal(g.combo,0);
});

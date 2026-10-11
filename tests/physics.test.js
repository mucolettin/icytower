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

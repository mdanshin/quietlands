import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,WORLD,BEACONS,CAMPS,TOWER,NPCS,recipes,walkable,groundHeight,height,dist,MAP_CELLS} from '../dist/core.js';

test('All objectives and resources are reachable on the connected island',()=>{
  const span=180,step=2,seen=new Set(),queue=[[-42,64]],key=(x,z)=>x+','+z;seen.add(key(-42,64));
  for(let at=0;at<queue.length;at++){const[x,z]=queue[at];for(const[dx,dz]of[[step,0],[-step,0],[0,step],[0,-step]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(Math.abs(nx)>span||Math.abs(nz)>span||seen.has(k)||!walkable(nx,nz))continue;seen.add(k);queue.push([nx,nz]);}}
  for(const p of[...BEACONS,...CAMPS,...NPCS,TOWER,...WORLD.nodes]){assert.ok(walkable(p.x,p.z),`Land beneath ${p.name||p.id}`);assert.ok(queue.some(([x,z])=>Math.hypot(p.x-x,p.z-z)<3),`Connected path to ${p.name||p.id}`);}
  for(const n of WORLD.nodes)assert.ok(height(n.x,n.z)>.1,`Resource above water: ${n.id}`);
  assert.ok(WORLD.trees.length>300);assert.ok(WORLD.nodes.filter(n=>n.type==='crystal').length>=12);
});
test('Movement respects the shore, scenery and diagonal speed',()=>{
  const a=new Game(),b=new Game();a.state.x=b.state.x=-39;a.state.z=b.state.z=63;
  const p={x:a.state.x,z:a.state.z};a.tick(.05,{x:1,z:0});b.tick(.05,{x:1,z:1});assert.ok(Math.abs(dist(p,a.state)-dist(p,b.state))<.001);
  const start={x:a.state.x,z:a.state.z};a.move(500,500);assert.equal(a.state.x,start.x);assert.equal(a.state.z,start.z);
  const t=WORLD.trees[0];a.state.x=t.x-2;a.state.z=t.z;a.move(2,0);assert.equal(a.state.x,t.x-2);
});
test('Crafting is atomic, upgrades change combat and completed equipment cannot be charged again',()=>{
  const g=new Game(),before=g.snapshot();assert.equal(g.craft('sword'),false);assert.deepEqual(g.state.inventory,before.inventory);
  g.state.inventory.wood=100;g.state.inventory.ore=100;g.state.inventory.crystal=50;const damage=g.damage;
  assert.equal(g.craft('sword'),true);assert.equal(g.damage,damage+9);assert.equal(g.craft('bow'),true);
  const funds=g.state.inventory.wood;assert.equal(g.craft('bow'),false);assert.equal(g.state.inventory.wood,funds);
  for(let i=0;i<4;i++)g.craft('sword');assert.equal(g.state.weaponTier,3);assert.equal(recipes(g).find(r=>r.id==='sword').max,true);
});
test('Potions and dodges prevent waste and correctly apply protection',()=>{
  const g=new Game();assert.equal(g.usePotion(),false);assert.equal(g.state.inventory.potions,3);
  g.state.hp=20;assert.equal(g.usePotion(),true);assert.equal(g.state.hp,75);assert.equal(g.state.inventory.potions,2);
  assert.equal(g.dodge(),true);g.hurt(25,{});assert.equal(g.state.hp,75);assert.equal(g.dodge(),false);
  for(let i=0;i<10;i++)g.tick(.05);g.hurt(25,{});assert.equal(g.state.hp,50);
});
test('Melee, ranged projectiles and enemy telegraphs resolve damage',()=>{
  const g=new Game();const e=g.enemies.find(e=>e.kind==='wisp'&&!e.guardFor);g.state.x=e.x;g.state.z=e.z+2.5;const hp=e.hp;g.attack();assert.ok(e.hp<hp);
  e.hp=e.maxHp;g.state.z=e.z+12;g.state.bow=true;g.selectWeapon('bow');g.cooldown=0;g.state.stamina=100;g.attack();assert.equal(g.projectiles.length,1);for(let i=0;i<16;i++)g.tick(.05);assert.ok(e.hp<e.maxHp,'Arrow collides with target');
  const enemy=g.enemies.find(e=>e.kind==='sentinel');g.state.x=enemy.x;g.state.z=enemy.z+1.5;g.state.hp=100;g.invincible=0;g.tick(.05);assert.equal(enemy.mode,'windup');for(let i=0;i<15;i++)g.tick(.05);assert.ok(g.state.hp<100,'Telegraphed attack deals damage');
});
test('Main quest can run from first conversation to victory and persist',()=>{
  const g=new Game();assert.equal(g.quest().target.id,'marfa');g.npcAction('main');
  for(const b of BEACONS){g.state.x=b.x;g.state.z=b.z;g.state.inventory.crystal=3;assert.equal(g.interact(),false,'Guard blocks beacon');for(const e of g.enemies.filter(e=>e.guardFor===b.id))g.hitEnemy(e,1000);g.state.inventory.crystal=2;assert.equal(g.interact(),false,'Material requirement enforced');g.state.inventory.crystal=3;assert.equal(g.interact(),true);assert.equal(g.state.inventory.crystal,0);assert.equal(g.interact(),false,'No repeated beacon reward');}
  assert.equal(g.state.beacons.length,3);const boss=g.enemies.find(e=>e.boss);assert.ok(g.enemyActive(boss));g.state.x=TOWER.x;g.state.z=TOWER.z;assert.equal(g.interact(),false,'Boss blocks final fire');g.hitEnemy(boss,1000);assert.equal(g.interact(),true);assert.ok(g.state.flags.finished);
  const loaded=new Game(g.snapshot());assert.ok(loaded.state.flags.finished);assert.equal(loaded.state.beacons.length,3);assert.ok(loaded.enemies.find(e=>e.boss).dead);assert.deepEqual(loaded.state.inventory,g.state.inventory);
});
test('Side quests reward once, camps allow travel, death preserves campaign progress',()=>{
  const g=new Game();g.npcAction('supplies');g.state.inventory.wood=12;g.state.inventory.ore=8;assert.ok(g.npcAction('deliverSupplies'));const coins=g.state.inventory.coins;assert.equal(g.npcAction('deliverSupplies'),false);assert.equal(g.state.inventory.coins,coins);
  g.state.flags.satchelFound=true;const max=g.maxHp;g.npcAction('deliverSatchel');assert.ok(g.maxHp>=max+20);const pots=g.state.inventory.potions;g.npcAction('deliverSatchel');assert.equal(g.state.inventory.potions,pots);
  assert.equal(g.travel('ridge'),false);g.state.x=CAMPS[2].x;g.state.z=CAMPS[2].z;g.explore();g.rest('ridge');assert.ok(g.travel('bay'));g.state.beacons=['forest'];g.invincible=0;g.hurt(1000,{});assert.equal(g.state.stats.deaths,1);assert.equal(g.state.hp,g.maxHp);assert.deepEqual(g.state.beacons,['forest']);
});
test('Malformed saves are bounded and ordinary harvests respawn while chests stay empty',()=>{
  const g=new Game({version:1,x:Infinity,z:NaN,level:-20,inventory:{coins:-100,wood:'oops'},explored:[-1,1,1,Infinity,99999]});assert.ok(Number.isFinite(g.state.x));assert.equal(g.state.level,1);assert.equal(g.state.inventory.coins,0);assert.ok(g.state.explored.every(n=>n>=0&&n<MAP_CELLS*MAP_CELLS));
  const herb=WORLD.nodes.find(n=>n.type==='herb'),chest=WORLD.nodes.find(n=>n.type==='chest');g.state.harvests[herb.id]=0;g.state.harvests[chest.id]=0;g.state.elapsed=181;assert.ok(g.nodeAvailable(herb));assert.equal(g.nodeAvailable(chest),false);
});

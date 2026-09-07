export const WORLD_SIZE=360, MAP_CELLS=36, SAVE_KEY='quietlands-save-v1';
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function random(seed=53814){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export const CAMPS=[{id:'bay',name:'Поселение у залива',x:-42,z:53,y:3.3},{id:'pine',name:'Лесной привал',x:-87,z:-54,y:5.4},{id:'ridge',name:'Перевал',x:-28,z:-91,y:9.2},{id:'amber',name:'Янтарная стоянка',x:77,z:67,y:3.4}];
export const BEACONS=[{id:'forest',name:'Лесной маяк',x:-103,z:-20,y:4.5},{id:'amber',name:'Янтарный маяк',x:104,z:27,y:5.5},{id:'snow',name:'Северный маяк',x:0,z:-113,y:11.2}];
export const NPCS=[{id:'marfa',name:'Марфа',role:'Смотрительница маяка',x:-40,z:57},{id:'smith',name:'Тихон',role:'Кузнец',x:-55,z:45},{id:'herbalist',name:'Нина',role:'Травница',x:-31,z:43}];
export const TOWER={id:'tower',name:'Затопленная крепость',x:77,z:-83,y:13};
export const LANDMARKS=[...CAMPS,...BEACONS,TOWER];
export const BRIDGES=[52,-42];
export const RESOURCE_NAMES={wood:'Древесина',ore:'Руда',herb:'Травы',crystal:'Кристаллы',coins:'Монеты',potions:'Настои'};
export function biome(x,z){if(z<-67)return'snow';if(x>48&&z<0)return'ruins';if(x>51)return'amber';if(x<-39&&z<14)return'forest';return'meadow';}
export const BIOMES={meadow:{name:'Зелёные луга',color:'#87a45d',danger:'Спокойные земли'},forest:{name:'Шепчущий лес',color:'#3e7360',danger:'В лесу прячутся тени'},amber:{name:'Янтарная роща',color:'#b6a35d',danger:'Дикие тропы'},snow:{name:'Северный хребет',color:'#a7b6b6',danger:'Холодные вершины'},ruins:{name:'Старые руины',color:'#828b89',danger:'Земли стража'}};
export const riverX=z=>28+11*Math.sin(z*.034);
export function onBridge(x,z){return BRIDGES.some(b=>Math.abs(z-b)<3.6&&Math.abs(x-riverX(b))<12)||(Math.abs(x+39)<2&&z>65&&z<89);}
export function height(x,z){
  let h=3.2+Math.sin(x*.042)*Math.cos(z*.035)*1.8+Math.sin(x*.09+z*.031)*.48+Math.max(0,(-z-28)/92)*7.7;
  const bay=Math.hypot((x+5)/48,(z-111)/58);if(bay<1.1){const mix=clamp((bay-.84)/.26,0,1);h=-1.6*(1-mix)+h*mix;}
  for(const l of LANDMARKS){const d=Math.hypot(x-l.x,z-l.z);if(d<17){let t=clamp((17-d)/7,0,1);t=t*t*(3-2*t);h=h*(1-t)+l.y*t;}}
  const a=Math.atan2(z,x),shore=155+9*Math.sin(a*3)+5*Math.cos(a*7),r=Math.hypot(x,z);
  if(r>shore-15)h=h*(1-clamp((r-shore+15)/20,0,1))-7*clamp((r-shore+15)/20,0,1);
  if(z>-139&&z<133){const d=Math.abs(x-riverX(z));if(d<8)h=Math.min(h,-.8+(h+.8)*clamp((d-3.8)/4.2,0,1));}
  return h;
}
export const groundHeight=(x,z)=>onBridge(x,z)?Math.max(height(x,z),3.55):height(x,z);
export const isWater=(x,z)=>!onBridge(x,z)&&height(x,z)<.15;
export const walkable=(x,z)=>Math.abs(x)<177&&Math.abs(z)<177&&groundHeight(x,z)>-3.2;
const PATHS=[[CAMPS[0],{x:-71,z:9}],[{x:-71,z:9},BEACONS[0]],[{x:-71,z:9},CAMPS[1]],[CAMPS[1],CAMPS[2]],[CAMPS[2],BEACONS[2]],[CAMPS[0],{x:riverX(52),z:52}],[{x:riverX(52),z:52},CAMPS[3]],[CAMPS[3],BEACONS[1]],[BEACONS[1],TOWER],[{x:-7,z:-49},{x:riverX(-42),z:-42}],[{x:riverX(-42),z:-42},TOWER],[CAMPS[2],{x:-7,z:-49}]];
export function pathDistance(x,z){let out=1000;for(const[a,b]of PATHS){const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz),0,1);out=Math.min(out,Math.hypot(x-a.x-dx*t,z-a.z-dz*t));}return out;}
export function makeWorld(){
  const rng=random(),trees=[],rocks=[],nodes=[],enemies=[],decoration=[];
  function free(x,z,pad=10){return height(x,z)>.6&&LANDMARKS.every(l=>Math.hypot(x-l.x,z-l.z)>pad)&&pathDistance(x,z)>3.1;}
  for(let i=0;i<2200&&trees.length<770;i++){const x=(rng()-.5)*307,z=(rng()-.5)*295,b=biome(x,z);if(!free(x,z,b==='forest'?11:15)||b==='ruins'||(b==='snow'&&rng()>.4))continue;trees.push({x,z,size:1.6+rng()*2.5,variant:rng(),biome:b,angle:rng()*6.28});}
  for(let i=0;i<350;i++){const x=(rng()-.5)*309,z=(rng()-.5)*300;if(free(x,z,9))rocks.push({x,z,size:.35+rng()*1.6,angle:rng()*6.28});}
  for(let i=0;i<2000;i++){const x=(rng()-.5)*310,z=(rng()-.5)*305;if(height(x,z)>.9&&pathDistance(x,z)>2)decoration.push({x,z,kind:rng(),size:.45+rng()*.8});}
  const node=(type,x,z,extra={})=>nodes.push({id:'n'+nodes.length,type,x,z,...extra});
  node('wood',-48,65);node('ore',-33,60);node('herb',-44,71);node('crystal',-27,52);node('herb',-46,38);
  const types=['wood','wood','ore','herb','herb','crystal'];
  for(let i=0;i<260&&nodes.length<98;i++){const x=(rng()-.5)*270,z=(rng()-.5)*270;if(height(x,z)<1||LANDMARKS.some(l=>Math.hypot(x-l.x,z-l.z)<7)||nodes.some(n=>Math.hypot(x-n.x,z-n.z)<5))continue;node(types[i%types.length],x,z);}
  for(const b of BEACONS){node('crystal',b.x-12,b.z+9);node('crystal',b.x+9,b.z+11);node('herb',b.x-7,b.z+14);}
  for(const p of [{x:-68,z:27},{x:-119,z:32},{x:-90,z:-91},{x:5,z:-75},{x:127,z:4},{x:76,z:91},{x:-56,z:88},{x:111,z:-51}])node('chest',p.x,p.z);
  node('satchel',-111,0);
  const stats={wisp:{hp:34,damage:8,speed:3.5,xp:17,coins:5,range:2},wolf:{hp:56,damage:12,speed:4.9,xp:26,coins:8,range:2.25},sentinel:{hp:95,damage:17,speed:2.8,xp:43,coins:14,range:3},boss:{hp:480,damage:25,speed:3.65,xp:230,coins:130,range:6.8}};
  function enemy(kind,x,z,extra={}){enemies.push({id:'e'+enemies.length,kind,x,z,homeX:x,homeZ:z,...stats[kind],...extra});}
  for(let i=0;i<130&&enemies.length<34;i++){const x=(rng()-.5)*258,z=(rng()-.5)*257;if(height(x,z)<1.5||CAMPS.some(c=>Math.hypot(x-c.x,z-c.z)<25)||BEACONS.some(c=>Math.hypot(x-c.x,z-c.z)<14)||Math.hypot(x-TOWER.x,z-TOWER.z)<18)continue;const b=biome(x,z);enemy(b==='snow'||b==='ruins'?'sentinel':b==='forest'?'wolf':'wisp',x,z);}
  for(const b of BEACONS){enemy('sentinel',b.x-5,b.z+5,{guardFor:b.id});enemy('wisp',b.x+5,b.z-2,{guardFor:b.id});}
  enemy('boss',TOWER.x,TOWER.z+7,{boss:true});
  return{trees,rocks,nodes,enemies,decoration};
}
export const WORLD=makeWorld();
const costText=cost=>Object.entries(cost).map(([k,v])=>`${RESOURCE_NAMES[k]} ${v}`).join(' · ');
export function recipes(g){const w=g.state.weaponTier,a=g.state.armorTier;return[
  {id:'potion',name:'Травяной настой',desc:'Восстанавливает 55 здоровья.',icon:'potion',cost:{herb:3,wood:1}},
  {id:'sword',name:w>=3?'Меч улучшен до предела':`Улучшить меч · ${w+1} ступень`,desc:'Урон меча +9. Улучшение сохраняется.',icon:'sword',cost:{wood:6+w*4,ore:5+w*5,...(w>=1?{crystal:w*2}:{})},max:w>=3},
  {id:'bow',name:'Дорожный лук',desc:'Стреляет на расстоянии. Каждый выстрел расходует выносливость.',icon:'bow',cost:{wood:10,ore:4},max:g.state.bow},
  {id:'armor',name:a>=2?'Доспех улучшен до предела':`Укрепить доспех · ${a+1} ступень`,desc:'Каждый удар врага наносит на 3 меньше урона.',icon:'armor',cost:{wood:6+a*4,ore:9+a*6},max:a>=2}
].map(r=>({...r,costText:costText(r.cost),can:!r.max&&Object.entries(r.cost).every(([k,n])=>g.state.inventory[k]>=n)}));}
function defaults(){return{version:1,x:-42,z:64,hp:100,stamina:100,level:1,xp:0,inventory:{wood:0,ore:0,herb:0,crystal:0,coins:15,potions:3},weapon:'sword',weaponTier:0,armorTier:0,bow:false,elapsed:0,flags:{main:false,supplies:false,suppliesDone:false,satchel:false,satchelFound:false,satchelDone:false,huntReward:false,bossKilled:false,finished:false},beacons:[],camps:['bay'],lastCamp:'bay',explored:[],harvests:{},defeated:{},stats:{kills:0,chests:0,deaths:0,gathered:0},settings:{sound:false,quality:'high'}};}
export class Game{
  constructor(saved=null){this.state=defaults();this.events=[];this.cooldown=0;this.rollTime=0;this.invincible=0;this.regenDelay=0;this.attackAnim=0;this.heading=Math.PI;this.projectiles=[];this.time=0;this.stepCount=0;this.restore(saved);this.enemies=WORLD.enemies.map(e=>({...e,hp:e.hp,maxHp:e.hp,dead:this.state.defeated[e.id]!=null,mode:'idle',timer:0,cooldown:0,angle:0,hit:0}));this.explore();}
  get maxHp(){return 100+(this.state.level-1)*12+(this.state.flags.satchelDone?20:0);}
  get damage(){return 18+this.state.weaponTier*9+(this.state.level-1)*2;}
  get nextXp(){return this.state.level*65;}
  emit(type,data={}){this.events.push({type,...data});}
  message(text,error=false){this.emit('toast',{text,error});}
  drain(){return this.events.splice(0);}
  restore(saved){
    if(!saved||saved.version!==1)return;
    const s=this.state,num=(v,a,b,f)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,a,b):f;
    s.level=Math.floor(num(saved.level,1,30,1));s.x=num(saved.x,-175,175,-42);s.z=num(saved.z,-175,175,64);if(!walkable(s.x,s.z)){s.x=-42;s.z=64;}
    for(const k of Object.keys(s.flags))s.flags[k]=saved.flags?.[k]===true;
    for(const k of Object.keys(s.inventory))s.inventory[k]=Math.floor(num(saved.inventory?.[k],0,100000,s.inventory[k]));
    s.weaponTier=Math.floor(num(saved.weaponTier,0,3,0));s.armorTier=Math.floor(num(saved.armorTier,0,2,0));s.bow=saved.bow===true;s.weapon=saved.weapon==='bow'&&s.bow?'bow':'sword';s.hp=num(saved.hp,1,this.maxHp,this.maxHp);s.stamina=num(saved.stamina,0,100,100);s.xp=num(saved.xp,0,s.level*65-1,0);s.elapsed=num(saved.elapsed,0,1e8,0);
    s.beacons=BEACONS.filter(b=>Array.isArray(saved.beacons)&&saved.beacons.includes(b.id)).map(b=>b.id);
    s.camps=CAMPS.filter(c=>c.id==='bay'||(Array.isArray(saved.camps)&&saved.camps.includes(c.id))).map(c=>c.id);s.lastCamp=s.camps.includes(saved.lastCamp)?saved.lastCamp:'bay';
    s.explored=Array.isArray(saved.explored)?[...new Set(saved.explored.filter(v=>Number.isInteger(v)&&v>=0&&v<MAP_CELLS*MAP_CELLS))]:[];
    for(const n of WORLD.nodes){const v=saved.harvests?.[n.id];if(typeof v==='number'&&Number.isFinite(v))s.harvests[n.id]=clamp(v,0,s.elapsed);}
    for(const e of WORLD.enemies){const v=saved.defeated?.[e.id];if(typeof v==='number'&&Number.isFinite(v))s.defeated[e.id]=clamp(v,0,s.elapsed);}
    for(const k of Object.keys(s.stats))s.stats[k]=Math.floor(num(saved.stats?.[k],0,1e7,0));
    s.settings.sound=saved.settings?.sound===true;s.settings.quality=saved.settings?.quality==='low'?'low':'high';
  }
  snapshot(){return JSON.parse(JSON.stringify(this.state));}
  explore(){const s=this.state,cx=Math.floor((s.x+180)/10),cz=Math.floor((s.z+180)/10),known=new Set(s.explored);for(let z=cz-2;z<=cz+2;z++)for(let x=cx-2;x<=cx+2;x++)if(x>=0&&z>=0&&x<MAP_CELLS&&z<MAP_CELLS&&Math.hypot(x-cx,z-cz)<2.8)known.add(z*MAP_CELLS+x);s.explored=[...known];for(const c of CAMPS)if(dist(s,c)<11&&!s.camps.includes(c.id)){s.camps.push(c.id);this.message(`Найден привал: ${c.name}`);this.gainXp(30);this.emit('save');}}
  move(dx,dz){const s=this.state,can=(x,z)=>walkable(x,z)&&!WORLD.trees.some(t=>Math.hypot(t.x-x,t.z-z)<.68)&&!this.houseCollision(x,z);if(can(s.x+dx,s.z))s.x+=dx;if(can(s.x,s.z+dz))s.z+=dz;}
  houseCollision(x,z){return[{x:-55,z:39,w:3.8,d:3.1},{x:-30,z:36,w:3.1,d:3},{x:-53,z:59,w:3.5,d:3.1}].some(h=>Math.abs(x-h.x)<h.w&&Math.abs(z-h.z)<h.d);}
  tick(dt,input={}){
    dt=clamp(dt,0,.05);const s=this.state;s.elapsed+=dt;this.time+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.attackAnim=Math.max(0,this.attackAnim-dt);this.invincible=Math.max(0,this.invincible-dt);this.regenDelay=Math.max(0,this.regenDelay-dt);
    let mx=input.x||0,mz=input.z||0,len=Math.hypot(mx,mz);if(len>1){mx/=len;mz/=len;len=1;}
    const running=input.run&&s.stamina>3&&len>.1&&!isWater(s.x,s.z);let speed=isWater(s.x,s.z)?3:running?11:6.5;
    if(this.rollTime>0){this.rollTime-=dt;mx=Math.sin(this.heading);mz=Math.cos(this.heading);speed=21;len=1;}else if(len>.05)this.heading=Math.atan2(mx,mz);
    if(running){s.stamina=Math.max(0,s.stamina-dt*19);this.regenDelay=.45;}
    if(len>.02)this.move(mx*speed*dt,mz*speed*dt);
    if(this.regenDelay<=0)s.stamina=Math.min(100,s.stamina+dt*23);
    if(++this.stepCount%18===0)this.explore();
    for(const e of this.enemies){
      e.hit=Math.max(0,e.hit-dt);e.cooldown=Math.max(0,e.cooldown-dt);if(e.dead){if(!e.guardFor&&!e.boss&&s.elapsed-this.state.defeated[e.id]>240&&dist(s,{x:e.homeX,z:e.homeZ})>32){e.dead=false;e.hp=e.maxHp;e.x=e.homeX;e.z=e.homeZ;delete s.defeated[e.id];}continue;}
      if(e.boss&&(s.beacons.length<3||s.flags.bossKilled))continue;
      const d=dist(s,e),homeD=Math.hypot(e.x-e.homeX,e.z-e.homeZ);if(d>55&&e.mode==='idle')continue;
      if(e.mode==='windup'){e.timer-=dt;if(e.timer<=0){if(dist(s,e)<e.range+.75)this.hurt(e.damage,e);this.emit('enemyAttack',{enemy:e});e.mode='chase';e.cooldown=e.boss?1.05:1.35;}continue;}
      if(CAMPS.some(c=>dist(s,c)<11)){e.mode='return';}
      else if(d<(e.boss?27:15)&&homeD<(e.boss?27:28))e.mode='chase';
      else if(d>23||homeD>29)e.mode='return';
      if(e.mode==='chase'){
        e.angle=Math.atan2(s.x-e.x,s.z-e.z);
        if(d<e.range&&e.cooldown<=0){e.mode='windup';e.timer=e.boss?.92:.64;this.emit('windup',{enemy:e});}
        else if(d>e.range*.85){const sp=e.speed*(e.boss&&e.hp<e.maxHp*.5?1.35:1);this.moveEnemy(e,Math.sin(e.angle)*sp*dt,Math.cos(e.angle)*sp*dt);}
        if(e.boss&&e.hp<e.maxHp*.5){e.burst=(e.burst||0)+dt;if(e.burst>4.4){e.burst=0;for(let j=0;j<8;j++){const a=j*Math.PI/4;this.projectiles.push({x:e.x,z:e.z,vx:Math.sin(a)*12,vz:Math.cos(a)*12,life:3,hostile:true,damage:14,id:Math.random()});}this.emit('burst',{x:e.x,z:e.z});}}
      }else if(e.mode==='return'){if(homeD>1){e.angle=Math.atan2(e.homeX-e.x,e.homeZ-e.z);this.moveEnemy(e,Math.sin(e.angle)*e.speed*dt,Math.cos(e.angle)*e.speed*dt);}else{e.mode='idle';e.hp=Math.min(e.maxHp,e.hp+dt*10);}}
    }
    for(const p of this.projectiles){p.x+=p.vx*dt;p.z+=p.vz*dt;p.life-=dt;if(p.hostile){if(dist(p,s)<1.3){this.hurt(p.damage,p);p.life=0;}}else{const e=this.enemies.find(e=>this.enemyActive(e)&&dist(e,p)<(e.boss?2.5:1.25));if(e){this.hitEnemy(e,p.damage);p.life=0;}}}
    this.projectiles=this.projectiles.filter(p=>p.life>0);
  }
  moveEnemy(e,dx,dz){if(walkable(e.x+dx,e.z+dz)){e.x+=dx;e.z+=dz;}}
  enemyActive(e){return!e.dead&&(!e.boss||(this.state.beacons.length===3&&!this.state.flags.bossKilled));}
  inCombat(){return this.enemies.some(e=>this.enemyActive(e)&&e.mode!=='idle'&&dist(e,this.state)<20);}
  attack(aim=null){
    const s=this.state;if(this.cooldown>0||this.rollTime>0)return false;const bow=s.weapon==='bow'&&s.bow,cost=bow?17:7;if(s.stamina<cost)return false;
    s.stamina-=cost;this.regenDelay=.7;this.cooldown=bow?.68:.42;this.attackAnim=.28;
    const candidates=this.enemies.filter(e=>this.enemyActive(e)&&dist(e,s)<(bow?24:4.3)).sort((a,b)=>dist(a,s)-dist(b,s));
    if(candidates.length)this.heading=Math.atan2(candidates[0].x-s.x,candidates[0].z-s.z);else if(aim)this.heading=Math.atan2(aim.x-s.x,aim.z-s.z);
    this.emit('attack',{bow,x:s.x,z:s.z,angle:this.heading});
    if(bow)this.projectiles.push({x:s.x+Math.sin(this.heading),z:s.z+Math.cos(this.heading),vx:Math.sin(this.heading)*35,vz:Math.cos(this.heading)*35,damage:this.damage+7,life:1.1,id:Math.random()});
    else for(const e of candidates){const a=Math.atan2(e.x-s.x,e.z-s.z)-this.heading;if(Math.cos(a)>.05)this.hitEnemy(e,this.damage);}
    return true;
  }
  dodge(){const s=this.state;if(this.rollTime>0||s.stamina<24)return false;s.stamina-=24;this.regenDelay=.8;this.rollTime=.24;this.invincible=.4;this.emit('dodge',{x:s.x,z:s.z});return true;}
  hurt(amount,source){if(this.invincible>0)return;const s=this.state,n=Math.max(1,amount-s.armorTier*3);s.hp=Math.max(0,s.hp-n);this.invincible=.5;this.emit('hurt',{amount:n,x:s.x,z:s.z});if(s.hp===0)this.die();}
  hitEnemy(e,amount){e.hp-=amount;e.hit=.2;e.mode=e.mode==='windup'?'windup':'chase';this.emit('hit',{amount,x:e.x,z:e.z,kind:e.kind});if(e.hp<=0){e.hp=0;e.dead=true;this.state.defeated[e.id]=this.state.elapsed;this.state.stats.kills++;this.state.inventory.coins+=e.coins;if(e.kind==='sentinel'||e.boss)this.state.inventory.crystal+=e.boss?5:1;this.gainXp(e.xp);this.emit('kill',{x:e.x,z:e.z,kind:e.kind});if(e.boss){this.state.flags.bossKilled=true;this.message('Страж повержен. Поднимись к огню крепости.');this.emit('save');}if(this.state.stats.kills>=8&&!this.state.flags.huntReward){this.state.flags.huntReward=true;this.state.inventory.coins+=40;this.gainXp(65);this.message('Тропа без теней: +40 монет');}}}
  gainXp(n){const s=this.state;s.xp+=n;while(s.xp>=this.nextXp&&s.level<30){s.xp-=this.nextXp;s.level++;s.hp=this.maxHp;s.stamina=100;this.message(`Уровень ${s.level}. Здоровье и сила выросли.`);this.emit('level',{level:s.level});}}
  die(){const s=this.state,c=CAMPS.find(c=>c.id===s.lastCamp)||CAMPS[0],loss=Math.floor(s.inventory.coins*.15);s.inventory.coins-=loss;s.x=c.x+3;s.z=c.z+4;s.hp=this.maxHp;s.stamina=100;s.stats.deaths++;this.projectiles=[];this.rollTime=0;this.invincible=3;for(const e of this.enemies){if(!e.dead){e.x=e.homeX;e.z=e.homeZ;e.hp=e.maxHp;e.mode='idle';}}this.message(`Ты очнулся у костра. Потеряно монет: ${loss}.`,true);this.emit('respawn');this.emit('save');}
  nodeAvailable(n){const at=this.state.harvests[n.id];return at==null||(!['chest','satchel'].includes(n.type)&&this.state.elapsed-at>180);}
  nearest(){const s=this.state,list=[...NPCS.map(n=>({...n,kind:'npc'})),...CAMPS.map(c=>({...c,kind:'camp'})),...BEACONS.map(b=>({...b,kind:'beacon'})),{...TOWER,kind:'tower'},...WORLD.nodes.filter(n=>this.nodeAvailable(n)).map(n=>({...n,kind:'node'}))];return list.filter(n=>dist(s,n)<(n.kind==='beacon'||n.kind==='tower'?5:3.8)).sort((a,b)=>dist(a,s)-dist(b,s))[0]||null;}
  interactionLabel(n){if(!n)return'';if(n.kind==='npc')return`Поговорить · ${n.name}`;if(n.kind==='camp')return'Отдохнуть у костра';if(n.kind==='beacon')return this.state.beacons.includes(n.id)?'Маяк горит':`Зажечь маяк · 3 кристалла`;if(n.kind==='tower')return this.state.flags.finished?'Огонь крепости горит':'Огонь крепости';return{wood:'Собрать древесину',ore:'Добыть руду',herb:'Собрать травы',crystal:'Добыть кристаллы',chest:'Открыть сундук',satchel:'Подобрать сумку'}[n.type];}
  interact(){const n=this.nearest();if(!n)return false;const s=this.state;
    if(n.kind==='npc'){this.emit('dialog',{npc:n.id});return true;}
    if(n.kind==='camp'){this.emit('camp',{camp:n.id});return true;}
    if(n.kind==='beacon'){
      if(s.beacons.includes(n.id)){this.message('Этот маяк уже горит.');return false;}
      if(this.enemies.some(e=>e.guardFor===n.id&&!e.dead)){this.message('Сначала победи двух стражей маяка.',true);return false;}
      if(s.inventory.crystal<3){this.message('Для маяка нужны 3 кристалла.',true);return false;}
      s.inventory.crystal-=3;s.beacons.push(n.id);s.flags.main=true;s.inventory.coins+=35;this.gainXp(90);this.emit('beacon',{id:n.id,x:n.x,z:n.z});this.message(`${n.name} зажжён · ${s.beacons.length}/3`);if(s.beacons.length===3)this.message('Печать крепости снята. Страж прилива проснулся.');this.emit('save');return true;
    }
    if(n.kind==='tower'){if(s.flags.finished){this.message('Корабли снова видят берег. Можно продолжить исследование.');return false;}if(s.beacons.length<3){this.message('Огонь крепости запечатан. Зажги три маяка.',true);return false;}if(!s.flags.bossKilled){this.message('Огонь охраняет Страж прилива.',true);return false;}s.flags.finished=true;this.gainXp(200);s.inventory.coins+=200;this.emit('victory');this.emit('save');return true;}
    s.harvests[n.id]=s.elapsed;
    if(n.type==='chest'){s.inventory.coins+=25;s.inventory.crystal+=2;s.inventory.potions++;s.stats.chests++;this.gainXp(30);this.message('В сундуке: 25 монет, 2 кристалла и настой.');}
    else if(n.type==='satchel'){s.flags.satchelFound=true;this.message('Найдена сумка Нины. Верни её травнице у залива.');this.gainXp(25);}
    else{const amount={wood:3,ore:2,herb:2,crystal:2}[n.type];s.inventory[n.type]+=amount;s.stats.gathered+=amount;this.message(`+${amount} · ${RESOURCE_NAMES[n.type]}`);this.gainXp(4);}
    this.emit('gather',{x:n.x,z:n.z,kind:n.type,id:n.id});this.emit('save');return true;
  }
  usePotion(){const s=this.state;if(s.hp>=this.maxHp){this.message('Здоровье уже восстановлено.');return false;}if(s.inventory.potions<1){this.message('Настои закончились. Их можно сделать или купить.',true);return false;}s.inventory.potions--;const n=Math.min(55,this.maxHp-s.hp);s.hp+=n;this.emit('heal',{amount:n,x:s.x,z:s.z});this.emit('save');return true;}
  craft(id){const r=recipes(this).find(r=>r.id===id);if(!r?.can){this.message(r?.max?'Это улучшение уже готово.':'Не хватает материалов.',true);return false;}for(const[k,n]of Object.entries(r.cost))this.state.inventory[k]-=n;if(id==='potion')this.state.inventory.potions++;if(id==='sword')this.state.weaponTier++;if(id==='armor')this.state.armorTier++;if(id==='bow')this.state.bow=true;this.message(`${r.name} — готово.`);this.emit('craft');this.emit('save');return true;}
  selectWeapon(w){if(w==='bow'&&!this.state.bow){this.message('Сначала сделай лук в меню ремесла.');return false;}if(w!=='bow'&&w!=='sword')return false;this.state.weapon=w;return true;}
  npcAction(action){const s=this.state,i=s.inventory,f=s.flags;
    if(action==='main'&&!f.main){f.main=true;this.message('Маяки отмечены на карте. Кристаллы растут у скал.');this.gainXp(20);}
    if(action==='supplies')f.supplies=true;
    if(action==='deliverSupplies'){if(f.suppliesDone||!f.supplies||i.wood<12||i.ore<8){this.message('Нужны 12 древесины и 8 руды.',true);return false;}i.wood-=12;i.ore-=8;i.coins+=65;f.suppliesDone=true;this.gainXp(100);this.message('Запас к зиме: +65 монет.');}
    if(action==='satchel')f.satchel=true;
    if(action==='deliverSatchel'){if(!f.satchelFound||f.satchelDone)return false;f.satchelDone=true;i.potions+=3;this.gainXp(110);s.hp=this.maxHp;this.message('Сумка травницы: +20 к здоровью и 3 настоя.');}
    if(action==='buyPotion'){if(i.coins<12){this.message('Настой стоит 12 монет.',true);return false;}i.coins-=12;i.potions++;this.message('Куплен травяной настой.');}
    if(action==='sellOre'){if(i.ore<3){this.message('Для обмена нужны 3 руды.',true);return false;}i.ore-=3;i.coins+=10;this.message('Руда продана за 10 монет.');}
    this.emit('save');return true;
  }
  rest(id){const c=CAMPS.find(c=>c.id===id);if(!c||dist(c,this.state)>9)return false;const s=this.state;s.lastCamp=id;s.hp=this.maxHp;s.stamina=100;this.invincible=2;this.message('Ты отдохнул. Здесь начнётся путь после поражения.');this.emit('heal',{amount:0,x:s.x,z:s.z});this.emit('save');return true;}
  travel(id){const c=CAMPS.find(c=>c.id===id);if(!c||!this.state.camps.includes(id))return false;if(this.inCombat()){this.message('Сначала оторвись от врагов.',true);return false;}this.state.x=c.x+3;this.state.z=c.z+4;this.state.lastCamp=id;this.invincible=2;this.explore();this.emit('travel');this.message(c.name);this.emit('save');return true;}
  quest(){const s=this.state;if(!s.flags.main)return{title:'Огонь у залива',task:'Поговори с Марфой у костра',progress:'',target:NPCS[0]};if(s.beacons.length<3){const target=BEACONS.filter(b=>!s.beacons.includes(b.id)).sort((a,b)=>dist(a,s)-dist(b,s))[0];return{title:'Три огня',task:'Победи стражей и зажги маяки. Для каждого нужны 3 кристалла.',progress:`${s.beacons.length} / 3 МАЯКА`,target};}if(!s.flags.bossKilled)return{title:'Страж прилива',task:'Доберись до крепости на северо-востоке и победи стража.',progress:'ПЕЧАТЬ СНЯТА',target:TOWER};if(!s.flags.finished)return{title:'Огонь над морем',task:'Зажги главный маяк в крепости.',progress:'ПОСЛЕДНИЙ ОГОНЬ',target:TOWER};return{title:'Берег снова виден',task:'Исследуй остров и закончи оставшиеся поручения.',progress:'ПУТЬ ПРОЙДЕН',target:null};}
}

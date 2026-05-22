const W = 480, H = 640, SECS = 60, N_SQ = 5;
const FONT = 'Nunito, Arial';
const API = '__API_URL__';

const DOGS = [
  { name:'Aussie Doxie',    speed:148, catch:27, sStars:3, rStars:3, desc:'Balanced all-rounder',       body:0x9B5E2A, patch:0xF5ECD7, ear:0x4E2206, snout:0xC8864A },
  { name:'Golden Retriever',speed:142, catch:38, sStars:3, rStars:4, desc:'Wide reach, steady pace',    body:0xD4962A, patch:0xF0D060, ear:0xA06818, snout:0xB86830 },
  { name:'Dalmatian',       speed:192, catch:17, sStars:5, rStars:2, desc:'Blazing fast, get in close', body:0xEEEBE6, patch:0x222222, ear:0xD8D4CE, snout:0xE8E2D8 },
  { name:'Corgi',           speed:108, catch:48, sStars:2, rStars:5, desc:'Slow legs, massive reach',   body:0xD08040, patch:0xF5ECD7, ear:0x904018, snout:0xE09858 },
];

const SQUIRRELS = [
  { name:'Gray Squirrel',  region:'N. America', speed:88,  fleeR:140, erratic:0, diff:'Easy',   diffColor:0x44CC66, body:0x888890, tail:0xB0B0B8, belly:0xD8D8DC, desc:'Slow & predictable' },
  { name:'Red Squirrel',   region:'Europe',     speed:114, fleeR:158, erratic:1, diff:'Medium', diffColor:0xDDCC00, body:0x8B2200, tail:0xBB3A00, belly:0xE0AA70, desc:'Quick & twitchy' },
  { name:'Nihon Risu',     region:'Japan',      speed:142, fleeR:178, erratic:2, diff:'Hard',   diffColor:0xFF8822, body:0x3A2818, tail:0x6A4828, belly:0xC0A078, desc:'Fast & erratic' },
  { name:'Flying Squirrel',region:'SE Asia',    speed:128, fleeR:198, erratic:3, diff:'Expert', diffColor:0xFF3355, body:0x2C1810, tail:0x583828, belly:0xA87858, desc:'Glides away!' },
];

const BGS = [
  { name:'Sunny Backyard',  gTop:0x90CC80, gBot:0x3A7830, fence:0xC09050, fenceShad:0x7A5820, t1:0x58B050, t2:0x2A7828, trunk:0x9A5A28 },
  { name:'Autumn Park',     gTop:0xB89860, gBot:0x604820, fence:0x806040, fenceShad:0x483018, t1:0xCC5010, t2:0x882008, trunk:0x583010 },
  { name:'Snowy Yard',      gTop:0xE0EEF8, gBot:0xA8C8E0, fence:0x98B8D0, fenceShad:0x6888A8, t1:0x6898A8, t2:0x306878, trunk:0x908070 },
  { name:'Tropical Garden', gTop:0x28884A, gBot:0x0A4820, fence:0x409028, fenceShad:0x206010, t1:0x188840, t2:0x085828, trunk:0x4A2A10 },
];

const BG_ICONS = ['☀️','🍂','❄️','🌺']; // world decorative icons (single emoji, render fine)

const TREES = [[0.18,0.16],[0.78,0.24],[0.28,0.55],[0.68,0.65],[0.50,0.36],[0.12,0.74],[0.82,0.80]];

// Escalating streak tiers — index = combo count (null = no display)
const STREAKS = [
  null, null,
  { label:'DOUBLE!',      hex:'#AAFFAA', mult:1, announce:false },
  { label:'TRIPLE!',      hex:'#FFFF55', mult:2, announce:false },
  { label:'RAMPAGE!',     hex:'#FFB800', mult:2, announce:true  },
  { label:'ON FIRE!',     hex:'#FF7700', mult:3, announce:true  },
  { label:'UNSTOPPABLE!', hex:'#FF4400', mult:3, announce:true  },
  { label:'DOMINATING!',  hex:'#FF2266', mult:4, announce:true  },
  { label:'GODLIKE!',     hex:'#FF44FF', mult:4, announce:true  },
  { label:'LEGENDARY!',   hex:'#44FFFF', mult:5, announce:true  },
];

const POWERUPS = [
  { key:'speed',  emoji:'⚡', label:'SPEED BOOST!',    color:0xFFDD00, bg:0xAA8800, duration:6 },
  { key:'reach',  emoji:'🐾', label:'BIG PAWS!',       color:0xFF8800, bg:0xAA5500, duration:7 },
  { key:'freeze', emoji:'❄️', label:'FROZEN!',          color:0x66EEFF, bg:0x1188AA, duration:4 },
  { key:'time',   emoji:'⏰', label:'+10 SECONDS!',     color:0x44FF99, bg:0x118844, duration:0 },
  { key:'x2',     emoji:'⭐', label:'DOUBLE SCORE!',    color:0xFF66FF, bg:0xAA22AA, duration:8 },
  { key:'magnet', emoji:'🧲', label:'SQUIRREL MAGNET!', color:0xFF5555, bg:0xAA1111, duration:5 },
];

// ── Sprite drawing ────────────────────────────────────────────────────────────
function ol(g, a=0.20) { g.fillStyle(0x1A1010, a); }
function fl(g, c, a=1) { g.fillStyle(c, a); }

function drawDog(g, cfg) {
  g.fillStyle(0x000000,0.12); g.fillEllipse(34,55,52,13);
  if (cfg.name === 'Aussie Doxie') {
    ol(g); g.fillEllipse(26,31,46,22); ol(g); g.fillCircle(48,21,17);
    ol(g); g.fillEllipse(36,13,13,21); g.fillEllipse(55,12,13,21);
    ol(g); g.fillEllipse(62,26,14,10);
    fl(g,cfg.body); g.fillEllipse(26,31,41,18);
    fl(g,cfg.patch); g.fillEllipse(22,32,17,13);
    fl(g,cfg.body); g.fillCircle(48,21,14);
    fl(g,cfg.ear); g.fillEllipse(36,13,10,18); g.fillEllipse(55,12,10,18);
    fl(g,cfg.snout); g.fillEllipse(62,26,11,7);
    fl(g,cfg.patch,0.75); g.fillEllipse(47,18,7,9);
    ol(g); g.fillCircle(66,24,4); fl(g,0xFFFFFF,0.5); g.fillCircle(65,23,1.8);
    ol(g); g.fillCircle(52,18,4.5); fl(g,0xFFFFFF); g.fillCircle(54,17,2);
    ol(g,0.15); g.fillEllipse(6,27,11,8); fl(g,cfg.body); g.fillEllipse(6,27,8,6);
    fl(g,cfg.patch); g.fillCircle(12,40,4); g.fillCircle(22,41,4);
  } else if (cfg.name === 'Golden Retriever') {
    ol(g); g.fillEllipse(28,30,44,24); ol(g); g.fillCircle(50,21,17);
    ol(g); g.fillEllipse(36,16,13,21); g.fillEllipse(62,16,13,21);
    ol(g); g.fillEllipse(65,25,14,10);
    fl(g,cfg.body); g.fillEllipse(28,30,40,20);
    fl(g,cfg.patch,0.6); g.fillEllipse(25,32,20,14);
    fl(g,cfg.body); g.fillCircle(50,21,14);
    fl(g,cfg.ear); g.fillEllipse(36,16,10,18); g.fillEllipse(62,16,10,18);
    fl(g,cfg.patch,0.7); g.fillEllipse(65,25,11,7);
    ol(g); g.fillCircle(69,22,4); fl(g,0xFFFFFF,0.5); g.fillCircle(68,21,1.8);
    ol(g); g.fillCircle(54,18,4.5); fl(g,0xFFFFFF); g.fillCircle(56,17,2);
    ol(g,0.15); g.fillEllipse(7,24,14,8); fl(g,cfg.body); g.fillEllipse(7,24,11,6);
    fl(g,cfg.patch); g.fillCircle(12,40,4); g.fillCircle(24,41,4);
  } else if (cfg.name === 'Dalmatian') {
    ol(g); g.fillEllipse(26,30,44,22); ol(g); g.fillCircle(48,21,17);
    ol(g); g.fillEllipse(34,13,13,21); g.fillEllipse(56,12,13,21);
    ol(g); g.fillEllipse(62,25,14,10);
    fl(g,cfg.body); g.fillEllipse(26,30,40,18);
    fl(g,cfg.patch); g.fillCircle(18,26,5); g.fillEllipse(30,33,8,6); g.fillCircle(36,26,4);
    fl(g,cfg.body); g.fillCircle(48,21,14);
    fl(g,cfg.patch); g.fillCircle(44,16,5); g.fillCircle(53,13,3);
    fl(g,cfg.ear); g.fillEllipse(34,13,10,18); g.fillEllipse(56,12,10,18);
    fl(g,cfg.patch); g.fillCircle(36,16,3);
    fl(g,cfg.body); g.fillEllipse(62,25,11,7);
    ol(g); g.fillCircle(66,23,4); fl(g,0xFFFFFF,0.5); g.fillCircle(65,22,1.8);
    ol(g); g.fillCircle(52,18,4.5); fl(g,0xFFFFFF); g.fillCircle(54,17,2);
    ol(g,0.15); g.fillEllipse(6,25,12,7); fl(g,cfg.body); g.fillEllipse(6,25,9,5);
  } else {
    ol(g); g.fillEllipse(27,31,44,22); ol(g); g.fillCircle(49,21,17);
    ol(g); g.fillTriangle(33,14,26,1,40,14); g.fillTriangle(60,14,66,1,53,14);
    ol(g); g.fillEllipse(64,26,14,10);
    fl(g,cfg.body); g.fillEllipse(27,31,40,18);
    fl(g,cfg.patch); g.fillEllipse(23,33,18,13);
    fl(g,cfg.body); g.fillCircle(49,21,14);
    fl(g,cfg.body); g.fillTriangle(33,14,27,3,39,14); g.fillTriangle(60,14,65,3,54,14);
    fl(g,cfg.patch,0.6); g.fillTriangle(33,14,28,6,38,14); g.fillTriangle(60,14,64,6,55,14);
    fl(g,cfg.patch,0.85); g.fillEllipse(64,26,11,7);
    ol(g); g.fillCircle(68,23,4); fl(g,0xFFFFFF,0.5); g.fillCircle(67,22,1.8);
    ol(g); g.fillCircle(53,18,4.5); fl(g,0xFFFFFF); g.fillCircle(55,17,2);
    ol(g,0.15); g.fillCircle(7,26,6); fl(g,cfg.body); g.fillCircle(7,26,5);
    fl(g,cfg.patch); g.fillCircle(12,40,4); g.fillCircle(24,41,4);
  }
}

function drawSquirrel(g, cfg) {
  g.fillStyle(0x000000,0.10); g.fillEllipse(24,44,36,10);
  ol(g,0.14); g.fillEllipse(10,20,20,32);
  fl(g,cfg.tail,0.9); g.fillEllipse(10,20,16,28);
  fl(g,cfg.tail,0.5); g.fillEllipse(8,16,12,22);
  fl(g,0xFFFFFF,0.09); g.fillEllipse(7,17,6,14);
  ol(g,0.22); g.fillEllipse(26,25,24,20);
  fl(g,cfg.body); g.fillEllipse(26,25,20,16);
  fl(g,cfg.belly); g.fillEllipse(26,27,11,11);
  ol(g,0.22); g.fillCircle(32,14,12);
  fl(g,cfg.body); g.fillCircle(32,14,10);
  ol(g,0.15); g.fillTriangle(25,9,22,1,30,9); g.fillTriangle(36,9,33,1,40,9);
  fl(g,cfg.body); g.fillTriangle(26,9,23,3,29,9); g.fillTriangle(36,9,34,3,39,9);
  fl(g,cfg.belly,0.7); g.fillTriangle(26,9,24,5,28,9); g.fillTriangle(36,9,35,5,38,9);
  ol(g,0.22); g.fillCircle(36,13,5);
  fl(g,0x1A1010); g.fillCircle(36,13,4);
  fl(g,0xFFFFFF); g.fillCircle(37.5,12,2); fl(g,0xFFFFFF,0.35); g.fillCircle(35,14,1);
  fl(g,0xFF8899); g.fillCircle(39,17,2);
  fl(g,0xFF9999,0.15); g.fillCircle(38,18,5);
  ol(g,0.15); g.fillEllipse(28,34,9,6); g.fillEllipse(36,34,9,6);
  fl(g,cfg.body); g.fillEllipse(28,34,7,5); g.fillEllipse(36,34,7,5);
  fl(g,cfg.belly,0.5); g.fillEllipse(28,35,5,3); g.fillEllipse(36,35,5,3);
  if (cfg.name==='Flying Squirrel') { fl(g,cfg.belly,0.25); g.fillEllipse(18,22,12,18); }
}

function drawTree(g, t1, t2, trunk) {
  g.fillStyle(0x000000,0.09); g.fillEllipse(25,55,46,14);
  g.fillStyle(0x000000,0.4); g.fillRect(20,40,11,18);
  g.fillStyle(trunk); g.fillRect(21,40,9,18);
  g.fillStyle(0xFFFFFF,0.10); g.fillRect(22,40,3,16);
  g.fillStyle(t2,0.75); g.fillCircle(25,28,22);
  g.fillStyle(t1); g.fillCircle(25,22,19);
  g.fillStyle(t1,0.85); g.fillCircle(14,26,13); g.fillCircle(36,26,13);
  g.fillStyle(t1); g.fillCircle(25,18,14);
  g.fillStyle(0xFFFFFF,0.14); g.fillCircle(20,13,7);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    DOGS.forEach((c,i)=>{ const g=this.add.graphics(); drawDog(g,c); g.generateTexture('dog_'+i,76,58); g.destroy(); });
    SQUIRRELS.forEach((c,i)=>{ const g=this.add.graphics(); drawSquirrel(g,c); g.generateTexture('sq_'+i,52,46); g.destroy(); });
    BGS.forEach((b,i)=>{ const g=this.add.graphics(); drawTree(g,b.t1,b.t2,b.trunk); g.generateTexture('tree_'+i,50,60); g.destroy(); });

    const p=this.add.graphics();
    p.fillStyle(0x000000,0.22); p.fillCircle(7,5,5); p.fillCircle(14,3,4); p.fillCircle(18,6,4); p.fillCircle(16,11,4);
    p.generateTexture('paw',26,18); p.destroy();

    const gl=this.add.graphics();
    for(let r=30;r>0;r-=6){ gl.fillStyle(0xFFFFFF,0.034*(30/r)); gl.fillCircle(32,32,r); }
    gl.generateTexture('glow',64,64); gl.destroy();

    const sp=this.add.graphics();
    sp.fillStyle(0xFFFFFF,1); sp.fillCircle(5,5,5);
    sp.generateTexture('dot',10,10); sp.destroy();

    this.cameras.main.fadeIn(400,0,0,0);
    const hasName=!!localStorage.getItem('dogchase_name');
    this.time.delayedCall(400,()=>this.scene.start(hasName?'Select':'Name'));
  }
}

// ── Button helper ─────────────────────────────────────────────────────────────
function drawBtn(g, x, y, w, h, r, color, bColor=0xFFFFFF, bAlpha=0.35) {
  g.fillStyle(0x000000,0.22); g.fillRoundedRect(x+2,y+3,w,h,r);
  g.fillStyle(color,1); g.fillRoundedRect(x,y,w,h,r);
  g.fillStyle(0xFFFFFF,0.22); g.fillRoundedRect(x+2,y+2,w-4,h*0.44,{tl:r,tr:r,bl:0,br:0});
  g.lineStyle(1.5,bColor,bAlpha); g.strokeRoundedRect(x,y,w,h,r);
}

// ── Select Screen ─────────────────────────────────────────────────────────────
class SelectScene extends Phaser.Scene {
  constructor() { super('Select'); }

  create() {
    this.dogIdx = this.registry.get('dogIdx') ?? 0;
    this.sqIdx  = this.registry.get('sqIdx')  ?? 0;
    this.bgIdx  = this.registry.get('bgIdx')  ?? 0;
    // Only fade in on first load or world change — skip for dog/squirrel swaps
    if(!this.registry.get('_soft')) this.cameras.main.fadeIn(320,0,0,0);
    this.registry.set('_soft', false);
    this._drawBg();
    this._buildUI();
  }

  _drawBg() {
    // Warm sky gradient — menu-specific, not tied to game world
    const g = this.add.graphics().setDepth(0);
    g.fillGradientStyle(0x5588CC, 0x5588CC, 0x3A9060, 0x3A9060, 1);
    g.fillRect(0,0,W,H);
    // Subtle cloud puffs (decorative, not animated)
    g.fillStyle(0xFFFFFF,0.06);
    g.fillEllipse(80,55,130,38); g.fillEllipse(130,44,100,32); g.fillEllipse(105,62,80,26);
    g.fillEllipse(340,40,110,32); g.fillEllipse(385,32,90,26); g.fillEllipse(360,52,70,22);
    // Soft ground strip at bottom
    g.fillStyle(0x2A6838,0.55); g.fillRect(0,H-44,W,44);
    g.fillStyle(0x3A8848,0.4); g.fillRect(0,H-44,W,10);
  }

  _buildUI() {
    const hs = localStorage.getItem('dogchase_hs')||0;
    // Even card centres — 6px margins, 8px gaps, 108px cards
    const CX = [60, 180, 300, 420];
    const CHW = 54; // half-width

    // ── Title area ────────────────────────────────────────────────────────────
    // Drop-shadow for title text: draw same text offset in dark, then bright on top
    this.add.text(W/2+2, 30, 'DOG CHASE!',
      {fontSize:'36px',fill:'#1A3010',fontFamily:FONT,fontStyle:'900'}).setOrigin(0.5).setDepth(1);
    this.add.text(W/2, 28, 'DOG CHASE!',
      {fontSize:'36px',fill:'#FFF5DD',fontFamily:FONT,fontStyle:'900'}).setOrigin(0.5).setDepth(2);

    this.add.text(W/2, 66, 'Chase squirrels before time runs out!',
      {fontSize:'13px',fill:'#D4EEC8',fontFamily:FONT}).setOrigin(0.5).setDepth(2);
    if(parseInt(hs)>0){
      this.add.text(W/2, 83, `Best: ${hs} caught`,
        {fontSize:'12px',fill:'#FFE566',fontFamily:FONT,fontStyle:'bold'}).setOrigin(0.5).setDepth(2);
    }

    // Decorative divider
    const div = this.add.graphics().setDepth(2);
    div.lineStyle(1,0xFFFFFF,0.18); div.lineBetween(30,98,W-30,98);

    let y = 106;

    const secLabel = (txt, yy) =>
      this.add.text(W/2, yy, txt,
        {fontSize:'10.5px',fill:'#FFE566',fontFamily:FONT,fontStyle:'bold',letterSpacing:2}).setOrigin(0.5).setDepth(2);

    // ── Dog section ───────────────────────────────────────────────────────────
    secLabel('CHOOSE YOUR DOG', y);
    y += 13;

    DOGS.forEach((d,i) => {
      const cx = CX[i];
      const sel = i===this.dogIdx;
      const cg = this.add.graphics().setDepth(1);
      this._card(cg, cx-CHW, y, CHW*2, 86, sel);
      this.add.image(cx, y+38, 'dog_'+i).setScale(1.1).setDepth(3);
      this.add.text(cx, y+78, d.name,
        {fontSize:'9px',fill: sel?'#FFD766':'#E0E8D0',fontFamily:FONT,fontStyle:'bold'}).setOrigin(0.5).setDepth(3);
      this.add.rectangle(cx, y+43, CHW*2, 86, 0,0).setDepth(4).setInteractive({useHandCursor:true})
        .on('pointerdown',()=>{ this.dogIdx=i; this._refresh(); });
    });
    y += 100;

    const dg = DOGS[this.dogIdx];
    this.add.text(W/2, y,
      `${dg.desc}  ·  Spd ${'▸'.repeat(dg.sStars)}  Reach ${'●'.repeat(dg.rStars)}`,
      {fontSize:'11px',fill:'#C8DCBC',fontFamily:FONT}).setOrigin(0.5).setDepth(2);
    y += 18;

    // ── Squirrel section ──────────────────────────────────────────────────────
    y += 8;
    secLabel('CHOOSE YOUR SQUIRREL', y);
    y += 13;

    SQUIRRELS.forEach((s,i) => {
      const cx = CX[i];
      const sel = i===this.sqIdx;
      const cg = this.add.graphics().setDepth(1);
      this._card(cg, cx-CHW, y, CHW*2, 86, sel);
      this.add.image(cx, y+30, 'sq_'+i).setScale(1.0).setDepth(3);
      // Difficulty badge
      const dc = this.add.graphics().setDepth(3);
      dc.fillStyle(s.diffColor,0.9); dc.fillRoundedRect(cx-22,y+60,44,16,8);
      this.add.text(cx, y+68, s.diff,
        {fontSize:'9px',fill:'#fff',fontFamily:FONT,fontStyle:'bold'}).setOrigin(0.5).setDepth(4);
      this.add.text(cx, y+80, s.region,
        {fontSize:'8px',fill: sel?'#FFD766':'#C8DCBC',fontFamily:FONT}).setOrigin(0.5).setDepth(3);
      this.add.rectangle(cx, y+43, CHW*2, 86, 0,0).setDepth(5).setInteractive({useHandCursor:true})
        .on('pointerdown',()=>{ this.sqIdx=i; this._refresh(); });
    });
    y += 100;

    const sq = SQUIRRELS[this.sqIdx];
    this.add.text(W/2, y,
      `${sq.name}  ·  ${sq.region}  ·  ${sq.desc}`,
      {fontSize:'11px',fill:'#C8DCBC',fontFamily:FONT}).setOrigin(0.5).setDepth(2);
    y += 18;

    // ── World section ─────────────────────────────────────────────────────────
    y += 8;
    secLabel('CHOOSE YOUR WORLD', y);
    y += 13;

    BGS.forEach((bg,i) => {
      const cx = CX[i];
      const sel = i===this.bgIdx;
      const wg = this.add.graphics().setDepth(1);
      // Sky top half
      wg.fillStyle(bg.gTop, sel?1:0.7);
      wg.fillRoundedRect(cx-CHW, y, CHW*2, 22, {tl:9,tr:9,bl:0,br:0});
      // Ground bottom half
      wg.fillStyle(bg.gBot, sel?1:0.7);
      wg.fillRoundedRect(cx-CHW, y+22, CHW*2, 22, {tl:0,tr:0,bl:9,br:9});
      // Selected ring
      if(sel){ wg.lineStyle(2.5,0xFFD766,1); }
      else   { wg.lineStyle(1.5,0xFFFFFF,0.30); }
      wg.strokeRoundedRect(cx-CHW, y, CHW*2, 44, 9);
      // Icon
      this.add.text(cx, y+12, BG_ICONS[i], {fontSize:'13px'}).setOrigin(0.5).setDepth(3);
      this.add.text(cx, y+33, bg.name,
        {fontSize:'8px',fill:'#fff',stroke:'#000',strokeThickness:2,
         fontFamily:FONT,fontStyle:'bold',align:'center',wordWrap:{width:CHW*2-6}}).setOrigin(0.5).setDepth(3);
      this.add.rectangle(cx, y+22, CHW*2, 44, 0,0).setDepth(4).setInteractive({useHandCursor:true})
        .on('pointerdown',()=>{
          this.registry.set('bgIdx', i);
          this.cameras.main.fadeOut(180,0,0,0);
          this.time.delayedCall(180,()=>this.scene.restart());
        });
    });
    y += 52;

    // ── Play button ───────────────────────────────────────────────────────────
    y += 22;
    const PW=220, PH=58;
    const pbg = this.add.graphics().setDepth(2);
    drawBtn(pbg, W/2-PW/2, y, PW, PH, 29, 0xE89020, 0xFFD766, 0.9);
    this.add.text(W/2, y+PH/2, '▶   PLAY!',
      {fontSize:'28px',fill:'#fff',fontStyle:'900',fontFamily:FONT,
       stroke:'#7A3800',strokeThickness:2}).setOrigin(0.5).setDepth(3);
    this.add.rectangle(W/2, y+PH/2, PW, PH, 0,0).setDepth(4).setInteractive({useHandCursor:true})
      .on('pointerover', ()=>pbg.setAlpha(0.88))
      .on('pointerout',  ()=>pbg.setAlpha(1))
      .on('pointerdown', ()=>{
        this.registry.set('dogIdx',this.dogIdx);
        this.registry.set('sqIdx', this.sqIdx);
        this.registry.set('bgIdx', this.bgIdx);
        this.cameras.main.fadeOut(280,0,0,0);
        this.time.delayedCall(280,()=>this.scene.start('Game'));
      });

    this.add.text(W/2, y+PH+16, 'Drag finger or click to move  ·  WASD / arrows',
      {fontSize:'11px',fill:'#88AA80',fontFamily:FONT}).setOrigin(0.5).setDepth(2);

    // Leaderboard link
    const lbg=this.add.graphics().setDepth(2);
    drawBtn(lbg,W/2-80,y+PH+34,160,32,16,0x1A2A18,0xFFD766,0.35);
    this.add.text(W/2,y+PH+50,'🏆  Leaderboard',
      {fontSize:'13px',fill:'#FFD766',fontFamily:FONT,fontStyle:'bold'}).setOrigin(0.5).setDepth(3);
    this.add.rectangle(W/2,y+PH+50,160,32,0,0).setDepth(4).setInteractive({useHandCursor:true})
      .on('pointerdown',()=>{
        this.cameras.main.fadeOut(260,0,0,0);
        this.time.delayedCall(260,()=>this.scene.start('Leaderboard'));
      });
  }

  _card(g, x, y, w, h, selected) {
    if (selected) {
      g.fillStyle(0x000000,0.20); g.fillRoundedRect(x+2,y+2,w,h,10);
      g.fillStyle(0xFFFFFF,0.22); g.fillRoundedRect(x,y,w,h,10);
      g.lineStyle(2.5,0xFFD766,1); g.strokeRoundedRect(x,y,w,h,10);
      // Inner top shimmer
      g.fillStyle(0xFFFFFF,0.14); g.fillRoundedRect(x+2,y+2,w-4,h*0.35,{tl:10,tr:10,bl:0,br:0});
    } else {
      g.fillStyle(0x000000,0.18); g.fillRoundedRect(x,y,w,h,10);
      g.fillStyle(0xFFFFFF,0.12); g.fillRoundedRect(x,y,w,h,10);
      g.lineStyle(1.5,0xFFFFFF,0.28); g.strokeRoundedRect(x,y,w,h,10);
    }
  }

  _refresh() {
    this.registry.set('dogIdx', this.dogIdx);
    this.registry.set('sqIdx',  this.sqIdx);
    this.registry.set('bgIdx',  this.bgIdx);
    this.registry.set('_soft',  true); // skip fade-in flash on dog/squirrel swap
    this.scene.restart();
  }
}

// ── Game Scene ────────────────────────────────────────────────────────────────
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    this.dogCfg = DOGS[this.registry.get('dogIdx')??0];
    this.sqCfg  = SQUIRRELS[this.registry.get('sqIdx')??0];
    this.bgIdx  = this.registry.get('bgIdx')??0;
    this.bgCfg  = BGS[this.bgIdx];
    this.cameras.main.fadeIn(350,0,0,0);
    this.buildWorld(); this.buildDog(); this.buildSquirrels();
    this.buildUI(); this.buildInput(); this.buildPowerups();
    this.score=0; this.combo=0; this.comboTimer=0;
    this.timeLeft=SECS; this.difficulty=1.0; this.over=false;
    this._sessionToken=null;
    fetch(`${API}/session`).then(r=>r.json()).then(d=>{ this._sessionToken=d.token; }).catch(()=>{});
    this.time.addEvent({delay:1000,loop:true,callback:()=>{
      if(this.over) return;
      this.timeLeft=Math.max(0,this.timeLeft-1);
      const m=Math.floor(this.timeLeft/60),s=this.timeLeft%60;
      this.timerTxt.setText(`${m}:${s.toString().padStart(2,'0')}`);
      if(this.timeLeft<=10) this.timerTxt.setStyle({fill:'#FF7755',fontSize:'26px'});
      if(this.timeLeft===0) this.endGame();
    }});
  }

  buildWorld() {
    const b = this.bgCfg;
    const g = this.add.graphics().setDepth(0);
    g.fillGradientStyle(b.gTop,b.gTop,b.gBot,b.gBot,1); g.fillRect(0,0,W,H);
    const td = this.add.graphics().setDepth(1);
    td.fillStyle(0x000000,0.03);
    for(let x=0;x<W;x+=44) for(let y=0;y<H;y+=44)
      if((x/44+y/44)%2===0) td.fillRect(x,y,44,44);
    this.buildFence(b);
    this.trees = this.physics.add.staticGroup();
    TREES.forEach(([nx,ny])=>{
      const t=this.trees.create(nx*W,ny*H,'tree_'+this.bgIdx);
      t.setCircle(19,6,6); t.refreshBody();
    });
    this.startClouds(); this.startAmbient();
  }

  buildFence(b) {
    const f = this.add.graphics().setDepth(2);
    f.lineStyle(14,0x000000,0.18); f.strokeRect(9,9,W-18,H-18);
    f.lineStyle(9,b.fence,1); f.strokeRect(10,10,W-20,H-20);
    f.lineStyle(2,0xFFFFFF,0.20); f.strokeRect(12,12,W-24,H-24);
    for(let x=10;x<=W-10;x+=52){
      f.fillStyle(b.fenceShad); f.fillRect(x-4,5,10,14); f.fillRect(x-4,H-19,10,14);
      f.fillStyle(b.fence); f.fillRect(x-4,5,9,13); f.fillRect(x-4,H-19,9,13);
      f.fillStyle(0xFFFFFF,0.16); f.fillRect(x-2,6,3,10); f.fillRect(x-2,H-18,3,10);
    }
    for(let y=62;y<=H-62;y+=52){
      f.fillStyle(b.fenceShad); f.fillRect(5,y-4,14,10); f.fillRect(W-19,y-4,14,10);
      f.fillStyle(b.fence); f.fillRect(5,y-4,13,9); f.fillRect(W-19,y-4,13,9);
    }
  }

  startClouds() {
    const spawn=()=>{
      if(this.over) return;
      const cols=[0xFFFFFF,0xFFF0D0,0xE8F8FF,0xC8FFE8];
      const y=Phaser.Math.Between(25,160), sz=Phaser.Math.Between(50,110);
      const cg=this.add.graphics().setDepth(3);
      const a=Phaser.Math.FloatBetween(0.10,0.22);
      cg.fillStyle(cols[this.bgIdx],a);
      cg.fillEllipse(0,0,sz*0.7,sz*0.4); cg.fillEllipse(sz*.25,-sz*.18,sz*.6,sz*.4);
      cg.fillEllipse(sz*.55,0,sz*.65,sz*.38); cg.fillEllipse(sz*.28,sz*.06,sz*.5,sz*.28);
      cg.setPosition(-sz*0.8,y);
      const dur=Phaser.Math.Between(20000,34000);
      this.tweens.add({targets:cg,x:W+sz,duration:dur,ease:'Linear',
        onComplete:()=>{ cg.destroy(); if(!this.over) spawn(); }});
    };
    for(let i=0;i<3;i++) this.time.delayedCall(i*5000,spawn);
  }

  startAmbient() {
    const mote=(tint,minY,maxY,minD,maxD,sc)=>{
      if(this.over) return;
      const x=Phaser.Math.Between(20,W-20), y=Phaser.Math.Between(minY,maxY);
      const m=this.add.image(x,y,'dot').setTint(tint)
        .setScale(Phaser.Math.FloatBetween(sc*.6,sc))
        .setAlpha(Phaser.Math.FloatBetween(0.15,0.45)).setDepth(3);
      this.tweens.add({targets:m,y:y-Phaser.Math.Between(60,180),
        x:x+Phaser.Math.Between(-40,40),alpha:0,
        duration:Phaser.Math.Between(minD,maxD),onComplete:()=>m.destroy()});
    };
    if(this.bgIdx===0) this.time.addEvent({delay:350,loop:true,callback:()=>{ if(!this.over) mote(0xFFDD44,200,H,4000,8000,0.22); }});
    if(this.bgIdx===1){
      this.time.addEvent({delay:500,loop:true,callback:()=>{
        if(this.over) return;
        const leaf=this.add.text(Phaser.Math.Between(20,W-20),-10,['🍂','🍁','🍃'][Phaser.Math.Between(0,2)],
          {fontSize:`${Phaser.Math.Between(12,18)}px`}).setDepth(3).setAlpha(0.7);
        this.tweens.add({targets:leaf,y:H+20,x:leaf.x+Phaser.Math.Between(-70,70),
          angle:Phaser.Math.Between(-300,300),duration:Phaser.Math.Between(3500,6000),onComplete:()=>leaf.destroy()});
      }});
      this.time.addEvent({delay:180,loop:true,callback:()=>{ if(!this.over) mote(0xFF8833,H-80,H,1200,3000,0.16); }});
    }
    if(this.bgIdx===2) this.time.addEvent({delay:200,loop:true,callback:()=>{ if(!this.over) mote(0xDDEEFF,-10,0,3000,6000,0.28); }});
    if(this.bgIdx===3){
      this.time.addEvent({delay:650,loop:true,callback:()=>{
        if(this.over) return;
        const x=Phaser.Math.Between(30,W-30),y=Phaser.Math.Between(100,H-100);
        const fly=this.add.image(x,y,'glow').setScale(0.3).setTint(0x88FF44).setAlpha(0).setDepth(3);
        this.tweens.add({targets:fly,alpha:0.6,duration:500,yoyo:true,repeat:Phaser.Math.Between(1,3),
          onComplete:()=>{ this.tweens.add({targets:fly,x:x+Phaser.Math.Between(-50,50),y:y+Phaser.Math.Between(-50,50),alpha:0,duration:700,onComplete:()=>fly.destroy()}); }});
      }});
      const fl2=['🌺','🌸','🌼','🌻'];
      [[55,90],[395,110],[70,500],[410,555],[230,205],[345,430]].forEach(([x,y])=>
        this.add.text(x,y,fl2[Phaser.Math.Between(0,3)],{fontSize:`${Phaser.Math.Between(16,22)}px`}).setAlpha(0.65).setDepth(2));
    }
  }

  buildDog() {
    const key='dog_'+(this.registry.get('dogIdx')??0);
    this.dogShad=this.add.ellipse(W/2,H/2+12,44,12,0x000000,0.15).setDepth(3);
    this.dog=this.physics.add.image(W/2,H/2,key).setDepth(5);
    this.dog.setCollideWorldBounds(true); this.dog.setCircle(16,16,10);
    this.dog.setDrag(820); this.dog.setMaxVelocity(this.dogCfg.speed*2);
    this.physics.add.collider(this.dog,this.trees);
    this.idleTween=this.tweens.add({targets:this.dog,scaleY:0.94,duration:480,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    this.pawTimer=0;
  }

  buildSquirrels() {
    this.squirrels=this.physics.add.group(); this.sqData=[]; this.sqShads=[];
    for(let i=0;i<N_SQ;i++) this.spawnSquirrel(i);
    this.physics.add.collider(this.squirrels,this.trees);
    this.physics.add.collider(this.squirrels,this.squirrels);
  }

  spawnSquirrel(i) {
    let x,y,ok,tries=0;
    do{ ok=true; x=Phaser.Math.Between(55,W-55); y=Phaser.Math.Between(55,H-55);
      for(const[nx,ny]of TREES) if(Phaser.Math.Distance.Between(x,y,nx*W,ny*H)<68){ok=false;break;}
      if(ok&&this.dog&&Phaser.Math.Distance.Between(x,y,this.dog.x,this.dog.y)<115) ok=false;
    }while(!ok&&++tries<60);
    const shad=this.add.ellipse(x,y+9,32,9,0x000000,0.12).setDepth(3); this.sqShads[i]=shad;
    const sq=this.squirrels.create(x,y,'sq_'+(this.registry.get('sqIdx')??0)).setDepth(5);
    sq.setCollideWorldBounds(true); sq.setCircle(13,13,10); sq.setDrag(620);
    this.tweens.add({targets:sq,angle:Phaser.Math.Between(-4,4),duration:Phaser.Math.Between(380,620),
      yoyo:true,repeat:-1,ease:'Sine.easeInOut',delay:Phaser.Math.Between(0,600)});
    this.sqData[i]={sprite:sq,state:'wander',wTimer:0,wx:0,wy:0,catching:false,idx:i};
  }

  buildUI() {
    const tb=this.add.graphics().setDepth(10);
    tb.fillStyle(0x000000,0.48); tb.fillRect(0,0,W,48);
    tb.lineStyle(1,0xFFFFFF,0.1); tb.lineBetween(0,48,W,48);
    this.scoreTxt=this.add.text(18,8,'Score: 0',
      {fontSize:'23px',fill:'#FFF5DD',stroke:'#000',strokeThickness:3,fontFamily:FONT,fontStyle:'900'}).setDepth(11);
    this.timerTxt=this.add.text(W-18,8,'1:00',
      {fontSize:'23px',fill:'#FFF5DD',stroke:'#000',strokeThickness:3,fontFamily:FONT,fontStyle:'900'}).setOrigin(1,0).setDepth(11);
    this.comboTxt=this.add.text(W/2,10,'',
      {fontSize:'18px',fill:'#FFD766',stroke:'#000',strokeThickness:3,fontFamily:FONT,fontStyle:'900'}).setOrigin(0.5,0).setDepth(11).setAlpha(0);
    this.barkTxt=this.add.text(W/2,58,'',{fontSize:'28px'}).setOrigin(0.5).setDepth(12).setAlpha(0);
    const bb=this.add.graphics().setDepth(10);
    bb.fillStyle(0x000000,0.42); bb.fillRect(0,H-38,W,38);
    bb.lineStyle(1,0xFFFFFF,0.1); bb.lineBetween(0,H-38,W,H-38);
    this.effectSlots=[];
    for(let i=0;i<6;i++){
      const x=40+i*72;
      const bg=this.add.graphics().setDepth(11).setVisible(false);
      const txt=this.add.text(x,H-22,'',{fontSize:'11px',fill:'#fff',fontFamily:FONT,fontStyle:'bold'}).setOrigin(0.5).setDepth(12).setVisible(false);
      const bar=this.add.graphics().setDepth(12).setVisible(false);
      this.effectSlots.push({bg,txt,bar,x});
    }
    this.announceTxt=this.add.text(W/2,H/2-55,'',
      {fontSize:'34px',fill:'#fff',stroke:'#000',strokeThickness:6,fontFamily:FONT,fontStyle:'900',align:'center'})
      .setOrigin(0.5).setDepth(30).setAlpha(0);
  }

  buildInput() {
    this.cursors=this.input.keyboard.createCursorKeys();
    this.wasd=this.input.keyboard.addKeys('W,A,S,D');
    this.touch=null;

    // Touch target indicator — visible ring that appears where finger is
    this.touchRingOuter=this.add.circle(0,0,22,0xFFFFFF,0).setDepth(20).setStrokeStyle(2,0xFFFFFF,0.5).setVisible(false);
    this.touchRingInner=this.add.circle(0,0,6,0xFFFFFF,0.7).setDepth(20).setVisible(false);
    this.touchLine=this.add.graphics().setDepth(19);

    this.input.on('pointerdown',p=>{
      if(p.y < 52) return; // ignore taps on the top HUD bar
      this.touch={x:p.x,y:p.y};
      this.touchRingOuter.setPosition(p.x,p.y).setVisible(true).setAlpha(1).setScale(1);
      this.touchRingInner.setPosition(p.x,p.y).setVisible(true).setAlpha(1);
      this.tweens.killTweensOf(this.touchRingOuter);
      this.tweens.add({targets:this.touchRingOuter,scaleX:1.4,scaleY:1.4,alpha:0.6,duration:180,ease:'Power2'});
    });
    this.input.on('pointermove',p=>{
      if(!p.isDown) return;
      this.touch={x:p.x,y:p.y};
      this.touchRingOuter.setPosition(p.x,p.y);
      this.touchRingInner.setPosition(p.x,p.y);
    });
    this.input.on('pointerup',()=>{
      this.touch=null;
      this.tweens.killTweensOf(this.touchRingOuter);
      this.tweens.add({targets:[this.touchRingOuter,this.touchRingInner],alpha:0,duration:200,
        onComplete:()=>{ this.touchRingOuter.setVisible(false); this.touchRingInner.setVisible(false); }});
      this.touchLine.clear();
    });
  }

  buildPowerups() {
    this.puOnScreen=[]; this.effects={speed:0,reach:0,freeze:0,x2:0,magnet:0};
    this.time.delayedCall(9000,()=>{if(!this.over)this.spawnPowerup();});
    this.time.addEvent({delay:15000,loop:true,callback:()=>{
      if(!this.over&&this.puOnScreen.length<2) this.spawnPowerup();
    }});
  }

  spawnPowerup() {
    const cfg=POWERUPS[Phaser.Math.Between(0,POWERUPS.length-1)];
    let x,y,ok,tries=0;
    do{ ok=true; x=Phaser.Math.Between(65,W-65); y=Phaser.Math.Between(85,H-65);
      for(const[nx,ny]of TREES) if(Phaser.Math.Distance.Between(x,y,nx*W,ny*H)<78){ok=false;break;}
      if(ok&&this.dog&&Phaser.Math.Distance.Between(x,y,this.dog.x,this.dog.y)<90) ok=false;
    }while(!ok&&++tries<50);
    const g3=this.add.image(x,y,'glow').setScale(0.88).setTint(cfg.color).setAlpha(0.06).setDepth(5);
    const g2=this.add.image(x,y,'glow').setScale(0.62).setTint(cfg.color).setAlpha(0.12).setDepth(5);
    const g1=this.add.image(x,y,'glow').setScale(0.40).setTint(cfg.color).setAlpha(0.22).setDepth(5);
    const disc=this.add.circle(x,y,21,cfg.bg,0.96).setDepth(6);
    const lbl=this.add.text(x,y+1,cfg.emoji,{fontSize:'21px'}).setOrigin(0.5,0.5).setDepth(7);
    const spinRing=this.add.graphics().setDepth(5);
    const timerArc=this.add.graphics().setDepth(7);
    const PU_LIFE=16000;
    const spawnedAt=this.time.now;
    let angle=0;
    const spinTmr=this.time.addEvent({delay:18,loop:true,callback:()=>{
      // Spinning dot ring
      angle+=2.5; spinRing.clear();
      for(let d=0;d<360;d+=90){
        const a=(d+angle)*Math.PI/180;
        spinRing.fillStyle(cfg.color,0.7); spinRing.fillCircle(x+Math.cos(a)*30,y+Math.sin(a)*30,2.5);
      }
      // Depleting arc — tail chases head clockwise until it disappears
      timerArc.clear();
      const frac=Math.max(0,1-(this.time.now-spawnedAt)/PU_LIFE);
      if(frac>0.01){
        const urgent=frac<0.2;
        const flashAlpha=urgent?(0.55+0.45*Math.sin(this.time.now*0.018)):0.9;
        timerArc.lineStyle(3.5,cfg.color,flashAlpha);
        timerArc.beginPath();
        timerArc.arc(x,y,25,-Math.PI/2,-Math.PI/2+Math.PI*2*frac,false,0.02);
        timerArc.strokePath();
        if(urgent) disc.setAlpha(0.7+0.3*Math.sin(this.time.now*0.018));
        else disc.setAlpha(0.96);
      }
    }});
    const ft=this.tweens.add({targets:[disc,lbl,g1,g2,g3],y:`-=8`,duration:950,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    const pt=this.tweens.add({targets:[g1,g2,g3],alpha:'+=0.07',duration:750,yoyo:true,repeat:-1});
    const despawn=this.time.delayedCall(PU_LIFE,()=>this.removePowerup(pu,false));
    const pu={cfg,disc,lbl,g1,g2,g3,spinRing,timerArc,spinTmr,ft,pt,despawn,gone:false};
    this.puOnScreen.push(pu);
  }

  removePowerup(pu,collected){
    if(pu.gone) return; pu.gone=true;
    pu.pt.stop(); pu.ft.stop(); pu.despawn.remove();
    pu.spinTmr.remove(); pu.spinRing.destroy(); pu.timerArc.destroy();
    const objs=[pu.disc,pu.lbl,pu.g1,pu.g2,pu.g3];
    if(collected){
      this.tweens.add({targets:objs,scaleX:2.4,scaleY:2.4,alpha:0,duration:360,ease:'Power2',onComplete:()=>objs.forEach(o=>o.destroy())});
    } else {
      this.tweens.add({targets:objs,alpha:0,duration:320,onComplete:()=>objs.forEach(o=>o.destroy())});
    }
    this.puOnScreen=this.puOnScreen.filter(p=>p!==pu);
  }

  checkPowerups(){
    this.puOnScreen.forEach(pu=>{
      if(pu.gone) return;
      if(Phaser.Math.Distance.Between(this.dog.x,this.dog.y,pu.disc.x,pu.disc.y)<40)
        this.collectPowerup(pu);
    });
  }

  collectPowerup(pu){
    const cfg=pu.cfg; this.removePowerup(pu,true); this.sparkBurst(this.dog.x,this.dog.y,cfg.color,12);
    if(cfg.key==='time'){
      this.timeLeft=Math.min(this.timeLeft+10,SECS+30);
      const m=Math.floor(this.timeLeft/60),s=this.timeLeft%60;
      this.timerTxt.setText(`${m}:${s.toString().padStart(2,'0')}`).setStyle({fill:'#66FFAA'});
      this.time.delayedCall(1400,()=>this.timerTxt.setStyle({fill:'#FFF5DD',fontSize:'23px'}));
    } else { this.effects[cfg.key]=cfg.duration; }
    this.tweens.killTweensOf(this.announceTxt);
    this.announceTxt.setText(`${cfg.emoji}\n${cfg.label}`).setAlpha(1).setScale(1);
    this.tweens.add({targets:this.announceTxt,alpha:0,scaleX:1.2,scaleY:1.2,duration:1500,delay:750,ease:'Power2'});
    this.cameras.main.flash(260,(cfg.color>>16)&0xFF,(cfg.color>>8)&0xFF,cfg.color&0xFF,true);
  }

  sparkBurst(x,y,color,count=10){
    for(let i=0;i<count;i++){
      const a=(i/count)*Math.PI*2+Math.random()*0.6;
      const d=Phaser.Math.Between(22,58);
      const sp=this.add.image(x,y,'dot').setTint(color).setAlpha(1).setDepth(25)
        .setScale(Phaser.Math.FloatBetween(0.5,1.3));
      this.tweens.add({targets:sp,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,alpha:0,scaleX:0,scaleY:0,
        duration:Phaser.Math.Between(300,600),ease:'Power2',onComplete:()=>sp.destroy()});
    }
  }

  updateEffects(dt){
    let slot=0;
    for(const[key,timeLeft] of Object.entries(this.effects)){
      const sl=this.effectSlots[slot++];
      if(timeLeft>0){
        this.effects[key]=Math.max(0,timeLeft-dt);
        const cfg=POWERUPS.find(p=>p.key===key);
        const pct=this.effects[key]/cfg.duration;
        sl.bg.setVisible(true).clear();
        sl.bg.fillStyle(cfg.bg,0.88); sl.bg.fillRoundedRect(sl.x-31,H-35,62,24,8);
        sl.bg.lineStyle(1.5,cfg.color,0.7); sl.bg.strokeRoundedRect(sl.x-31,H-35,62,24,8);
        sl.txt.setVisible(true).setText(`${cfg.emoji} ${Math.ceil(this.effects[key])}s`);
        sl.bar.setVisible(true).clear();
        sl.bar.fillStyle(0x000000,0.3); sl.bar.fillRoundedRect(sl.x-28,H-14,56,4,2);
        sl.bar.fillStyle(cfg.color,0.9); sl.bar.fillRoundedRect(sl.x-28,H-14,56*pct,4,2);
      } else {
        sl.bg.setVisible(false).clear(); sl.txt.setVisible(false); sl.bar.setVisible(false).clear();
      }
    }
  }

  update(time,delta){
    if(this.over) return;
    const dt=delta/1000;
    this.updateEffects(dt); this.moveDog(dt); this.moveSquirrels(dt);
    this.checkCatches(); this.checkPowerups();
    this.dogShad.setPosition(this.dog.x+2,this.dog.y+13);
    this.sqData.forEach((d,i)=>{
      if(d?.sprite?.active&&this.sqShads[i]) this.sqShads[i].setPosition(d.sprite.x+1,d.sprite.y+10);
    });
    this.pawTimer-=dt;
    const vel=this.dog.body.velocity;
    const moving=Math.abs(vel.x)>28||Math.abs(vel.y)>28;
    if(moving&&this.pawTimer<=0){
      this.pawTimer=0.22;
      const pw=this.add.image(this.dog.x,this.dog.y,'paw').setAlpha(0.3).setDepth(2).setTint(0x000000);
      this.tweens.add({targets:pw,alpha:0,duration:950,onComplete:()=>pw.destroy()});
    }
    if(this.effects.speed>0&&moving&&Math.random()<0.4){
      const tr=this.add.image(this.dog.x,this.dog.y,'glow').setScale(0.28).setTint(0xFFDD44).setAlpha(0.45).setDepth(4);
      this.tweens.add({targets:tr,alpha:0,scaleX:0.1,scaleY:0.1,duration:280,onComplete:()=>tr.destroy()});
    }
    if(this.combo>0){this.comboTimer-=dt;if(this.comboTimer<=0){this.combo=0;this.comboTxt.setAlpha(0);}}
    // Draw dashed line from dog to touch target
    this.touchLine.clear();
    if(this.touch){
      const dx=this.touch.x-this.dog.x, dy=this.touch.y-this.dog.y;
      const dist=Math.hypot(dx,dy);
      if(dist>20){
        this.touchLine.lineStyle(1.5,0xFFFFFF,0.22);
        const steps=Math.floor(dist/12);
        for(let i=1;i<steps;i+=2){
          const t0=i/steps, t1=Math.min((i+1)/steps,1);
          this.touchLine.lineBetween(
            this.dog.x+dx*t0, this.dog.y+dy*t0,
            this.dog.x+dx*t1, this.dog.y+dy*t1
          );
        }
      }
    }
  }

  moveDog(dt){
    const k=this.cursors,w=this.wasd;
    let vx=0,vy=0;
    if(k.left.isDown||w.A.isDown) vx=-1; else if(k.right.isDown||w.D.isDown) vx=1;
    if(k.up.isDown||w.W.isDown) vy=-1; else if(k.down.isDown||w.S.isDown) vy=1;
    if(vx===0&&vy===0&&this.touch){
      const dx=this.touch.x-this.dog.x,dy=this.touch.y-this.dog.y;
      const d=Math.hypot(dx,dy);
      if(d>12){vx=dx/d;vy=dy/d;}else this.touch=null;
    }
    if(vx!==0&&vy!==0){vx*=0.707;vy*=0.707;}
    const speedMult=this.effects.speed>0?1.8:1;
    const spd=this.dogCfg.speed*speedMult;
    this.dog.setAcceleration(vx*spd*5,vy*spd*5); this.dog.setMaxVelocity(spd);
    if(vx<-0.1) this.dog.setFlipX(true); else if(vx>0.1) this.dog.setFlipX(false);
    const isMoving=vx!==0||vy!==0;
    if(!isMoving&&this.idleTween.paused) this.idleTween.resume();
    if(isMoving&&!this.idleTween.paused) this.idleTween.pause();
    if(this.effects.speed>0&&!this.dog.speedGlow){this.dog.speedGlow=true;this.dog.setTint(0xFFEE55);}
    else if(this.effects.speed<=0&&this.dog.speedGlow){this.dog.speedGlow=false;this.dog.clearTint();}
  }

  moveSquirrels(dt){
    const dx=this.dog.x,dy=this.dog.y;
    const sqCfg=this.sqCfg, spd=sqCfg.speed*this.difficulty, fleeR=sqCfg.fleeR;
    const frozen=this.effects.freeze>0, magnet=this.effects.magnet>0;
    this.sqData.forEach(d=>{
      if(!d||!d.sprite?.active||d.catching) return;
      const sq=d.sprite;
      if(frozen){sq.setVelocity(0,0);sq.setTint(0x99DDFF);return;}
      sq.clearTint();
      if(magnet){const a=Phaser.Math.Angle.Between(sq.x,sq.y,dx,dy);sq.setVelocity(Math.cos(a)*78,Math.sin(a)*78);return;}
      const dist=Phaser.Math.Distance.Between(sq.x,sq.y,dx,dy);
      if(dist<fleeR){
        d.state='flee';
        let angle=Phaser.Math.Angle.Between(dx,dy,sq.x,sq.y);
        angle+=(Math.random()-0.5)*[0,0.3,0.7,1.2][sqCfg.erratic];
        let dm=1; if(sqCfg.erratic===3&&Math.random()<0.02) dm=2.2;
        const fs=spd*(1+(1-dist/fleeR)*0.4)*dm;
        sq.setVelocity(Math.cos(angle)*fs,Math.sin(angle)*fs); sq.setFlipX(Math.cos(angle)<0);
      } else {
        d.state='wander'; d.wTimer-=dt;
        if(d.wTimer<=0){
          d.wTimer=Phaser.Math.FloatBetween(0.8,2.6);
          if(Math.random()<0.25){d.wx=0;d.wy=0;}
          else{const a=Math.random()*Math.PI*2;const ws=Phaser.Math.FloatBetween(25,58);d.wx=Math.cos(a)*ws;d.wy=Math.sin(a)*ws;}
        }
        sq.setVelocity(d.wx,d.wy);
        if(d.wx<-5)sq.setFlipX(true);else if(d.wx>5)sq.setFlipX(false);
      }
    });
  }

  checkCatches(){
    const catchR=this.dogCfg.catch*(this.effects.reach>0?2.3:1);
    if(this.effects.reach>0&&!this.reachRing){
      this.reachRing=this.add.circle(this.dog.x,this.dog.y,catchR).setStrokeStyle(2,0xFF8800,0.5).setFillStyle(0xFF8800,0.07).setDepth(4);
    } else if(this.effects.reach<=0&&this.reachRing){this.reachRing.destroy();this.reachRing=null;}
    if(this.reachRing) this.reachRing.setPosition(this.dog.x,this.dog.y);
    this.sqData.forEach((d,i)=>{
      if(!d||!d.sprite?.active||d.catching) return;
      if(Phaser.Math.Distance.Between(d.sprite.x,d.sprite.y,this.dog.x,this.dog.y)<catchR+8)
        this.catchSquirrel(d,i);
    });
  }

  catchSquirrel(d,i){
    d.catching=true;
    const sq=d.sprite,cx=sq.x,cy=sq.y;
    this.combo++; this.comboTimer=4;
    const tier=STREAKS[Math.min(this.combo,STREAKS.length-1)];
    const cMult=tier?tier.mult:1;
    const sMult=this.effects.x2>0?2:1;
    const pts=cMult*sMult;
    this.score+=pts; this.scoreTxt.setText('Score: '+this.score);
    this.difficulty=1+Math.floor(this.score/5)*0.08;
    if(tier){
      // Scale text up slightly at higher tiers
      const scale=1+Math.min(this.combo-2,7)*0.08;
      this.comboTxt
        .setText(tier.label)
        .setStyle({fill:tier.hex,fontSize:'18px',stroke:'#000',strokeThickness:3,fontFamily:FONT,fontStyle:'900'})
        .setAlpha(1).setScale(scale);
      this.tweens.killTweensOf(this.comboTxt);
      this.tweens.add({targets:this.comboTxt,alpha:0,duration:1200,delay:1600});
      // Big screen announcement for high-tier streaks
      if(tier.announce){
        this.tweens.killTweensOf(this.announceTxt);
        this.announceTxt.setText(tier.label).setStyle({fill:tier.hex,fontSize:'38px',stroke:'#000',strokeThickness:7,fontFamily:FONT,fontStyle:'900'}).setAlpha(1).setScale(1);
        this.tweens.add({targets:this.announceTxt,alpha:0,scaleX:1.3,scaleY:1.3,duration:1400,delay:600,ease:'Power2'});
        if(this.combo>=7) this.cameras.main.flash(200,(parseInt(tier.hex.slice(1,3),16)),(parseInt(tier.hex.slice(3,5),16)),(parseInt(tier.hex.slice(5,7),16)),true);
      }
    }
    const col=pts>=6?'#FF7744':pts>=4?'#FFD700':pts>=2?'#FFE888':'#FFFFFF';
    const pop=this.add.text(cx,cy-14,`+${pts}${cMult>1?` ×${cMult}`:''}${sMult>1?' ⭐':''}`,
      {fontSize:pts>=4?'30px':'22px',fill:col,stroke:'#000',strokeThickness:4,fontFamily:FONT,fontStyle:'900'})
      .setOrigin(0.5).setDepth(22);
    this.tweens.add({targets:pop,y:cy-68,alpha:0,scaleX:1.25,scaleY:1.25,duration:950,ease:'Power2',onComplete:()=>pop.destroy()});
    this.sparkBurst(cx,cy,0xFFDD44,14);
    const emoji=['🐾','🦴','✨','💨','🎯'][Phaser.Math.Between(0,4)];
    this.barkTxt.setText(emoji).setAlpha(1).setPosition(cx,cy-30);
    this.tweens.add({targets:this.barkTxt,alpha:0,y:this.barkTxt.y-22,duration:650});
    this.tweens.add({targets:sq,alpha:0,duration:80,yoyo:true,repeat:3,onComplete:()=>{
      sq.setAlpha(1); if(this.sqShads[i]) this.sqShads[i].setAlpha(0.12);
      let x,y,ok,tries=0;
      do{ok=true;x=Phaser.Math.Between(55,W-55);y=Phaser.Math.Between(55,H-55);
        for(const[nx,ny]of TREES) if(Phaser.Math.Distance.Between(x,y,nx*W,ny*H)<68){ok=false;break;}
        if(ok&&Phaser.Math.Distance.Between(x,y,this.dog.x,this.dog.y)<135) ok=false;
      }while(!ok&&++tries<60);
      sq.setPosition(x,y); sq.setVelocity(0,0); d.catching=false;
    }});
    this.cameras.main.shake(90+cMult*40,0.0025+cMult*0.002);
  }

  async endGame(){
    if(this.over) return; this.over=true;
    const hs=parseInt(localStorage.getItem('dogchase_hs')||0);
    const newBest=this.score>hs;
    if(newBest) localStorage.setItem('dogchase_hs',this.score);
    // Submit score to leaderboard (fire and forget — game over proceeds regardless)
    const playerName=localStorage.getItem('dogchase_name');
    if(playerName&&this._sessionToken){
      fetch(`${API}/scores`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          token:this._sessionToken,
          playerName,
          score:this.score,
          dog:this.dogCfg.name,
          squirrel:this.sqCfg.name,
        })
      }).catch(()=>{});
    }
    this.cameras.main.fadeOut(480,0,0,0);
    this.time.delayedCall(480,()=>this.scene.start('GameOver',{score:this.score,hs:Math.max(this.score,hs),newBest,playerName}));
  }
}

// ── Game Over ─────────────────────────────────────────────────────────────────
class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }
  init(d){this.final=d.score;this.hs=d.hs;this.newBest=d.newBest;this.playerName=d.playerName||'';}
  create(){
    const bgIdx=this.registry.get('bgIdx')??0, b=BGS[bgIdx];
    this.cameras.main.fadeIn(480,0,0,0);
    const g=this.add.graphics();
    g.fillGradientStyle(b.gTop,b.gTop,b.gBot,b.gBot,1); g.fillRect(0,0,W,H);
    g.fillStyle(0x000000,0.52); g.fillRect(0,0,W,H);
    const cg=this.add.graphics().setDepth(1);
    cg.fillStyle(0x1A1A1A,0.6); cg.fillRoundedRect(22,28,W-44,H-56,18);
    cg.lineStyle(2,0xFFD766,0.55); cg.strokeRoundedRect(22,28,W-44,H-56,18);
    cg.fillStyle(0xFFD766,0.8); cg.fillRoundedRect(22,28,W-44,5,{tl:18,tr:18,bl:0,br:0});

    this.add.text(W/2,72,"Time's Up!",
      {fontSize:'36px',fill:'#FFF5DD',stroke:'#2A1800',strokeThickness:4,fontFamily:FONT,fontStyle:'900'}).setOrigin(0.5).setDepth(2);

    // NEW BEST badge — sits below title, above dog
    if(this.newBest){
      const nbg=this.add.graphics().setDepth(2);
      nbg.fillStyle(0xFFCC00,1); nbg.fillRoundedRect(W/2-76,94,152,30,15);
      nbg.lineStyle(2,0xFFAA00,1); nbg.strokeRoundedRect(W/2-76,94,152,30,15);
      const nb=this.add.text(W/2,109,'★  NEW BEST!  ★',
        {fontSize:'15px',fill:'#3A1800',fontFamily:FONT,fontStyle:'900'}).setOrigin(0.5).setDepth(3);
      this.tweens.add({targets:[nbg,nb],scaleX:1.05,scaleY:1.05,duration:550,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    }

    // Dog — center at 192 (top=140, clear of badge bottom 124)
    const dogIdx=this.registry.get('dogIdx')??0;
    const dog=this.add.image(W/2,192,'dog_'+dogIdx).setScale(1.8).setDepth(2);
    this.tweens.add({targets:dog,y:182,duration:1000,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    this.add.ellipse(W/2,245,42,11,0x000000,0.15).setDepth(1);

    // Score box — top at 252 (dog bottom=244, 8px gap)
    const sb=this.add.graphics().setDepth(2);
    sb.fillStyle(0xFFD766,0.13); sb.fillRoundedRect(W/2-88,252,176,82,14);
    sb.lineStyle(2,0xFFD766,0.5); sb.strokeRoundedRect(W/2-88,252,176,82,14);
    this.add.text(W/2,289,`${this.final}`,
      {fontSize:'62px',fill:'#FFD766',stroke:'#2A1800',strokeThickness:5,fontFamily:FONT,fontStyle:'900'}).setOrigin(0.5).setDepth(3);
    this.add.text(W/2,325,'SQUIRRELS CAUGHT',
      {fontSize:'11px',fill:'#C8A870',fontFamily:FONT,fontStyle:'bold',letterSpacing:2}).setOrigin(0.5).setDepth(3);
    this.add.text(W/2,344,`All-time best: ${this.hs}`,
      {fontSize:'12px',fill:'#9A9080',fontFamily:FONT}).setOrigin(0.5).setDepth(3);

    const msg=this.final>=12?'Unstoppable chaser! 🏆':this.final>=8?'Amazing dog! 🌟':
              this.final>=5?'Good pup! 🦴':this.final>=2?'Keep chasing! 🐾':'Sneaky squirrels! 🐿️';
    this.add.text(W/2,348,msg,{fontSize:'17px',fill:'#EEE0C8',fontFamily:FONT,fontStyle:'bold'}).setOrigin(0.5).setDepth(2);

    // Squirrel parade
    const sqIdx=this.registry.get('sqIdx')??0;
    const paradeCount = Math.min(this.final, 7);
    for(let i=0;i<paradeCount;i++){
      const startX = -20 + i * 22;
      const rowY = 372 + (i%2)*16;
      const sq=this.add.image(startX, rowY, 'sq_'+sqIdx).setScale(1.0).setDepth(2);
      this.tweens.add({targets:sq,x:startX+Phaser.Math.Between(360,480),
        duration:Phaser.Math.Between(2400,4000),repeat:-1,delay:i*200});
    }

    const pbg=this.add.graphics().setDepth(2);
    drawBtn(pbg,W/2-112,432,224,56,28,0xE89020,0xFFD766,0.85);
    this.add.text(W/2,460,'▶  PLAY AGAIN',
      {fontSize:'24px',fill:'#fff',fontStyle:'900',fontFamily:FONT,stroke:'#804000',strokeThickness:2}).setOrigin(0.5).setDepth(3);
    const pz=this.add.rectangle(W/2,460,224,56,0,0).setDepth(4).setInteractive({useHandCursor:true});
    pz.on('pointerover',()=>pbg.setAlpha(0.85)); pz.on('pointerout',()=>pbg.setAlpha(1));
    pz.on('pointerdown',()=>{this.cameras.main.fadeOut(280,0,0,0);this.time.delayedCall(280,()=>this.scene.start('Game'));});

    const sbg=this.add.graphics().setDepth(2);
    drawBtn(sbg,W/2-112,502,224,44,22,0x444444,0xFFFFFF,0.2);
    this.add.text(W/2,524,'CHANGE SETUP',
      {fontSize:'17px',fill:'#DDD8C8',fontFamily:FONT,fontStyle:'bold'}).setOrigin(0.5).setDepth(3);
    const sz=this.add.rectangle(W/2,524,224,44,0,0).setDepth(4).setInteractive({useHandCursor:true});
    sz.on('pointerdown',()=>{this.cameras.main.fadeOut(280,0,0,0);this.time.delayedCall(280,()=>this.scene.start('Select'));});

    // Leaderboard snippet — top 3 all-time
    const lbBox=this.add.graphics().setDepth(2);
    lbBox.fillStyle(0xFFFFFF,0.04); lbBox.fillRoundedRect(22,554,W-44,56,10);
    lbBox.lineStyle(1,0xFFFFFF,0.12); lbBox.strokeRoundedRect(22,554,W-44,56,10);
    const lbTitle=this.add.text(W/2,562,'ALL-TIME TOP 3',{fontSize:'9px',fill:'#667766',fontFamily:FONT,fontStyle:'bold',letterSpacing:2}).setOrigin(0.5).setDepth(3);
    const lbLoading=this.add.text(W/2,578,'Loading...',{fontSize:'11px',fill:'#556655',fontFamily:FONT}).setOrigin(0.5).setDepth(3);
    this.add.rectangle(W/2,582,W-44,56,0,0).setDepth(4).setInteractive({useHandCursor:true})
      .on('pointerdown',()=>{
        this.cameras.main.fadeOut(260,0,0,0);
        this.time.delayedCall(260,()=>this.scene.start('Leaderboard',{highlightScore:this.final,highlightName:this.playerName}));
      });
    fetch(`${API}/scores?period=alltime&limit=3`).then(r=>r.json()).then(data=>{
      lbLoading.destroy();
      const scores=data.scores||[];
      if(!scores.length){ this.add.text(W/2,578,'No scores yet!',{fontSize:'11px',fill:'#556655',fontFamily:FONT}).setOrigin(0.5).setDepth(3); return; }
      const medals=['🥇','🥈','🥉'];
      scores.forEach((s,i)=>{
        const x=52+i*(W-44)/3;
        const isMe=s.playerName===this.playerName;
        this.add.text(x,568,`${medals[i]} ${s.score}`,{fontSize:'12px',fill:isMe?'#FFD766':'#C8D8A8',fontFamily:FONT,fontStyle:'900'}).setOrigin(0.5).setDepth(3);
        this.add.text(x,584,s.playerName.slice(0,10),{fontSize:'9px',fill:isMe?'#FFD766':'#667766',fontFamily:FONT}).setOrigin(0.5).setDepth(3);
      });
    }).catch(()=>{ lbLoading.setText('Tap to see leaderboard'); });

    this.input.keyboard.once('keydown-SPACE',()=>{this.cameras.main.fadeOut(280,0,0,0);this.time.delayedCall(280,()=>this.scene.start('Game'));});
    this.input.keyboard.once('keydown-ENTER',()=>{this.cameras.main.fadeOut(280,0,0,0);this.time.delayedCall(280,()=>this.scene.start('Game'));});
  }
}

// ── Fun name generator ────────────────────────────────────────────────────────
const ADJ=['Swift','Brave','Sneaky','Fluffy','Mighty','Zippy','Fuzzy','Turbo','Lucky','Sly'];
const NOU=['Corgi','Doxie','Chaser','Dasher','Pouncer','Fetcher','Sprinter','Catcher','Hound','Pup'];
function genName(){ return ADJ[Math.floor(Math.random()*ADJ.length)]+NOU[Math.floor(Math.random()*NOU.length)]+Math.floor(Math.random()*99+1); }

// ── Name Entry Scene ──────────────────────────────────────────────────────────
class NameScene extends Phaser.Scene {
  constructor(){ super('Name'); }
  create(){
    this.cameras.main.fadeIn(300,0,0,0);
    const g=this.add.graphics();
    g.fillStyle(0x0d1117,1); g.fillRect(0,0,W,H);
    const cg=this.add.graphics().setDepth(1);
    cg.fillStyle(0x1A1A2E,0.95); cg.fillRoundedRect(W/2-170,H/2-170,340,320,18);
    cg.lineStyle(2,0xFFD766,0.6); cg.strokeRoundedRect(W/2-170,H/2-170,340,320,18);

    this.add.text(W/2,H/2-130,'WHO ARE YOU?',
      {fontSize:'22px',fill:'#FFD766',fontFamily:FONT,fontStyle:'900',stroke:'#000',strokeThickness:3}).setOrigin(0.5).setDepth(2);
    this.add.text(W/2,H/2-100,'Enter your name for the leaderboard',
      {fontSize:'12px',fill:'#AAB8A0',fontFamily:FONT}).setOrigin(0.5).setDepth(2);

    // Name input using DOM
    this.nameInput = this.add.dom(W/2, H/2-55).createFromHTML(
      `<input id="nameInput" type="text" maxlength="20" placeholder="Your name..."
       style="width:240px;padding:10px 14px;font-size:18px;font-family:Nunito,Arial;
       border-radius:10px;border:2px solid #FFD766;background:#0d1117;color:#FFF5DD;
       text-align:center;outline:none;" />`
    ).setDepth(3);

    const savedName = localStorage.getItem('dogchase_name') || '';
    if(savedName) this.nameInput.getChildByID('nameInput').value = savedName;

    // Generate button
    const gbg=this.add.graphics().setDepth(2);
    drawBtn(gbg,W/2-110,H/2+5,220,40,20,0x334455,0xAABBCC,0.4);
    this.add.text(W/2,H/2+25,'🎲  Generate a name',
      {fontSize:'13px',fill:'#AACCEE',fontFamily:FONT,fontStyle:'bold'}).setOrigin(0.5).setDepth(3);
    this.add.rectangle(W/2,H/2+25,220,40,0,0).setDepth(4).setInteractive({useHandCursor:true})
      .on('pointerdown',()=>{
        const n=genName();
        this.nameInput.getChildByID('nameInput').value=n;
      });

    // Play button
    const pbg=this.add.graphics().setDepth(2);
    drawBtn(pbg,W/2-110,H/2+60,220,52,26,0xE89020,0xFFD766,0.9);
    this.add.text(W/2,H/2+86,'▶  LET\'S GO!',
      {fontSize:'22px',fill:'#fff',fontStyle:'900',fontFamily:FONT,stroke:'#7A3800',strokeThickness:2}).setOrigin(0.5).setDepth(3);
    this.add.rectangle(W/2,H/2+86,220,52,0,0).setDepth(4).setInteractive({useHandCursor:true})
      .on('pointerdown',()=>this._submit());
    this.input.keyboard.once('keydown-ENTER',()=>this._submit());
  }
  _submit(){
    const raw=this.nameInput.getChildByID('nameInput').value.trim();
    const name=raw||genName();
    localStorage.setItem('dogchase_name',name);
    this.cameras.main.fadeOut(280,0,0,0);
    this.time.delayedCall(280,()=>this.scene.start('Select'));
  }
}

// ── Leaderboard Scene ─────────────────────────────────────────────────────────
class LeaderboardScene extends Phaser.Scene {
  constructor(){ super('Leaderboard'); }
  init(d){ this.highlightScore=d?.highlightScore||null; this.highlightName=d?.highlightName||null; }
  create(){
    this.cameras.main.fadeIn(320,0,0,0);
    this.period='alltime';
    this._drawBg();
    this._buildUI();
    this._load();
  }
  _drawBg(){
    const g=this.add.graphics().setDepth(0);
    g.fillGradientStyle(0x0d1117,0x0d1117,0x1A2A18,0x1A2A18,1); g.fillRect(0,0,W,H);
    g.fillStyle(0xFFD766,0.04); g.fillRect(0,0,W,H);
  }
  _buildUI(){
    // Title
    this.add.text(W/2+2,38,'LEADERBOARD',{fontSize:'30px',fill:'#1A1000',fontFamily:FONT,fontStyle:'900'}).setOrigin(0.5).setDepth(1);
    this.add.text(W/2,36,'LEADERBOARD',{fontSize:'30px',fill:'#FFD766',fontFamily:FONT,fontStyle:'900'}).setOrigin(0.5).setDepth(2);

    // Period tabs
    const tabs=[['alltime','All‑Time'],['weekly','This Week'],['daily','Today']];
    this.tabBtns=[];
    tabs.forEach(([key,label],i)=>{
      const x=80+i*160;
      const tbg=this.add.graphics().setDepth(2);
      const ttxt=this.add.text(x,76,label,{fontSize:'12px',fontFamily:FONT,fontStyle:'bold'}).setOrigin(0.5).setDepth(3);
      const thit=this.add.rectangle(x,76,144,28,0,0).setDepth(4).setInteractive({useHandCursor:true})
        .on('pointerdown',()=>{ this.period=key; this._updateTabs(); this._load(); });
      this.tabBtns.push({key,tbg,ttxt,thit});
    });
    this._updateTabs();

    // Rows container
    this.rowContainer=this.add.container(0,0).setDepth(2);

    // Loading text
    this.loadingTxt=this.add.text(W/2,300,'Loading...',
      {fontSize:'16px',fill:'#AAB8A0',fontFamily:FONT}).setOrigin(0.5).setDepth(3);

    // Back button
    const bbg=this.add.graphics().setDepth(2);
    drawBtn(bbg,W/2-100,H-70,200,44,22,0x333333,0xFFFFFF,0.2);
    this.add.text(W/2,H-48,'← BACK',{fontSize:'16px',fill:'#CCC8B8',fontFamily:FONT,fontStyle:'bold'}).setOrigin(0.5).setDepth(3);
    this.add.rectangle(W/2,H-48,200,44,0,0).setDepth(4).setInteractive({useHandCursor:true})
      .on('pointerdown',()=>{
        this.cameras.main.fadeOut(260,0,0,0);
        this.time.delayedCall(260,()=>this.scene.start('Select'));
      });
  }
  _updateTabs(){
    this.tabBtns.forEach(({key,tbg,ttxt})=>{
      const sel=key===this.period;
      tbg.clear();
      if(sel){ tbg.fillStyle(0xFFD766,0.18); tbg.fillRoundedRect(tbg.x||0,62,144,28,8); }
      tbg.lineStyle(1.5,sel?0xFFD766:0xFFFFFF,sel?0.8:0.2);
      const x=ttxt.x-72;
      tbg.fillStyle(sel?0xFFD766:0x333333,sel?0.18:0.1); tbg.fillRoundedRect(x,62,144,28,8);
      tbg.lineStyle(1.5,sel?0xFFD766:0xFFFFFF,sel?0.7:0.15); tbg.strokeRoundedRect(x,62,144,28,8);
      ttxt.setStyle({fill:sel?'#FFD766':'#888880',fontFamily:FONT,fontStyle:'bold',fontSize:'12px'});
    });
  }
  async _load(){
    this.loadingTxt.setVisible(true);
    this.rowContainer.removeAll(true);
    try {
      const res=await fetch(`${API}/scores?period=${this.period}&limit=10`);
      const data=await res.json();
      this.loadingTxt.setVisible(false);
      this._renderRows(data.scores||[]);
    } catch(e){
      this.loadingTxt.setText('Could not load scores').setVisible(true);
    }
  }
  _renderRows(scores){
    if(!scores.length){
      const t=this.add.text(W/2,300,'No scores yet — be the first!',
        {fontSize:'14px',fill:'#667766',fontFamily:FONT}).setOrigin(0.5);
      this.rowContainer.add(t); return;
    }
    const playerName=localStorage.getItem('dogchase_name')||'';
    scores.forEach((s,i)=>{
      const y=108+i*46;
      const isMe=s.playerName===playerName||(this.highlightScore&&s.score===this.highlightScore&&s.playerName===this.highlightName);
      const rowBg=this.add.graphics();
      rowBg.fillStyle(isMe?0xFFD766:0xFFFFFF,isMe?0.12:0.04);
      rowBg.fillRoundedRect(22,y,W-44,38,8);
      if(isMe){ rowBg.lineStyle(1.5,0xFFD766,0.5); rowBg.strokeRoundedRect(22,y,W-44,38,8); }
      const rankCol=i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'#667766';
      const rank=this.add.text(46,y+19,`#${s.rank}`,{fontSize:'13px',fill:rankCol,fontFamily:FONT,fontStyle:'900'}).setOrigin(0.5);
      const name=this.add.text(72,y+12,s.playerName,{fontSize:'14px',fill:isMe?'#FFD766':'#EEE8D8',fontFamily:FONT,fontStyle:'bold'}).setOrigin(0,0.5);
      const detail=this.add.text(72,y+28,`${s.dog} · ${s.squirrel}`,{fontSize:'9px',fill:'#667766',fontFamily:FONT}).setOrigin(0,0.5);
      const scoreT=this.add.text(W-38,y+19,`${s.score}`,{fontSize:'20px',fill:isMe?'#FFD766':'#C8D8A8',fontFamily:FONT,fontStyle:'900'}).setOrigin(1,0.5);
      this.rowContainer.add([rowBg,rank,name,detail,scoreT]);
    });
  }
}

// ── Launch ────────────────────────────────────────────────────────────────────
new Phaser.Game({
  type:Phaser.AUTO,
  backgroundColor:'#0d1117',
  parent:'game',
  dom:{ createContainer:true },
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},
  physics:{default:'arcade',arcade:{gravity:{y:0},debug:false}},
  scene:[BootScene,NameScene,SelectScene,GameScene,GameOverScene,LeaderboardScene],
});

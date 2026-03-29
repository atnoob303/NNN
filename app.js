// ═══════════════════════════════════════════════
// MỤC LỤC:
//  §1  STATE & CONSTANTS
//  §2  UTILS
//  §3  PARENT / CHILDREN
//  §4  TRANSFORM MODE
//  §5  TOOLS & ELEMENT FACTORY
//  §6  RENDER ELEMENT
//  §7  WARP
//  §8  TRANSFORM HANDLES
//  §9  DRAG & SCALE & ROTATE
//  §10 SELECTION
//  §11 CANVAS DRAW
//  §12 ADD / REMOVE / HISTORY
//  §13 HIERARCHY (drag-drop)
//  §14 PROPS HELPERS
//  §15 RENDER PROPS
//  §16 EXPORT (Lua + HTML)
//  §17 KEYBOARD
//  §18 INIT
// ═══════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// §1  DEFS — gọn tối đa, key: [psX,poX,psY,poY,ssW,soW,ssH,soH]
// ───────────────────────────────────────────────────────────────

// §1 STATE & CONSTANTS
var els=[],sel=null,selGroup=[],tool='sel',idc=0,hist=[],dtool=null,etab='lua';
var rulerOn=false;
var tMode=0,TMODES=['Scale','Move','Rotate','All','Warp'],TICONS=['⤢','✥','↻','⊕','⌀'];
var hierDrag=null;
var VERSION='Alpha 0.0.6.16.5';
var distGuideOn=true;

var FONTS=['GothamMedium','GothamBold','Gotham','Arial','ArialBold','Legacy','Highway','SciFi','Antique','Cartoon','Code','Fantasy','Garamond','Arcade','Ubuntu','Merriweather','Oswald','Nunito','Bangers','Creepster'];
var DW={TextLabel:160,TextButton:120,ImageLabel:100,ImageButton:100,VideoFrame:200,ViewportFrame:160,ScreenGui:400,ScrollingFrame:200,CanvasGroup:180};
var DH={TextLabel:32,TextButton:36,ImageLabel:100,ImageButton:100,VideoFrame:120,ViewportFrame:120,ScreenGui:300,ScrollingFrame:200,CanvasGroup:180};
var COL={Frame:'#7c6af7',ScrollingFrame:'#a78bfa',CanvasGroup:'#c4b5fd',ViewportFrame:'#60a5fa',VideoFrame:'#f59e0b',ScreenGui:'#22d3ee',TextLabel:'#4ade80',ImageLabel:'#34d399',TextButton:'#f472b6',ImageButton:'#fb7185'};
 
// Helper tạo UDim2 default position/size (offset-only cho root mặc định)
// mkU(psX,poX,psY,poY,ssW,soW,ssH,soH)
function mkU(px,ox,py,oy,sw,ow,sh,oh){
  return{psX:px,poX:ox,psY:py,poY:oy,ssW:sw,soW:ow,ssH:sh,soH:oh};
}
 
// DEFS — mỗi type dùng offset thuần (psX=0,ssW=0) cho root default
// Cấu trúc: spread mkU(...) + các prop riêng của type
var DEFS = {
  Frame:          {...mkU(0,40,0,50,0,160,0,120), bc:{r:34,g:34,b:54},   bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,rot:0,mods:{}},
  ScrollingFrame: {...mkU(0,40,0,50,0,200,0,200), bc:{r:26,g:26,b:40},   bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,rot:0,mods:{},sbt:6,sbc:{r:124,g:106,b:247},csy:200,se:true},
  CanvasGroup:    {...mkU(0,40,0,50,0,180,0,180), bc:{r:44,g:44,b:69},   bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,rot:0,mods:{},gt:0.1},
  ViewportFrame:  {...mkU(0,40,0,50,0,160,0,120), bc:{r:17,g:17,b:32},   bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,rot:0,mods:{}},
  VideoFrame:     {...mkU(0,40,0,50,0,200,0,120), bc:{r:17,g:17,b:32},   bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,rot:0,mods:{},vid:'rbxassetid://0',vol:0.5,vplay:false,vloop:false},
  ScreenGui:      {...mkU(0,0, 0,0, 0,400,0,300), bc:{r:0,g:0,b:0},                             op:1,zi:0,vis:true,rot:0,mods:{},en:true,dord:0,ros:true,igi:false},
  TextLabel:      {...mkU(0,40,0,50,0,160,0,32),  bc:{r:0,g:0,b:0},      bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,rot:0,mods:{},txt:'Label',tc:{r:226,g:226,b:240},tsz:14,fn:'GothamMedium',txa:'Left',tya:'Center',tw:false,tsc:false,rt:false},
  ImageLabel:     {...mkU(0,40,0,50,0,100,0,100), bc:{r:49,g:50,b:68},   bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,rot:0,mods:{},img:'rbxassetid://0',ic:{r:255,g:255,b:255},st:'Stretch',it:0},
  TextButton:     {...mkU(0,40,0,50,0,120,0,36),  bc:{r:124,g:106,b:247},bdc:{r:167,g:139,b:250},bdw:0,cr:8,op:1,zi:0,vis:true,rot:0,mods:{},txt:'Button',tc:{r:255,g:255,b:255},tsz:14,fn:'GothamBold',txa:'Center',tya:'Center',tw:false,abc:true,modal:false},
  ImageButton:    {...mkU(0,40,0,50,0,100,0,100), bc:{r:244,g:114,b:182},bdc:{r:251,g:113,b:133},bdw:0,cr:8,op:1,zi:0,vis:true,rot:0,mods:{},img:'rbxassetid://0',ic:{r:255,g:255,b:255},st:'Stretch',it:0,abc:true,modal:false},
};
 
// MDEF — giữ nguyên, không liên quan UDim2
var MDEF = {
  UICorner:{cr:8}, UIGradient:{c0:'#7c6af7',c1:'#22d3ee',rot:0,en:true},
  UIStroke:{col:'#7c6af7',th:2,tr:0,en:true}, UIPadding:{t:8,b:8,l:8,r:8},
  UIScale:{sc:1}, UIAspectRatioConstraint:{ar:1,at:'FitWithinMaxSize',da:'Width'},
  UISizeConstraint:{mnx:0,mny:0,mxx:999,mxy:999}, UITextSizeConstraint:{mn:6,mx:100},
  UIListLayout:{fd:'Vertical',ha:'Left',va:'Top',so:'LayoutOrder',pd:4,wr:false},
  UIGridLayout:{cs:100,cpx:4,cpy:4,fd:'Horizontal',ha:'Left',va:'Top',so:'LayoutOrder'},
  UITableLayout:{fec:false,fer:false,pd:0},
  UIPageLayout:{an:true,ad:'Horizontal',ci:false,es:'Quad',ed:'Out',pd:0},
  UIFlexItem:{fm:'Fill',gr:1,sr:1}
};
 
// mkEl sửa lại — không còn x/y/w/h
function mkEl(type, psX, poX, psY, poY, ssW, soW, ssH, soH){
  var d = JSON.parse(JSON.stringify(DEFS[type] || DEFS.Frame));
  var o = {
    id:'el_'+(++idc), type:type, name:type+idc,
    psX:psX!==undefined?psX:d.psX, poX:poX!==undefined?poX:d.poX,
    psY:psY!==undefined?psY:d.psY, poY:poY!==undefined?poY:d.poY,
    ssW:ssW!==undefined?ssW:d.ssW, soW:soW!==undefined?soW:d.soW,
    ssH:ssH!==undefined?ssH:d.ssH, soH:soH!==undefined?soH:d.soH,
    ax:d.ax||0, ay:d.ay||0,
    rot:0, parentId:null, warp:null, mods:{}
  };
  for(var k in d){
    if(!['psX','poX','psY','poY','ssW','soW','ssH','soH','rot','mods','ax','ay'].includes(k))
      o[k] = d[k];
  }
  return o;
}
 
// Khi vẽ (draw tool) — tạo el từ pixel tọa độ canvas, encode thành UDim2 offset-only
function mkElFromPixel(type, px, py, pw, ph){
  return mkEl(type, 0,Math.round(px), 0,Math.round(py), 0,Math.max(20,Math.round(pw)), 0,Math.max(20,Math.round(ph)));
}

// §2 UTILS
function rgb(c){return c?'rgb('+Math.round(c.r||0)+','+Math.round(c.g||0)+','+Math.round(c.b||0)+')':'#888';}
function h2r(h){return{r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)};}
function r2h(c){return c?'#'+[c.r||0,c.g||0,c.b||0].map(function(x){return Math.round(x).toString(16).padStart(2,'0');}).join(''):'#313244';}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.style.opacity='1';clearTimeout(t._t);t._t=setTimeout(function(){t.style.opacity='0';},1800);}
function hint(){var a=els.length>0;document.getElementById('ehint').style.display=a?'none':'flex';document.getElementById('eemp').style.display=a?'none':'block';}
function saveH(){hist.push(JSON.parse(JSON.stringify(els)));if(hist.length>50)hist.shift();}
function getEl(id){return els.find(function(e){return e.id===id;});}

// ───────────────────────────────────────────────────────────────
// §3  PARENT / CHILDREN — UDim2 as source of truth
// ───────────────────────────────────────────────────────────────
 
// Canvas size helper — dùng cho root elements
function getCanvasSize(){
  var cv = document.getElementById('cv');
  return { w: cv ? (cv.clientWidth||800) : 800, h: cv ? (cv.clientHeight||600) : 600 };
}
 
// getElRect(el) — computed realtime: trả về world pixel {x,y,w,h,rot}
// - Root: tính theo canvas size
// - Child: tính theo parent rect + UDim2
function getElRect(el){
  if(!el) return {x:0,y:0,w:0,h:0,rot:0};
  var par = el.parentId ? getEl(el.parentId) : null;
  var pw, ph, originX, originY, pRot=0;
  if(par){
    var pr = getElRect(par);
    pw=pr.w; ph=pr.h; originX=pr.x; originY=pr.y; pRot=pr.rot;
  } else {
    var cs = getCanvasSize();
    pw=cs.w; ph=cs.h; originX=0; originY=0;
  }
  var lx = el.psX*pw + el.poX;
  var ly = el.psY*ph + el.poY;
  var w  = Math.max(1, el.ssW*pw + el.soW);
  var h  = Math.max(1, el.ssH*ph + el.soH);
 
  var wx, wy;
  if(par){
    // rotate local coords quanh center của parent
    var pcx = originX + pw/2, pcy = originY + ph/2;
    var ox = lx - pw/2 + w/2, oy = ly - ph/2 + h/2;
    var pr2 = pRot * Math.PI/180;
    wx = pcx + ox*Math.cos(pr2) - oy*Math.sin(pr2) - w/2;
    wy = pcy + ox*Math.sin(pr2) + oy*Math.cos(pr2) - h/2;
  } else {
    wx = lx; wy = ly;
  }
  return { x:wx, y:wy, w:w, h:h, rot:(el.rot||0) + pRot };
}
 
// Encode pixel coords ngược lại thành UDim2 (inplace)
// px,py = world top-left của element, pw,ph = world size
function encodeUDim2(el, wx, wy, ww, wh){
  var par = el.parentId ? getEl(el.parentId) : null;
  var pw, ph, originX, originY, pRot=0;
  if(par){
    var pr = getElRect(par);
    pw=pr.w; ph=pr.h; originX=pr.x; originY=pr.y; pRot=pr.rot;
  } else {
    var cs = getCanvasSize();
    pw=cs.w; ph=cs.h; originX=0; originY=0;
  }
  var lx, ly;
  if(par){
    // unrotate world → local
    var pcx = originX + pw/2, pcy = originY + ph/2;
    var wcx = wx + ww/2, wcy = wy + wh/2;
    var pr2 = pRot * Math.PI/180;
    var relX = wcx - pcx, relY = wcy - pcy;
    var lRelX =  relX*Math.cos(-pr2) - relY*Math.sin(-pr2);
    var lRelY =  relX*Math.sin(-pr2) + relY*Math.cos(-pr2);
    lx = lRelX - ww/2 + pw/2;
    ly = lRelY - wh/2 + ph/2;
  } else {
    lx = wx; ly = wy;
  }
  // Pure scale khi có parent, pure offset khi root
  if(par && pw>0 && ph>0){
    el.psX = lx/pw; el.poX = 0;
    el.psY = ly/ph; el.poY = 0;
    el.ssW = ww/pw; el.soW = 0;
    el.ssH = wh/ph; el.soH = 0;
  } else {
    el.psX = 0; el.poX = Math.round(lx);
    el.psY = 0; el.poY = Math.round(ly);
    el.ssW = 0; el.soW = Math.round(ww);
    el.ssH = 0; el.soH = Math.round(wh);
  }
}
 
// getAbsPos — alias backward compat cho các chỗ dùng {x,y,rot}
function getAbsPos(el){
  var r = getElRect(el);
  return {x:r.x, y:r.y, rot:r.rot};
}
 
// getRotatedBounds — giữ nguyên logic, dùng getElRect
function getRotatedBounds(el){
  var r = getElRect(el);
  var cx=r.x+r.w/2, cy=r.y+r.h/2;
  var rad=(r.rot||0)*Math.PI/180;
  var hw=r.w/2, hh=r.h/2;
  var cos=Math.abs(Math.cos(rad)), sin=Math.abs(Math.sin(rad));
  var bw=hw*cos+hh*sin, bh=hw*sin+hh*cos;
  return{x:cx-bw, y:cy-bh, w:bw*2, h:bh*2};
}
 
function getChildren(pid){return els.filter(function(e){return e.parentId===pid;});}
function getDescendants(id){
  var r=[];
  getChildren(id).forEach(function(c){r.push(c);getDescendants(c.id).forEach(function(d){r.push(d);});});
  return r;
}
function isAncestor(anc,cid){
  var e=getEl(cid); if(!e||!e.parentId)return false;
  return e.parentId===anc||isAncestor(anc,e.parentId);
}
 
function unparent(el){
  if(!el||!el.parentId)return;
  var r = getElRect(el);
  // re-encode thành root UDim2 trước khi bỏ parent
  el.parentId = null;
  encodeUDim2(el, r.x, r.y, r.w, r.h);
  el.rot = r.rot; // flatten rotation
  renderEl(el); renderHier(); toast('🔓 Unparented');
}
 
function setParent(dragged, newParentId){
  var r = getElRect(dragged); // world rect trước khi đổi parent
  dragged.parentId = newParentId || null;
  encodeUDim2(dragged, r.x, r.y, r.w, r.h);
}
 
function reorderEl(draggedId,targetId,position){
  var di=els.findIndex(function(e){return e.id===draggedId;});
  var ti=els.findIndex(function(e){return e.id===targetId;});
  if(di<0||ti<0||di===ti)return;
  var dragged=els.splice(di,1)[0];
  ti=els.findIndex(function(e){return e.id===targetId;});
  if(position==='after')ti++;
  els.splice(ti,0,dragged);
}
 
function tryReparent(drag){
  if(!drag)return;
  var r=getElRect(drag), dcx=r.x+r.w/2, dcy=r.y+r.h/2, best=null, bestA=0;
  els.forEach(function(el){
    if(el.id===drag.id||isAncestor(el.id,drag.id))return;
    var er=getElRect(el);
    if(dcx>=er.x&&dcx<=er.x+er.w&&dcy>=er.y&&dcy<=er.y+er.h){
      var area=er.w*er.h; if(area>bestA){bestA=area;best=el;}
    }
  });
  if(best&&best.id!==drag.parentId){
    setParent(drag,best.id);
    toast('📦 Parented to '+best.name); renderHier();
  }
}
 
// moveChildrenWithParent — không cần nữa vì con dùng local UDim2,
// world coords tự tính theo parent. Giữ stub để không break call sites.
function moveChildrenWithParent(parentId,dx,dy){ /* no-op: UDim2 local coords tự bám */ }
function rotateChildrenWithParent(parentId,cx,cy,dRad){ /* no-op */ }
function scaleChildrenWithParent(parentId,ox,oy,ow,oh,nx,ny,nw,nh){ /* no-op */ }
 
// getElAbsXY — alias dùng trong §10 group scale
function getElAbsXY(el){ return getElRect(el); }
 

// §4 TRANSFORM MODE
function cycleTransformMode(){
  tMode=(tMode+1)%TMODES.length;updateTransformUI();
  toast(TICONS[tMode]+' Mode: '+TMODES[tMode]);
  var el=getEl(sel);if(el)renderEl(el);
}
function updateTransformUI(){
  var b=document.getElementById('btn-tmode');
  if(b){b.textContent=TICONS[tMode]+' '+TMODES[tMode];b.className='tbtn tmode-'+tMode+(tMode===0?' active':'');}
}

// ───────────────────────────────────────────────────────────────
// §5 TOOLS & ELEMENT FACTORY
// ───────────────────────────────────────────────────────────────

function setTool(t){
  tool=t;
  document.getElementById('btn-sel').classList.toggle('active',t==='sel');
  document.getElementById('btn-drw').classList.toggle('active',t==='drw');
  document.getElementById('ca').style.cursor=t==='drw'?'crosshair':'default';
}
// ───────────────────────────────────────────────────────────────
// §6  renderEl — sửa dùng getElRect thay vì el.x/y/w/h
// ───────────────────────────────────────────────────────────────
// PATCH: trong renderEl(el), thay mọi el.x → r.x, el.y → r.y, el.w → r.w, el.h → r.h
// bằng cách lấy r = getElRect(el) ở đầu hàm.
// Dưới đây là renderEl hoàn chỉnh đã patch:
 
function renderEl(el){
  var d=document.getElementById(el.id);
  if(!d){d=document.createElement('div');d.id=el.id;d.className='element';document.getElementById('cv').appendChild(d);}
  var r=getElRect(el); // ← UDim2 computed
  d.dataset.type=el.type; d.dataset.parentId=el.parentId||'';
  d.style.cssText='position:absolute;cursor:'+(tool==='drw'?'crosshair':'move')
    +';left:'+r.x+'px;top:'+r.y+'px;width:'+r.w+'px;height:'+r.h+'px'
    +';z-index:'+((el.zi||0)+1)+';opacity:'+(el.op||1)
    +';display:'+(el.vis===false?'none':'')
    +';transform:rotate('+r.rot+'deg);transform-origin:center center;outline:none;border:none;';
  var m=el.mods||{};
  if(m.UIGradient&&m.UIGradient.en!==false){var g=m.UIGradient;d.style.background='linear-gradient('+(g.rot||0)+'deg,'+g.c0+','+g.c1+')';}
  else d.style.background = rgb(el.bc) || '#222236';
  d.style.borderRadius=((m.UICorner?m.UICorner.cr:el.cr)||0)+'px';
  if(m.UIStroke&&m.UIStroke.en!==false) d.style.outline=(m.UIStroke.th||2)+'px solid '+(m.UIStroke.col||'#7c6af7');
  else if(el.bdw>0) d.style.border=el.bdw+'px solid '+rgb(el.bdc);
  if(m.UIPadding){var p=m.UIPadding;d.style.padding=(p.t||0)+'px '+(p.r||0)+'px '+(p.b||0)+'px '+(p.l||0)+'px';}
  else d.style.padding='';
  if(el.warp) applyWarp(d,el); else d.style.clipPath='';
  var hasKids=els.some(function(e){return e.parentId===el.id;});
  d.style.boxShadow=(hasKids&&el.id!==sel)?'inset 0 0 0 2px rgba(34,211,238,0.3)':'';
  var inGroup=selGroup.indexOf(el.id)>=0;
  if(inGroup) d.classList.add('sel'); else{d.classList.remove('sel');if(!m.UIStroke)d.style.outline='none';}
  d.innerHTML='';
  var mks=Object.keys(m);
  if(mks.length){var chip=document.createElement('div');chip.className='mod-chip';mks.slice(0,4).forEach(function(mk){var b=document.createElement('span');b.className='mod-bd';b.textContent=mk.replace('UI','');chip.appendChild(b);});d.appendChild(chip);}
  if(el.parentId){var pi=document.createElement('div');pi.className='parent-ind';pi.textContent='⊂';pi.title='Child of '+((getEl(el.parentId)||{}).name||'?');d.appendChild(pi);}
  if(hasKids){var ci=document.createElement('div');ci.className='children-ind';ci.textContent='⊃'+getChildren(el.id).length;d.appendChild(ci);}
  if(el.type==='TextLabel'||el.type==='TextButton'){
    var sp=document.createElement('div');
    sp.style.cssText='width:100%;height:100%;display:flex;align-items:center;pointer-events:none;color:'+rgb(el.tc)+';font-size:'+(el.tsz||14)+'px;font-weight:'+(el.type==='TextButton'?700:400)+';justify-content:'+(el.txa==='Center'?'center':el.txa==='Right'?'flex-end':'flex-start')+';padding:0 7px';
    sp.textContent=el.txt||el.type; d.appendChild(sp);
  }
  if(el.type==='ImageLabel'||el.type==='ImageButton'){var ph=document.createElement('div');ph.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:20px;opacity:.4;pointer-events:none';ph.textContent=el.type==='ImageButton'?'🔘':'🖼';d.appendChild(ph);}
  if(el.type==='VideoFrame'){var ph=document.createElement('div');ph.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;opacity:.5;pointer-events:none;flex-direction:column;gap:3px';ph.innerHTML='▶<div style="font-size:9px;color:#f59e0b;font-family:monospace">VIDEO</div>';d.appendChild(ph);}
  if(el.type==='ViewportFrame'){var ph=document.createElement('div');ph.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;opacity:.4;pointer-events:none;flex-direction:column;gap:3px';ph.innerHTML='📦<div style="font-size:9px;color:#60a5fa;font-family:monospace">3D</div>';d.appendChild(ph);}
  if(el.type==='ScrollingFrame'){var sb=document.createElement('div');sb.style.cssText='position:absolute;right:0;top:0;bottom:0;width:'+(el.sbt||6)+'px;background:'+rgb(el.sbc)+';opacity:.4;border-radius:3px';d.appendChild(sb);}
  if(el.type==='ScreenGui'){d.style.border='1px dashed rgba(34,211,238,.3)';var lb=document.createElement('div');lb.style.cssText='position:absolute;top:3px;left:4px;font-size:8px;color:#22d3ee;font-family:monospace;opacity:.6;font-weight:700;pointer-events:none';lb.textContent='⊡ ScreenGui';d.appendChild(lb);}
  if(inGroup&&selGroup.length===1) addTransformHandles(d,el);
  d.onmousedown=function(e){
    if(tool==='drw')return;
    if(e.target.classList.contains('rh')||e.target.classList.contains('wh')||e.target.classList.contains('roth'))return;
    e.stopPropagation();
    if(e.shiftKey){selEl(el.id,true);return;}
    selEl(el.id,false);
    startDrag(el,e);
  };
  d.onclick=function(e){e.stopPropagation();};
}

// §7 WARP
function initWarp(el){el.warp={tl:{x:0,y:0},tr:{x:0,y:0},br:{x:0,y:0},bl:{x:0,y:0},ctrlT:{x:0,y:0},ctrlR:{x:0,y:0},ctrlB:{x:0,y:0},ctrlL:{x:0,y:0}};}
function applyWarp(d,el){
  if(!el.warp)return;
  var r=getElRect(el);
  var w=el.warp, W=r.w, H=r.h;  // ← dùng getElRect
  var pts=[[w.tl.x,w.tl.y],[W+w.tr.x,w.tr.y],[W+w.br.x,H+w.br.y],[w.bl.x,H+w.bl.y]].map(function(p){return(p[0]/W*100).toFixed(1)+'% '+(p[1]/H*100).toFixed(1)+'%';});
  d.style.clipPath='polygon('+pts.join(',')+')';}
function wps(id,corner,axis,v){var el=getEl(id);if(!el||!el.warp)return;el.warp[corner][axis]=v;renderEl(el);}
function resetWarp(id){var el=getEl(id);if(!el)return;el.warp=null;renderEl(el);renderProps();}

// §8 TRANSFORM HANDLES
function addTransformHandles(d,el){
  if(tMode===0||tMode===3)addScaleHandles(d,el);
  if(tMode===2||tMode===3)addRotateHandle(d,el);
  if(tMode===4)addWarpHandles(d,el);
}
function addScaleHandles(d,el){
  [{pos:'tl',cur:'nw-resize',s:'top:-5px;left:-5px'},{pos:'tc',cur:'n-resize',s:'top:-5px;left:50%;transform:translateX(-50%)'},{pos:'tr',cur:'ne-resize',s:'top:-5px;right:-5px'},{pos:'ml',cur:'w-resize',s:'top:50%;left:-5px;transform:translateY(-50%)'},{pos:'mr',cur:'e-resize',s:'top:50%;right:-5px;transform:translateY(-50%)'},{pos:'bl',cur:'sw-resize',s:'bottom:-5px;left:-5px'},{pos:'bc',cur:'s-resize',s:'bottom:-5px;left:50%;transform:translateX(-50%)'},{pos:'br',cur:'se-resize',s:'bottom:-5px;right:-5px'}]
  .forEach(function(h){var hd=document.createElement('div');hd.className='rh rh-'+h.pos;hd.style.cssText='position:absolute;width:9px;height:9px;background:var(--ac);border:2px solid var(--bg0);border-radius:2px;cursor:'+h.cur+';z-index:100;'+h.s;hd.onmousedown=function(e){e.stopPropagation();e.preventDefault();startScaleHandle(el,h.pos,e);};d.appendChild(hd);});
}
function addRotateHandle(d,el){
  var line=document.createElement('div');line.style.cssText='position:absolute;top:-14px;left:50%;width:1px;height:14px;background:var(--cy);opacity:.5;transform:translateX(-50%);pointer-events:none';
  var rh=document.createElement('div');rh.className='roth';rh.style.cssText='position:absolute;top:-26px;left:50%;transform:translateX(-50%);width:14px;height:14px;background:var(--cy);border:2px solid var(--bg0);border-radius:50%;cursor:grab;z-index:101;display:flex;align-items:center;justify-content:center;font-size:9px;color:#000';rh.textContent='↻';
  rh.onmousedown=function(e){e.stopPropagation();e.preventDefault();startRotate(el,e);};
  d.appendChild(line);d.appendChild(rh);
}
function addWarpHandles(d,el){
  if(!el.warp)initWarp(el);
  [{key:'tl',s:'top:-5px;left:-5px'},{key:'tr',s:'top:-5px;right:-5px'},{key:'br',s:'bottom:-5px;right:-5px'},{key:'bl',s:'bottom:-5px;left:-5px'}]
  .forEach(function(c){var hd=document.createElement('div');hd.className='wh';hd.style.cssText='position:absolute;width:10px;height:10px;background:#f59e0b;border:2px solid var(--bg0);border-radius:2px;cursor:crosshair;z-index:102;'+c.s;hd.onmousedown=function(e){e.stopPropagation();e.preventDefault();startWarpCorner(el,c.key,e);};d.appendChild(hd);});
  [{key:'ctrlT',s:'top:-5px;left:50%;transform:translateX(-50%)'},{key:'ctrlR',s:'top:50%;right:-5px;transform:translateY(-50%)'},{key:'ctrlB',s:'bottom:-5px;left:50%;transform:translateX(-50%)'},{key:'ctrlL',s:'top:50%;left:-5px;transform:translateY(-50%)'}]
  .forEach(function(c){var hd=document.createElement('div');hd.className='wh';hd.style.cssText='position:absolute;width:8px;height:8px;background:#22d3ee;border:2px solid var(--bg0);border-radius:50%;cursor:crosshair;z-index:102;'+c.s;hd.onmousedown=function(e){e.stopPropagation();e.preventDefault();startWarpCtrl(el,c.key,e);};d.appendChild(hd);});
}

// ───────────────────────────────────────────────────────────────
// §9  DRAG & SCALE & ROTATE — encode UDim2 sau mỗi thao tác
// ───────────────────────────────────────────────────────────────

function startScaleHandle(el, pos, e){
  saveH();
  var sx=e.clientX, sy=e.clientY;
  var r0=getElRect(el);
  var ox0=r0.x, oy0=r0.y, ow0=r0.w, oh0=r0.h;
  var rotRad=r0.rot*Math.PI/180;

  var fixMap={
    tl:{lx:ow0/2,ly:oh0/2}, tc:{lx:0,ly:oh0/2}, tr:{lx:-ow0/2,ly:oh0/2},
    ml:{lx:ow0/2,ly:0},                           mr:{lx:-ow0/2,ly:0},
    bl:{lx:ow0/2,ly:-oh0/2},bc:{lx:0,ly:-oh0/2}, br:{lx:-ow0/2,ly:-oh0/2}
  };
  var fix=fixMap[pos]||{lx:0,ly:0};
  var startCX=ox0+ow0/2, startCY=oy0+oh0/2;

  function mm(ev){
    var dx=ev.clientX-sx, dy=ev.clientY-sy;
    var lx= dx*Math.cos(rotRad)+dy*Math.sin(rotRad);
    var ly=-dx*Math.sin(rotRad)+dy*Math.cos(rotRad);

    var nw=ow0, nh=oh0;
    if(pos==='tr'||pos==='mr'||pos==='br') nw=Math.max(20,ow0+lx);
    if(pos==='tl'||pos==='ml'||pos==='bl') nw=Math.max(20,ow0-lx);
    if(pos==='bl'||pos==='bc'||pos==='br') nh=Math.max(20,oh0+ly);
    if(pos==='tl'||pos==='tc'||pos==='tr') nh=Math.max(20,oh0-ly);
    if(pos==='tc'||pos==='bc') nw=ow0;
    if(pos==='ml'||pos==='mr') nh=oh0;
    if(ev.shiftKey&&(pos==='tl'||pos==='tr'||pos==='bl'||pos==='br')){
      var ratio=ow0/oh0;
      if(nw/nh>ratio) nh=nw/ratio; else nw=nh*ratio;
      nw=Math.max(20,nw); nh=Math.max(20,nh);
    }

    var sfx=fix.lx*(nw/ow0), sfy=fix.ly*(nh/oh0);
    var ofx=fix.lx, ofy=fix.ly;
    var newFixWX=startCX+sfx*Math.cos(rotRad)-sfy*Math.sin(rotRad);
    var newFixWY=startCY+sfx*Math.sin(rotRad)+sfy*Math.cos(rotRad);
    var oldFixWX=startCX+ofx*Math.cos(rotRad)-ofy*Math.sin(rotRad);
    var oldFixWY=startCY+ofx*Math.sin(rotRad)+ofy*Math.cos(rotRad);
    var newCX=startCX+(oldFixWX-newFixWX);
    var newCY=startCY+(oldFixWY-newFixWY);
    var newX=newCX-nw/2, newY=newCY-nh/2;

    var savedRot=el.rot; el.rot=0;
    encodeUDim2(el,newX,newY,nw,nh);
    el.rot=savedRot;

    renderEl(el);
    getDescendants(el.id).forEach(renderEl);
    renderProps(); updInfo(el);
    var b=getRotatedBounds(el);
    updateRuler(el);
    drawResizeGuides(b.x,b.y,b.w,b.h);
    drawBoundingBox(b.x,b.y,b.w,b.h);
    drawDistanceGuides(b.x,b.y,b.w,b.h);
  }

  function mu(){
    clearResizeGuides();
    document.removeEventListener('mousemove',mm);
    document.removeEventListener('mouseup',mu);
  }
  document.addEventListener('mousemove',mm);
  document.addEventListener('mouseup',mu);
}

// ─────────────────────────────────────────────
function startWarpCorner(el,key,e){
  saveH(); if(!el.warp)initWarp(el);
  var sx=e.clientX, sy=e.clientY, ox=el.warp[key].x, oy=el.warp[key].y;
  function mm(ev){
    el.warp[key].x=ox+(ev.clientX-sx);
    el.warp[key].y=oy+(ev.clientY-sy);
    var d=document.getElementById(el.id); if(d)applyWarp(d,el);
    renderEl(el);
  }
  function mu(){document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);}
  document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
}

function startWarpCtrl(el,key,e){
  saveH(); if(!el.warp)initWarp(el);
  var sx=e.clientX, sy=e.clientY, ox=el.warp[key].x, oy=el.warp[key].y;
  function mm(ev){
    el.warp[key].x=ox+(ev.clientX-sx);
    el.warp[key].y=oy+(ev.clientY-sy);
    renderEl(el);
  }
  function mu(){document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);}
  document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
}

// ─────────────────────────────────────────────
function startDrag(el,e){
  if(selGroup.length>1&&selGroup.indexOf(el.id)>=0){startGroupDrag(e);return;}
  saveH();
  var r0=getElRect(el);
  var smx=e.clientX, smy=e.clientY;
  var startWX=r0.x, startWY=r0.y;

  var descSnaps=getDescendants(el.id).map(function(c){
    var cr=getElRect(c); return{el:c,wx:cr.x,wy:cr.y,ww:cr.w,wh:cr.h};
  });

  var ov=document.getElementById('ruler-overlay');
  if(ov&&distGuideOn&&ov.style.display==='none') ov.style.display='block';

  function mm(ev){
    var dx=ev.clientX-smx, dy=ev.clientY-smy;
    var newWX=startWX+dx, newWY=startWY+dy;

    var tmp={x:newWX,y:newWY,w:r0.w,h:r0.h,id:el.id,parentId:el.parentId};
    snapGuides(tmp);
    newWX=tmp.x; newWY=tmp.y;

    var savedRot=el.rot; el.rot=0;
    encodeUDim2(el,newWX,newWY,r0.w,r0.h);
    el.rot=savedRot;

    var actualDX=newWX-startWX, actualDY=newWY-startWY;
    descSnaps.forEach(function(s){
      var newX=s.wx+actualDX, newY=s.wy+actualDY;
      var savedRot2=s.el.rot; s.el.rot=0;
      encodeUDim2(s.el,newX,newY,s.ww,s.wh);
      s.el.rot=savedRot2;
      renderEl(s.el);
    });

    renderEl(el); updInfo(el); updateRuler(el);
    var b=getRotatedBounds(el);
    drawResizeGuides(b.x,b.y,b.w,b.h); // ← FIX: update XYWH liên tục khi drag
    drawDistanceGuides(b.x,b.y,b.w,b.h);
  }

  function mu(ev){
    clearGuides();
    var ov=document.getElementById('ruler-overlay');
    if(ov) ov.querySelectorAll('.rul-dist').forEach(function(e){e.remove();});
    if(ov&&!rulerOn&&!distGuideOn) ov.style.display='none';
    document.removeEventListener('mousemove',mm);
    document.removeEventListener('mouseup',mu);
    if(ev.altKey){tryReparent(el);renderEl(el);}
    renderHier();
  }
  document.addEventListener('mousemove',mm);
  document.addEventListener('mouseup',mu);
}

// ─────────────────────────────────────────────
function startRotate(el,e){
  saveH();
  var caRect=document.getElementById('ca').getBoundingClientRect();
  var r0=getElRect(el);
  var cx=r0.x+r0.w/2, cy=r0.y+r0.h/2;
  var screenCX=cx+caRect.left, screenCY=cy+caRect.top;
  var sa=Math.atan2(e.clientY-screenCY,e.clientX-screenCX)*180/Math.PI;
  var sr=el.rot||0;

  function mm(ev){
    var a=Math.atan2(ev.clientY-screenCY,ev.clientX-screenCX)*180/Math.PI;
    var newRot=sr+(a-sa);
    if(ev.shiftKey) newRot=Math.round(newRot/15)*15;

    el.rot=newRot;
    renderEl(el);
    getDescendants(el.id).forEach(renderEl);
    updInfo(el);

    if(rulerOn) updateRuler(el);
    var b=getRotatedBounds(el);
    drawBoundingBox(b.x,b.y,b.w,b.h);
    drawResizeGuides(b.x,b.y,b.w,b.h);
    if(distGuideOn) drawDistanceGuides(b.x,b.y,b.w,b.h);
  }

  function mu(){
    clearResizeGuides();
    document.removeEventListener('mousemove',mm);
    document.removeEventListener('mouseup',mu);
  }
  document.addEventListener('mousemove',mm);
  document.addEventListener('mouseup',mu);
}

// ─────────────────────────────────────────────
function updInfo(el){
  var r=getElRect(el);
  document.getElementById('cinfo').textContent=
    el.type+' · '+Math.round(r.x)+','+Math.round(r.y)+
    ' · '+Math.round(r.w)+'×'+Math.round(r.h)+
    (el.rot?' · '+(el.rot||0).toFixed(1)+'°':'');
}

// ───────────────────────────────────────────────────────────────
// §9b  snapGuides
// ───────────────────────────────────────────────────────────────

var _origSnapGuides=null;

function snapGuidesRect(rect){
  clearGuides();
  if(selGroup.length>1) return{dx:0,dy:0};
  var others=els.filter(function(e){return e.id!==(rect._id||rect.id||'');});
  if(!others.length) return{dx:0,dy:0};
  var ex=rect.x,ey=rect.y,ew=rect.w,eh=rect.h;
  var ecx=ex+ew/2,ecy=ey+eh/2,ex2=ex+ew,ey2=ey+eh;
  var snapX=null,snapY=null;
  var THRESH=SNAP_THRESHOLD;
  others.forEach(function(o){
    if(snapX!==null&&snapY!==null) return;
    var or=getElRect(o);
    var ox=or.x,oy=or.y,ow=or.w,oh=or.h;
    var ocx=ox+ow/2,ocy=oy+oh/2,ox2=ox+ow,oy2=oy+oh;
    [[ex,ox],[ex,ox2],[ex,ocx],[ecx,ox],[ecx,ocx],[ecx,ox2],[ex2,ox],[ex2,ox2],[ex2,ocx]]
      .forEach(function(p){if(snapX===null&&Math.abs(p[0]-p[1])<THRESH){rect.x+=p[1]-p[0];ex=rect.x;ex2=ex+ew;ecx=ex+ew/2;snapX=p[1];}});
    [[ey,oy],[ey,oy2],[ey,ocy],[ecy,oy],[ecy,ocy],[ecy,oy2],[ey2,oy],[ey2,oy2],[ey2,ocy]]
      .forEach(function(p){if(snapY===null&&Math.abs(p[0]-p[1])<THRESH){rect.y+=p[1]-p[0];ey=rect.y;ey2=ey+eh;ecy=ey+eh/2;snapY=p[1];}});
  });
  if(snapX!==null) _drawGuide(true,snapX,'#22d3ee');
  if(snapY!==null) _drawGuide(false,snapY,'#22d3ee');
  return{dx:0,dy:0};
}

// ───────────────────────────────────────────────────────────────
// §9c  GROUP TRANSFORM
// ───────────────────────────────────────────────────────────────

function startGroupDrag(e){
  saveH();
  var grp=selGroup.map(getEl).filter(Boolean);
  var snaps=grp.map(function(el){
    var r=getElRect(el); return{el:el,wx:r.x,wy:r.y,ww:r.w,wh:r.h};
  });
  var smx=e.clientX, smy=e.clientY;

  function mm(ev){
    var dx=ev.clientX-smx, dy=ev.clientY-smy;
    var tempRects=snaps.map(function(s){return{x:s.wx+dx,y:s.wy+dy,w:s.ww,h:s.wh};});
    var mnx=Math.min.apply(null,tempRects.map(function(r){return r.x;}));
    var mny=Math.min.apply(null,tempRects.map(function(r){return r.y;}));
    var mxx=Math.max.apply(null,tempRects.map(function(r){return r.x+r.w;}));
    var mxy=Math.max.apply(null,tempRects.map(function(r){return r.y+r.h;}));
    var snapOff=snapGuidesGroup({x:mnx,y:mny,w:mxx-mnx,h:mxy-mny});
    dx+=snapOff.dx; dy+=snapOff.dy;

    snaps.forEach(function(s){
      var newX=s.wx+dx, newY=s.wy+dy;
      var savedRot=s.el.rot; s.el.rot=0;
      encodeUDim2(s.el,newX,newY,s.ww,s.wh);
      s.el.rot=savedRot;
      renderEl(s.el);
      getDescendants(s.el.id).forEach(renderEl);
    });
    renderGroupBox();
    var b=calcGroupBounds();
    if(b){
      document.getElementById('cinfo').textContent=
        'Group · '+Math.round(b.x)+','+Math.round(b.y)+
        ' · '+Math.round(b.w)+'×'+Math.round(b.h);
      updateRulerGroup(b,grp);
    }
  }

  function mu(){
    clearGuides();
    document.removeEventListener('mousemove',mm);
    document.removeEventListener('mouseup',mu);
    renderHier();
  }
  document.addEventListener('mousemove',mm);
  document.addEventListener('mouseup',mu);
}

function startGroupScale(pos,e){
  saveH();
  var b0=calcGroupBounds(); if(!b0)return;
  var grp=selGroup.map(getEl).filter(Boolean);
  var snaps=grp.map(function(el){
    var r=getElRect(el);
    return{el:el,rx:(r.x-b0.x)/b0.w,ry:(r.y-b0.y)/b0.h,rw:r.w/b0.w,rh:r.h/b0.h};
  });
  var sx=e.clientX, sy=e.clientY;

  function mm(ev){
    var dx=ev.clientX-sx, dy=ev.clientY-sy;
    var nb={x:b0.x,y:b0.y,w:b0.w,h:b0.h};
    if(pos==='tr'||pos==='mr'||pos==='br') nb.w=Math.max(40,b0.w+dx);
    if(pos==='tl'||pos==='ml'||pos==='bl'){nb.w=Math.max(40,b0.w-dx);nb.x=b0.x+b0.w-nb.w;}
    if(pos==='bl'||pos==='bc'||pos==='br') nb.h=Math.max(40,b0.h+dy);
    if(pos==='tl'||pos==='tc'||pos==='tr'){nb.h=Math.max(40,b0.h-dy);nb.y=b0.y+b0.h-nb.h;}
    if(pos==='tc'||pos==='bc'){nb.w=b0.w;nb.x=b0.x;}
    if(pos==='ml'||pos==='mr'){nb.h=b0.h;nb.y=b0.y;}
    if(ev.shiftKey&&(pos==='tl'||pos==='tr'||pos==='bl'||pos==='br')){
      var rat=b0.w/b0.h;
      if(nb.w/nb.h>rat) nb.h=nb.w/rat; else nb.w=nb.h*rat;
      if(pos==='tl'){nb.x=b0.x+b0.w-nb.w;nb.y=b0.y+b0.h-nb.h;}
      if(pos==='tr') nb.y=b0.y+b0.h-nb.h;
      if(pos==='bl') nb.x=b0.x+b0.w-nb.w;
    }
    snaps.forEach(function(s){
      var el=s.el;
      var nax=nb.x+s.rx*nb.w, nay=nb.y+s.ry*nb.h;
      var nw=Math.max(10,s.rw*nb.w), nh=Math.max(10,s.rh*nb.h);
      var savedRot=el.rot; el.rot=0;
      encodeUDim2(el,nax,nay,nw,nh);
      el.rot=savedRot;
      renderEl(el);
      getDescendants(el.id).forEach(renderEl);
    });
    if(_gb){
      _gb.style.left=nb.x+'px'; _gb.style.top=nb.y+'px';
      _gb.style.width=nb.w+'px'; _gb.style.height=nb.h+'px';
    }
    document.getElementById('cinfo').textContent=
      'Group · '+Math.round(nb.x)+','+Math.round(nb.y)+
      ' · '+Math.round(nb.w)+'×'+Math.round(nb.h);
  }

  function mu(){
    document.removeEventListener('mousemove',mm);
    document.removeEventListener('mouseup',mu);
    renderGroupBox();
  }
  document.addEventListener('mousemove',mm);
  document.addEventListener('mouseup',mu);
}

function calcGroupBounds(){
  var grp=selGroup.map(getEl).filter(Boolean);
  if(grp.length<2) return null;
  var mnx=Infinity,mny=Infinity,mxx=-Infinity,mxy=-Infinity;
  grp.forEach(function(e){
    var b=getRotatedBounds(e);
    mnx=Math.min(mnx,b.x); mny=Math.min(mny,b.y);
    mxx=Math.max(mxx,b.x+b.w); mxy=Math.max(mxy,b.y+b.h);
  });
  return{x:mnx,y:mny,w:mxx-mnx,h:mxy-mny};
}

// ───────────────────────────────────────────────────────────────
// §9d  CANVAS DRAW — xem §11 để biết mkElFromPixel + encodeUDim2
// ───────────────────────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────
// §10 SELECTION
// ───────────────────────────────────────────────────────────────

function selEl(id,shift){
  if(shift&&id){
    if(selGroup.indexOf(id)<0)selGroup.push(id);
    else selGroup=selGroup.filter(function(x){return x!==id;});
    sel=id;
  } else {
    sel=id;
    selGroup=id?[id]:[];
  }
  els.forEach(function(e){
    var d=document.getElementById(e.id);
    var inGroup=selGroup.indexOf(e.id)>=0;
    if(d){
      d.classList.toggle('sel',inGroup);
      if(!inGroup&&!((e.mods||{}).UIStroke))d.style.outline='none';
    }
    renderEl(e);
  });
  updateAlignBar();
  renderProps();renderHier();
  renderGroupBox();
}

// ───────────────────────────────────────────────────────────────
// §10b GROUP TRANSFORM
// ───────────────────────────────────────────────────────────────

var _gb=null,_gbH=[];
// calcGroupBounds   ← XÓA (dùng bản §9c)
// startGroupDrag    ← XÓA (dùng bản §9c)
// startGroupScale   ← XÓA (dùng bản §9c)
 
function clearGroupBox(){
  if(_gb&&_gb.parentNode)_gb.parentNode.removeChild(_gb);
  _gb=null;_gbH=[];
}
function renderGroupBox(){
  clearGroupBox();
  if(selGroup.length<2)return;
  var b=calcGroupBounds();if(!b)return;
  var cv=document.getElementById('cv');
  _gb=document.createElement('div');
  _gb.id='group-box';
  _gb.style.cssText='position:absolute;z-index:500;left:'+b.x+'px;top:'+b.y+'px;width:'+b.w+'px;height:'+b.h+'px;outline:2px dashed var(--ac);outline-offset:2px;background:rgba(124,106,247,0.04);cursor:move;box-sizing:border-box;';
  cv.appendChild(_gb);
  [{id:'tl',s:'top:-5px;left:-5px;cursor:nw-resize'},{id:'tc',s:'top:-5px;left:50%;transform:translateX(-50%);cursor:n-resize'},{id:'tr',s:'top:-5px;right:-5px;cursor:ne-resize'},{id:'ml',s:'top:50%;left:-5px;transform:translateY(-50%);cursor:w-resize'},{id:'mr',s:'top:50%;right:-5px;transform:translateY(-50%);cursor:e-resize'},{id:'bl',s:'bottom:-5px;left:-5px;cursor:sw-resize'},{id:'bc',s:'bottom:-5px;left:50%;transform:translateX(-50%);cursor:s-resize'},{id:'br',s:'bottom:-5px;right:-5px;cursor:se-resize'}]
  .forEach(function(h){
    var hd=document.createElement('div');
    hd.style.cssText='position:absolute;width:9px;height:9px;background:var(--ac);border:2px solid var(--bg0);border-radius:2px;z-index:502;'+h.s;
    hd.onmousedown=function(e){e.stopPropagation();e.preventDefault();startGroupScale(h.id,e);};
    _gb.appendChild(hd);_gbH.push(hd);
  });
  _gb.onmousedown=function(e){
    if(e.target!==_gb)return;
    e.stopPropagation();startGroupDrag(e);
  };
}
// ───────────────────────────────────────────────────────────────
// §11 CANVAS DRAW
// ───────────────────────────────────────────────────────────────

var ca=document.getElementById('ca');
var _selBox=null;
ca.onmousedown=function(e){
  var t=e.target;
  if(t!==ca&&t!==document.getElementById('cv')&&!t.classList.contains('gridbg')&&!(tool==='drw'))return;
  if(tool==='drw'){
    var r=ca.getBoundingClientRect(),ds={x:e.clientX-r.left,y:e.clientY-r.top};
    // §11-FIX BUG2: dùng mkElFromPixel thay vì mkEl(type,x,y,w,h)
    var el=mkElFromPixel(dtool||'Frame',ds.x,ds.y,10,10);
    saveH();els.push(el);renderEl(el);selEl(el.id);hint();
    window._drawingEl=el;
    function mm(ev){
      var nx=ev.clientX-r.left,ny=ev.clientY-r.top;
      var rw=Math.abs(nx-ds.x)||10,rh=Math.abs(ny-ds.y)||10;
      if(ev.shiftKey){var s=Math.max(rw,rh);rw=s;rh=s;}
      // §11-FIX BUG2: encodeUDim2 thay vì el.x/y/w/h trực tiếp
      encodeUDim2(el, Math.min(ds.x,nx), Math.min(ds.y,ny), rw, rh);
      renderEl(el);updInfo(el);
      // §11-FIX BUG2: dùng getElRect để lấy ecx/ecy
      var _er=getElRect(el);
      drawBoundingBox(_er.x,_er.y,_er.w,_er.h);
      drawDistanceGuides(_er.x,_er.y,_er.w,_er.h);
      var ecx=_er.x+_er.w/2,ecy=_er.y+_er.h/2,best=null,bestA=Infinity;
      els.forEach(function(o){
        if(o.id===el.id)return;
        var or=getElRect(o);
        if(ecx>=or.x&&ecx<=or.x+or.w&&ecy>=or.y&&ecy<=or.y+or.h){
          var area=or.w*or.h;if(area<bestA){bestA=area;best=o;}
        }
      });
      els.forEach(function(o){
        if(o.id===el.id)return;
        var d=document.getElementById(o.id);
        if(d)d.style.outline=(best&&o.id===best.id)?'2px solid #fbbf24':'';
      });
    }
    function mu(){
      // §11-FIX BUG2: check size qua getElRect, encode default nếu quá nhỏ
      var _er=getElRect(el);
      if(_er.w<20||_er.h<20){
        encodeUDim2(el, _er.x, _er.y, DW[el.type]||160, DH[el.type]||80);
      }
      clearResizeGuides();
      els.forEach(function(o){
        var d=document.getElementById(o.id);
        if(d&&o.id!==el.id)d.style.outline='';
      });
      var _er2=getElRect(el);
      var ecx=_er2.x+_er2.w/2,ecy=_er2.y+_er2.h/2,best=null,bestA=Infinity;
      els.forEach(function(o){
        if(o.id===el.id)return;
        var or=getElRect(o);
        if(ecx>=or.x&&ecx<=or.x+or.w&&ecy>=or.y&&ecy<=or.y+or.h){
          var area=or.w*or.h;if(area<bestA){bestA=area;best=o;}
        }
      });
      if(best){setParent(el,best.id);renderEl(el);toast('📦 '+el.name+' → '+best.name);}
      renderEl(el);renderProps();setTool('sel');dtool=null;
      window._drawingEl=null;
      renderHier();
      document.removeEventListener('mousemove',mm);
      document.removeEventListener('mouseup',mu);
    }
    document.addEventListener('mousemove',mm);
    document.addEventListener('mouseup',mu);
    return;
  }
  if(tool==='sel'&&!e.shiftKey){
    selEl(null);renderProps();
    var r=ca.getBoundingClientRect();
    var sx=e.clientX-r.left,sy=e.clientY-r.top;
    var sb=document.createElement('div');
    sb.id='sel-box';
    sb.style.cssText='position:absolute;border:1px solid var(--ac);background:rgba(124,106,247,.08);pointer-events:none;z-index:900;';
    document.getElementById('cv').appendChild(sb);
    _selBox=sb;
    function mm(ev){
      var nx=ev.clientX-r.left,ny=ev.clientY-r.top;
      var bx=Math.min(sx,nx),by=Math.min(sy,ny),bw=Math.abs(nx-sx),bh=Math.abs(ny-sy);
      sb.style.left=bx+'px';sb.style.top=by+'px';sb.style.width=bw+'px';sb.style.height=bh+'px';
      els.forEach(function(el){
        var er=getElRect(el);
        var inside=er.x<bx+bw&&er.x+er.w>bx&&er.y<by+bh&&er.y+er.h>by;
        var d=document.getElementById(el.id);
        if(d)d.style.opacity=inside?'1':'0.4';
      });
    }
    function mu(ev){
      var nx=ev.clientX-r.left,ny=ev.clientY-r.top;
      var bx=Math.min(sx,nx),by=Math.min(sy,ny),bw=Math.abs(nx-sx),bh=Math.abs(ny-sy);
      if(sb.parentNode)sb.parentNode.removeChild(sb);
      _selBox=null;
      els.forEach(function(el){var d=document.getElementById(el.id);if(d)d.style.opacity='';});
      if(bw<5&&bh<5){document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);return;}
      var found=[];
      els.forEach(function(el){
        var er=getElRect(el);
        if(er.x<bx+bw&&er.x+er.w>bx&&er.y<by+bh&&er.y+er.h>by)found.push(el.id);
      });
      if(found.length){
        selGroup=found;sel=found[found.length-1];
        els.forEach(function(e){renderEl(e);});
        updateAlignBar();renderProps();renderHier();renderGroupBox();
        toast('✦ Selected '+found.length+' elements');
      }
      document.removeEventListener('mousemove',mm);
      document.removeEventListener('mouseup',mu);
    }
    document.addEventListener('mousemove',mm);
    document.addEventListener('mouseup',mu);
    return;
  }
  if(tool==='sel'&&e.shiftKey){return;}
};

// ───────────────────────────────────────────────────────────────
// §12 ADD / REMOVE / HISTORY
// ───────────────────────────────────────────────────────────────

function addPreset(type){dtool=type;setTool('drw');toast('✎ Draw: '+type);}
function addMod(mk){
  var el=getEl(sel);if(!el){toast('⚠ Select element first!');return;}
  if(el.mods[mk]){toast(mk+' already added');return;}
  saveH();el.mods[mk]=JSON.parse(JSON.stringify(MDEF[mk]||{}));renderEl(el);renderProps();renderHier();toast('✓ '+mk);
}
function removeMod(mk){var el=getEl(sel);if(!el)return;saveH();delete el.mods[mk];renderEl(el);renderProps();}
function layerUp(){var el=getEl(sel);if(!el)return;saveH();el.zi=(el.zi||0)+1;renderEl(el);}
function layerDn(){var el=getEl(sel);if(!el)return;saveH();el.zi=Math.max(0,(el.zi||0)-1);renderEl(el);}
function dupSel(){
  if(selGroup.length>1){
    saveH();
    var idMap={};
    var newEls=[];
    selGroup.forEach(function(id){
      var o=getEl(id);if(!o)return;
      var c=JSON.parse(JSON.stringify(o));
      c.id='el_'+(++idc);
      c.name=o.type+idc;
      idMap[o.id]=c.id;
      newEls.push(c);
    });
    newEls.forEach(function(c){
      if(c.parentId&&idMap[c.parentId])c.parentId=idMap[c.parentId];
      c.poX=(c.poX||0)+20; c.poY=(c.poY||0)+20; // ← FIX BUG5: bỏ c.x+=20;c.y+=20
    });
    newEls.forEach(function(c){els.push(c);renderEl(c);});
    selGroup=newEls.map(function(c){return c.id;});
    sel=selGroup[selGroup.length-1];
    els.forEach(function(e){renderEl(e);});
    renderGroupBox();renderHier();
    toast('⧉ Duplicated '+newEls.length+' elements');
    return;
  }
  var o=getEl(sel);if(!o)return;
  saveH();var c=JSON.parse(JSON.stringify(o));
  c.id='el_'+(++idc);c.name=o.type+idc;
  c.poX=(c.poX||0)+20; c.poY=(c.poY||0)+20; // ← FIX BUG5: bỏ c.x+=20;c.y+=20
  els.push(c);renderEl(c);selEl(c.id);renderHier();
}
function delSel() {
  if (!sel) return;
  saveH();
  var toDelete = [];
  selGroup.forEach(function(id) {
    toDelete.push(id);
    getDescendants(id).forEach(function(c) { toDelete.push(c.id); });
  });
  toDelete.forEach(function(id) {
    var d = document.getElementById(id);
    if (d) d.remove();
  });
  els = els.filter(function(e) { return toDelete.indexOf(e.id) < 0; });
  sel = null; selGroup = [];
  clearGroupBox();
  renderProps(); renderHier(); hint();
  toast('🗑 Deleted ' + toDelete.length + ' element(s)');
}
function clearAll(){
  if(els.length&&!confirm('Xóa tất cả?'))return;saveH();
  els.forEach(function(e){var d=document.getElementById(e.id);if(d)d.remove();});
  els=[];sel=null;renderProps();renderHier();hint();
}
function undo(){
  if(!hist.length)return;
  els.forEach(function(e){var d=document.getElementById(e.id);if(d)d.remove();});
  els=hist.pop();sel=null;selGroup=[];clearGroupBox();
  els.forEach(renderEl);renderProps();renderHier();hint();
}

// ───────────────────────────────────────────────────────────────
// §13 HIERARCHY (drag-drop)
// ───────────────────────────────────────────────────────────────

var _hDragId=null,_hOverId=null,_hPos=null,_hPlaceholder=null;
function _removePlaceholder(){
  if(_hPlaceholder&&_hPlaceholder.parentNode)_hPlaceholder.parentNode.removeChild(_hPlaceholder);
  _hPlaceholder=null;
}
function _makePlaceholder(depth,label){
  var ph=document.createElement('div');
  ph.id='hier-ph';
  ph.style.cssText='height:3px;margin:1px 0;border-radius:2px;background:var(--ac);opacity:.85;pointer-events:none;transition:all .1s;';
  ph.style.marginLeft=(7+depth*14)+'px';
  return ph;
}
function renderHier(){
  var list=document.getElementById('elist');
  list.innerHTML='';
  document.getElementById('eemp').style.display=els.length?'none':'block';
  var flatNodes=[];
  function collectNodes(el,depth){
    flatNodes.push({el:el,depth:depth});
    getChildren(el.id).forEach(function(c){collectNodes(c,depth+1);});
  }
  els.filter(function(e){return!e.parentId;}).forEach(function(el){collectNodes(el,0);});
  flatNodes.forEach(function(node,idx){
    var el=node.el,depth=node.depth;
    var c=COL[el.type]||'#888';
    var kids=getChildren(el.id);
    var d=document.createElement('div');
    d.className='el-item'+(el.id===sel?' on':'');
    d.dataset.id=el.id;
    d.dataset.depth=depth;
    d.draggable=true;
    d.style.paddingLeft=(7+depth*14)+'px';
    d.style.transition='transform .12s, opacity .12s';
    d.innerHTML=
      '<div class="el-ic" style="background:'+c+'22;color:'+c+'">▪</div>'+
      (depth?'<span style="color:var(--tx3);font-size:9px;margin-right:2px">⊂</span>':'')+
      '<span class="el-nm">'+el.name+'</span>'+
      '<span class="el-tp">'+el.type+'</span>'+
      (kids.length?'<span style="color:var(--cy);font-size:8px;margin-left:2px">⊃'+kids.length+'</span>':'')+
      (el.parentId?'<span class="hier-unpar" onclick="event.stopPropagation();unparent(getEl(\''+el.id+'\'));renderEl(getEl(\''+el.id+'\'));renderProps()" title="Unparent">✕</span>':'');
    d.onclick=function(e){
      if(!e.target.classList.contains('hier-unpar')){selEl(el.id);lTab(1);}
    };
    d.ondragstart=function(e){
      _hDragId=el.id;
      e.dataTransfer.effectAllowed='move';
      setTimeout(function(){d.style.opacity='0.35';},0);
    };
    d.ondragend=function(){
      _hDragId=null;_hOverId=null;_hPos=null;
      d.style.opacity='';
      _removePlaceholder();
      list.querySelectorAll('.el-item').forEach(function(n){
        n.classList.remove('hier-over','hier-insert-before','hier-insert-after');
        n.style.transform='';
      });
    };
    d.ondragover=function(e){
      e.preventDefault();
      if(!_hDragId||_hDragId===el.id||isAncestor(el.id,_hDragId))return;
      e.dataTransfer.dropEffect='move';
      var rect=d.getBoundingClientRect();
      var relY=e.clientY-rect.top;
      var pct=relY/rect.height;
      var newPos;
      if(pct<0.25) newPos='before';
      else if(pct>0.75) newPos='after';
      else newPos='inside';
      if(_hOverId===el.id&&_hPos===newPos)return;
      _hOverId=el.id;_hPos=newPos;
      list.querySelectorAll('.el-item').forEach(function(n){
        n.classList.remove('hier-over','hier-insert-before','hier-insert-after');
      });
      _removePlaceholder();
      if(newPos==='inside'){
        d.classList.add('hier-over');
        var ph=_makePlaceholder(depth+1);
        ph.style.marginLeft=(14+(depth+1)*14)+'px';
        ph.style.height='18px';
        ph.style.background='rgba(124,106,247,0.18)';
        ph.style.border='1px dashed var(--ac)';
        ph.style.borderRadius='4px';
        ph.style.marginRight='6px';
        if(d.nextSibling)list.insertBefore(ph,d.nextSibling);
        else list.appendChild(ph);
        _hPlaceholder=ph;
      } else {
        var ph=_makePlaceholder(depth);
        if(newPos==='before'){
          d.classList.add('hier-insert-before');
          list.insertBefore(ph,d);
        } else {
          d.classList.add('hier-insert-after');
          var lastChild=d;
          var allItems=list.querySelectorAll('.el-item');
          var found=false;
          allItems.forEach(function(item){
            if(found&&parseInt(item.dataset.depth||0)>depth)lastChild=item;
            else if(found)found=false;
            if(item===d)found=true;
          });
          if(lastChild.nextSibling)list.insertBefore(ph,lastChild.nextSibling);
          else list.appendChild(ph);
        }
        _hPlaceholder=ph;
      }
    };
    d.ondragleave=function(e){
      if(!d.contains(e.relatedTarget)){
        d.classList.remove('hier-over','hier-insert-before','hier-insert-after');
      }
    };
    d.ondrop=function(e){
      e.preventDefault();e.stopPropagation();
      d.classList.remove('hier-over','hier-insert-before','hier-insert-after');
      _removePlaceholder();
      if(!_hDragId||_hDragId===el.id||isAncestor(el.id,_hDragId))return;
      var dragged=getEl(_hDragId);
      if(!dragged)return;
      saveH();
      if(_hPos==='inside'){
        setParent(dragged,el.id);
        toast('📦 '+dragged.name+' → '+el.name);
      } else {
        setParent(dragged, el.parentId||null);
        reorderEl(dragged.id, el.id, _hPos);
        toast('↕ Reordered: '+dragged.name);
      }
      renderEl(dragged);
      getDescendants(dragged.id).forEach(renderEl);
      renderHier();renderProps();
      _hDragId=null;_hOverId=null;_hPos=null;
    };
    list.appendChild(d);
    Object.keys(el.mods||{}).forEach(function(mk){
      var md=document.createElement('div');
      md.className='el-item';
      md.style.paddingLeft=(20+depth*14)+'px';
      md.innerHTML='<div class="el-ic" style="background:rgba(196,181,253,.15);color:#c4b5fd">✦</div><span class="el-nm" style="color:var(--ac3)">'+mk+'</span>';
      md.onclick=function(e){e.stopPropagation();selEl(el.id);};
      list.appendChild(md);
    });
  });
  list.ondragover=function(e){
    e.preventDefault();
    if(!_hDragId)return;
    var items=list.querySelectorAll('.el-item[data-id]');
    var last=items[items.length-1];
    if(!last)return;
    var rect=last.getBoundingClientRect();
    if(e.clientY>rect.bottom){
      if(_hOverId!=='__root__'){
        _hOverId='__root__';_hPos='after';
        _removePlaceholder();
        list.querySelectorAll('.el-item').forEach(function(n){n.classList.remove('hier-over','hier-insert-before','hier-insert-after');});
        var ph=_makePlaceholder(0);
        ph.style.margin='3px 6px';
        list.appendChild(ph);
        _hPlaceholder=ph;
      }
    }
  };
  list.ondrop=function(e){
    e.preventDefault();
    _removePlaceholder();
    if(!_hDragId)return;
    var dragged=getEl(_hDragId);
    if(!dragged)return;
    if(e.target===list||e.target===document.getElementById('eemp')){
      if(dragged.parentId){
        saveH();
        unparent(dragged);
        renderEl(dragged);
        getDescendants(dragged.id).forEach(renderEl);
        renderHier();renderProps();
        toast('🔓 '+dragged.name+' → Root');
      }
    }
    _hDragId=null;_hOverId=null;_hPos=null;
  };
  hint();
}
function lTab(i){
  [0,1].forEach(function(j){
    document.getElementById('lt'+j).classList.toggle('on',j===i);
    document.getElementById('lc'+j).classList.toggle('on',j===i);
  });
}

// §14 PROPS HELPERS
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');}
function sec(t,c){return'<div style="border-bottom:1px solid var(--bd)"><div class="ps-hdr">'+t+'</div><div class="ps-body">'+c+'</div></div>';}
function nr(id,lb,k,mn,mx,v,st){
  st=st||1;var lid='L'+k.replace(/\W/g,'_')+id,dp=st<1?2:0;
  return'<div class="pr"><span class="pl">'+lb+'</span><input type="range" class="pi" min="'+mn+'" max="'+mx+'" step="'+st+'" value="'+v+'" style="flex:1" oninput="ps(\''+id+'\',\''+k+'\',+this.value);(document.getElementById(\''+lid+'\')||{}).textContent=parseFloat(this.value).toFixed('+dp+')"/><span class="pv" id="'+lid+'">'+parseFloat(v).toFixed(dp)+'</span></div>';
}
function cr(id,lb,k,v){return'<div class="pr"><span class="pl">'+lb+'</span><input type="color" class="pi" value="'+r2h(v)+'" oninput="psr(\''+id+'\',\''+k+'\',this.value)"/></div>';}
function tr2(id,lb,k,v){return'<div class="pr"><span class="pl">'+lb+'</span><input type="text" class="pi" value="'+esc(v||'')+'" oninput="ps(\''+id+'\',\''+k+'\',this.value)"/></div>';}
function ck(id,lb,k,v){return'<div class="pr"><span class="pl">'+lb+'</span><input type="checkbox" '+(v?'checked':'')+' onchange="ps(\''+id+'\',\''+k+'\',this.checked);var e=getEl(\''+id+'\');if(e){renderEl(e);renderProps();}"/></div>';}
function tog(id,k,opts,cur){return'<div class="pr"><span class="pl">'+k+'</span><div style="display:flex;gap:3px;flex:1">'+opts.map(function(a){return'<div class="to '+(cur===a?'on':'')+'" onclick="ps(\''+id+'\',\''+k+'\',\''+a+'\');renderProps()">'+a+'</div>';}).join('')+'</div></div>';}
function mr(id,mk,k,lb,mn,mx,v,st){
  st=st||1;var lid='M'+mk.replace(/\W/g,'_')+k+id,dp=st<1?2:0;
  return'<div class="pr"><span class="pl">'+lb+'</span><input type="range" class="pi" min="'+mn+'" max="'+mx+'" step="'+st+'" value="'+v+'" style="flex:1" oninput="ms(\''+id+'\',\''+mk+'\',\''+k+'\',+this.value);(document.getElementById(\''+lid+'\')||{}).textContent=parseFloat(this.value).toFixed('+dp+')"/><span class="pv" id="'+lid+'">'+parseFloat(v).toFixed(dp)+'</span></div>';
}
function mck(id,mk,k,lb,v){return'<div class="pr"><span class="pl">'+lb+'</span><input type="checkbox" '+(v?'checked':'')+' onchange="ms(\''+id+'\',\''+mk+'\',\''+k+'\',this.checked);var e=getEl(\''+id+'\');if(e){renderEl(e);renderProps();}"/></div>';}
function mtog(id,mk,k,opts,cur){return'<div class="pr"><span class="pl">'+k+'</span><div style="display:flex;gap:3px;flex:1">'+opts.map(function(a){return'<div class="to '+(cur===a?'on':'')+'" onclick="ms(\''+id+'\',\''+mk+'\',\''+k+'\',\''+a+'\');renderProps()">'+a[0]+'</div>';}).join('')+'</div></div>';}

// ───────────────────────────────────────────────────────────────
// §15  RENDER PROPS — đầy đủ UDim2 fields
// ───────────────────────────────────────────────────────────────
 
function renderProps(){
  var pp=document.getElementById('pp'), el=getEl(sel);
  if(!el){pp.innerHTML='<div class="no-sel">Chọn một element<br>để xem Properties</div>';return;}
  var id=el.id, c=COL[el.type]||'#888';
  var kids=getChildren(id), parEl=el.parentId?getEl(el.parentId):null;
  var r=getElRect(el); // world rect để hiển thị tham khảo
 
  var h='<div style="padding:8px;background:var(--bg2);border-bottom:1px solid var(--bd)">'
    +'<div style="font-size:11px;font-weight:700;color:'+c+'">'+el.type+'</div>'
    +'<input class="pi" style="margin-top:3px" value="'+esc(el.name)+'" placeholder="Name" oninput="ps(\''+id+'\',\'name\',this.value)"/>'
    +'</div>';
 
  // Hierarchy
  h+='<div style="border-bottom:1px solid var(--bd)"><div class="ps-hdr">🔗 Hierarchy</div><div class="ps-body">';
  h+=parEl
    ?'<div class="pr"><span class="pl">Parent</span><span style="color:var(--cy);font-size:10px;flex:1">'+parEl.name+'</span><button class="tbtn" style="padding:1px 5px;font-size:9px" onclick="unparent(getEl(\''+id+'\'));renderEl(getEl(\''+id+'\'));renderProps()">✕</button></div>'
    :'<div class="pr"><span class="pl">Parent</span><span style="color:var(--tx3);font-size:10px">None (canvas)</span></div>';
  if(kids.length){
    h+='<div class="pr" style="flex-direction:column;align-items:flex-start;gap:2px"><span class="pl" style="min-width:auto">Children ('+kids.length+')</span>';
    kids.forEach(function(ch){h+='<div style="padding:1px 6px;background:var(--bg3);border-radius:3px;font-size:9px;color:var(--ac3);cursor:pointer;width:100%" onclick="selEl(\''+ch.id+'\')">'+ch.name+'</div>';});
    h+='</div>';
  }
  h+='<div class="pr" style="font-size:9px;color:var(--tx3)">Alt+Drop trên canvas hoặc kéo trong Hierarchy</div></div></div>';
 
  // World coords (read-only, để tham khảo)
  h+='<div style="border-bottom:1px solid var(--bd)"><div class="ps-hdr">🌐 World (px)</div><div class="ps-body">'
    +'<div class="pr"><span class="pl">X</span><span class="pv" style="flex:1">'+Math.round(r.x)+'</span><span class="pl">Y</span><span class="pv" style="flex:1">'+Math.round(r.y)+'</span></div>'
    +'<div class="pr"><span class="pl">W</span><span class="pv" style="flex:1">'+Math.round(r.w)+'</span><span class="pl">H</span><span class="pv" style="flex:1">'+Math.round(r.h)+'</span></div>'
    +'<div class="pr" style="font-size:9px;color:var(--tx3)">Read-only — edit qua UDim2 bên dưới</div>'
    +'</div></div>';
 
  if(el.type!=='ScreenGui'){
    // UDim2 Position
    h+='<div style="border-bottom:1px solid var(--bd)"><div class="ps-hdr">📐 Position UDim2</div><div class="ps-body">';
    h+=nr(id,'Pos Scale X','psX',  -2,3,   el.psX||0,  0.001);
    h+=nr(id,'Pos Offset X','poX', -2000,2000, el.poX||0, 1);
    h+=nr(id,'Pos Scale Y','psY',  -2,3,   el.psY||0,  0.001);
    h+=nr(id,'Pos Offset Y','poY', -2000,2000, el.poY||0, 1);
    h+=nr(id,'Rotation','rot',     -360,360, el.rot||0, 0.5);
    h+='<div class="pr" style="font-size:9px;color:var(--tx3)">UDim2.new(psX,poX, psY,poY)</div>';
    h+='</div></div>';
 
    // UDim2 Size
    h+='<div style="border-bottom:1px solid var(--bd)"><div class="ps-hdr">📏 Size UDim2</div><div class="ps-body">';
    h+=nr(id,'Size Scale W','ssW', 0,2,    el.ssW||0,  0.001);
    h+=nr(id,'Size Offset W','soW',0,2000, el.soW||0,  1);
    h+=nr(id,'Size Scale H','ssH', 0,2,    el.ssH||0,  0.001);
    h+=nr(id,'Size Offset H','soH',0,2000, el.soH||0,  1);
    h+='<div class="pr" style="font-size:9px;color:var(--tx3)">UDim2.new(ssW,soW, ssH,soH)</div>';
    h+='</div></div>';
 
    // ZIndex + Visible
    h+='<div style="border-bottom:1px solid var(--bd)"><div class="ps-hdr">⚙ Layout</div><div class="ps-body">';
    h+=nr(id,'ZIndex','zi',0,20,el.zi||0);
    h+=nr(id,'Anchor X','ax',0,1,el.ax||0,0.01);
    h+=nr(id,'Anchor Y','ay',0,1,el.ay||0,0.01);
    h+=ck(id,'Visible','vis',el.vis!==false);
    h+='</div></div>';
  }
 
  // Appearance
  h+=sec('🎨 Appearance',
    cr(id,'BG','bc',el.bc)
    +nr(id,'Opacity','op',0,1,el.op||1,0.01)
    +nr(id,'Corner','cr',0,200,el.cr||0)
    +nr(id,'Border','bdw',0,20,el.bdw||0)
    +cr(id,'Bdr Col','bdc',el.bdc));
 
  // Type-specific props
  if(el.type==='TextLabel'||el.type==='TextButton'){
    var fo=FONTS.map(function(f){return'<option '+(el.fn===f?'selected':'')+' value="'+f+'">'+f+'</option>';}).join('');
    h+=sec('✏️ Text',
      tr2(id,'Text','txt',el.txt)
      +cr(id,'Color','tc',el.tc)
      +nr(id,'Size','tsz',6,96,el.tsz||14)
      +'<div class="pr"><span class="pl">Font</span><select class="pi" onchange="ps(\''+id+'\',\'fn\',this.value)">'+fo+'</select></div>'
      +tog(id,'txa',['Left','Center','Right'],el.txa)
      +tog(id,'tya',['Top','Center','Bottom'],el.tya)
      +ck(id,'Wrapped','tw',el.tw)
      +ck(id,'Scaled','tsc',el.tsc)
      +ck(id,'RichText','rt',el.rt));
  }
  if(el.type==='ImageLabel'||el.type==='ImageButton'){
    var so=['Stretch','Slice','Tile','Fit','Crop'].map(function(s){return'<option '+(el.st===s?'selected':'')+' value="'+s+'">'+s+'</option>';}).join('');
    h+=sec('🖼 Image',
      tr2(id,'Image ID','img',el.img)
      +cr(id,'Color','ic',el.ic)
      +nr(id,'Transp','it',0,1,el.it||0,0.01)
      +'<div class="pr"><span class="pl">Scale</span><select class="pi" onchange="ps(\''+id+'\',\'st\',this.value)">'+so+'</select></div>');
  }
  if(el.type==='ScrollingFrame') h+=sec('⊟ Scroll',nr(id,'Bar W','sbt',1,20,el.sbt||6)+cr(id,'Bar Col','sbc',el.sbc)+nr(id,'Canvas H','csy',100,2000,el.csy||200)+ck(id,'Enabled','se',el.se!==false));
  if(el.type==='VideoFrame') h+=sec('▶ Video',tr2(id,'Video ID','vid',el.vid)+nr(id,'Volume','vol',0,1,el.vol||0.5,0.01)+ck(id,'Playing','vplay',el.vplay)+ck(id,'Looped','vloop',el.vloop));
  if(el.type==='ScreenGui') h+=sec('⊡ ScreenGui',ck(id,'Enabled','en',el.en!==false)+nr(id,'DisplayOrd','dord',0,100,el.dord||0)+ck(id,'ResetOnSpawn','ros',el.ros!==false)+ck(id,'IgnoreInset','igi',el.igi));
  if(el.type==='CanvasGroup') h+=sec('⊞ Canvas',nr(id,'GroupTransp','gt',0,1,el.gt||0,0.01));
  if(el.type==='TextButton'||el.type==='ImageButton') h+=sec('🖱 Button',ck(id,'AutoColor','abc',el.abc!==false)+ck(id,'Modal','modal',el.modal));
 
  // Warp
  if(el.warp){
    var wp=el.warp;
    var wh='<div class="pr"><span class="pl" style="color:var(--yw)">Corner offsets</span></div>';
    ['tl','tr','br','bl'].forEach(function(k){
      wh+='<div class="pr"><span class="pl">'+k.toUpperCase()+' X</span><input type="range" class="pi" min="-100" max="100" value="'+(wp[k].x||0)+'" style="flex:1" oninput="wps(\''+id+'\',\''+k+'\',\'x\',+this.value)"/><span class="pv">'+(wp[k].x||0)+'</span></div>'
         +'<div class="pr"><span class="pl">'+k.toUpperCase()+' Y</span><input type="range" class="pi" min="-100" max="100" value="'+(wp[k].y||0)+'" style="flex:1" oninput="wps(\''+id+'\',\''+k+'\',\'y\',+this.value)"/><span class="pv">'+(wp[k].y||0)+'</span></div>';
    });
    wh+='<div class="pr"><button class="tbtn rd" style="width:100%;font-size:9px" onclick="resetWarp(\''+id+'\')">↺ Reset Warp</button></div>'
       +'<div class="pr" style="font-size:9px;color:var(--yw)">⚠ Warp không export Lua</div>';
    h+=sec('⌀ Warp',wh);
  }
 
  // Modifiers
  var mods=el.mods||{}, allM=Object.keys(MDEF);
  h+='<div style="border-bottom:1px solid var(--bd)"><div class="ps-hdr">✨ Modifiers</div><div class="ps-body">'
    +'<div style="padding:3px 8px 1px;font-size:9px;color:var(--tx3);font-weight:700">Click để toggle:</div>'
    +'<div class="mod-tags">';
  allM.forEach(function(mk){
    h+='<div class="mt '+(mods[mk]?'on':'')+'" onclick="'+(mods[mk]?'removeMod':'addMod')+'(\''+mk+'\')">'+mk.replace('UI','')+'</div>';
  });
  h+='</div>';
  Object.keys(mods).forEach(function(mk){
    var md=mods[mk], mh='';
    if(mk==='UICorner') mh+=mr(id,mk,'cr','Radius',0,200,md.cr||0);
    if(mk==='UIGradient') mh+='<div class="pr"><span class="pl">Color 0</span><input type="color" class="pi" value="'+(md.c0||'#7c6af7')+'" oninput="ms(\''+id+'\',\'UIGradient\',\'c0\',this.value)"/></div><div class="pr"><span class="pl">Color 1</span><input type="color" class="pi" value="'+(md.c1||'#22d3ee')+'" oninput="ms(\''+id+'\',\'UIGradient\',\'c1\',this.value)"/></div>'+mr(id,mk,'rot','Rotation',0,360,md.rot||0)+mck(id,mk,'en','Enabled',md.en!==false);
    if(mk==='UIStroke') mh+='<div class="pr"><span class="pl">Color</span><input type="color" class="pi" value="'+(md.col||'#7c6af7')+'" oninput="ms(\''+id+'\',\'UIStroke\',\'col\',this.value)"/></div>'+mr(id,mk,'th','Thickness',1,20,md.th||2)+mr(id,mk,'tr','Transparency',0,1,md.tr||0,0.01)+mck(id,mk,'en','Enabled',md.en!==false);
    if(mk==='UIPadding') mh+=mr(id,mk,'t','Top',0,100,md.t||0)+mr(id,mk,'b','Bottom',0,100,md.b||0)+mr(id,mk,'l','Left',0,100,md.l||0)+mr(id,mk,'r','Right',0,100,md.r||0);
    if(mk==='UIScale') mh+=mr(id,mk,'sc','Scale',0.1,5,md.sc||1,0.01);
    if(mk==='UIAspectRatioConstraint') mh+=mr(id,mk,'ar','Ratio',0.1,10,md.ar||1,0.01)+mtog(id,mk,'da',['Width','Height'],md.da);
    if(mk==='UISizeConstraint') mh+=mr(id,mk,'mnx','Min W',0,1000,md.mnx||0)+mr(id,mk,'mny','Min H',0,1000,md.mny||0)+mr(id,mk,'mxx','Max W',0,2000,md.mxx||999)+mr(id,mk,'mxy','Max H',0,2000,md.mxy||999);
    if(mk==='UITextSizeConstraint') mh+=mr(id,mk,'mn','MinSize',1,100,md.mn||6)+mr(id,mk,'mx','MaxSize',1,200,md.mx||100);
    if(mk==='UIListLayout') mh+=mtog(id,mk,'fd',['Horizontal','Vertical'],md.fd)+mr(id,mk,'pd','Padding',0,50,md.pd||0)+mck(id,mk,'wr','Wraps',md.wr);
    if(mk==='UIGridLayout') mh+=mr(id,mk,'cs','CellSize',10,300,md.cs||100)+mr(id,mk,'cpx','PadX',0,50,md.cpx||4)+mr(id,mk,'cpy','PadY',0,50,md.cpy||4);
    if(mk==='UIFlexItem'){
      var fmo=['Fill','Shrink','Grow','None'].map(function(v){return'<option '+(md.fm===v?'selected':'')+'>'+v+'</option>';}).join('');
      mh+='<div class="pr"><span class="pl">FlexMode</span><select class="pi" onchange="ms(\''+id+'\',\'UIFlexItem\',\'fm\',this.value)">'+fmo+'</select></div>'+mr(id,mk,'gr','GrowRatio',0,10,md.gr||1,0.1)+mr(id,mk,'sr','ShrinkRatio',0,10,md.sr||1,0.1);
    }
    if(mk==='UIPageLayout') mh+=mck(id,mk,'an','Animated',md.an!==false)+mtog(id,mk,'ad',['Horizontal','Vertical'],md.ad)+mck(id,mk,'ci','Circular',md.ci);
    if(mh) h+='<div class="ms"><div class="ms-hdr"><span>'+mk+'</span><span class="ms-x" onclick="removeMod(\''+mk+'\')">✕</span></div><div>'+mh+'</div></div>';
  });
  h+='</div></div>';
  h+='<button class="delbtn" onclick="delSel()">🗑 Delete '+el.type+'</button>';
  pp.innerHTML=h;
}
 
// ps() — sửa để re-render descendants sau khi đổi UDim2 props
function ps(id,k,v){
  var el=getEl(id); if(!el)return;
  el[k]=v;
  renderEl(el);
  getDescendants(id).forEach(renderEl);
  // Nếu thay đổi UDim2 props, render props lại để world coords cập nhật
  if(['psX','poX','psY','poY','ssW','soW','ssH','soH'].indexOf(k)>=0) renderProps();
}
function psr(id,k,hex){var el=getEl(id);if(!el)return;el[k]=h2r(hex);renderEl(el);}
function ms(id,mk,k,v){var el=getEl(id);if(!el||!el.mods[mk])return;el.mods[mk][k]=v;renderEl(el);}
 

// ───────────────────────────────────────────────────────────────
// §16  EXPORT — Lua + HTML dùng UDim2 đúng chuẩn Roblox
// ───────────────────────────────────────────────────────────────

function setExTab(t){etab=t;document.getElementById('etl').classList.toggle('on',t==='lua');document.getElementById('eth').classList.toggle('on',t==='html');document.getElementById('ec').textContent=t==='lua'?buildLua():buildHTML();}
function showExport(){var code=etab==='lua'?buildLua():buildHTML();document.getElementById('ec').textContent=code;document.getElementById('einfo').textContent=els.length+' elements · '+code.split('\n').length+' lines';document.getElementById('em').classList.add('show');}
function hideExport(){document.getElementById('em').classList.remove('show');}
function copyCode(){navigator.clipboard.writeText(etab==='lua'?buildLua():buildHTML()).then(function(){toast('✅ Copied!');});}
function dlCode(){var code=etab==='lua'?buildLua():buildHTML(),ext=etab==='lua'?'.lua':'.html';var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([code],{type:'text/plain'}));a.download='roblox-ui'+ext;a.click();}
 
function _sorted(){
  var s=[];
  function add(el){s.push(el);getChildren(el.id).forEach(add);}
  els.filter(function(e){return!e.parentId;}).forEach(add);
  return s;
}
 
function buildLua(){
  var out='-- Generated by Roblox UI Builder '+VERSION+'\n'
    +'local PlayerGui=game:GetService("Players").LocalPlayer:WaitForChild("PlayerGui")\n\n';
 
  _sorted().forEach(function(el,i){
    var vn=(el.name||el.type+i).replace(/\W/g,'_');
    var par = el.parentId ? (getEl(el.parentId).name||'Frame').replace(/\W/g,'_') : 'PlayerGui';
 
    out+='local '+vn+'=Instance.new("'+el.type+'")\n';
    out+=vn+'.Name="'+el.name+'"\n';
    out+=vn+'.Parent='+par+'\n';
 
    if(el.type!=='ScreenGui'){
      // Position UDim2
      var psX=(el.psX||0), poX=Math.round(el.poX||0);
      var psY=(el.psY||0), poY=Math.round(el.poY||0);
      out+=vn+'.Position=UDim2.new('+_f(psX)+','+poX+','+_f(psY)+','+poY+')\n';
 
      // Size UDim2
      var ssW=(el.ssW||0), soW=Math.round(el.soW||0);
      var ssH=(el.ssH||0), soH=Math.round(el.soH||0);
      out+=vn+'.Size=UDim2.new('+_f(ssW)+','+soW+','+_f(ssH)+','+soH+')\n';
 
      // AnchorPoint
      out+=vn+'.AnchorPoint=Vector2.new('+_f(el.ax||0)+','+_f(el.ay||0)+')\n';
 
      // ZIndex
      out+=vn+'.ZIndex='+(el.zi||0)+'\n';
 
      // BackgroundColor3
      if(el.bc) out+=vn+'.BackgroundColor3=Color3.fromRGB('+_rgb(el.bc)+')\n';
 
      // BackgroundTransparency (1 - opacity)
      out+=vn+'.BackgroundTransparency='+_f(1-(el.op||1))+'\n';
 
      if(el.vis===false) out+=vn+'.Visible=false\n';
      if(el.rot) out+=vn+'.Rotation='+_f(el.rot||0)+'\n';
    }
 
    if(el.warp) out+='-- Warp trên '+vn+' không export được\n';
 
    // TextLabel / TextButton
    if(el.type==='TextLabel'||el.type==='TextButton'){
      out+=vn+'.Text="'+String(el.txt||'').replace(/"/g,'\\"')+'"\n';
      if(el.tc) out+=vn+'.TextColor3=Color3.fromRGB('+_rgb(el.tc)+')\n';
      out+=vn+'.TextSize='+(el.tsz||14)+'\n';
      out+=vn+'.Font=Enum.Font.'+(el.fn||'GothamMedium')+'\n';
      out+=vn+'.TextXAlignment=Enum.TextXAlignment.'+(el.txa||'Left')+'\n';
      out+=vn+'.TextYAlignment=Enum.TextYAlignment.'+(el.tya||'Center')+'\n';
      if(el.tw) out+=vn+'.TextWrapped=true\n';
      if(el.tsc) out+=vn+'.TextScaled=true\n';
      if(el.rt) out+=vn+'.RichText=true\n';
    }
 
    // ImageLabel / ImageButton
    if(el.type==='ImageLabel'||el.type==='ImageButton'){
      if(el.img) out+=vn+'.Image="'+el.img+'"\n';
      if(el.ic) out+=vn+'.ImageColor3=Color3.fromRGB('+_rgb(el.ic)+')\n';
      out+=vn+'.ImageTransparency='+(el.it||0)+'\n';
      out+=vn+'.ScaleType=Enum.ScaleType.'+(el.st||'Stretch')+'\n';
    }
 
    // ScrollingFrame
    if(el.type==='ScrollingFrame'){
      out+=vn+'.ScrollBarThickness='+(el.sbt||6)+'\n';
      if(el.sbc) out+=vn+'.ScrollBarImageColor3=Color3.fromRGB('+_rgb(el.sbc)+')\n';
      out+=vn+'.CanvasSize=UDim2.new(0,0,0,'+(el.csy||200)+')\n';
      if(el.se===false) out+=vn+'.ScrollingEnabled=false\n';
    }
 
    // VideoFrame
    if(el.type==='VideoFrame'){
      out+=vn+'.Video="'+(el.vid||'rbxassetid://0')+'"\n';
      out+=vn+'.Volume='+(el.vol||0.5)+'\n';
      if(el.vloop) out+=vn+'.Looped=true\n';
      if(el.vplay) out+=vn+':Play()\n';
    }
 
    // ScreenGui
    if(el.type==='ScreenGui'){
      if(el.en===false) out+=vn+'.Enabled=false\n';
      out+=vn+'.DisplayOrder='+(el.dord||0)+'\n';
      if(el.ros===false) out+=vn+'.ResetOnSpawn=false\n';
      if(el.igi) out+=vn+'.IgnoreGuiInset=true\n';
    }
 
    // CanvasGroup
    if(el.type==='CanvasGroup') out+=vn+'.GroupTransparency='+(el.gt||0)+'\n';
 
    // TextButton / ImageButton
    if(el.type==='TextButton'||el.type==='ImageButton'){
      if(el.abc===false) out+=vn+'.AutoButtonColor=false\n';
      if(el.modal) out+=vn+'.Modal=true\n';
    }
 
    // Modifiers
    Object.keys(el.mods||{}).forEach(function(mk){
      var md=el.mods[mk], mv=mk+'_'+vn;
      out+='\nlocal '+mv+'=Instance.new("'+mk+'")\n'+mv+'.Parent='+vn+'\n';
      if(mk==='UICorner') out+=mv+'.CornerRadius=UDim.new(0,'+(md.cr||0)+')\n';
      if(mk==='UIGradient'){
        var c0=h2r(md.c0||'#7c6af7'), c1=h2r(md.c1||'#22d3ee');
        out+=mv+'.Color=ColorSequence.new({ColorSequenceKeypoint.new(0,Color3.fromRGB('+_rgb(c0)+')),ColorSequenceKeypoint.new(1,Color3.fromRGB('+_rgb(c1)+'))})\n';
        out+=mv+'.Rotation='+(md.rot||0)+'\n';
      }
      if(mk==='UIStroke'){
        var sc2=h2r(md.col||'#7c6af7');
        out+=mv+'.Color=Color3.fromRGB('+_rgb(sc2)+')\n'+mv+'.Thickness='+(md.th||2)+'\n'+mv+'.Transparency='+(md.tr||0)+'\n';
      }
      if(mk==='UIPadding') out+=mv+'.PaddingTop=UDim.new(0,'+(md.t||0)+')\n'+mv+'.PaddingBottom=UDim.new(0,'+(md.b||0)+')\n'+mv+'.PaddingLeft=UDim.new(0,'+(md.l||0)+')\n'+mv+'.PaddingRight=UDim.new(0,'+(md.r||0)+')\n';
      if(mk==='UIScale') out+=mv+'.Scale='+(md.sc||1)+'\n';
      if(mk==='UIAspectRatioConstraint') out+=mv+'.AspectRatio='+(md.ar||1)+'\n'+mv+'.AspectType=Enum.AspectType.'+(md.at||'FitWithinMaxSize')+'\n'+mv+'.DominantAxis=Enum.DominantAxis.'+(md.da||'Width')+'\n';
      if(mk==='UISizeConstraint') out+=mv+'.MinSize=Vector2.new('+(md.mnx||0)+','+(md.mny||0)+')\n'+mv+'.MaxSize=Vector2.new('+(md.mxx||999)+','+(md.mxy||999)+')\n';
      if(mk==='UITextSizeConstraint') out+=mv+'.MinTextSize='+(md.mn||6)+'\n'+mv+'.MaxTextSize='+(md.mx||100)+'\n';
      if(mk==='UIListLayout') out+=mv+'.FillDirection=Enum.FillDirection.'+(md.fd||'Vertical')+'\n'+mv+'.HorizontalAlignment=Enum.HorizontalAlignment.'+(md.ha||'Left')+'\n'+mv+'.VerticalAlignment=Enum.VerticalAlignment.'+(md.va||'Top')+'\n'+mv+'.SortOrder=Enum.SortOrder.'+(md.so||'LayoutOrder')+'\n'+mv+'.Padding=UDim.new(0,'+(md.pd||0)+')\n';
      if(mk==='UIGridLayout') out+=mv+'.CellSize=UDim2.new(0,'+(md.cs||100)+',0,'+(md.cs||100)+')\n'+mv+'.CellPadding=UDim2.new(0,'+(md.cpx||4)+',0,'+(md.cpy||4)+')\n'+mv+'.FillDirection=Enum.FillDirection.'+(md.fd||'Horizontal')+'\n'+mv+'.SortOrder=Enum.SortOrder.'+(md.so||'LayoutOrder')+'\n';
      if(mk==='UITableLayout') out+=mv+'.FillEmptySpaceColumns='+(md.fec?'true':'false')+'\n'+mv+'.FillEmptySpaceRows='+(md.fer?'true':'false')+'\n';
      if(mk==='UIPageLayout') out+=mv+'.Animated='+(md.an!==false?'true':'false')+'\n'+mv+'.AnimationDirection=Enum.AnimationDirection.'+(md.ad||'Horizontal')+'\n'+mv+'.Circular='+(md.ci?'true':'false')+'\n';
      if(mk==='UIFlexItem') out+=mv+'.FlexMode=Enum.UIFlexMode.'+(md.fm||'Fill')+'\n'+mv+'.GrowRatio='+(md.gr||1)+'\n'+mv+'.ShrinkRatio='+(md.sr||1)+'\n';
    });
 
    if(el.type==='TextButton'||el.type==='ImageButton')
      out+='\n'+vn+'.MouseButton1Click:Connect(function()\n\t-- TODO\nend)\n';
 
    out+='\n';
  });
  return out;
}
 
function buildHTML(){
  var out='<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n'
    +'<style>body{margin:0;background:#0d0d14}.ui{position:relative;width:800px;height:600px}</style>\n'
    +'</head>\n<body>\n<div class="ui">\n';
  _sorted().forEach(function(el){
    if(el.type==='ScreenGui') return;
    var r=getElRect(el);
    var bg=el.bc?'rgb('+_rgb(el.bc)+')':'#222';
    var m=el.mods||{};
    var st='position:absolute;left:'+Math.round(r.x)+'px;top:'+Math.round(r.y)+'px;width:'+Math.round(r.w)+'px;height:'+Math.round(r.h)+'px;opacity:'+(el.op||1)+';z-index:'+(el.zi||0)+';';
    if(r.rot) st+='transform:rotate('+r.rot+'deg);transform-origin:center;';
    if(m.UICorner) st+='border-radius:'+(m.UICorner.cr||0)+'px;';
    if(m.UIGradient&&m.UIGradient.en!==false) st+='background:linear-gradient('+(m.UIGradient.rot||0)+'deg,'+m.UIGradient.c0+','+m.UIGradient.c1+');';
    else st+='background:'+bg+';';
    if(m.UIStroke&&m.UIStroke.en!==false) st+='outline:'+(m.UIStroke.th||2)+'px solid '+(m.UIStroke.col||'#7c6af7')+';';
    if(m.UIPadding) st+='padding:'+(m.UIPadding.t||0)+'px '+(m.UIPadding.r||0)+'px '+(m.UIPadding.b||0)+'px '+(m.UIPadding.l||0)+'px;';
    if(el.warp){
      var w=el.warp,W=r.w,H=r.h;
      var pts=[[w.tl.x,w.tl.y],[W+w.tr.x,w.tr.y],[W+w.br.x,H+w.br.y],[w.bl.x,H+w.bl.y]]
        .map(function(p){return(p[0]/W*100).toFixed(1)+'% '+(p[1]/H*100).toFixed(1)+'%';});
      st+='clip-path:polygon('+pts.join(',')+')';
    }
    if(el.type==='TextLabel'||el.type==='TextButton'){
      var tc=el.tc?'rgb('+_rgb(el.tc)+')':'#fff';
      st+='display:flex;align-items:center;justify-content:'+(el.txa==='Center'?'center':el.txa==='Right'?'flex-end':'flex-start')+';color:'+tc+';font-size:'+(el.tsz||14)+'px;font-weight:'+(el.type==='TextButton'?700:400)+';padding:0 7px;'+(el.type==='TextButton'?'cursor:pointer;':'');
      out+='  <div style="'+st+'">'+(el.txt||'')+'</div>\n';
    } else {
      out+='  <div style="'+st+'"></div>\n';
    }
  });
  return out+'</div>\n</body>\n</html>';
}
 
// ─── Helpers ───
function _f(n){return parseFloat((n||0).toFixed(4));}
function _rgb(c){return Math.round(c.r||0)+','+Math.round(c.g||0)+','+Math.round(c.b||0);}

// ───────────────────────────────────────────────────────────────
// §17  KEYBOARD — sửa Arrow keys dùng encodeUDim2
// ───────────────────────────────────────────────────────────────

var _ctrlUsed = false;
document.addEventListener('keydown', function(e) {
  var t = document.activeElement.tagName;
  if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
  if (e.ctrlKey && e.key !== 'Control') _ctrlUsed = true;
  if (e.key === 'Delete' || e.key === 'Backspace') delSel();
  if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
  if (e.ctrlKey && e.key === 'd') { e.preventDefault(); dupSel(); }
  if (e.ctrlKey && e.key === 'a') {
    e.preventDefault();
    if (!els.length) return;
    selGroup = els.map(function(e) { return e.id; });
    sel = selGroup[selGroup.length - 1];
    els.forEach(function(e) { renderEl(e); });
    updateAlignBar();
    renderProps();
    renderHier();
    renderGroupBox();
    toast('✦ Selected all ' + els.length + ' elements');
    return;
  }
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault();
    var child = getEl(sel);
    if (!child) { toast('⚠ Chọn element trước!'); return; }
    // FIX BUG4: bỏ child.x/y/w/h, dùng getElRect
    var _cr = getElRect(child);
    var cx = _cr.x + _cr.w / 2, cy = _cr.y + _cr.h / 2;
    var best = null, bestA = Infinity;
    els.forEach(function(el) {
      if (el.id === child.id || isAncestor(el.id, child.id)) return;
      // FIX BUG4: bỏ getAbsPos + el.w/h, dùng getElRect
      var _er = getElRect(el);
      if (cx >= _er.x && cx <= _er.x + _er.w && cy >= _er.y && cy <= _er.y + _er.h) {
        var area = _er.w * _er.h; // FIX BUG4: bỏ el.w * el.h
        if (area < bestA) { bestA = area; best = el; }
      }
    });
    if (best) {
      saveH(); setParent(child, best.id);
      renderEl(child); getDescendants(child.id).forEach(renderEl);
      renderHier(); renderProps();
      toast('📦 ' + child.name + ' → child của ' + best.name);
    } else { toast('⚠ Không tìm thấy parent phù hợp!'); }
    return;
  }
  if (e.key === 'Escape') { setTool('sel'); selEl(null); renderProps(); dtool = null; }
  var el = getEl(sel); if (!el) return;
  var st = e.shiftKey ? 10 : 1;
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    clearTimeout(_arrowSaveTimer);
    _arrowSaveTimer = setTimeout(saveH, 300);
  }
  var _r=getElRect(el);
  if(e.key==='ArrowUp')    encodeUDim2(el,_r.x,Math.max(0,_r.y-st),_r.w,_r.h);
  if(e.key==='ArrowDown')  encodeUDim2(el,_r.x,_r.y+st,_r.w,_r.h);
  if(e.key==='ArrowLeft')  encodeUDim2(el,Math.max(0,_r.x-st),_r.y,_r.w,_r.h);
  if(e.key==='ArrowRight') encodeUDim2(el,_r.x+st,_r.y,_r.w,_r.h);
  renderEl(el); getDescendants(el.id).forEach(renderEl);
});
document.addEventListener('keyup', function(e) {
  if (e.key === 'Control') {
    var t = document.activeElement.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') { _ctrlUsed = false; return; }
    if (!_ctrlUsed) cycleTransformMode();
    _ctrlUsed = false;
  }
});
var _arrowSaveTimer = null;

// §18 INIT
(function(){
  var tb=document.getElementById('topbar'),btn=document.createElement('button');
  btn.id='btn-tmode';btn.className='tbtn active';btn.title='Ctrl để đổi: Scale→Move→Rotate→All→Warp';btn.onclick=cycleTransformMode;
  var sep=document.querySelector('.sep');
  if(sep&&sep.nextSibling)tb.insertBefore(btn,sep.nextSibling.nextSibling);else tb.appendChild(btn);
  updateTransformUI();
  var s=document.createElement('style');
  s.textContent=
    '.parent-ind{position:absolute;bottom:2px;left:3px;font-size:8px;color:rgba(34,211,238,.6);pointer-events:none;font-weight:700}'+
    '.children-ind{position:absolute;bottom:2px;right:3px;font-size:8px;color:rgba(34,211,238,.7);pointer-events:none;font-weight:700}'+
    '.rh{position:absolute;width:9px;height:9px;background:var(--ac);border:2px solid var(--bg0);border-radius:2px;z-index:100}'+
    '.wh{z-index:102}.roth{position:absolute;cursor:grab}'+
    '#btn-tmode{min-width:90px;text-align:center}'+
    '.tmode-0{background:var(--ac)!important;color:#fff!important}'+
    '.tmode-1{background:#4ade80!important;color:#000!important;border-color:#4ade80!important}'+
    '.tmode-2{background:#22d3ee!important;color:#000!important;border-color:#22d3ee!important}'+
    '.tmode-3{background:linear-gradient(90deg,var(--ac),#22d3ee)!important;color:#fff!important}'+
    '.tmode-4{background:#f59e0b!important;color:#000!important;border-color:#f59e0b!important}'+
    '.hier-over{background:rgba(124,106,247,.22)!important;outline:1px solid var(--ac);border-radius:4px}'+
    '.hier-unpar{margin-left:auto;font-size:9px;color:var(--rd);cursor:pointer;padding:0 3px;opacity:.6}'+
    '.hier-unpar:hover{opacity:1}'+
    '.el-item[draggable]{cursor:grab}'+
    '.el-item[draggable]:active{cursor:grabbing}'+
    '#group-box{transition:none}';
  document.head.appendChild(s);
  document.querySelectorAll('.version-tag').forEach(function(el){ el.textContent = VERSION; });
  renderProps();hint();
})();

// ───────────────────────────────────────────────────────────────
// §19  ALIGNMENT — sửa dùng getElRect
// ───────────────────────────────────────────────────────────────

function updateAlignBar(){var bar=document.getElementById('align-bar');if(!bar)return;bar.style.display=selGroup.length>=2?'flex':'none';}
 
function alignLeft(){
  var group=selGroup.map(getEl).filter(Boolean); if(group.length<2)return; saveH();
  var minX=Math.min.apply(null,group.map(function(e){return getElRect(e).x;}));
  group.forEach(function(e){
    var r=getElRect(e); encodeUDim2(e,minX,r.y,r.w,r.h); renderEl(e);
  }); toast('⬤ Align Left');
}
function alignRight(){
  var group=selGroup.map(getEl).filter(Boolean); if(group.length<2)return; saveH();
  var maxX=Math.max.apply(null,group.map(function(e){var r=getElRect(e);return r.x+r.w;}));
  group.forEach(function(e){
    var r=getElRect(e); encodeUDim2(e,maxX-r.w,r.y,r.w,r.h); renderEl(e);
  }); toast('⬤ Align Right');
}
function alignCenterH(){
  var group=selGroup.map(getEl).filter(Boolean); if(group.length<2)return; saveH();
  var minX=Math.min.apply(null,group.map(function(e){return getElRect(e).x;}));
  var maxX=Math.max.apply(null,group.map(function(e){var r=getElRect(e);return r.x+r.w;}));
  var cx=(minX+maxX)/2;
  group.forEach(function(e){
    var r=getElRect(e); encodeUDim2(e,cx-r.w/2,r.y,r.w,r.h); renderEl(e);
  }); toast('⬤ Center H');
}
function alignTop(){
  var group=selGroup.map(getEl).filter(Boolean); if(group.length<2)return; saveH();
  var minY=Math.min.apply(null,group.map(function(e){return getElRect(e).y;}));
  group.forEach(function(e){
    var r=getElRect(e); encodeUDim2(e,r.x,minY,r.w,r.h); renderEl(e);
  }); toast('⬤ Align Top');
}
function alignBottom(){
  var group=selGroup.map(getEl).filter(Boolean); if(group.length<2)return; saveH();
  var maxY=Math.max.apply(null,group.map(function(e){var r=getElRect(e);return r.y+r.h;}));
  group.forEach(function(e){
    var r=getElRect(e); encodeUDim2(e,r.x,maxY-r.h,r.w,r.h); renderEl(e);
  }); toast('⬤ Align Bottom');
}
function alignCenterV(){
  var group=selGroup.map(getEl).filter(Boolean); if(group.length<2)return; saveH();
  var minY=Math.min.apply(null,group.map(function(e){return getElRect(e).y;}));
  var maxY=Math.max.apply(null,group.map(function(e){var r=getElRect(e);return r.y+r.h;}));
  var cy=(minY+maxY)/2;
  group.forEach(function(e){
    var r=getElRect(e); encodeUDim2(e,r.x,cy-r.h/2,r.w,r.h); renderEl(e);
  }); toast('⬤ Center V');
}
function distributeH(){
  var group=selGroup.map(getEl).filter(Boolean); if(group.length<3)return; saveH();
  group.sort(function(a,b){return getElRect(a).x-getElRect(b).x;});
  var r0=getElRect(group[0]), rN=getElRect(group[group.length-1]);
  var minX=r0.x, maxX=rN.x+rN.w;
  var totalW=group.reduce(function(s,e){return s+getElRect(e).w;},0);
  var gap=(maxX-minX-totalW)/(group.length-1);
  var cur=minX;
  group.forEach(function(e){
    var r=getElRect(e); encodeUDim2(e,cur,r.y,r.w,r.h); renderEl(e); cur+=r.w+gap;
  }); toast('⬤ Distribute H');
}
function distributeV(){
  var group=selGroup.map(getEl).filter(Boolean); if(group.length<3)return; saveH();
  group.sort(function(a,b){return getElRect(a).y-getElRect(b).y;});
  var r0=getElRect(group[0]), rN=getElRect(group[group.length-1]);
  var minY=r0.y, maxY=rN.y+rN.h;
  var totalH=group.reduce(function(s,e){return s+getElRect(e).h;},0);
  var gap=(maxY-minY-totalH)/(group.length-1);
  var cur=minY;
  group.forEach(function(e){
    var r=getElRect(e); encodeUDim2(e,r.x,cur,r.w,r.h); renderEl(e); cur+=r.h+gap;
  }); toast('⬤ Distribute V');
}

// ───────────────────────────────────────────────────────────────
// §20  RULER — sửa dùng getElRect
// ───────────────────────────────────────────────────────────────
function toggleRuler(){
  rulerOn=!rulerOn;
  var btn=document.getElementById('btn-ruler');
  if(btn)btn.classList.toggle('active',rulerOn);
  var ov=document.getElementById('ruler-overlay');
  if(ov)ov.style.display=rulerOn?'block':'none';
  if(!rulerOn&&ov)ov.innerHTML='';
  toast(rulerOn?'📏 Ruler ON':'📏 Ruler OFF');
}
function toggleDistGuide(){
  distGuideOn=!distGuideOn;
  var btn=document.getElementById('btn-distguide');
  if(btn)btn.classList.toggle('active',distGuideOn);
  var ov=document.getElementById('ruler-overlay');
  if(!distGuideOn&&ov){
    ov.querySelectorAll('.rul-dist').forEach(function(e){e.remove();});
    if(!rulerOn)ov.style.display='none';
  }
  toast(distGuideOn?'📐 Dist ON':'📐 Dist OFF');
}
function updateRuler(el){
  if(!rulerOn||!el)return;
  var ov=document.getElementById('ruler-overlay'); if(!ov)return;
  ov.querySelectorAll('.rul-single').forEach(function(e){e.remove();});
  var b=getRotatedBounds(el);
  var x=Math.round(b.x),y=Math.round(b.y),w=Math.round(b.w),h=Math.round(b.h);
  var html='';
  html+='<div class="rul-single rul-line rul-h" style="top:'+y+'px;border-color:#22d3ee"></div>';
  html+='<div class="rul-single rul-line rul-h" style="top:'+(y+h)+'px;border-color:#22d3ee"></div>';
  html+='<div class="rul-single rul-line rul-v" style="left:'+x+'px;border-color:#22d3ee"></div>';
  html+='<div class="rul-single rul-line rul-v" style="left:'+(x+w)+'px;border-color:#22d3ee"></div>';
  html+='<div class="rul-single rul-lbl" style="left:'+(x+w/2)+'px;top:'+(y-18)+'px;color:#22d3ee">W: '+w+'px</div>';
  html+='<div class="rul-single rul-lbl" style="left:'+(x+w+8)+'px;top:'+(y+h/2)+'px;color:#22d3ee">H: '+h+'px</div>';
  html+='<div class="rul-single rul-lbl" style="left:'+(x+2)+'px;top:'+(y+2)+'px;color:#22d3ee">'+x+', '+y+'</div>';
  var tmp=document.createElement('div');tmp.innerHTML=html;
  while(tmp.firstChild)ov.appendChild(tmp.firstChild);
}
function updateRulerGroup(bounds,grp){
  if(!rulerOn)return;
  var ov=document.getElementById('ruler-overlay');
  if(!ov)return;
  ov.querySelectorAll('.rul-single').forEach(function(e){e.remove();});
  var bx=Math.round(bounds.x),by=Math.round(bounds.y),bw=Math.round(bounds.w),bh=Math.round(bounds.h);
  var html='';
  html+='<div class="rul-single rul-line rul-h" style="top:'+by+'px;border-color:#22d3ee;opacity:.9"></div>';
  html+='<div class="rul-single rul-line rul-h" style="top:'+(by+bh)+'px;border-color:#22d3ee;opacity:.9"></div>';
  html+='<div class="rul-single rul-line rul-v" style="left:'+bx+'px;border-color:#22d3ee;opacity:.9"></div>';
  html+='<div class="rul-single rul-line rul-v" style="left:'+(bx+bw)+'px;border-color:#22d3ee;opacity:.9"></div>';
  html+='<div class="rul-single rul-lbl" style="left:'+(bx+bw/2)+'px;top:'+(by-18)+'px;color:#22d3ee">W: '+bw+'px</div>';
  html+='<div class="rul-single rul-lbl" style="left:'+(bx+bw+8)+'px;top:'+(by+bh/2)+'px;color:#22d3ee">H: '+bh+'px</div>';
  grp.forEach(function(el){
    var b=getRotatedBounds(el);
    var x=Math.round(b.x),y=Math.round(b.y),w=Math.round(b.w),h=Math.round(b.h);
    html+='<div class="rul-single rul-line rul-h" style="top:'+y+'px;border-color:#fbbf24;opacity:.5"></div>';
    html+='<div class="rul-single rul-line rul-h" style="top:'+(y+h)+'px;border-color:#fbbf24;opacity:.5"></div>';
    html+='<div class="rul-single rul-line rul-v" style="left:'+x+'px;border-color:#fbbf24;opacity:.5"></div>';
    html+='<div class="rul-single rul-line rul-v" style="left:'+(x+w)+'px;border-color:#fbbf24;opacity:.5"></div>';
    html+='<div class="rul-single rul-lbl" style="left:'+(x+2)+'px;top:'+(y+2)+'px;color:#fbbf24;font-size:8px">'+el.name+'</div>';
  });
  var tmp=document.createElement('div');tmp.innerHTML=html;
  while(tmp.firstChild)ov.appendChild(tmp.firstChild);
}
function drawBoundingBox(x,y,w,h){
  var ov=document.getElementById('ruler-overlay');
  if(!ov)return;
  if(ov.style.display==='none')ov.style.display='block';
  ov.querySelectorAll('.rul-bbox').forEach(function(e){e.remove();});
  var color='#a16207';
  var lines=[
    'top:'+y+'px;left:'+x+'px;width:'+w+'px;height:1px',
    'top:'+(y+h)+'px;left:'+x+'px;width:'+w+'px;height:1px',
    'top:'+y+'px;left:'+x+'px;width:1px;height:'+h+'px',
    'top:'+y+'px;left:'+(x+w)+'px;width:1px;height:'+h+'px'
  ];
  lines.forEach(function(s){
    var d=document.createElement('div');
    d.className='rul-bbox';
    d.style.cssText='position:absolute;background:'+color+';opacity:.7;pointer-events:none;z-index:710;'+s;
    ov.appendChild(d);
  });
  var lb=document.createElement('div');
  lb.className='rul-bbox rul-lbl';
  lb.style.cssText='left:'+(x+w/2)+'px;top:'+(y-16)+'px;color:#a16207;background:rgba(13,13,20,.8);transform:translateX(-50%);';
  lb.textContent=Math.round(w)+'×'+Math.round(h);
  ov.appendChild(lb);
}
function drawResizeGuides(x, y, w, h) {
  var ov = document.getElementById('ruler-overlay');
  if (!ov) return;
  if (ov.style.display === 'none') ov.style.display = 'block';
  ov.querySelectorAll('.rul-resize').forEach(function(e) { e.remove(); });
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  var color = '#fbbf24';
  var lines = [
    'top:' + y + 'px;left:0;right:0;height:0;border-top:1px solid ' + color,
    'top:' + (y + h) + 'px;left:0;right:0;height:0;border-top:1px solid ' + color,
    'top:0;bottom:0;left:' + x + 'px;width:0;border-left:1px solid ' + color,
    'top:0;bottom:0;left:' + (x + w) + 'px;width:0;border-left:1px solid ' + color
  ];
  lines.forEach(function(s) {
    var d = document.createElement('div');
    d.className = 'rul-resize';
    d.style.cssText = 'position:absolute;opacity:.55;pointer-events:none;z-index:709;' + s;
    ov.appendChild(d);
  });
  var lbls = [
    { text: 'W: ' + w, css: 'left:' + (x + w / 2) + 'px;top:' + (y - 16) + 'px;transform:translateX(-50%);color:#fbbf24' },
    { text: 'H: ' + h, css: 'left:' + (x + w + 6) + 'px;top:' + (y + h / 2) + 'px;transform:translateY(-50%);color:#fbbf24' },
    { text: x + ', ' + y, css: 'left:' + (x + 2) + 'px;top:' + (y + 2) + 'px;color:#fbbf24' }
  ];
  lbls.forEach(function(l) {
    var d = document.createElement('div');
    d.className = 'rul-resize rul-lbl';
    d.style.cssText = l.css + ';background:rgba(13,13,20,.8);';
    d.textContent = l.text;
    ov.appendChild(d);
  });
}
var DIST_SNAP_THRESHOLD = 4;
function drawDistanceGuides(x, y, w, h) {
  if (!distGuideOn) return;
  var ov = document.getElementById('ruler-overlay');
  if (!ov) return;
  if (ov.style.display === 'none') ov.style.display = 'block';
  ov.querySelectorAll('.rul-dist').forEach(function(e) { e.remove(); });
  els.forEach(function(o) {
    if (selGroup.indexOf(o.id) >= 0) return;
    var b = getRotatedBounds(o);
    var ox = Math.round(b.x), oy = Math.round(b.y), ow = Math.round(b.w), oh = Math.round(b.h);
    var ex = Math.round(x), ey = Math.round(y), ew = Math.round(w), eh = Math.round(h);
    var ex2 = ex + ew, ey2 = ey + eh, ox2 = ox + ow, oy2 = oy + oh;
    var overlapV = ey < oy2 && ey2 > oy;
    var overlapH = ex < ox2 && ex2 > ox;
    var color = 'rgba(239,68,68,0.7)';
    if (overlapV) {
      var overlapTop = Math.max(ey, oy), overlapBottom = Math.min(ey2, oy2);
      var overlapMidY = Math.round((overlapTop + overlapBottom) / 2);
      if (ox > ex2) { var gapR = ox - ex2; _makeDistLine(ov, true, ex2, overlapMidY, gapR, color); _makeDistLabel(ov, ex2 + gapR / 2, overlapMidY - 10, gapR + 'px', color); }
      if (ex > ox2) { var gapL = ex - ox2; _makeDistLine(ov, true, ox2, overlapMidY, gapL, color); _makeDistLabel(ov, ox2 + gapL / 2, overlapMidY - 10, gapL + 'px', color); }
    }
    if (overlapH) {
      var overlapLeft = Math.max(ex, ox), overlapRight = Math.min(ex2, ox2);
      var overlapMidX = Math.round((overlapLeft + overlapRight) / 2);
      if (oy > ey2) { var gapB = oy - ey2; _makeDistLine(ov, false, overlapMidX, ey2, gapB, color); _makeDistLabel(ov, overlapMidX + 4, ey2 + gapB / 2, gapB + 'px', color); }
      if (ey > oy2) { var gapT = ey - oy2; _makeDistLine(ov, false, overlapMidX, oy2, gapT, color); _makeDistLabel(ov, overlapMidX + 4, oy2 + gapT / 2, gapT + 'px', color); }
    }
  });
}
function _makeDistLine(ov, isHoriz, x, y, len, color) {
  var d = document.createElement('div');
  d.className = 'rul-dist';
  if (isHoriz) {
    d.style.cssText = 'position:absolute;pointer-events:none;z-index:708;left:' + x + 'px;top:' + y + 'px;width:' + len + 'px;height:1px;background:' + color + ';';
  } else {
    d.style.cssText = 'position:absolute;pointer-events:none;z-index:708;left:' + x + 'px;top:' + y + 'px;width:1px;height:' + len + 'px;background:' + color + ';';
  }
  ov.appendChild(d);
}
function _makeDistLabel(ov, x, y, text, color) {
  var d = document.createElement('div');
  d.className = 'rul-dist rul-lbl';
  d.style.cssText = 'left:' + x + 'px;top:' + y + 'px;color:' + color + ';background:rgba(13,13,20,.85);transform:translate(-50%,-50%);font-size:8px;';
  d.textContent = text;
  ov.appendChild(d);
}
function clearResizeGuides(){
  var ov=document.getElementById('ruler-overlay');
  if(!ov)return;
  ov.querySelectorAll('.rul-bbox,.rul-resize,.rul-dist').forEach(function(e){e.remove();});
  if(!rulerOn&&!distGuideOn)ov.style.display='none';
  else if(rulerOn)ov.style.display='block';
}

// ───────────────────────────────────────────────────────────────
// §21  SMART GUIDES — sửa dùng getElRect
// ───────────────────────────────────────────────────────────────

var _guideLines = [];
var SNAP_THRESHOLD = 8;
function clearGuides() {
  _guideLines.forEach(function(g) { if (g.parentNode) g.parentNode.removeChild(g); });
  _guideLines = [];
}
function _drawGuide(isVertical, val, color) {
  var cv = document.getElementById('cv');
  var g = document.createElement('div');
  color = color || '#22d3ee';
  if (isVertical) {
    g.style.cssText = 'position:absolute;top:0;bottom:0;width:1px;background:' + color + ';opacity:.85;pointer-events:none;z-index:800;left:' + val + 'px;';
  } else {
    g.style.cssText = 'position:absolute;left:0;right:0;height:1px;background:' + color + ';opacity:.85;pointer-events:none;z-index:800;top:' + val + 'px;';
  }
  cv.appendChild(g);
  _guideLines.push(g);
}
function snapGuides(el){
  clearGuides();
  if(selGroup.length>1)return;
  var others=els.filter(function(e){return e.id!==el.id;});
  if(!others.length)return;
  // el ở đây là object tạm có .x/.y/.w/.h (world coords) — KHÔNG phải UDim2 el
  // startDrag truyền object tạm vào, sau đó encodeUDim2 từ kết quả
  var ex=el.x,ey=el.y,ew=el.w,eh=el.h;
  var ecx=ex+ew/2,ecy=ey+eh/2,ex2=ex+ew,ey2=ey+eh;
  var snapX=null,snapY=null;
  var THRESH=SNAP_THRESHOLD;
  others.forEach(function(o){
    if(snapX!==null&&snapY!==null)return;
    var or=getElRect(o);
    var ox=or.x,oy=or.y,ow=or.w,oh=or.h;
    var ocx=ox+ow/2,ocy=oy+oh/2,ox2=ox+ow,oy2=oy+oh;
    [[ex,ox],[ex,ox2],[ex,ocx],[ecx,ox],[ecx,ocx],[ecx,ox2],[ex2,ox],[ex2,ox2],[ex2,ocx]]
      .forEach(function(p){if(snapX===null&&Math.abs(p[0]-p[1])<THRESH){var delta=p[1]-p[0];el.x+=delta;ex=el.x;ex2=ex+ew;ecx=ex+ew/2;snapX=p[1];}});
    [[ey,oy],[ey,oy2],[ey,ocy],[ecy,oy],[ecy,ocy],[ecy,oy2],[ey2,oy],[ey2,oy2],[ey2,ocy]]
      .forEach(function(p){if(snapY===null&&Math.abs(p[0]-p[1])<THRESH){var delta=p[1]-p[0];el.y+=delta;ey=el.y;ey2=ey+eh;ecy=ey+eh/2;snapY=p[1];}});
  });
  if(snapX!==null)_drawGuide(true,snapX,'#22d3ee');
  if(snapY!==null)_drawGuide(false,snapY,'#22d3ee');
  _equalSpacingSnap(el,others,snapX,snapY);
}
function _equalSpacingSnap(el, others, alreadySnapX, alreadySnapY) {
  var THRESH = SNAP_THRESHOLD;
  var ov = document.getElementById('ruler-overlay');
 
  if (alreadySnapX === null) {
    var ex = el.x, ew = el.w, ex2 = ex + ew;
    for (var i = 0; i < others.length; i++) {
      for (var j = 0; j < others.length; j++) {
        if (i === j) continue;
        // §21-FIX BUG6: dùng getElRect thay vì getAbsPos + others[i].w
        var A = getElRect(others[i]);
        var B = getElRect(others[j]);
        var ax=A.x, aw=A.w, ax2=ax+aw;
        var bx=B.x, bw=B.w, bx2=bx+bw;
        if (bx >= ax2) {
          var refGap = bx - ax2;
          var targetX1 = bx2 + refGap;
          if (Math.abs(ex - targetX1) < THRESH) {
            el.x = targetX1;
            _drawEqualH(ov, ax, ax2, bx, bx2, el.x, el.x+ew, refGap, Math.min(A.y+A.h, B.y+B.h, el.y+el.h)+8);
            return;
          }
          var targetX2 = ax - refGap - ew;
          if (Math.abs(ex - targetX2) < THRESH) {
            el.x = targetX2;
            _drawEqualH(ov, el.x, el.x+ew, ax, ax2, bx, bx2, refGap, Math.min(A.y+A.h, B.y+B.h, el.y+el.h)+8);
            return;
          }
          var targetX3 = ax2 + refGap;
          if (Math.abs(ex - targetX3) < THRESH && targetX3+ew <= bx-refGap+THRESH) {
            el.x = targetX3;
            _drawEqualH(ov, ax, ax2, el.x, el.x+ew, bx, bx2, refGap, Math.min(A.y+A.h, B.y+B.h, el.y+el.h)+8);
            return;
          }
        }
      }
    }
  }
 
  if (alreadySnapY === null) {
    var ey = el.y, eh = el.h, ey2 = ey + eh;
    for (var i = 0; i < others.length; i++) {
      for (var j = 0; j < others.length; j++) {
        if (i === j) continue;
        // §21-FIX BUG6: dùng getElRect thay vì getAbsPos + others[i].h
        var A = getElRect(others[i]);
        var B = getElRect(others[j]);
        var ay=A.y, ah=A.h, ay2=ay+ah;
        var by=B.y, bh=B.h, by2=by+bh;
        if (by >= ay2) {
          var refGap = by - ay2;
          var targetY1 = by2 + refGap;
          if (Math.abs(ey - targetY1) < THRESH) {
            el.y = targetY1;
            _drawEqualV(ov, ay, ay2, by, by2, el.y, el.y+eh, refGap, Math.max(A.x+A.w, B.x+B.w, el.x+el.w)+8);
            return;
          }
          var targetY2 = ay - refGap - eh;
          if (Math.abs(ey - targetY2) < THRESH) {
            el.y = targetY2;
            _drawEqualV(ov, el.y, el.y+eh, ay, ay2, by, by2, refGap, Math.max(A.x+A.w, B.x+B.w, el.x+el.w)+8);
            return;
          }
          var targetY3 = ay2 + refGap;
          if (Math.abs(ey - targetY3) < THRESH && targetY3+eh <= by-refGap+THRESH) {
            el.y = targetY3;
            _drawEqualV(ov, ay, ay2, el.y, el.y+eh, by, by2, refGap, Math.max(A.x+A.w, B.x+B.w, el.x+el.w)+8);
            return;
          }
        }
      }
    }
  }
}
function _drawEqualH(ov, x1s, x1e, x2s, x2e, x3s, x3e, gap, y) {
  if (!ov || !distGuideOn) return;
  ov.querySelectorAll('.rul-dist').forEach(function(e) { e.remove(); });
  var col = 'rgba(239,68,68,0.85)', tickH = 6;
  [[x1e, x2s], [x2e, x3s]].forEach(function(seg) {
    if (seg[1] <= seg[0]) return;
    _makeDistLine(ov, true, seg[0], y, seg[1] - seg[0], col);
    _makeDistLine(ov, false, seg[0], y - tickH / 2, tickH, col);
    _makeDistLine(ov, false, seg[1] - 1, y - tickH / 2, tickH, col);
  });
  [[x1e, x2s], [x2e, x3s]].forEach(function(seg) {
    if (seg[1] <= seg[0]) return;
    _makeDistLabel(ov, (seg[0] + seg[1]) / 2, y - 10, gap + 'px', col);
  });
  [x1s, x1e, x2s, x2e, x3s, x3e].forEach(function(lx) { _makeDistLine(ov, false, lx, y - 14, 20, 'rgba(239,68,68,0.25)'); });
}
function _drawEqualV(ov, y1s, y1e, y2s, y2e, y3s, y3e, gap, x) {
  if (!ov || !distGuideOn) return;
  ov.querySelectorAll('.rul-dist').forEach(function(e) { e.remove(); });
  var col = 'rgba(239,68,68,0.85)', tickW = 6;
  [[y1e, y2s], [y2e, y3s]].forEach(function(seg) {
    if (seg[1] <= seg[0]) return;
    _makeDistLine(ov, false, x, seg[0], seg[1] - seg[0], col);
    _makeDistLine(ov, true, x - tickW / 2, seg[0], tickW, col);
    _makeDistLine(ov, true, x - tickW / 2, seg[1] - 1, tickW, col);
  });
  [[y1e, y2s], [y2e, y3s]].forEach(function(seg) {
    if (seg[1] <= seg[0]) return;
    _makeDistLabel(ov, x + 10, (seg[0] + seg[1]) / 2, gap + 'px', col);
  });
  [y1s, y1e, y2s, y2e, y3s, y3e].forEach(function(ly) { _makeDistLine(ov, true, x - 14, ly, 20, 'rgba(239,68,68,0.25)'); });
}
function snapGuidesGroup(bounds){
  clearGuides();
  var gx=bounds.x,gy=bounds.y,gw=bounds.w,gh=bounds.h;
  var gcx=gx+gw/2,gcy=gy+gh/2,gx2=gx+gw,gy2=gy+gh;
  var snapX=null,snapY=null;
  var THRESH=SNAP_THRESHOLD;
  var outsiders=els.filter(function(e){return selGroup.indexOf(e.id)<0;});
  outsiders.forEach(function(o){
    if(snapX!==null&&snapY!==null)return;
    var or=getElRect(o);
    var ox=or.x,oy=or.y,ow=or.w,oh=or.h;
    var ocx=ox+ow/2,ocy=oy+oh/2,ox2=ox+ow,oy2=oy+oh;
    [[gx,ox],[gx,ox2],[gx,ocx],[gcx,ox],[gcx,ocx],[gcx,ox2],[gx2,ox],[gx2,ox2],[gx2,ocx]]
      .forEach(function(p){if(snapX===null&&Math.abs(p[0]-p[1])<THRESH)snapX={delta:p[1]-p[0],val:p[1]};});
    [[gy,oy],[gy,oy2],[gy,ocy],[gcy,oy],[gcy,ocy],[gcy,oy2],[gy2,oy],[gy2,oy2],[gy2,ocy]]
      .forEach(function(p){if(snapY===null&&Math.abs(p[0]-p[1])<THRESH)snapY={delta:p[1]-p[0],val:p[1]};});
  });
  if(snapX!==null)_drawGuide(true,snapX.val,'#22d3ee');
  if(snapY!==null)_drawGuide(false,snapY.val,'#22d3ee');
  return{dx:snapX?snapX.delta:0,dy:snapY?snapY.delta:0};
}
function drawDistanceGuides(x,y,w,h){
  if(!distGuideOn)return;
  var ov=document.getElementById('ruler-overlay'); if(!ov)return;
  if(ov.style.display==='none')ov.style.display='block';
  ov.querySelectorAll('.rul-dist').forEach(function(e){e.remove();});
  els.forEach(function(o){
    if(selGroup.indexOf(o.id)>=0)return;
    var b=getRotatedBounds(o);
    var ox=Math.round(b.x),oy=Math.round(b.y),ow=Math.round(b.w),oh=Math.round(b.h);
    var ex=Math.round(x),ey=Math.round(y),ew=Math.round(w),eh=Math.round(h);
    var ex2=ex+ew,ey2=ey+eh,ox2=ox+ow,oy2=oy+oh;
    var overlapV=ey<oy2&&ey2>oy, overlapH=ex<ox2&&ex2>ox;
    var color='rgba(239,68,68,0.7)';
    if(overlapV){
      var overlapMidY=Math.round((Math.max(ey,oy)+Math.min(ey2,oy2))/2);
      if(ox>ex2){var gapR=ox-ex2;_makeDistLine(ov,true,ex2,overlapMidY,gapR,color);_makeDistLabel(ov,ex2+gapR/2,overlapMidY-10,gapR+'px',color);}
      if(ex>ox2){var gapL=ex-ox2;_makeDistLine(ov,true,ox2,overlapMidY,gapL,color);_makeDistLabel(ov,ox2+gapL/2,overlapMidY-10,gapL+'px',color);}
    }
    if(overlapH){
      var overlapMidX=Math.round((Math.max(ex,ox)+Math.min(ex2,ox2))/2);
      if(oy>ey2){var gapB=oy-ey2;_makeDistLine(ov,false,overlapMidX,ey2,gapB,color);_makeDistLabel(ov,overlapMidX+4,ey2+gapB/2,gapB+'px',color);}
      if(ey>oy2){var gapT=ey-oy2;_makeDistLine(ov,false,overlapMidX,oy2,gapT,color);_makeDistLabel(ov,overlapMidX+4,oy2+gapT/2,gapT+'px',color);}
    }
  });
}

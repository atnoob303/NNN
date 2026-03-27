// ═══════════════════════════════════════════════
// APP.JS — Roblox UI Builder v3.1
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

// §1 STATE & CONSTANTS
var els=[],sel=null,tool='sel',idc=0,hist=[],dtool=null,etab='lua';
var tMode=0,TMODES=['Scale','Move','Rotate','All','Warp'],TICONS=['⤢','✥','↻','⊕','⌀'];
var hierDrag=null;

var DEFS={
  Frame:         {bg:'#222236',bc:{r:34,g:34,b:54},  bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,rot:0},
  ScrollingFrame:{bg:'#1a1a28',bc:{r:26,g:26,b:40},  bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,sbt:6,sbc:{r:124,g:106,b:247},csy:200,se:true,rot:0},
  CanvasGroup:   {bg:'#2c2c45',bc:{r:44,g:44,b:69},  bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,gt:0.1,rot:0},
  ViewportFrame: {bg:'#111120',bc:{r:17,g:17,b:32},  bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,rot:0},
  VideoFrame:    {bg:'#111120',bc:{r:17,g:17,b:32},  bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,vid:'rbxassetid://0',vol:0.5,vplay:false,vloop:false,rot:0},
  ScreenGui:     {bg:'transparent',bc:{r:0,g:0,b:0},                        op:1,zi:0,vis:true,en:true,dord:0,ros:true,igi:false,rot:0},
  TextLabel:     {bg:'transparent',bc:{r:0,g:0,b:0},  bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,txt:'Label',tc:{r:226,g:226,b:240},tsz:14,fn:'GothamMedium',txa:'Left',tya:'Center',tw:false,tsc:false,rt:false,rot:0},
  ImageLabel:    {bg:'#313244',bc:{r:49,g:50,b:68},   bdc:{r:62,g:62,b:96}, bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,img:'rbxassetid://0',ic:{r:255,g:255,b:255},st:'Stretch',it:0,rot:0},
  TextButton:    {bg:'#7c6af7',bc:{r:124,g:106,b:247},bdc:{r:167,g:139,b:250},bdw:0,cr:8,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,txt:'Button',tc:{r:255,g:255,b:255},tsz:14,fn:'GothamBold',txa:'Center',tya:'Center',tw:false,abc:true,modal:false,rot:0},
  ImageButton:   {bg:'#f472b6',bc:{r:244,g:114,b:182},bdc:{r:251,g:113,b:133},bdw:0,cr:8,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,img:'rbxassetid://0',ic:{r:255,g:255,b:255},st:'Stretch',it:0,abc:true,modal:false,rot:0}
};
var MDEF={
  UICorner:{cr:8},UIGradient:{c0:'#7c6af7',c1:'#22d3ee',rot:0,en:true},
  UIStroke:{col:'#7c6af7',th:2,tr:0,en:true},UIPadding:{t:8,b:8,l:8,r:8},
  UIScale:{sc:1},UIAspectRatioConstraint:{ar:1,at:'FitWithinMaxSize',da:'Width'},
  UISizeConstraint:{mnx:0,mny:0,mxx:999,mxy:999},UITextSizeConstraint:{mn:6,mx:100},
  UIListLayout:{fd:'Vertical',ha:'Left',va:'Top',so:'LayoutOrder',pd:4,wr:false},
  UIGridLayout:{cs:100,cpx:4,cpy:4,fd:'Horizontal',ha:'Left',va:'Top',so:'LayoutOrder'},
  UITableLayout:{fec:false,fer:false,pd:0},
  UIPageLayout:{an:true,ad:'Horizontal',ci:false,es:'Quad',ed:'Out',pd:0},
  UIFlexItem:{fm:'Fill',gr:1,sr:1}
};
var FONTS=['GothamMedium','GothamBold','Gotham','Arial','ArialBold','Legacy','Highway','SciFi','Antique','Cartoon','Code','Fantasy','Garamond','Arcade','Ubuntu','Merriweather','Oswald','Nunito','Bangers','Creepster'];
var DW={TextLabel:160,TextButton:120,ImageLabel:100,ImageButton:100,VideoFrame:200,ViewportFrame:160,ScreenGui:400,ScrollingFrame:200,CanvasGroup:180};
var DH={TextLabel:32,TextButton:36,ImageLabel:100,ImageButton:100,VideoFrame:120,ViewportFrame:120,ScreenGui:300,ScrollingFrame:200,CanvasGroup:180};
var COL={Frame:'#7c6af7',ScrollingFrame:'#a78bfa',CanvasGroup:'#c4b5fd',ViewportFrame:'#60a5fa',VideoFrame:'#f59e0b',ScreenGui:'#22d3ee',TextLabel:'#4ade80',ImageLabel:'#34d399',TextButton:'#f472b6',ImageButton:'#fb7185'};

// §2 UTILS
function rgb(c){return c?'rgb('+Math.round(c.r||0)+','+Math.round(c.g||0)+','+Math.round(c.b||0)+')':'#888';}
function h2r(h){return{r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)};}
function r2h(c){return c?'#'+[c.r||0,c.g||0,c.b||0].map(function(x){return Math.round(x).toString(16).padStart(2,'0');}).join(''):'#313244';}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.style.opacity='1';clearTimeout(t._t);t._t=setTimeout(function(){t.style.opacity='0';},1800);}
function hint(){var a=els.length>0;document.getElementById('ehint').style.display=a?'none':'flex';document.getElementById('eemp').style.display=a?'none':'block';}
function saveH(){hist.push(JSON.parse(JSON.stringify(els)));if(hist.length>50)hist.shift();}
function getEl(id){return els.find(function(e){return e.id===id;});}

// §3 PARENT / CHILDREN
function getAbsPos(el){
  if(!el.parentId)return{x:el.x,y:el.y,rot:el.rot||0};
  var par=getEl(el.parentId);
  if(!par){el.parentId=null;return{x:el.x,y:el.y,rot:el.rot||0};}
  var pa=getAbsPos(par),pcx=pa.x+par.w/2,pcy=pa.y+par.h/2,pr=(pa.rot||0)*Math.PI/180;
  var rx=el.x*Math.cos(pr)-el.y*Math.sin(pr),ry=el.x*Math.sin(pr)+el.y*Math.cos(pr);
  return{x:pcx+rx-el.w/2,y:pcy+ry-el.h/2,rot:(pa.rot||0)+(el.rot||0)};
}
function getChildren(pid){return els.filter(function(e){return e.parentId===pid;});}
function getDescendants(id){
  var r=[];
  getChildren(id).forEach(function(c){r.push(c);getDescendants(c.id).forEach(function(d){r.push(d);});});
  return r;
}
function isAncestor(anc,cid){
  var e=getEl(cid);
  if(!e||!e.parentId)return false;
  return e.parentId===anc||isAncestor(anc,e.parentId);
}
function unparent(el){
  if(!el||!el.parentId)return;
  var a=getAbsPos(el);el.x=a.x;el.y=a.y;el.rot=a.rot;el.parentId=null;
  renderEl(el);renderHier();toast('🔓 Unparented');
}

// Lấy parent của el (null nếu root)
function getParentId(el){ return el.parentId||null; }

// Tính vị trí tương đối khi set parent mới
function setParent(dragged, newParentId){
  // Unparent cũ trước
  if(dragged.parentId){
    var abs=getAbsPos(dragged);
    dragged.x=abs.x;dragged.y=abs.y;dragged.rot=abs.rot||0;
    dragged.parentId=null;
  }
  if(!newParentId){ return; } // chỉ unparent, không set parent mới
  var par=getEl(newParentId);
  if(!par)return;
  dragged.parentId=newParentId;
  var pa=getAbsPos(par),pcx=pa.x+par.w/2,pcy=pa.y+par.h/2;
  dragged.x=dragged.x-pcx+dragged.w/2;
  dragged.y=dragged.y-pcy+dragged.h/2;
}

// Reorder: di chuyển dragged vào đúng vị trí trong mảng els (trước/sau target)
function reorderEl(draggedId, targetId, position){
  // position: 'before' | 'after'
  var di=els.findIndex(function(e){return e.id===draggedId;});
  var ti=els.findIndex(function(e){return e.id===targetId;});
  if(di<0||ti<0||di===ti)return;
  var dragged=els.splice(di,1)[0];
  ti=els.findIndex(function(e){return e.id===targetId;}); // tìm lại sau splice
  if(position==='after')ti++;
  els.splice(ti,0,dragged);
}

function tryReparent(drag){
  if(!drag)return;
  var dcx=drag.x+drag.w/2,dcy=drag.y+drag.h/2,best=null,bestA=0;
  els.forEach(function(el){
    if(el.id===drag.id||isAncestor(el.id,drag.id))return;
    var a=getAbsPos(el);
    if(dcx>=a.x&&dcx<=a.x+el.w&&dcy>=a.y&&dcy<=a.y+el.h){
      var area=el.w*el.h;if(area>bestA){bestA=area;best=el;}
    }
  });
  if(best&&best.id!==drag.parentId){
    setParent(drag,best.id);
    toast('📦 Parented to '+best.name);renderHier();
  }
}

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

// §5 TOOLS & ELEMENT FACTORY
function setTool(t){
  tool=t;
  document.getElementById('btn-sel').classList.toggle('active',t==='sel');
  document.getElementById('btn-drw').classList.toggle('active',t==='drw');
  document.getElementById('ca').style.cursor=t==='drw'?'crosshair':'default';
}
function mkEl(type,x,y,w,h){
  var d=JSON.parse(JSON.stringify(DEFS[type]||DEFS.Frame));
  var o={id:'el_'+(++idc),type:type,x:x,y:y,w:w,h:h,name:type+idc,mods:{},rot:0,parentId:null,warp:null};
  for(var k in d)o[k]=d[k];return o;
}

// §6 RENDER ELEMENT
function renderEl(el){
  var d=document.getElementById(el.id);
  if(!d){d=document.createElement('div');d.id=el.id;d.className='element';document.getElementById('cv').appendChild(d);}
  d.dataset.type=el.type;d.dataset.parentId=el.parentId||'';
  var ap=getAbsPos(el);
  var dx=el.parentId?ap.x:el.x,dy=el.parentId?ap.y:el.y,dr=el.parentId?ap.rot:(el.rot||0);
  d.style.cssText='position:absolute;cursor:move;left:'+dx+'px;top:'+dy+'px;width:'+el.w+'px;height:'+el.h+'px;z-index:'+((el.zi||0)+1)+';opacity:'+(el.op||1)+';display:'+(el.vis===false?'none':'')+';transform:rotate('+dr+'deg);transform-origin:center center;outline:none;border:none;';
  var m=el.mods||{};
  if(m.UIGradient&&m.UIGradient.en!==false){var g=m.UIGradient;d.style.background='linear-gradient('+(g.rot||0)+'deg,'+g.c0+','+g.c1+')';}
  else d.style.background=rgb(el.bc)||el.bg;
  d.style.borderRadius=((m.UICorner?m.UICorner.cr:el.cr)||0)+'px';
  if(m.UIStroke&&m.UIStroke.en!==false)d.style.outline=(m.UIStroke.th||2)+'px solid '+(m.UIStroke.col||'#7c6af7');
  else if(el.bdw>0)d.style.border=el.bdw+'px solid '+rgb(el.bdc);
  if(m.UIPadding){var p=m.UIPadding;d.style.padding=(p.t||0)+'px '+(p.r||0)+'px '+(p.b||0)+'px '+(p.l||0)+'px';}
  else d.style.padding='';
  if(el.warp)applyWarp(d,el);else d.style.clipPath='';
  var hasKids=els.some(function(e){return e.parentId===el.id;});
  d.style.boxShadow=(hasKids&&el.id!==sel)?'inset 0 0 0 2px rgba(34,211,238,0.3)':'';
  if(sel===el.id)d.classList.add('sel');else{d.classList.remove('sel');if(!m.UIStroke)d.style.outline='none';}
  d.innerHTML='';
  // Mod chips
  var mks=Object.keys(m);
  if(mks.length){var chip=document.createElement('div');chip.className='mod-chip';mks.slice(0,4).forEach(function(mk){var b=document.createElement('span');b.className='mod-bd';b.textContent=mk.replace('UI','');chip.appendChild(b);});d.appendChild(chip);}
  // Indicators
  if(el.parentId){var pi=document.createElement('div');pi.className='parent-ind';pi.textContent='⊂';pi.title='Child of '+((getEl(el.parentId)||{}).name||'?');d.appendChild(pi);}
  if(hasKids){var ci=document.createElement('div');ci.className='children-ind';ci.textContent='⊃'+getChildren(el.id).length;d.appendChild(ci);}
  // Content
  if(el.type==='TextLabel'||el.type==='TextButton'){
    var sp=document.createElement('div');
    sp.style.cssText='width:100%;height:100%;display:flex;align-items:center;pointer-events:none;color:'+rgb(el.tc)+';font-size:'+(el.tsz||14)+'px;font-weight:'+(el.type==='TextButton'?700:400)+';justify-content:'+(el.txa==='Center'?'center':el.txa==='Right'?'flex-end':'flex-start')+';padding:0 7px';
    sp.textContent=el.txt||el.type;d.appendChild(sp);
  }
  if(el.type==='ImageLabel'||el.type==='ImageButton'){var ph=document.createElement('div');ph.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:20px;opacity:.4;pointer-events:none';ph.textContent=el.type==='ImageButton'?'🔘':'🖼';d.appendChild(ph);}
  if(el.type==='VideoFrame'){var ph=document.createElement('div');ph.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;opacity:.5;pointer-events:none;flex-direction:column;gap:3px';ph.innerHTML='▶<div style="font-size:9px;color:#f59e0b;font-family:monospace">VIDEO</div>';d.appendChild(ph);}
  if(el.type==='ViewportFrame'){var ph=document.createElement('div');ph.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;opacity:.4;pointer-events:none;flex-direction:column;gap:3px';ph.innerHTML='📦<div style="font-size:9px;color:#60a5fa;font-family:monospace">3D</div>';d.appendChild(ph);}
  if(el.type==='ScrollingFrame'){var sb=document.createElement('div');sb.style.cssText='position:absolute;right:0;top:0;bottom:0;width:'+(el.sbt||6)+'px;background:'+rgb(el.sbc)+';opacity:.4;border-radius:3px';d.appendChild(sb);}
  if(el.type==='ScreenGui'){d.style.border='1px dashed rgba(34,211,238,.3)';var lb=document.createElement('div');lb.style.cssText='position:absolute;top:3px;left:4px;font-size:8px;color:#22d3ee;font-family:monospace;opacity:.6;font-weight:700;pointer-events:none';lb.textContent='⊡ ScreenGui';d.appendChild(lb);}
  if(sel===el.id)addTransformHandles(d,el);
  d.onmousedown=function(e){
    if(e.target.classList.contains('rh')||e.target.classList.contains('wh')||e.target.classList.contains('roth'))return;
    e.stopPropagation();selEl(el.id);startDrag(el,e);
  };
  d.onclick=function(e){e.stopPropagation();selEl(el.id);};
}

// §7 WARP
function initWarp(el){el.warp={tl:{x:0,y:0},tr:{x:0,y:0},br:{x:0,y:0},bl:{x:0,y:0},ctrlT:{x:0,y:0},ctrlR:{x:0,y:0},ctrlB:{x:0,y:0},ctrlL:{x:0,y:0}};}
function applyWarp(d,el){
  if(!el.warp)return;
  var w=el.warp,W=el.w,H=el.h;
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
  var w=el.warp,W=el.w,H=el.h;
  [{key:'tl',s:'top:-5px;left:-5px'},{key:'tr',s:'top:-5px;right:-5px'},{key:'br',s:'bottom:-5px;right:-5px'},{key:'bl',s:'bottom:-5px;left:-5px'}]
  .forEach(function(c){var hd=document.createElement('div');hd.className='wh';hd.style.cssText='position:absolute;width:10px;height:10px;background:#f59e0b;border:2px solid var(--bg0);border-radius:2px;cursor:crosshair;z-index:102;'+c.s;hd.onmousedown=function(e){e.stopPropagation();e.preventDefault();startWarpCorner(el,c.key,e);};d.appendChild(hd);});
  [{key:'ctrlT',s:'top:-5px;left:50%;transform:translateX(-50%)'},{key:'ctrlR',s:'top:50%;right:-5px;transform:translateY(-50%)'},{key:'ctrlB',s:'bottom:-5px;left:50%;transform:translateX(-50%)'},{key:'ctrlL',s:'top:50%;left:-5px;transform:translateY(-50%)'}]
  .forEach(function(c){var hd=document.createElement('div');hd.className='wh';hd.style.cssText='position:absolute;width:8px;height:8px;background:#22d3ee;border:2px solid var(--bg0);border-radius:50%;cursor:crosshair;z-index:102;'+c.s;hd.onmousedown=function(e){e.stopPropagation();e.preventDefault();startWarpCtrl(el,c.key,e);};d.appendChild(hd);});
}

// §9 DRAG & SCALE & ROTATE
function startScaleHandle(el,pos,e){
  saveH();var sx=e.clientX,sy=e.clientY,ox=el.x,oy=el.y,ow=el.w,oh=el.h;
  function mm(ev){
    var dx=ev.clientX-sx,dy=ev.clientY-sy,sq=ev.shiftKey,nw=ow,nh=oh,nx=ox,ny=oy;
    if(pos==='tr'||pos==='mr'||pos==='br')nw=Math.max(20,ow+dx);
    if(pos==='tl'||pos==='ml'||pos==='bl'){nw=Math.max(20,ow-dx);nx=ox+ow-nw;}
    if(pos==='bl'||pos==='bc'||pos==='br')nh=Math.max(20,oh+dy);
    if(pos==='tl'||pos==='tc'||pos==='tr'){nh=Math.max(20,oh-dy);ny=oy+oh-nh;}
    if(sq&&(pos==='tl'||pos==='tr'||pos==='bl'||pos==='br')){var s=Math.max(nw,nh);nw=s;nh=s;if(pos==='tl'){nx=ox+ow-s;ny=oy+oh-s;}if(pos==='tr')ny=oy+oh-s;if(pos==='bl')nx=ox+ow-s;}
    if(pos==='tc'||pos==='bc'){nw=ow;nx=ox;}if(pos==='ml'||pos==='mr'){nh=oh;ny=oy;}
    el.w=nw;el.h=nh;el.x=nx;el.y=ny;renderEl(el);renderProps();updInfo(el);getDescendants(el.id).forEach(renderEl);
  }
  function mu(){document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);}
  document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
}
function startRotate(el,e){
  saveH();var d=document.getElementById(el.id),rc=d.getBoundingClientRect();
  var cx=rc.left+rc.width/2,cy=rc.top+rc.height/2,sa=Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI,sr=el.rot||0;
  function mm(ev){var a=Math.atan2(ev.clientY-cy,ev.clientX-cx)*180/Math.PI,r=sr+(a-sa);el.rot=ev.shiftKey?Math.round(r/15)*15:r;renderEl(el);updInfo(el);getDescendants(el.id).forEach(renderEl);}
  function mu(){document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);}
  document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
}
function startWarpCorner(el,key,e){
  saveH();if(!el.warp)initWarp(el);var sx=e.clientX,sy=e.clientY,ox=el.warp[key].x,oy=el.warp[key].y;
  function mm(ev){el.warp[key].x=ox+(ev.clientX-sx);el.warp[key].y=oy+(ev.clientY-sy);var d=document.getElementById(el.id);if(d)applyWarp(d,el);renderEl(el);}
  function mu(){document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);}
  document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
}
function startWarpCtrl(el,key,e){
  saveH();if(!el.warp)initWarp(el);var sx=e.clientX,sy=e.clientY,ox=el.warp[key].x,oy=el.warp[key].y;
  function mm(ev){el.warp[key].x=ox+(ev.clientX-sx);el.warp[key].y=oy+(ev.clientY-sy);renderEl(el);}
  function mu(){document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);}
  document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
}
function startDrag(el,e){
  saveH();var isKid=!!el.parentId,slx=el.x,sly=el.y,smx=e.clientX,smy=e.clientY,ox=e.clientX-el.x,oy=e.clientY-el.y;
  function mm(ev){
    if(isKid){el.x=slx+(ev.clientX-smx);el.y=sly+(ev.clientY-smy);}
    else{el.x=Math.max(0,ev.clientX-ox);el.y=Math.max(0,ev.clientY-oy);}
    renderEl(el);updInfo(el);if(!isKid)getDescendants(el.id).forEach(renderEl);
  }
  function mu(ev){
    document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);
    if(ev.altKey){tryReparent(el);renderEl(el);}
    renderHier();
  }
  document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
}
function updInfo(el){document.getElementById('cinfo').textContent=el.type+' · '+Math.round(el.x)+','+Math.round(el.y)+' · '+Math.round(el.w)+'×'+Math.round(el.h)+(el.rot?' · '+(el.rot||0).toFixed(1)+'°':'');}

// §10 SELECTION
function selEl(id){
  sel=id;
  els.forEach(function(e){
    var d=document.getElementById(e.id);
    if(d){d.classList.toggle('sel',e.id===id);if(e.id!==id&&!((e.mods||{}).UIStroke))d.style.outline='none';}
    renderEl(e);
  });
  renderProps();renderHier();
}

// §11 CANVAS DRAW
var ca=document.getElementById('ca');
ca.onmousedown=function(e){
  var t=e.target;
  if(t!==ca&&t!==document.getElementById('cv')&&!t.classList.contains('gridbg'))return;
  if(tool==='sel'){selEl(null);renderProps();return;}
  var r=ca.getBoundingClientRect(),ds={x:e.clientX-r.left,y:e.clientY-r.top};
  var el=mkEl(dtool||'Frame',ds.x,ds.y,10,10);
  saveH();els.push(el);renderEl(el);selEl(el.id);hint();
  function mm(ev){
    var nx=ev.clientX-r.left,ny=ev.clientY-r.top;
    el.x=Math.min(ds.x,nx);el.y=Math.min(ds.y,ny);
    var rw=Math.abs(nx-ds.x)||10,rh=Math.abs(ny-ds.y)||10;
    if(ev.shiftKey){var s=Math.max(rw,rh);el.w=s;el.h=s;}else{el.w=rw;el.h=rh;}
    renderEl(el);updInfo(el);
  }
  function mu(){if(el.w<20)el.w=DW[el.type]||160;if(el.h<20)el.h=DH[el.type]||80;renderEl(el);renderProps();setTool('sel');dtool=null;document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);}
  document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
};

// §12 ADD / REMOVE / HISTORY
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
  var o=getEl(sel);if(!o)return;
  saveH();var c=JSON.parse(JSON.stringify(o));c.id='el_'+(++idc);c.name=o.type+idc;c.x+=20;c.y+=20;
  els.push(c);renderEl(c);selEl(c.id);renderHier();
}
function delSel(){
  if(!sel)return;saveH();
  getChildren(sel).forEach(function(c){c.parentId=null;});
  var d=document.getElementById(sel);if(d)d.remove();
  els=els.filter(function(e){return e.id!==sel;});sel=null;renderProps();renderHier();hint();
}
function clearAll(){
  if(els.length&&!confirm('Xóa tất cả?'))return;saveH();
  els.forEach(function(e){var d=document.getElementById(e.id);if(d)d.remove();});
  els=[];sel=null;renderProps();renderHier();hint();
}
function undo(){
  if(!hist.length)return;
  els.forEach(function(e){var d=document.getElementById(e.id);if(d)d.remove();});
  els=hist.pop();sel=null;els.forEach(renderEl);renderProps();renderHier();hint();
}

// §13 HIERARCHY (drag-drop như Roblox Studio)
// State cho drag trong hierarchy
var _hDragId=null;       // id đang kéo
var _hOverId=null;       // id đang hover
var _hPos=null;          // 'before'|'inside'|'after'
var _hPlaceholder=null;  // div placeholder

function _removePlaceholder(){
  if(_hPlaceholder&&_hPlaceholder.parentNode)_hPlaceholder.parentNode.removeChild(_hPlaceholder);
  _hPlaceholder=null;
}

function _makePlaceholder(depth,label){
  var ph=document.createElement('div');
  ph.id='hier-ph';
  ph.style.cssText='height:3px;margin:1px 0;border-radius:2px;background:var(--ac);opacity:.85;pointer-events:none;transition:all .1s;';
  ph.style.marginLeft=(7+depth*14)+'px';
  if(label){
    var lb=document.createElement('div');
    lb.style.cssText='position:absolute;left:'+(14+depth*14)+'px;top:-8px;font-size:8px;color:var(--ac);font-weight:700;pointer-events:none;font-family:monospace;';
    lb.textContent=label;
    // không append label vào ph vì ph là inline
  }
  return ph;
}

function renderHier(){
  var list=document.getElementById('elist');
  list.innerHTML='';
  document.getElementById('eemp').style.display=els.length?'none':'block';

  // Flat list theo thứ tự render (DFS)
  var flatNodes=[]; // [{el, depth}]
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

    // ── DRAG START ──
    d.ondragstart=function(e){
      _hDragId=el.id;
      e.dataTransfer.effectAllowed='move';
      setTimeout(function(){d.style.opacity='0.35';},0);
    };

    // ── DRAG END ──
    d.ondragend=function(){
      _hDragId=null;_hOverId=null;_hPos=null;
      d.style.opacity='';
      _removePlaceholder();
      // Xóa highlight tất cả
      list.querySelectorAll('.el-item').forEach(function(n){
        n.classList.remove('hier-over','hier-insert-before','hier-insert-after');
        n.style.transform='';
      });
    };

    // ── DRAG OVER ──
    d.ondragover=function(e){
      e.preventDefault();
      if(!_hDragId||_hDragId===el.id||isAncestor(el.id,_hDragId))return;
      e.dataTransfer.dropEffect='move';

      var rect=d.getBoundingClientRect();
      var relY=e.clientY-rect.top;
      var pct=relY/rect.height;

      // Xác định vùng: 25% trên = before, 50% giữa = inside, 25% dưới = after
      var newPos;
      if(pct<0.25) newPos='before';
      else if(pct>0.75) newPos='after';
      else newPos='inside';

      if(_hOverId===el.id&&_hPos===newPos)return; // không re-render nếu không đổi
      _hOverId=el.id;_hPos=newPos;

      // Xóa highlight cũ
      list.querySelectorAll('.el-item').forEach(function(n){
        n.classList.remove('hier-over','hier-insert-before','hier-insert-after');
      });
      _removePlaceholder();

      if(newPos==='inside'){
        // Highlight frame đích màu tím nhạt
        d.classList.add('hier-over');
        // Thêm placeholder thụt vào bên dưới item này (như child đầu tiên)
        var ph=_makePlaceholder(depth+1);
        ph.style.marginLeft=(14+(depth+1)*14)+'px';
        ph.style.height='18px';
        ph.style.background='rgba(124,106,247,0.18)';
        ph.style.border='1px dashed var(--ac)';
        ph.style.borderRadius='4px';
        ph.style.marginRight='6px';
        // Chèn sau d
        if(d.nextSibling)list.insertBefore(ph,d.nextSibling);
        else list.appendChild(ph);
        _hPlaceholder=ph;
      } else {
        // Placeholder là đường kẻ ngang mỏng
        var ph=_makePlaceholder(depth);
        if(newPos==='before'){
          d.classList.add('hier-insert-before');
          list.insertBefore(ph,d);
        } else {
          d.classList.add('hier-insert-after');
          // Chèn sau tất cả children của el (nếu có)
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
      // Chỉ clear nếu thật sự rời khỏi item (không phải sang child)
      if(!d.contains(e.relatedTarget)){
        d.classList.remove('hier-over','hier-insert-before','hier-insert-after');
      }
    };

    // ── DROP ──
    d.ondrop=function(e){
      e.preventDefault();e.stopPropagation();
      d.classList.remove('hier-over','hier-insert-before','hier-insert-after');
      _removePlaceholder();
      if(!_hDragId||_hDragId===el.id||isAncestor(el.id,_hDragId))return;

      var dragged=getEl(_hDragId);
      if(!dragged)return;
      saveH();

      if(_hPos==='inside'){
        // Reparent vào trong el
        setParent(dragged,el.id);
        toast('📦 '+dragged.name+' → '+el.name);
      } else {
        // Reorder: đưa về cùng cấp với el (cùng parentId)
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

    // Mods dưới element
    Object.keys(el.mods||{}).forEach(function(mk){
      var md=document.createElement('div');
      md.className='el-item';
      md.style.paddingLeft=(20+depth*14)+'px';
      md.innerHTML='<div class="el-ic" style="background:rgba(196,181,253,.15);color:#c4b5fd">✦</div><span class="el-nm" style="color:var(--ac3)">'+mk+'</span>';
      md.onclick=function(e){e.stopPropagation();selEl(el.id);};
      list.appendChild(md);
    });
  });

  // ── DROP VÀO VÙNG TRỐNG CUỐI LIST → UNPARENT ──
  list.ondragover=function(e){
    e.preventDefault();
    if(!_hDragId)return;
    var items=list.querySelectorAll('.el-item[data-id]');
    var last=items[items.length-1];
    if(!last)return;
    var rect=last.getBoundingClientRect();
    var listRect=list.getBoundingClientRect();
    // Nếu chuột dưới item cuối cùng → hiện placeholder root
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

    // Nếu drop vào vùng trống (không phải item cụ thể) → unparent về root
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

// §15 RENDER PROPS
function renderProps(){
  var pp=document.getElementById('pp'),el=getEl(sel);
  if(!el){pp.innerHTML='<div class="no-sel">Chọn một element<br>để xem Properties</div>';return;}
  var id=el.id,c=COL[el.type]||'#888',kids=getChildren(id),parEl=el.parentId?getEl(el.parentId):null;
  var h='<div style="padding:8px;background:var(--bg2);border-bottom:1px solid var(--bd)"><div style="font-size:11px;font-weight:700;color:'+c+'">'+el.type+'</div><input class="pi" style="margin-top:3px" value="'+esc(el.name)+'" placeholder="Name" oninput="ps(\''+id+'\',\'name\',this.value)"/></div>';
  // Hierarchy
  h+='<div style="border-bottom:1px solid var(--bd)"><div class="ps-hdr">🔗 Hierarchy</div><div class="ps-body">';
  h+=parEl?'<div class="pr"><span class="pl">Parent</span><span style="color:var(--cy);font-size:10px;flex:1">'+parEl.name+'</span><button class="tbtn" style="padding:1px 5px;font-size:9px" onclick="unparent(getEl(\''+id+'\'));renderEl(getEl(\''+id+'\'));renderProps()">✕</button></div>':'<div class="pr"><span class="pl">Parent</span><span style="color:var(--tx3);font-size:10px">None</span></div>';
  if(kids.length){
    h+='<div class="pr" style="flex-direction:column;align-items:flex-start;gap:2px"><span class="pl" style="min-width:auto">Children ('+kids.length+')</span>';
    kids.forEach(function(ch){h+='<div style="padding:1px 6px;background:var(--bg3);border-radius:3px;font-size:9px;color:var(--ac3);cursor:pointer;width:100%" onclick="selEl(\''+ch.id+'\')">'+ch.name+'</div>';});
    h+='</div>';
  }
  h+='<div class="pr" style="font-size:9px;color:var(--tx3)">Kéo thả trong Hierarchy hoặc Alt+Drop trên canvas</div></div></div>';
  // Transform
  if(el.type!=='ScreenGui')h+=sec('📐 Transform',nr(id,'X','x',0,2000,el.x)+nr(id,'Y','y',0,2000,el.y)+nr(id,'W','w',10,2000,el.w)+nr(id,'H','h',10,2000,el.h)+nr(id,'Rot','rot',-360,360,el.rot||0)+nr(id,'ZIndex','zi',0,20,el.zi||0)+nr(id,'Anchor X','ax',0,1,el.ax||0,0.01)+nr(id,'Anchor Y','ay',0,1,el.ay||0,0.01)+nr(id,'PosScX','psx',0,1,el.psx||0,0.01)+nr(id,'PosScY','psy',0,1,el.psy||0,0.01)+nr(id,'SzScX','ssx',0,1,el.ssx||0,0.01)+nr(id,'SzScY','ssy',0,1,el.ssy||0,0.01)+ck(id,'Visible','vis',el.vis!==false));
  // Appearance
  h+=sec('🎨 Appearance',cr(id,'BG','bc',el.bc)+nr(id,'Opacity','op',0,1,el.op||1,0.01)+nr(id,'Corner','cr',0,200,el.cr||0)+nr(id,'Border','bdw',0,20,el.bdw||0)+cr(id,'Bdr Col','bdc',el.bdc));
  // Text
  if(el.type==='TextLabel'||el.type==='TextButton'){
    var fo=FONTS.map(function(f){return'<option '+(el.fn===f?'selected':'')+' value="'+f+'">'+f+'</option>';}).join('');
    h+=sec('✏️ Text',tr2(id,'Text','txt',el.txt)+cr(id,'Color','tc',el.tc)+nr(id,'Size','tsz',6,96,el.tsz||14)+'<div class="pr"><span class="pl">Font</span><select class="pi" onchange="ps(\''+id+'\',\'fn\',this.value)">'+fo+'</select></div>'+tog(id,'txa',['Left','Center','Right'],el.txa)+tog(id,'tya',['Top','Center','Bottom'],el.tya)+ck(id,'Wrapped','tw',el.tw)+ck(id,'Scaled','tsc',el.tsc)+ck(id,'RichText','rt',el.rt));
  }
  // Image
  if(el.type==='ImageLabel'||el.type==='ImageButton'){
    var so=['Stretch','Slice','Tile','Fit','Crop'].map(function(s){return'<option '+(el.st===s?'selected':'')+' value="'+s+'">'+s+'</option>';}).join('');
    h+=sec('🖼 Image',tr2(id,'Image ID','img',el.img)+cr(id,'Color','ic',el.ic)+nr(id,'Transp','it',0,1,el.it||0,0.01)+'<div class="pr"><span class="pl">Scale</span><select class="pi" onchange="ps(\''+id+'\',\'st\',this.value)">'+so+'</select></div>');
  }
  // Type-specific
  if(el.type==='ScrollingFrame')h+=sec('⊟ Scroll',nr(id,'Bar W','sbt',1,20,el.sbt||6)+cr(id,'Bar Col','sbc',el.sbc)+nr(id,'Canvas H','csy',100,2000,el.csy||200)+ck(id,'Enabled','se',el.se!==false));
  if(el.type==='VideoFrame')h+=sec('▶ Video',tr2(id,'Video ID','vid',el.vid)+nr(id,'Volume','vol',0,1,el.vol||0.5,0.01)+ck(id,'Playing','vplay',el.vplay)+ck(id,'Looped','vloop',el.vloop));
  if(el.type==='ScreenGui')h+=sec('⊡ ScreenGui',ck(id,'Enabled','en',el.en!==false)+nr(id,'DisplayOrd','dord',0,100,el.dord||0)+ck(id,'ResetOnSpawn','ros',el.ros!==false)+ck(id,'IgnoreInset','igi',el.igi));
  if(el.type==='CanvasGroup')h+=sec('⊞ Canvas',nr(id,'GroupTransp','gt',0,1,el.gt||0,0.01));
  if(el.type==='TextButton'||el.type==='ImageButton')h+=sec('🖱 Button',ck(id,'AutoColor','abc',el.abc!==false)+ck(id,'Modal','modal',el.modal));
  // Warp
  if(el.warp){
    var wp=el.warp,wkeys=['tl','tr','br','bl'];
    var wh='<div class="pr"><span class="pl" style="color:var(--yw)">Corner offsets</span></div>';
    wkeys.forEach(function(k){wh+='<div class="pr"><span class="pl">'+k.toUpperCase()+' X</span><input type="range" class="pi" min="-100" max="100" value="'+(wp[k].x||0)+'" style="flex:1" oninput="wps(\''+id+'\',\''+k+'\',\'x\',+this.value)"/><span class="pv">'+(wp[k].x||0)+'</span></div><div class="pr"><span class="pl">'+k.toUpperCase()+' Y</span><input type="range" class="pi" min="-100" max="100" value="'+(wp[k].y||0)+'" style="flex:1" oninput="wps(\''+id+'\',\''+k+'\',\'y\',+this.value)"/><span class="pv">'+(wp[k].y||0)+'</span></div>';});
    wh+='<div class="pr"><button class="tbtn rd" style="width:100%;font-size:9px" onclick="resetWarp(\''+id+'\')">↺ Reset Warp</button></div><div class="pr" style="font-size:9px;color:var(--yw)">⚠ Warp không export Lua</div>';
    h+=sec('⌀ Warp',wh);
  }
  // Modifiers
  var mods=el.mods||{},allM=Object.keys(MDEF);
  h+='<div style="border-bottom:1px solid var(--bd)"><div class="ps-hdr">✨ Modifiers</div><div class="ps-body"><div style="padding:3px 8px 1px;font-size:9px;color:var(--tx3);font-weight:700">Click để toggle:</div><div class="mod-tags">';
  allM.forEach(function(mk){h+='<div class="mt '+(mods[mk]?'on':'')+'" onclick="'+(mods[mk]?'removeMod':'addMod')+'(\''+mk+'\')">'+mk.replace('UI','')+'</div>';});
  h+='</div>';
  Object.keys(mods).forEach(function(mk){
    var md=mods[mk],mh='';
    if(mk==='UICorner')mh+=mr(id,mk,'cr','Radius',0,200,md.cr||0);
    if(mk==='UIGradient'){mh+='<div class="pr"><span class="pl">Color 0</span><input type="color" class="pi" value="'+(md.c0||'#7c6af7')+'" oninput="ms(\''+id+'\',\'UIGradient\',\'c0\',this.value)"/></div><div class="pr"><span class="pl">Color 1</span><input type="color" class="pi" value="'+(md.c1||'#22d3ee')+'" oninput="ms(\''+id+'\',\'UIGradient\',\'c1\',this.value)"/></div>'+mr(id,mk,'rot','Rotation',0,360,md.rot||0)+mck(id,mk,'en','Enabled',md.en!==false);}
    if(mk==='UIStroke'){mh+='<div class="pr"><span class="pl">Color</span><input type="color" class="pi" value="'+(md.col||'#7c6af7')+'" oninput="ms(\''+id+'\',\'UIStroke\',\'col\',this.value)"/></div>'+mr(id,mk,'th','Thickness',1,20,md.th||2)+mr(id,mk,'tr','Transparency',0,1,md.tr||0,0.01)+mck(id,mk,'en','Enabled',md.en!==false);}
    if(mk==='UIPadding')mh+=mr(id,mk,'t','Top',0,100,md.t||0)+mr(id,mk,'b','Bottom',0,100,md.b||0)+mr(id,mk,'l','Left',0,100,md.l||0)+mr(id,mk,'r','Right',0,100,md.r||0);
    if(mk==='UIScale')mh+=mr(id,mk,'sc','Scale',0.1,5,md.sc||1,0.01);
    if(mk==='UIAspectRatioConstraint')mh+=mr(id,mk,'ar','Ratio',0.1,10,md.ar||1,0.01)+mtog(id,mk,'da',['Width','Height'],md.da);
    if(mk==='UISizeConstraint')mh+=mr(id,mk,'mnx','Min W',0,1000,md.mnx||0)+mr(id,mk,'mny','Min H',0,1000,md.mny||0)+mr(id,mk,'mxx','Max W',0,2000,md.mxx||999)+mr(id,mk,'mxy','Max H',0,2000,md.mxy||999);
    if(mk==='UITextSizeConstraint')mh+=mr(id,mk,'mn','MinSize',1,100,md.mn||6)+mr(id,mk,'mx','MaxSize',1,200,md.mx||100);
    if(mk==='UIListLayout')mh+=mtog(id,mk,'fd',['Horizontal','Vertical'],md.fd)+mr(id,mk,'pd','Padding',0,50,md.pd||0)+mck(id,mk,'wr','Wraps',md.wr);
    if(mk==='UIGridLayout')mh+=mr(id,mk,'cs','CellSize',10,300,md.cs||100)+mr(id,mk,'cpx','PadX',0,50,md.cpx||4)+mr(id,mk,'cpy','PadY',0,50,md.cpy||4);
    if(mk==='UIFlexItem'){var fmo=['Fill','Shrink','Grow','None'].map(function(v){return'<option '+(md.fm===v?'selected':'')+'>'+v+'</option>';}).join('');mh+='<div class="pr"><span class="pl">FlexMode</span><select class="pi" onchange="ms(\''+id+'\',\'UIFlexItem\',\'fm\',this.value)">'+fmo+'</select></div>'+mr(id,mk,'gr','GrowRatio',0,10,md.gr||1,0.1)+mr(id,mk,'sr','ShrinkRatio',0,10,md.sr||1,0.1);}
    if(mk==='UIPageLayout')mh+=mck(id,mk,'an','Animated',md.an!==false)+mtog(id,mk,'ad',['Horizontal','Vertical'],md.ad)+mck(id,mk,'ci','Circular',md.ci);
    if(mh)h+='<div class="ms"><div class="ms-hdr"><span>'+mk+'</span><span class="ms-x" onclick="removeMod(\''+mk+'\')">✕</span></div><div>'+mh+'</div></div>';
  });
  h+='</div></div><button class="delbtn" onclick="delSel()">🗑 Delete '+el.type+'</button>';
  pp.innerHTML=h;
}
function ps(id,k,v){var el=getEl(id);if(!el)return;el[k]=v;renderEl(el);getDescendants(id).forEach(renderEl);}
function psr(id,k,hex){var el=getEl(id);if(!el)return;el[k]=h2r(hex);el.bg=hex;renderEl(el);}
function ms(id,mk,k,v){var el=getEl(id);if(!el||!el.mods[mk])return;el.mods[mk][k]=v;renderEl(el);}

// §16 EXPORT (Lua + HTML)
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
  var out='-- Generated by Roblox UI Builder v3.1\nlocal PlayerGui=game:GetService("Players").LocalPlayer:WaitForChild("PlayerGui")\n\n';
  _sorted().forEach(function(el,i){
    var vn=(el.name||el.type+i).replace(/\W/g,'_'),par;
    if(el.parentId)par=(getEl(el.parentId).name||'Frame').replace(/\W/g,'_');
    else par='PlayerGui';
    out+='local '+vn+'=Instance.new("'+el.type+'")\n'+vn+'.Name="'+el.name+'"\n'+vn+'.Parent='+par+'\n';
    if(el.type!=='ScreenGui'){
      out+=vn+'.Position=UDim2.new('+(el.psx||0)+','+Math.round(el.x)+','+(el.psy||0)+','+Math.round(el.y)+')\n';
      out+=vn+'.Size=UDim2.new('+(el.ssx||0)+','+Math.round(el.w)+','+(el.ssy||0)+','+Math.round(el.h)+')\n';
      out+=vn+'.AnchorPoint=Vector2.new('+(el.ax||0)+','+(el.ay||0)+')\n';
      out+=vn+'.ZIndex='+(el.zi||0)+'\n';
      if(el.bc)out+=vn+'.BackgroundColor3=Color3.fromRGB('+Math.round(el.bc.r)+','+Math.round(el.bc.g)+','+Math.round(el.bc.b)+')\n';
      out+=vn+'.BackgroundTransparency='+parseFloat((1-(el.op||1)).toFixed(2))+'\n';
      if(el.vis===false)out+=vn+'.Visible=false\n';
      if(el.rot)out+=vn+'.Rotation='+parseFloat((el.rot||0).toFixed(2))+'\n';
    }
    if(el.warp)out+='-- Warp trên '+vn+' không export được\n';
    if(el.type==='TextLabel'||el.type==='TextButton'){
      out+=vn+'.Text="'+String(el.txt||'').replace(/"/g,'\\"')+'"\n';
      if(el.tc)out+=vn+'.TextColor3=Color3.fromRGB('+Math.round(el.tc.r)+','+Math.round(el.tc.g)+','+Math.round(el.tc.b)+')\n';
      out+=vn+'.TextSize='+(el.tsz||14)+'\n'+vn+'.Font=Enum.Font.'+(el.fn||'GothamMedium')+'\n';
      out+=vn+'.TextXAlignment=Enum.TextXAlignment.'+(el.txa||'Left')+'\n'+vn+'.TextYAlignment=Enum.TextYAlignment.'+(el.tya||'Center')+'\n';
      if(el.tw)out+=vn+'.TextWrapped=true\n';if(el.tsc)out+=vn+'.TextScaled=true\n';if(el.rt)out+=vn+'.RichText=true\n';
    }
    if(el.type==='ImageLabel'||el.type==='ImageButton'){
      if(el.img)out+=vn+'.Image="'+el.img+'"\n';
      if(el.ic)out+=vn+'.ImageColor3=Color3.fromRGB('+Math.round(el.ic.r)+','+Math.round(el.ic.g)+','+Math.round(el.ic.b)+')\n';
      out+=vn+'.ImageTransparency='+(el.it||0)+'\n'+vn+'.ScaleType=Enum.ScaleType.'+(el.st||'Stretch')+'\n';
    }
    if(el.type==='ScrollingFrame'){out+=vn+'.ScrollBarThickness='+(el.sbt||6)+'\n';if(el.sbc)out+=vn+'.ScrollBarImageColor3=Color3.fromRGB('+Math.round(el.sbc.r)+','+Math.round(el.sbc.g)+','+Math.round(el.sbc.b)+')\n';out+=vn+'.CanvasSize=UDim2.new(0,0,0,'+(el.csy||200)+')\n';if(el.se===false)out+=vn+'.ScrollingEnabled=false\n';}
    if(el.type==='VideoFrame'){out+=vn+'.Video="'+(el.vid||'rbxassetid://0')+'"\n'+vn+'.Volume='+(el.vol||0.5)+'\n';if(el.vloop)out+=vn+'.Looped=true\n';if(el.vplay)out+=vn+':Play()\n';}
    if(el.type==='ScreenGui'){if(el.en===false)out+=vn+'.Enabled=false\n';out+=vn+'.DisplayOrder='+(el.dord||0)+'\n';if(el.ros===false)out+=vn+'.ResetOnSpawn=false\n';if(el.igi)out+=vn+'.IgnoreGuiInset=true\n';}
    if(el.type==='CanvasGroup')out+=vn+'.GroupTransparency='+(el.gt||0)+'\n';
    if(el.type==='TextButton'||el.type==='ImageButton'){if(el.abc===false)out+=vn+'.AutoButtonColor=false\n';if(el.modal)out+=vn+'.Modal=true\n';}
    Object.keys(el.mods||{}).forEach(function(mk){
      var md=el.mods[mk],mv=mk+'_'+vn;
      out+='\nlocal '+mv+'=Instance.new("'+mk+'")\n'+mv+'.Parent='+vn+'\n';
      if(mk==='UICorner')out+=mv+'.CornerRadius=UDim.new(0,'+(md.cr||0)+')\n';
      if(mk==='UIGradient'){var c0=h2r(md.c0||'#7c6af7'),c1=h2r(md.c1||'#22d3ee');out+=mv+'.Color=ColorSequence.new({ColorSequenceKeypoint.new(0,Color3.fromRGB('+c0.r+','+c0.g+','+c0.b+')),ColorSequenceKeypoint.new(1,Color3.fromRGB('+c1.r+','+c1.g+','+c1.b+'))})\n'+mv+'.Rotation='+(md.rot||0)+'\n';}
      if(mk==='UIStroke'){var sc=h2r(md.col||'#7c6af7');out+=mv+'.Color=Color3.fromRGB('+sc.r+','+sc.g+','+sc.b+')\n'+mv+'.Thickness='+(md.th||2)+'\n'+mv+'.Transparency='+(md.tr||0)+'\n';}
      if(mk==='UIPadding')out+=mv+'.PaddingTop=UDim.new(0,'+(md.t||0)+')\n'+mv+'.PaddingBottom=UDim.new(0,'+(md.b||0)+')\n'+mv+'.PaddingLeft=UDim.new(0,'+(md.l||0)+')\n'+mv+'.PaddingRight=UDim.new(0,'+(md.r||0)+')\n';
      if(mk==='UIScale')out+=mv+'.Scale='+(md.sc||1)+'\n';
      if(mk==='UIAspectRatioConstraint')out+=mv+'.AspectRatio='+(md.ar||1)+'\n'+mv+'.AspectType=Enum.AspectType.'+(md.at||'FitWithinMaxSize')+'\n'+mv+'.DominantAxis=Enum.DominantAxis.'+(md.da||'Width')+'\n';
      if(mk==='UISizeConstraint')out+=mv+'.MinSize=Vector2.new('+(md.mnx||0)+','+(md.mny||0)+')\n'+mv+'.MaxSize=Vector2.new('+(md.mxx||999)+','+(md.mxy||999)+')\n';
      if(mk==='UITextSizeConstraint')out+=mv+'.MinTextSize='+(md.mn||6)+'\n'+mv+'.MaxTextSize='+(md.mx||100)+'\n';
      if(mk==='UIListLayout')out+=mv+'.FillDirection=Enum.FillDirection.'+(md.fd||'Vertical')+'\n'+mv+'.HorizontalAlignment=Enum.HorizontalAlignment.'+(md.ha||'Left')+'\n'+mv+'.VerticalAlignment=Enum.VerticalAlignment.'+(md.va||'Top')+'\n'+mv+'.SortOrder=Enum.SortOrder.'+(md.so||'LayoutOrder')+'\n'+mv+'.Padding=UDim.new(0,'+(md.pd||0)+')\n';
      if(mk==='UIGridLayout')out+=mv+'.CellSize=UDim2.new(0,'+(md.cs||100)+',0,'+(md.cs||100)+')\n'+mv+'.CellPadding=UDim2.new(0,'+(md.cpx||4)+',0,'+(md.cpy||4)+')\n'+mv+'.FillDirection=Enum.FillDirection.'+(md.fd||'Horizontal')+'\n'+mv+'.SortOrder=Enum.SortOrder.'+(md.so||'LayoutOrder')+'\n';
      if(mk==='UITableLayout')out+=mv+'.FillEmptySpaceColumns='+(md.fec?'true':'false')+'\n'+mv+'.FillEmptySpaceRows='+(md.fer?'true':'false')+'\n';
      if(mk==='UIPageLayout')out+=mv+'.Animated='+(md.an!==false?'true':'false')+'\n'+mv+'.AnimationDirection=Enum.AnimationDirection.'+(md.ad||'Horizontal')+'\n'+mv+'.Circular='+(md.ci?'true':'false')+'\n';
      if(mk==='UIFlexItem')out+=mv+'.FlexMode=Enum.UIFlexMode.'+(md.fm||'Fill')+'\n'+mv+'.GrowRatio='+(md.gr||1)+'\n'+mv+'.ShrinkRatio='+(md.sr||1)+'\n';
    });
    if(el.type==='TextButton'||el.type==='ImageButton')out+='\n'+vn+'.MouseButton1Click:Connect(function()\n\t-- TODO\nend)\n';
    out+='\n';
  });
  return out;
}
function buildHTML(){
  var out='<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<style>body{margin:0;background:#0d0d14}.ui{position:relative;width:800px;height:600px}</style>\n</head>\n<body>\n<div class="ui">\n';
  _sorted().forEach(function(el){
    if(el.type==='ScreenGui')return;
    var ap=getAbsPos(el),bg=el.bc?'rgb('+Math.round(el.bc.r)+','+Math.round(el.bc.g)+','+Math.round(el.bc.b)+')':'#222',m=el.mods||{};
    var st='position:absolute;left:'+ap.x+'px;top:'+ap.y+'px;width:'+el.w+'px;height:'+el.h+'px;opacity:'+(el.op||1)+';z-index:'+(el.zi||0)+';';
    if(ap.rot)st+='transform:rotate('+ap.rot+'deg);transform-origin:center;';
    if(m.UICorner)st+='border-radius:'+(m.UICorner.cr||0)+'px;';
    if(m.UIGradient&&m.UIGradient.en!==false)st+='background:linear-gradient('+(m.UIGradient.rot||0)+'deg,'+m.UIGradient.c0+','+m.UIGradient.c1+');';else st+='background:'+bg+';';
    if(m.UIStroke&&m.UIStroke.en!==false)st+='outline:'+(m.UIStroke.th||2)+'px solid '+(m.UIStroke.col||'#7c6af7')+';';
    if(m.UIPadding)st+='padding:'+(m.UIPadding.t||0)+'px '+(m.UIPadding.r||0)+'px '+(m.UIPadding.b||0)+'px '+(m.UIPadding.l||0)+'px;';
    if(el.warp){var w=el.warp,W=el.w,H=el.h;var pts=[[w.tl.x,w.tl.y],[W+w.tr.x,w.tr.y],[W+w.br.x,H+w.br.y],[w.bl.x,H+w.bl.y]].map(function(p){return(p[0]/W*100).toFixed(1)+'% '+(p[1]/H*100).toFixed(1)+'%';});st+='clip-path:polygon('+pts.join(',')+')';}
    if(el.type==='TextLabel'||el.type==='TextButton'){var tc=el.tc?'rgb('+Math.round(el.tc.r)+','+Math.round(el.tc.g)+','+Math.round(el.tc.b)+')':'#fff';st+='display:flex;align-items:center;justify-content:'+(el.txa==='Center'?'center':el.txa==='Right'?'flex-end':'flex-start')+';color:'+tc+';font-size:'+(el.tsz||14)+'px;font-weight:'+(el.type==='TextButton'?700:400)+';padding:0 7px;'+(el.type==='TextButton'?'cursor:pointer;':'');out+='  <div style="'+st+'">'+(el.txt||'')+'</div>\n';}
    else out+='  <div style="'+st+'"></div>\n';
  });
  return out+'</div>\n</body>\n</html>';
}

// §17 KEYBOARD
document.addEventListener('keydown',function(e){
  var t=document.activeElement.tagName;
  if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;
  if(e.key==='Delete'||e.key==='Backspace')delSel();
  if(e.ctrlKey&&e.key==='z'){e.preventDefault();undo();}
  if(e.ctrlKey&&e.key==='d'){e.preventDefault();dupSel();}
  if(e.key==='Escape'){setTool('sel');selEl(null);renderProps();dtool=null;}
  var el=getEl(sel);if(!el)return;
  var st=e.shiftKey?10:1;
  if(e.key==='ArrowUp'){saveH();el.y=Math.max(0,el.y-st);renderEl(el);getDescendants(el.id).forEach(renderEl);}
  if(e.key==='ArrowDown'){saveH();el.y+=st;renderEl(el);getDescendants(el.id).forEach(renderEl);}
  if(e.key==='ArrowLeft'){saveH();el.x=Math.max(0,el.x-st);renderEl(el);getDescendants(el.id).forEach(renderEl);}
  if(e.key==='ArrowRight'){saveH();el.x+=st;renderEl(el);getDescendants(el.id).forEach(renderEl);}
});
document.addEventListener('keyup',function(e){
  if(e.key==='Control'){var t=document.activeElement.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;cycleTransformMode();}
});

// §18 INIT
(function(){
  // Transform mode button
  var tb=document.getElementById('topbar'),btn=document.createElement('button');
  btn.id='btn-tmode';btn.className='tbtn active';btn.title='Ctrl để đổi: Scale→Move→Rotate→All→Warp';btn.onclick=cycleTransformMode;
  var sep=document.querySelector('.sep');
  if(sep&&sep.nextSibling)tb.insertBefore(btn,sep.nextSibling.nextSibling);else tb.appendChild(btn);
  updateTransformUI();

  // Inject CSS
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
    // Hierarchy drag-drop styles
    '.hier-over{background:rgba(124,106,247,.22)!important;outline:1px solid var(--ac);border-radius:4px}'+
    '.hier-unpar{margin-left:auto;font-size:9px;color:var(--rd);cursor:pointer;padding:0 3px;opacity:.6}'+
    '.hier-unpar:hover{opacity:1}'+
    '.el-item[draggable]{cursor:grab}'+
    '.el-item[draggable]:active{cursor:grabbing}';
  document.head.appendChild(s);

  renderProps();hint();
})();

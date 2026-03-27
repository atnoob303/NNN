// ── STATE ──
var els=[], sel=null, tool='sel', idc=0, hist=[], dtool=null, etab='lua';

// ── DEFAULTS ──
var DEFS={
  Frame:         {bg:'#222236',bc:{r:34,g:34,b:54},bdc:{r:62,g:62,b:96},bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0},
  ScrollingFrame:{bg:'#1a1a28',bc:{r:26,g:26,b:40},bdc:{r:62,g:62,b:96},bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,sbt:6,sbc:{r:124,g:106,b:247},csy:200,se:true},
  CanvasGroup:   {bg:'#2c2c45',bc:{r:44,g:44,b:69},bdc:{r:62,g:62,b:96},bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,gt:0.1},
  ViewportFrame: {bg:'#111120',bc:{r:17,g:17,b:32},bdc:{r:62,g:62,b:96},bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0},
  VideoFrame:    {bg:'#111120',bc:{r:17,g:17,b:32},bdc:{r:62,g:62,b:96},bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,vid:'rbxassetid://0',vol:0.5,vplay:false,vloop:false},
  ScreenGui:     {bg:'transparent',bc:{r:0,g:0,b:0},op:1,zi:0,vis:true,en:true,dord:0,ros:true,igi:false},
  TextLabel:     {bg:'transparent',bc:{r:0,g:0,b:0},bdc:{r:62,g:62,b:96},bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,txt:'Label',tc:{r:226,g:226,b:240},tsz:14,fn:'GothamMedium',txa:'Left',tya:'Center',tw:false,tsc:false,rt:false},
  ImageLabel:    {bg:'#313244',bc:{r:49,g:50,b:68},bdc:{r:62,g:62,b:96},bdw:0,cr:0,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,img:'rbxassetid://0',ic:{r:255,g:255,b:255},st:'Stretch',it:0},
  TextButton:    {bg:'#7c6af7',bc:{r:124,g:106,b:247},bdc:{r:167,g:139,b:250},bdw:0,cr:8,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,txt:'Button',tc:{r:255,g:255,b:255},tsz:14,fn:'GothamBold',txa:'Center',tya:'Center',tw:false,abc:true,modal:false},
  ImageButton:   {bg:'#f472b6',bc:{r:244,g:114,b:182},bdc:{r:251,g:113,b:133},bdw:0,cr:8,op:1,zi:0,vis:true,ax:0,ay:0,psx:0,psy:0,ssx:0,ssy:0,img:'rbxassetid://0',ic:{r:255,g:255,b:255},st:'Stretch',it:0,abc:true,modal:false}
};

var MDEF={
  UICorner:{cr:8},
  UIGradient:{c0:'#7c6af7',c1:'#22d3ee',rot:0,en:true},
  UIStroke:{col:'#7c6af7',th:2,tr:0,en:true},
  UIPadding:{t:8,b:8,l:8,r:8},
  UIScale:{sc:1},
  UIAspectRatioConstraint:{ar:1,at:'FitWithinMaxSize',da:'Width'},
  UISizeConstraint:{mnx:0,mny:0,mxx:999,mxy:999},
  UITextSizeConstraint:{mn:6,mx:100},
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

// ── UTILS ──
function rgb(c){if(!c)return'#888';return'rgb('+Math.round(c.r||0)+','+Math.round(c.g||0)+','+Math.round(c.b||0)+')';}
function h2r(h){return{r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)};}
function r2h(c){if(!c)return'#313244';return'#'+[c.r||0,c.g||0,c.b||0].map(function(x){return Math.round(x).toString(16).padStart(2,'0');}).join('');}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.style.opacity='1';clearTimeout(t._t);t._t=setTimeout(function(){t.style.opacity='0';},1800);}
function hint(){var a=els.length>0;document.getElementById('ehint').style.display=a?'none':'flex';document.getElementById('eemp').style.display=a?'none':'block';}
function saveH(){hist.push(JSON.parse(JSON.stringify(els)));if(hist.length>50)hist.shift();}

// ── TOOLS ──
function setTool(t){
  tool=t;
  document.getElementById('btn-sel').classList.toggle('active',t==='sel');
  document.getElementById('btn-drw').classList.toggle('active',t==='drw');
  document.getElementById('ca').style.cursor=t==='drw'?'crosshair':'default';
}

function mkEl(type,x,y,w,h){
  var d=JSON.parse(JSON.stringify(DEFS[type]||DEFS.Frame));
  var o={id:'el_'+(++idc),type:type,x:x,y:y,w:w,h:h,name:type+idc,mods:{}};
  for(var k in d)o[k]=d[k];
  return o;
}

// ── RENDER ELEMENT ──
function renderEl(el){
  var d=document.getElementById(el.id);
  if(!d){d=document.createElement('div');d.id=el.id;d.className='element';document.getElementById('cv').appendChild(d);}
  d.dataset.type=el.type;
  d.style.position='absolute';d.style.cursor='move';
  d.style.left=el.x+'px';d.style.top=el.y+'px';d.style.width=el.w+'px';d.style.height=el.h+'px';
  d.style.zIndex=String((el.zi||0)+1);d.style.opacity=String(el.op||1);
  d.style.display=el.vis===false?'none':'';
  var mods=el.mods||{};
  if(mods.UIGradient&&mods.UIGradient.en!==false){
    var g=mods.UIGradient;d.style.background='linear-gradient('+(g.rot||0)+'deg,'+g.c0+','+g.c1+')';}
  else{d.style.background=rgb(el.bc)||el.bg;}
  d.style.borderRadius=((mods.UICorner?mods.UICorner.cr:el.cr)||0)+'px';
  d.style.outline='none';d.style.border='none';
  if(mods.UIStroke&&mods.UIStroke.en!==false){d.style.outline=(mods.UIStroke.th||2)+'px solid '+(mods.UIStroke.col||'#7c6af7');}
  else if(el.bdw>0){d.style.border=el.bdw+'px solid '+rgb(el.bdc);}
  if(mods.UIPadding){var p=mods.UIPadding;d.style.padding=(p.t||0)+'px '+(p.r||0)+'px '+(p.b||0)+'px '+(p.l||0)+'px';}
  else{d.style.padding='';}
  if(sel===el.id){d.classList.add('sel');}else{d.classList.remove('sel');if(!(mods.UIStroke&&mods.UIStroke.en!==false))d.style.outline='none';}
  d.innerHTML='';
  var mks=Object.keys(mods);
  if(mks.length){
    var chip=document.createElement('div');chip.className='mod-chip';
    mks.slice(0,4).forEach(function(mk){var b=document.createElement('span');b.className='mod-bd';b.textContent=mk.replace('UI','');chip.appendChild(b);});
    d.appendChild(chip);
  }
  if(el.type==='TextLabel'||el.type==='TextButton'){
    var sp=document.createElement('div');
    sp.style.width='100%';sp.style.height='100%';sp.style.display='flex';sp.style.alignItems='center';sp.style.pointerEvents='none';
    sp.style.color=rgb(el.tc);sp.style.fontSize=(el.tsz||14)+'px';sp.style.fontWeight=String(el.type==='TextButton'?700:400);
    sp.style.justifyContent=el.txa==='Center'?'center':el.txa==='Right'?'flex-end':'flex-start';sp.style.padding='0 7px';
    sp.textContent=el.txt||el.type;d.appendChild(sp);
  }
  if(el.type==='ImageLabel'||el.type==='ImageButton'){var ph=document.createElement('div');ph.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:20px;opacity:.4;pointer-events:none';ph.textContent=el.type==='ImageButton'?'🔘':'🖼';d.appendChild(ph);}
  if(el.type==='VideoFrame'){var ph=document.createElement('div');ph.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;opacity:.5;pointer-events:none;flex-direction:column;gap:3px';ph.innerHTML='▶<div style="font-size:9px;color:#f59e0b;font-family:monospace">VIDEO</div>';d.appendChild(ph);}
  if(el.type==='ViewportFrame'){var ph=document.createElement('div');ph.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;opacity:.4;pointer-events:none;flex-direction:column;gap:3px';ph.innerHTML='📦<div style="font-size:9px;color:#60a5fa;font-family:monospace">3D</div>';d.appendChild(ph);}
  if(el.type==='ScrollingFrame'){var sb=document.createElement('div');sb.style.cssText='position:absolute;right:0;top:0;bottom:0;width:'+(el.sbt||6)+'px;background:'+rgb(el.sbc)+';opacity:.4;border-radius:3px';d.appendChild(sb);}
  if(el.type==='ScreenGui'){d.style.border='1px dashed rgba(34,211,238,.3)';var lb=document.createElement('div');lb.style.cssText='position:absolute;top:3px;left:4px;font-size:8px;color:#22d3ee;font-family:monospace;opacity:.6;font-weight:700;pointer-events:none';lb.textContent='⊡ ScreenGui';d.appendChild(lb);}
  var rh=document.createElement('div');rh.className='rh';
  rh.onmousedown=function(e){e.stopPropagation();startResize(el,e);};
  d.appendChild(rh);
  d.onmousedown=function(e){if(e.target.className==='rh')return;e.stopPropagation();selEl(el.id);startDrag(el,e);};
  d.onclick=function(e){e.stopPropagation();selEl(el.id);};
}

// ── SELECTION ──
function selEl(id){
  sel=id;
  els.forEach(function(e){
    var d=document.getElementById(e.id);
    if(d){d.classList.toggle('sel',e.id===id);if(e.id!==id&&!((e.mods||{}).UIStroke))d.style.outline='none';}
  });
  renderProps();renderHier();
}

// ── DRAG & RESIZE ──
function startDrag(el,e){
  saveH();var ox=e.clientX-el.x,oy=e.clientY-el.y;
  function mm(ev){el.x=Math.max(0,ev.clientX-ox);el.y=Math.max(0,ev.clientY-oy);renderEl(el);updInfo(el);}
  function mu(){document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);}
  document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
}
function startResize(el,e){
  saveH();var sx=e.clientX,sy=e.clientY,sw=el.w,sh=el.h;
  function mm(ev){el.w=Math.max(20,sw+(ev.clientX-sx));el.h=Math.max(20,sh+(ev.clientY-sy));renderEl(el);renderProps();updInfo(el);}
  function mu(){document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);}
  document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
}
function updInfo(el){document.getElementById('cinfo').textContent=el.type+' · '+Math.round(el.x)+','+Math.round(el.y)+' · '+Math.round(el.w)+'×'+Math.round(el.h);}

// ── CANVAS DRAW ──
var ca=document.getElementById('ca');
ca.onmousedown=function(e){
  var t=e.target;
  if(t!==ca&&t!==document.getElementById('cv')&&!t.classList.contains('gridbg'))return;
  if(tool==='sel'){selEl(null);renderProps();return;}
  var r=ca.getBoundingClientRect(),ds={x:e.clientX-r.left,y:e.clientY-r.top};
  var el=mkEl(dtool||'Frame',ds.x,ds.y,10,10);
  saveH();els.push(el);renderEl(el);selEl(el.id);hint();
  function mm(ev){var nx=ev.clientX-r.left,ny=ev.clientY-r.top;el.x=Math.min(ds.x,nx);el.y=Math.min(ds.y,ny);el.w=Math.abs(nx-ds.x)||10;el.h=Math.abs(ny-ds.y)||10;renderEl(el);updInfo(el);}
  function mu(){if(el.w<20)el.w=DW[el.type]||160;if(el.h<20)el.h=DH[el.type]||80;renderEl(el);renderProps();setTool('sel');dtool=null;document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);}
  document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
};

// ── ADD / REMOVE ──
function addPreset(type){dtool=type;setTool('drw');toast('✎ Draw: '+type);}
function addMod(mk){
  var el=els.find(function(e){return e.id===sel;});
  if(!el){toast('⚠ Select element first!');return;}
  if(el.mods[mk]){toast(mk+' already added');return;}
  saveH();el.mods[mk]=JSON.parse(JSON.stringify(MDEF[mk]||{}));renderEl(el);renderProps();renderHier();toast('✓ '+mk);
}
function removeMod(mk){
  var el=els.find(function(e){return e.id===sel;});
  if(!el)return;saveH();delete el.mods[mk];renderEl(el);renderProps();
}
function layerUp(){var el=els.find(function(e){return e.id===sel;});if(!el)return;saveH();el.zi=(el.zi||0)+1;renderEl(el);}
function layerDn(){var el=els.find(function(e){return e.id===sel;});if(!el)return;saveH();el.zi=Math.max(0,(el.zi||0)-1);renderEl(el);}
function dupSel(){
  var orig=els.find(function(e){return e.id===sel;});if(!orig)return;
  saveH();var c=JSON.parse(JSON.stringify(orig));c.id='el_'+(++idc);c.name=orig.type+idc;c.x+=20;c.y+=20;
  els.push(c);renderEl(c);selEl(c.id);renderHier();
}
function delSel(){
  if(!sel)return;saveH();var d=document.getElementById(sel);if(d)d.remove();
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

// ── HIERARCHY ──
function renderHier(){
  var list=document.getElementById('elist');list.innerHTML='';
  els.forEach(function(el){
    var c=COL[el.type]||'#888';
    var d=document.createElement('div');d.className='el-item'+(el.id===sel?' on':'');
    d.innerHTML='<div class="el-ic" style="background:'+c+'22;color:'+c+'">▪</div><span class="el-nm">'+el.name+'</span><span class="el-tp">'+el.type+'</span>';
    d.onclick=function(){selEl(el.id);lTab(1);};list.appendChild(d);
    Object.keys(el.mods||{}).forEach(function(mk){
      var md=document.createElement('div');md.className='el-item';md.style.paddingLeft='20px';
      md.innerHTML='<div class="el-ic" style="background:rgba(196,181,253,.15);color:#c4b5fd">✦</div><span class="el-nm" style="color:var(--ac3)">'+mk+'</span>';
      md.onclick=function(e){e.stopPropagation();selEl(el.id);};list.appendChild(md);
    });
  });
  hint();
}
function lTab(i){
  [0,1].forEach(function(j){
    document.getElementById('lt'+j).classList.toggle('on',j===i);
    document.getElementById('lc'+j).classList.toggle('on',j===i);
  });
}

// ── PROPS HELPERS ──
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');}
function sec(t,c){return '<div style="border-bottom:1px solid var(--bd)"><div class="ps-hdr">'+t+'</div><div class="ps-body">'+c+'</div></div>';}
function nr(id,lb,k,mn,mx,v,st){
  st=st||1;var lid='L'+k.replace(/[^a-z]/gi,'_')+id;var dp=st<1?2:0;
  return '<div class="pr"><span class="pl">'+lb+'</span><input type="range" class="pi" min="'+mn+'" max="'+mx+'" step="'+st+'" value="'+v+'" style="flex:1" oninput="ps(\''+id+'\',\''+k+'\',+this.value);(document.getElementById(\''+lid+'\')||{}).textContent=parseFloat(this.value).toFixed('+dp+')"/><span class="pv" id="'+lid+'">'+parseFloat(v).toFixed(dp)+'</span></div>';
}
function cr(id,lb,k,v){return '<div class="pr"><span class="pl">'+lb+'</span><input type="color" class="pi" value="'+r2h(v)+'" oninput="psr(\''+id+'\',\''+k+'\',this.value)"/></div>';}
function tr2(id,lb,k,v){return '<div class="pr"><span class="pl">'+lb+'</span><input type="text" class="pi" value="'+esc(v||'')+'" oninput="ps(\''+id+'\',\''+k+'\',this.value)"/></div>';}
function ck(id,lb,k,v){return '<div class="pr"><span class="pl">'+lb+'</span><input type="checkbox" '+(v?'checked':'')+' onchange="ps(\''+id+'\',\''+k+'\',this.checked);var e=els.find(function(x){return x.id===\''+id+'\'});if(e)renderEl(e);renderProps()"/></div>';}
function tog(id,k,opts,cur){return '<div class="pr"><span class="pl">'+k+'</span><div style="display:flex;gap:3px;flex:1">'+opts.map(function(a){return'<div class="to '+(cur===a?'on':'')+'" onclick="ps(\''+id+'\',\''+k+'\',\''+a+'\');renderProps()">'+a+'</div>';}).join('')+'</div></div>';}
function mr(id,mk,k,lb,mn,mx,v,st){
  st=st||1;var lid='M'+mk.replace(/[^a-z]/gi,'_')+k+id;var dp=st<1?2:0;
  return '<div class="pr"><span class="pl">'+lb+'</span><input type="range" class="pi" min="'+mn+'" max="'+mx+'" step="'+st+'" value="'+v+'" style="flex:1" oninput="ms(\''+id+'\',\''+mk+'\',\''+k+'\',+this.value);(document.getElementById(\''+lid+'\')||{}).textContent=parseFloat(this.value).toFixed('+dp+')"/><span class="pv" id="'+lid+'">'+parseFloat(v).toFixed(dp)+'</span></div>';
}
function mck(id,mk,k,lb,v){return '<div class="pr"><span class="pl">'+lb+'</span><input type="checkbox" '+(v?'checked':'')+' onchange="ms(\''+id+'\',\''+mk+'\',\''+k+'\',this.checked);var e=els.find(function(x){return x.id===\''+id+'\'});if(e)renderEl(e);renderProps()"/></div>';}
function mtog(id,mk,k,opts,cur){return '<div class="pr"><span class="pl">'+k+'</span><div style="display:flex;gap:3px;flex:1">'+opts.map(function(a){return'<div class="to '+(cur===a?'on':'')+'" onclick="ms(\''+id+'\',\''+mk+'\',\''+k+'\',\''+a+'\');renderProps()">'+a[0]+'</div>';}).join('')+'</div></div>';}

// ── RENDER PROPS ──
function renderProps(){
  var pp=document.getElementById('pp');
  var el=els.find(function(e){return e.id===sel;});
  if(!el){pp.innerHTML='<div class="no-sel">Chọn một element<br>để xem Properties</div>';return;}
  var id=el.id,c=COL[el.type]||'#888';
  var h='<div style="padding:8px;background:var(--bg2);border-bottom:1px solid var(--bd)"><div style="font-size:11px;font-weight:700;color:'+c+'">'+el.type+'</div><input class="pi" style="margin-top:3px" value="'+esc(el.name)+'" placeholder="Name" oninput="ps(\''+id+'\',\'name\',this.value)"/></div>';
  if(el.type!=='ScreenGui'){
    h+=sec('📐 Transform',nr(id,'X','x',0,2000,el.x)+nr(id,'Y','y',0,2000,el.y)+nr(id,'Width','w',10,2000,el.w)+nr(id,'Height','h',10,2000,el.h)+nr(id,'ZIndex','zi',0,20,el.zi||0)+nr(id,'Anchor X','ax',0,1,el.ax||0,0.01)+nr(id,'Anchor Y','ay',0,1,el.ay||0,0.01)+nr(id,'PosScale X','psx',0,1,el.psx||0,0.01)+nr(id,'PosScale Y','psy',0,1,el.psy||0,0.01)+nr(id,'SzScale X','ssx',0,1,el.ssx||0,0.01)+nr(id,'SzScale Y','ssy',0,1,el.ssy||0,0.01)+ck(id,'Visible','vis',el.vis!==false));
  }
  h+=sec('🎨 Appearance',cr(id,'BG Color','bc',el.bc)+nr(id,'Opacity','op',0,1,el.op||1,0.01)+nr(id,'Corner R','cr',0,200,el.cr||0)+nr(id,'Border W','bdw',0,20,el.bdw||0)+cr(id,'Border Col','bdc',el.bdc));
  if(el.type==='TextLabel'||el.type==='TextButton'){
    var fo=FONTS.map(function(f){return'<option '+(el.fn===f?'selected':'')+' value="'+f+'">'+f+'</option>';}).join('');
    h+=sec('✏️ Text',tr2(id,'Text','txt',el.txt)+cr(id,'Text Color','tc',el.tc)+nr(id,'TextSize','tsz',6,96,el.tsz||14)+'<div class="pr"><span class="pl">Font</span><select class="pi" onchange="ps(\''+id+'\',\'fn\',this.value)">'+fo+'</select></div>'+tog(id,'txa',['Left','Center','Right'],el.txa)+tog(id,'tya',['Top','Center','Bottom'],el.tya)+ck(id,'TextWrapped','tw',el.tw)+ck(id,'TextScaled','tsc',el.tsc)+ck(id,'RichText','rt',el.rt));
  }
  if(el.type==='ImageLabel'||el.type==='ImageButton'){
    var so=['Stretch','Slice','Tile','Fit','Crop'].map(function(s){return'<option '+(el.st===s?'selected':'')+' value="'+s+'">'+s+'</option>';}).join('');
    h+=sec('🖼 Image',tr2(id,'Image ID','img',el.img)+cr(id,'Img Color','ic',el.ic)+nr(id,'Img Transp','it',0,1,el.it||0,0.01)+'<div class="pr"><span class="pl">ScaleType</span><select class="pi" onchange="ps(\''+id+'\',\'st\',this.value)">'+so+'</select></div>');
  }
  if(el.type==='ScrollingFrame')h+=sec('⊟ Scrolling',nr(id,'Bar W','sbt',1,20,el.sbt||6)+cr(id,'Bar Color','sbc',el.sbc)+nr(id,'Canvas H','csy',100,2000,el.csy||200)+ck(id,'ScrollEnabled','se',el.se!==false));
  if(el.type==='VideoFrame')h+=sec('▶ Video',tr2(id,'Video ID','vid',el.vid)+nr(id,'Volume','vol',0,1,el.vol||0.5,0.01)+ck(id,'Playing','vplay',el.vplay)+ck(id,'Looped','vloop',el.vloop));
  if(el.type==='ScreenGui')h+=sec('⊡ ScreenGui',ck(id,'Enabled','en',el.en!==false)+nr(id,'DisplayOrder','dord',0,100,el.dord||0)+ck(id,'ResetOnSpawn','ros',el.ros!==false)+ck(id,'IgnoreGuiInset','igi',el.igi));
  if(el.type==='CanvasGroup')h+=sec('⊞ CanvasGroup',nr(id,'GroupTransp','gt',0,1,el.gt||0,0.01));
  if(el.type==='TextButton'||el.type==='ImageButton')h+=sec('🖱 Button',ck(id,'AutoButtonColor','abc',el.abc!==false)+ck(id,'Modal','modal',el.modal));
  var mods=el.mods||{},allMods=Object.keys(MDEF);
  h+='<div style="border-bottom:1px solid var(--bd)"><div class="ps-hdr">✨ Modifiers</div><div class="ps-body"><div style="padding:3px 8px 1px;font-size:9px;color:var(--tx3);font-weight:700">Click to toggle:</div><div class="mod-tags">';
  allMods.forEach(function(mk){h+='<div class="mt '+(mods[mk]?'on':'')+'" onclick="'+(mods[mk]?'removeMod':'addMod')+'(\''+mk+'\')">'+mk.replace('UI','')+'</div>';});
  h+='</div>';
  Object.keys(mods).forEach(function(mk){
    var md=mods[mk],mh='';
    if(mk==='UICorner')mh+=mr(id,mk,'cr','CornerRadius',0,200,md.cr||0);
    if(mk==='UIGradient'){mh+='<div class="pr"><span class="pl">Color 0</span><input type="color" class="pi" value="'+(md.c0||'#7c6af7')+'" oninput="ms(\''+id+'\',\'UIGradient\',\'c0\',this.value)"/></div>';mh+='<div class="pr"><span class="pl">Color 1</span><input type="color" class="pi" value="'+(md.c1||'#22d3ee')+'" oninput="ms(\''+id+'\',\'UIGradient\',\'c1\',this.value)"/></div>';mh+=mr(id,mk,'rot','Rotation',0,360,md.rot||0)+mck(id,mk,'en','Enabled',md.en!==false);}
    if(mk==='UIStroke'){mh+='<div class="pr"><span class="pl">Color</span><input type="color" class="pi" value="'+(md.col||'#7c6af7')+'" oninput="ms(\''+id+'\',\'UIStroke\',\'col\',this.value)"/></div>';mh+=mr(id,mk,'th','Thickness',1,20,md.th||2)+mr(id,mk,'tr','Transparency',0,1,md.tr||0,0.01)+mck(id,mk,'en','Enabled',md.en!==false);}
    if(mk==='UIPadding')mh+=mr(id,mk,'t','Top',0,100,md.t||0)+mr(id,mk,'b','Bottom',0,100,md.b||0)+mr(id,mk,'l','Left',0,100,md.l||0)+mr(id,mk,'r','Right',0,100,md.r||0);
    if(mk==='UIScale')mh+=mr(id,mk,'sc','Scale',0.1,5,md.sc||1,0.01);
    if(mk==='UIAspectRatioConstraint'){mh+=mr(id,mk,'ar','Ratio',0.1,10,md.ar||1,0.01)+mtog(id,mk,'da',['Width','Height'],md.da);}
    if(mk==='UISizeConstraint')mh+=mr(id,mk,'mnx','Min W',0,1000,md.mnx||0)+mr(id,mk,'mny','Min H',0,1000,md.mny||0)+mr(id,mk,'mxx','Max W',0,2000,md.mxx||999)+mr(id,mk,'mxy','Max H',0,2000,md.mxy||999);
    if(mk==='UITextSizeConstraint')mh+=mr(id,mk,'mn','MinSize',1,100,md.mn||6)+mr(id,mk,'mx','MaxSize',1,200,md.mx||100);
    if(mk==='UIListLayout')mh+=mtog(id,mk,'fd',['Horizontal','Vertical'],md.fd)+mr(id,mk,'pd','Padding',0,50,md.pd||0)+mck(id,mk,'wr','Wraps',md.wr);
    if(mk==='UIGridLayout')mh+=mr(id,mk,'cs','CellSize',10,300,md.cs||100)+mr(id,mk,'cpx','PadX',0,50,md.cpx||4)+mr(id,mk,'cpy','PadY',0,50,md.cpy||4);
    if(mk==='UIFlexItem'){var fmo=['Fill','Shrink','Grow','None'].map(function(v){return'<option '+(md.fm===v?'selected':'')+' value="'+v+'">'+v+'</option>';}).join('');mh+='<div class="pr"><span class="pl">FlexMode</span><select class="pi" onchange="ms(\''+id+'\',\'UIFlexItem\',\'fm\',this.value)">'+fmo+'</select></div>'+mr(id,mk,'gr','GrowRatio',0,10,md.gr||1,0.1)+mr(id,mk,'sr','ShrinkRatio',0,10,md.sr||1,0.1);}
    if(mk==='UIPageLayout')mh+=mck(id,mk,'an','Animated',md.an!==false)+mtog(id,mk,'ad',['Horizontal','Vertical'],md.ad)+mck(id,mk,'ci','Circular',md.ci);
    if(mh)h+='<div class="ms"><div class="ms-hdr"><span>'+mk+'</span><span class="ms-x" onclick="removeMod(\''+mk+'\')">✕</span></div><div>'+mh+'</div></div>';
  });
  h+='</div></div><button class="delbtn" onclick="delSel()">🗑 Delete '+el.type+'</button>';
  pp.innerHTML=h;
}

function ps(id,k,v){var el=els.find(function(e){return e.id===id;});if(!el)return;el[k]=v;renderEl(el);}
function psr(id,k,hex){var el=els.find(function(e){return e.id===id;});if(!el)return;el[k]=h2r(hex);el.bg=hex;renderEl(el);}
function ms(id,mk,k,v){var el=els.find(function(e){return e.id===id;});if(!el||!el.mods[mk])return;el.mods[mk][k]=v;renderEl(el);}

// ── EXPORT ──
function setExTab(t){
  etab=t;
  document.getElementById('etl').classList.toggle('on',t==='lua');
  document.getElementById('eth').classList.toggle('on',t==='html');
  document.getElementById('ec').textContent=t==='lua'?buildLua():buildHTML();
}
function showExport(){
  var code=etab==='lua'?buildLua():buildHTML();
  document.getElementById('ec').textContent=code;
  document.getElementById('einfo').textContent=els.length+' elements · '+code.split('\n').length+' lines';
  document.getElementById('em').classList.add('show');
}
function hideExport(){document.getElementById('em').classList.remove('show');}
function copyCode(){navigator.clipboard.writeText(etab==='lua'?buildLua():buildHTML()).then(function(){toast('✅ Copied!');});}
function dlCode(){
  var code=etab==='lua'?buildLua():buildHTML(),ext=etab==='lua'?'.lua':'.html';
  var a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([code],{type:'text/plain'}));
  a.download='roblox-ui'+ext;a.click();
}

function buildLua(){
  var out='-- Generated by Roblox UI Builder v2\nlocal PlayerGui=game:GetService("Players").LocalPlayer:WaitForChild("PlayerGui")\n\n';
  els.forEach(function(el,i){
    var vn=(el.name||el.type+i).replace(/[^a-zA-Z0-9_]/g,'_');
    var par=i===0||el.type==='ScreenGui'?'PlayerGui':((els[0].name||els[0].type+'0').replace(/[^a-zA-Z0-9_]/g,'_'));
    out+='local '+vn+' = Instance.new("'+el.type+'")\n'+vn+'.Name = "'+el.name+'"\n'+vn+'.Parent = '+par+'\n';
    if(el.type!=='ScreenGui'){
      out+=vn+'.Position = UDim2.new('+(el.psx||0)+', '+Math.round(el.x)+', '+(el.psy||0)+', '+Math.round(el.y)+')\n';
      out+=vn+'.Size = UDim2.new('+(el.ssx||0)+', '+Math.round(el.w)+', '+(el.ssy||0)+', '+Math.round(el.h)+')\n';
      out+=vn+'.AnchorPoint = Vector2.new('+(el.ax||0)+', '+(el.ay||0)+')\n';
      out+=vn+'.ZIndex = '+(el.zi||0)+'\n';
      if(el.bc)out+=vn+'.BackgroundColor3 = Color3.fromRGB('+Math.round(el.bc.r||0)+','+Math.round(el.bc.g||0)+','+Math.round(el.bc.b||0)+')\n';
      out+=vn+'.BackgroundTransparency = '+parseFloat((1-(el.op||1)).toFixed(2))+'\n';
      if(el.vis===false)out+=vn+'.Visible = false\n';
    }
    if(el.type==='TextLabel'||el.type==='TextButton'){
      out+=vn+'.Text = "'+String(el.txt||'').replace(/"/g,'\\"')+'"\n';
      if(el.tc)out+=vn+'.TextColor3 = Color3.fromRGB('+Math.round(el.tc.r||0)+','+Math.round(el.tc.g||0)+','+Math.round(el.tc.b||0)+')\n';
      out+=vn+'.TextSize = '+(el.tsz||14)+'\n'+vn+'.Font = Enum.Font.'+(el.fn||'GothamMedium')+'\n';
      out+=vn+'.TextXAlignment = Enum.TextXAlignment.'+(el.txa||'Left')+'\n'+vn+'.TextYAlignment = Enum.TextYAlignment.'+(el.tya||'Center')+'\n';
      if(el.tw)out+=vn+'.TextWrapped = true\n';if(el.tsc)out+=vn+'.TextScaled = true\n';if(el.rt)out+=vn+'.RichText = true\n';
    }
    if(el.type==='ImageLabel'||el.type==='ImageButton'){
      if(el.img)out+=vn+'.Image = "'+el.img+'"\n';
      if(el.ic)out+=vn+'.ImageColor3 = Color3.fromRGB('+Math.round(el.ic.r||0)+','+Math.round(el.ic.g||0)+','+Math.round(el.ic.b||0)+')\n';
      out+=vn+'.ImageTransparency = '+(el.it||0)+'\n'+vn+'.ScaleType = Enum.ScaleType.'+(el.st||'Stretch')+'\n';
    }
    if(el.type==='ScrollingFrame'){
      out+=vn+'.ScrollBarThickness = '+(el.sbt||6)+'\n';
      if(el.sbc)out+=vn+'.ScrollBarImageColor3 = Color3.fromRGB('+Math.round(el.sbc.r||0)+','+Math.round(el.sbc.g||0)+','+Math.round(el.sbc.b||0)+')\n';
      out+=vn+'.CanvasSize = UDim2.new(0,0,0,'+(el.csy||200)+')\n';
      if(el.se===false)out+=vn+'.ScrollingEnabled = false\n';
    }
    if(el.type==='VideoFrame'){out+=vn+'.Video = "'+(el.vid||'rbxassetid://0')+'"\n'+vn+'.Volume = '+(el.vol||0.5)+'\n';if(el.vloop)out+=vn+'.Looped = true\n';if(el.vplay)out+=vn+':Play()\n';}
    if(el.type==='ScreenGui'){if(el.en===false)out+=vn+'.Enabled = false\n';out+=vn+'.DisplayOrder = '+(el.dord||0)+'\n';if(el.ros===false)out+=vn+'.ResetOnSpawn = false\n';if(el.igi)out+=vn+'.IgnoreGuiInset = true\n';}
    if(el.type==='CanvasGroup')out+=vn+'.GroupTransparency = '+(el.gt||0)+'\n';
    if(el.type==='TextButton'||el.type==='ImageButton'){if(el.abc===false)out+=vn+'.AutoButtonColor = false\n';if(el.modal)out+=vn+'.Modal = true\n';}
    Object.keys(el.mods||{}).forEach(function(mk){
      var md=el.mods[mk],mv=mk+'_'+vn;
      out+='\nlocal '+mv+' = Instance.new("'+mk+'")\n'+mv+'.Parent = '+vn+'\n';
      if(mk==='UICorner')out+=mv+'.CornerRadius = UDim.new(0,'+(md.cr||0)+')\n';
      if(mk==='UIGradient'){var c0=h2r(md.c0||'#7c6af7'),c1=h2r(md.c1||'#22d3ee');out+=mv+'.Color = ColorSequence.new({ColorSequenceKeypoint.new(0,Color3.fromRGB('+c0.r+','+c0.g+','+c0.b+')),ColorSequenceKeypoint.new(1,Color3.fromRGB('+c1.r+','+c1.g+','+c1.b+'))})\n'+mv+'.Rotation = '+(md.rot||0)+'\n';}
      if(mk==='UIStroke'){var sc=h2r(md.col||'#7c6af7');out+=mv+'.Color = Color3.fromRGB('+sc.r+','+sc.g+','+sc.b+')\n'+mv+'.Thickness = '+(md.th||2)+'\n'+mv+'.Transparency = '+(md.tr||0)+'\n';}
      if(mk==='UIPadding')out+=mv+'.PaddingTop=UDim.new(0,'+(md.t||0)+')\n'+mv+'.PaddingBottom=UDim.new(0,'+(md.b||0)+')\n'+mv+'.PaddingLeft=UDim.new(0,'+(md.l||0)+')\n'+mv+'.PaddingRight=UDim.new(0,'+(md.r||0)+')\n';
      if(mk==='UIScale')out+=mv+'.Scale = '+(md.sc||1)+'\n';
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
  els.forEach(function(el){
    if(el.type==='ScreenGui')return;
    var bg=el.bc?'rgb('+Math.round(el.bc.r)+','+Math.round(el.bc.g)+','+Math.round(el.bc.b)+')':'#222';
    var mods=el.mods||{};
    var st='position:absolute;left:'+el.x+'px;top:'+el.y+'px;width:'+el.w+'px;height:'+el.h+'px;opacity:'+(el.op||1)+';z-index:'+(el.zi||0)+';';
    if(mods.UICorner)st+='border-radius:'+(mods.UICorner.cr||0)+'px;';
    if(mods.UIGradient&&mods.UIGradient.en!==false)st+='background:linear-gradient('+(mods.UIGradient.rot||0)+'deg,'+mods.UIGradient.c0+','+mods.UIGradient.c1+');';else st+='background:'+bg+';';
    if(mods.UIStroke&&mods.UIStroke.en!==false)st+='outline:'+(mods.UIStroke.th||2)+'px solid '+(mods.UIStroke.col||'#7c6af7')+';';
    if(mods.UIPadding)st+='padding:'+(mods.UIPadding.t||0)+'px '+(mods.UIPadding.r||0)+'px '+(mods.UIPadding.b||0)+'px '+(mods.UIPadding.l||0)+'px;';
    if(el.type==='TextLabel'||el.type==='TextButton'){
      var tc=el.tc?'rgb('+Math.round(el.tc.r)+','+Math.round(el.tc.g)+','+Math.round(el.tc.b)+')':'#fff';
      st+='display:flex;align-items:center;justify-content:'+(el.txa==='Center'?'center':el.txa==='Right'?'flex-end':'flex-start')+';color:'+tc+';font-size:'+(el.tsz||14)+'px;font-weight:'+(el.type==='TextButton'?700:400)+';padding:0 7px;';
      if(el.type==='TextButton')st+='cursor:pointer;';
      out+='  <div style="'+st+'">'+(el.txt||'')+'</div>\n';
    } else {out+='  <div style="'+st+'"></div>\n';}
  });
  return out+'</div>\n</body>\n</html>';
}

// ── KEYBOARD ──
document.addEventListener('keydown',function(e){
  var t=document.activeElement.tagName;
  if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;
  if(e.key==='Delete'||e.key==='Backspace')delSel();
  if(e.ctrlKey&&e.key==='z'){e.preventDefault();undo();}
  if(e.ctrlKey&&e.key==='d'){e.preventDefault();dupSel();}
  if(e.key==='Escape'){setTool('sel');selEl(null);renderProps();dtool=null;}
  var el=els.find(function(x){return x.id===sel;});
  if(!el)return;
  if(e.key==='ArrowUp'){saveH();el.y=Math.max(0,el.y-(e.shiftKey?10:1));renderEl(el);}
  if(e.key==='ArrowDown'){saveH();el.y+=(e.shiftKey?10:1);renderEl(el);}
  if(e.key==='ArrowLeft'){saveH();el.x=Math.max(0,el.x-(e.shiftKey?10:1));renderEl(el);}
  if(e.key==='ArrowRight'){saveH();el.x+=(e.shiftKey?10:1);renderEl(el);}
});

// ── INIT ──
renderProps();
hint();

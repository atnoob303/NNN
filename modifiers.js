// ═══════════════════════════════════════════════════════════════
// modifiers.js — Render canvas + props cho objects mới & modifiers
// Load sau definitions.js, trước app.js
// ═══════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════
// §MOD-1  RENDER ELEMENT TRÊN CANVAS cho objects mới
// app.js gọi: renderElExtra(el, domEl) ở cuối renderEl()
// ════════════════════════════════════════════════════════════════
function renderElExtra(el, d) {
  if (!d) return;

  // ── TextBox ─────────────────────────────────────────────────
  if (el.type === 'TextBox') {
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = el.ph || 'Nhập text...';
    inp.value = el.txt || '';
    inp.style.cssText = [
      'position:absolute', 'inset:0', 'width:100%', 'height:100%',
      'background:none', 'border:none', 'outline:none',
      'color:rgb(' + _modRgb(el.tc) + ')',
      'font-size:' + (el.tsz||14) + 'px',
      'padding:0 8px',
      'font-family:inherit',
      'cursor:text',
      'pointer-events:none',   // click vẫn select element
    ].join(';');
    // placeholder color via CSS custom property
    var phStyle = document.createElement('style');
    phStyle.textContent = '#' + el.id + ' input::placeholder { color: rgb('
      + _modRgb(el.phc || {r:90,g:90,b:120}) + '); }';
    d.appendChild(phStyle);
    d.appendChild(inp);

    // badge
    var badge = document.createElement('div');
    badge.style.cssText = 'position:absolute;bottom:2px;right:4px;'
      + 'font-size:7px;color:#38bdf8;font-family:monospace;opacity:.6;pointer-events:none';
    badge.textContent = '✎ TextBox';
    d.appendChild(badge);
  }

  // ── BillboardGui ────────────────────────────────────────────
  if (el.type === 'BillboardGui') {
    var ph = document.createElement('div');
    ph.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;'
      + 'justify-content:center;flex-direction:column;gap:3px;pointer-events:none';
    var so = el.studOffset || {x:0,y:1,z:0};
    ph.innerHTML = '<div style="font-size:18px">📌</div>'
      + '<div style="font-size:8px;color:#fb923c;font-family:monospace;text-align:center">'
      + 'BillboardGui<br>Offset: '+so.x+', '+so.y+', '+so.z+'</div>';
    d.appendChild(ph);
    d.style.border = '1px dashed rgba(251,146,60,.5)';
  }

  // ── SurfaceGui ──────────────────────────────────────────────
  if (el.type === 'SurfaceGui') {
    var ph = document.createElement('div');
    ph.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;'
      + 'justify-content:center;flex-direction:column;gap:3px;pointer-events:none';
    ph.innerHTML = '<div style="font-size:18px">🟩</div>'
      + '<div style="font-size:8px;color:#a3e635;font-family:monospace;text-align:center">'
      + 'SurfaceGui<br>Face: '+(el.face||'Front')+'<br>'+(el.pixelsPerStud||50)+' px/stud</div>';
    d.appendChild(ph);
    d.style.border = '1px dashed rgba(163,230,53,.5)';
  }

  // ── SelectionBox ────────────────────────────────────────────
  if (el.type === 'SelectionBox') {
    var col = el.color || {r:244,g:63,b:94};
    d.style.background = 'rgba('+col.r+','+col.g+','+col.b+','+(1-(el.surfaceTransparency||0.7))+')';
    d.style.border = (el.lineThickness||0.05)*20 + 'px solid rgb('+col.r+','+col.g+','+col.b+')';
    d.style.borderRadius = '0';
    var badge = document.createElement('div');
    badge.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;'
      + 'justify-content:center;font-size:9px;color:rgb('+col.r+','+col.g+','+col.b+');'
      + 'font-family:monospace;pointer-events:none;font-weight:700';
    badge.textContent = '⬜ SelectionBox';
    d.appendChild(badge);
  }

  // ── Highlight ───────────────────────────────────────────────
  if (el.type === 'Highlight') {
    var fc = el.fillColor || {r:232,g:121,b:249};
    var oc = el.outlineColor || {r:255,g:255,b:255};
    d.style.background = 'rgba('+fc.r+','+fc.g+','+fc.b+','+(1-(el.fillTransparency||0.5))+')';
    d.style.outline = (1-(el.outlineTransparency||0))*3 + 'px solid rgb('+oc.r+','+oc.g+','+oc.b+')';
    var badge = document.createElement('div');
    badge.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;'
      + 'justify-content:center;font-size:9px;color:rgb('+fc.r+','+fc.g+','+fc.b+');'
      + 'font-family:monospace;pointer-events:none;font-weight:700;'
      + 'text-shadow:0 0 8px white';
    badge.textContent = '✦ Highlight';
    d.appendChild(badge);
  }
}

// Helper nội bộ
function _modRgb(c) {
  if (!c) return '226,226,240';
  return Math.round(c.r||0)+','+Math.round(c.g||0)+','+Math.round(c.b||0);
}

// ════════════════════════════════════════════════════════════════
// §MOD-2  RENDER PROPS cho objects mới
// app.js gọi: renderPropsExtra(el, id) → trả về HTML string
// ════════════════════════════════════════════════════════════════
function renderPropsExtra(el, id) {
  var h = '';
  if (!el) return h;

  // ── TextBox ─────────────────────────────────────────────────
  if (el.type === 'TextBox') {
    h += modSec('✎ TextBox',
      modTr(id, 'Text',        'txt',  el.txt  || '') +
      modTr(id, 'Placeholder', 'ph',   el.ph   || '') +
      modCr(id, 'Text Color',  'tc',   el.tc) +
      modCr(id, 'Placeholder Color', 'phc', el.phc || {r:90,g:90,b:120}) +
      modNr(id, 'Text Size',   'tsz',  6, 96, el.tsz||14) +
      modTog(id, 'txa', ['Left','Center','Right'], el.txa) +
      modTog(id, 'tya', ['Top','Center','Bottom'], el.tya) +
      modCk(id, 'ClearOnFocus', 'cls',       el.cls) +
      modCk(id, 'MultiLine',    'multiLine',  el.multiLine) +
      modNr(id, 'MaxLength',    'maxLen', 0, 500, el.maxLen||0) +
      modCk(id, 'RichText',     'rt',         el.rt)
    );
  }

  // ── BillboardGui ─────────────────────────────────────────────
  if (el.type === 'BillboardGui') {
    var sz = el.sz || {x:4,y:2};
    var so = el.studOffset || {x:0,y:1,z:0};
    h += modSec('📌 BillboardGui',
      '<div class="pr"><span class="pl">Size (studs)</span></div>' +
      modNr(id, 'Width',  'sz.x', 0.5, 50, sz.x, 0.5, function(v){ return 'szX'; }) +
      modNr(id, 'Height', 'sz.y', 0.5, 50, sz.y, 0.5) +
      '<div class="pr"><span class="pl">StudsOffset</span></div>' +
      modNr(id, 'X', 'studOffset.x', -20, 20, so.x, 0.1) +
      modNr(id, 'Y', 'studOffset.y', -20, 20, so.y, 0.1) +
      modNr(id, 'Z', 'studOffset.z', -20, 20, so.z, 0.1) +
      modCk(id, 'AlwaysOnTop',   'alwaysOnTop',   el.alwaysOnTop) +
      modNr(id, 'LightInfluence','lightInfluence', 0, 1, el.lightInfluence||0, 0.01) +
      modNr(id, 'MaxDistance',   'maxDist',        0, 1000, el.maxDist||0) +
      modCk(id, 'Enabled',       'enabled',        el.enabled !== false) +
      '<div class="pr" style="font-size:9px;color:var(--yw)">⚠ Adornee gán thủ công trong Studio</div>'
    );
  }

  // ── SurfaceGui ───────────────────────────────────────────────
  if (el.type === 'SurfaceGui') {
    h += modSec('🟩 SurfaceGui',
      modSelect(id, 'Face', 'face',
        ['Front','Back','Left','Right','Top','Bottom'], el.face||'Front') +
      modNr(id, 'PixelsPerStud', 'pixelsPerStud', 1, 200, el.pixelsPerStud||50) +
      modCk(id, 'AlwaysOnTop',   'alwaysOnTop',   el.alwaysOnTop) +
      modNr(id, 'LightInfluence','lightInfluence', 0, 1, el.lightInfluence||0, 0.01) +
      modCk(id, 'Enabled',       'enabled',        el.enabled !== false) +
      '<div class="pr" style="font-size:9px;color:var(--yw)">⚠ Adornee gán thủ công trong Studio</div>'
    );
  }

  // ── SelectionBox ─────────────────────────────────────────────
  if (el.type === 'SelectionBox') {
    h += modSec('⬜ SelectionBox',
      modCr(id, 'Color',          'color',             el.color) +
      modNr(id, 'LineThickness',  'lineThickness',  0, 0.5,  el.lineThickness||0.05, 0.005) +
      modCr(id, 'SurfaceColor',   'surfaceColor',      el.surfaceColor) +
      modNr(id, 'SurfaceTransp',  'surfaceTransparency', 0, 1, el.surfaceTransparency||0.7, 0.01) +
      modTr(id, 'Adornee (name)', 'adornee',           el.adornee||'') +
      '<div class="pr" style="font-size:9px;color:var(--yw)">⚠ Adornee gán thủ công trong Studio</div>'
    );
  }

  // ── Highlight ─────────────────────────────────────────────────
  if (el.type === 'Highlight') {
    h += modSec('✦ Highlight',
      modCr(id, 'FillColor',        'fillColor',        el.fillColor) +
      modNr(id, 'FillTransparency', 'fillTransparency', 0, 1, el.fillTransparency||0.5, 0.01) +
      modCr(id, 'OutlineColor',     'outlineColor',     el.outlineColor) +
      modNr(id, 'OutlineTransparency','outlineTransparency', 0, 1, el.outlineTransparency||0, 0.01) +
      modSelect(id, 'DepthMode', 'depthMode',
        ['AlwaysOnTop','Occluded'], el.depthMode||'AlwaysOnTop') +
      modCk(id, 'Enabled',  'enabled',  el.enabled !== false) +
      modTr(id, 'Adornee',  'adornee',  el.adornee||'') +
      '<div class="pr" style="font-size:9px;color:var(--yw)">⚠ Adornee gán thủ công trong Studio</div>'
    );
  }

  return h;
}

// ════════════════════════════════════════════════════════════════
// §MOD-3  RENDER PROPS cho MODIFIERS mới (UIBlur, UIBloom, v.v.)
// app.js gọi: renderModExtra(el, id, mk, md) → HTML string
// ════════════════════════════════════════════════════════════════
function renderModExtra(el, id, mk, md) {
  var h = '';
  var mv = mk;

  if (mk === 'UIBlurEffect')
    h += modMr(id, mk, 'size', 'BlurSize', 0, 56, md.size||24) +
         modMck(id, mk, 'en', 'Enabled', md.en !== false);

  if (mk === 'UIColorCorrectionEffect')
    h += modMr(id, mk, 'brightness', 'Brightness', -1, 1, md.brightness||0, 0.01) +
         modMr(id, mk, 'contrast',   'Contrast',   -1, 1, md.contrast||0,   0.01) +
         modMr(id, mk, 'saturation', 'Saturation', -1, 1, md.saturation||0, 0.01) +
         '<div class="pr"><span class="pl">TintColor</span>' +
         '<input type="color" class="pi" value="' + _modR2h(md.tintColor||{r:255,g:255,b:255}) + '"' +
         ' oninput="ms(\'' + id + '\',\'' + mk + '\',\'tintColor\',{r:parseInt(this.value.slice(1,3),16),' +
         'g:parseInt(this.value.slice(3,5),16),b:parseInt(this.value.slice(5,7),16)});' +
         'var e=getEl(\'' + id + '\');if(e)renderEl(e)"/></div>' +
         modMck(id, mk, 'en', 'Enabled', md.en !== false);

  if (mk === 'UIBloomEffect')
    h += modMr(id, mk, 'intensity',  'Intensity',  0, 2,    md.intensity||0.8,  0.01) +
         modMr(id, mk, 'size',       'Size',        0, 56,   md.size||24) +
         modMr(id, mk, 'threshold',  'Threshold',   0, 1,    md.threshold||0.95, 0.01) +
         modMck(id, mk, 'en', 'Enabled', md.en !== false);

  if (mk === 'UIDepthOfFieldEffect')
    h += modMr(id, mk, 'farIntensity',  'Far Intensity',   0, 1,   md.farIntensity||0,   0.01) +
         modMr(id, mk, 'focusDistance', 'Focus Distance',  0, 200, md.focusDistance||50)  +
         modMr(id, mk, 'inFocusRadius', 'In-Focus Radius', 0, 50,  md.inFocusRadius||10) +
         modMr(id, mk, 'nearIntensity', 'Near Intensity',  0, 1,   md.nearIntensity||0,  0.01) +
         modMck(id, mk, 'en', 'Enabled', md.en !== false);

  if (mk === 'UISunRaysEffect')
    h += modMr(id, mk, 'intensity', 'Intensity', 0, 1, md.intensity||0.25, 0.01) +
         modMr(id, mk, 'spread',    'Spread',    0, 1, md.spread||1,       0.01) +
         modMck(id, mk, 'en', 'Enabled', md.en !== false);

  return h;
}

// ════════════════════════════════════════════════════════════════
// §MOD-4  HELPER HTML — clones từ app.js nhưng prefix "mod"
//         để không xung đột namespace
// ════════════════════════════════════════════════════════════════

function modSec(title, content) {
  return '<div style="border:1px solid rgba(124,106,247,.25);border-radius:6px;overflow:hidden;margin:4px 8px">'
       + '<div class="ms-hdr"><span>' + title + '</span></div><div>' + content + '</div></div>';
}

function modNr(id, lb, k, mn, mx, v, st) {
  st = st || 1;
  var dp = st < 1 ? 2 : 0;
  var lid = 'MX' + k.replace(/\W/g,'_') + id;
  return '<div class="pr"><span class="pl">' + lb + '</span>'
       + '<input type="range" class="pi" min="' + mn + '" max="' + mx + '" step="' + st + '" value="' + v + '" style="flex:1"'
       + ' oninput="ps(\'' + id + '\',\'' + k + '\',+this.value);'
       + '(document.getElementById(\'' + lid + '\')||{}).textContent=parseFloat(this.value).toFixed(' + dp + ')"/>'
       + '<span class="pv" id="' + lid + '">' + parseFloat(v).toFixed(dp) + '</span></div>';
}

function modCr(id, lb, k, v) {
  var hex = _modR2h(v);
  return '<div class="pr"><span class="pl">' + lb + '</span>'
       + '<input type="color" class="pi" value="' + hex + '"'
       + ' oninput="psr(\'' + id + '\',\'' + k + '\',this.value)"/></div>';
}

function modTr(id, lb, k, v) {
  return '<div class="pr"><span class="pl">' + lb + '</span>'
       + '<input type="text" class="pi" value="' + (v||'') + '"'
       + ' oninput="ps(\'' + id + '\',\'' + k + '\',this.value)"/></div>';
}

function modCk(id, lb, k, v) {
  return '<div class="pr"><span class="pl">' + lb + '</span>'
       + '<input type="checkbox" ' + (v ? 'checked' : '') + ''
       + ' onchange="ps(\'' + id + '\',\'' + k + '\',this.checked);'
       + 'var e=getEl(\'' + id + '\');if(e){renderEl(e);renderProps();}"/></div>';
}

function modTog(id, k, opts, cur) {
  return '<div class="pr"><span class="pl">' + k + '</span>'
       + '<div style="display:flex;gap:3px;flex:1">'
       + opts.map(function(a) {
           return '<div class="to ' + (cur===a?'on':'') + '"'
                + ' onclick="ps(\'' + id + '\',\'' + k + '\',\'' + a + '\');renderProps()">'
                + a[0] + '</div>';
         }).join('')
       + '</div></div>';
}

function modSelect(id, lb, k, opts, cur) {
  var os = opts.map(function(o) {
    return '<option ' + (cur===o?'selected':'') + ' value="' + o + '">' + o + '</option>';
  }).join('');
  return '<div class="pr"><span class="pl">' + lb + '</span>'
       + '<select class="pi" onchange="ps(\'' + id + '\',\'' + k + '\',this.value);'
       + 'var e=getEl(\'' + id + '\');if(e){renderEl(e);renderProps();}">'
       + os + '</select></div>';
}

// Modifier-level helpers (gọi ms() thay vì ps())
function modMr(id, mk, k, lb, mn, mx, v, st) {
  st = st || 1;
  var dp = st < 1 ? 2 : 0;
  var lid = 'ME' + mk.replace(/\W/g,'_') + k + id;
  return '<div class="pr"><span class="pl">' + lb + '</span>'
       + '<input type="range" class="pi" min="' + mn + '" max="' + mx + '" step="' + st + '" value="' + v + '" style="flex:1"'
       + ' oninput="ms(\'' + id + '\',\'' + mk + '\',\'' + k + '\',+this.value);'
       + '(document.getElementById(\'' + lid + '\')||{}).textContent=parseFloat(this.value).toFixed(' + dp + ');'
       + 'var e=getEl(\'' + id + '\');if(e)renderEl(e)"/>'
       + '<span class="pv" id="' + lid + '">' + parseFloat(v).toFixed(dp) + '</span></div>';
}

function modMck(id, mk, k, lb, v) {
  return '<div class="pr"><span class="pl">' + lb + '</span>'
       + '<input type="checkbox" ' + (v ? 'checked' : '') + ''
       + ' onchange="ms(\'' + id + '\',\'' + mk + '\',\'' + k + '\',this.checked);'
       + 'var e=getEl(\'' + id + '\');if(e){renderEl(e);renderProps();}"/></div>';
}

// r2h helper nội bộ (tránh phụ thuộc app.js)
function _modR2h(c) {
  if (!c) return '#313244';
  return '#' + [c.r||0, c.g||0, c.b||0]
    .map(function(x) { return Math.round(x).toString(16).padStart(2,'0'); })
    .join('');
}

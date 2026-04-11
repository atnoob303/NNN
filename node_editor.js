// ═══════════════════════════════════════════════════════════════
// node_editor.js — Node Editor overlay (physics rope)
// Load SAU app.js
// Fix: pointer-events không chặn canvas, drag/rotate/resize vẫn hoạt động
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── STATE ────────────────────────────────────────────────────
  var NE = {
    open: false,
    mode: 'all',
    selId: null,
    nodes: [],
    edges: [],
    nodeEls: {},
    animId: null,
    conn: null,
    drag: null,
    dragOff: { x: 0, y: 0 },
    wrap: null,
    cv: null,
    ctx: null,
    domBuilt: false,
  };

  // ── COLORS ───────────────────────────────────────────────────
  var NCOLORS = {
    Frame:          { col: '#7c6af7', tag: 'Container' },
    ScrollingFrame: { col: '#a78bfa', tag: 'Container' },
    CanvasGroup:    { col: '#c4b5fd', tag: 'Container' },
    ViewportFrame:  { col: '#60a5fa', tag: 'Container' },
    VideoFrame:     { col: '#f59e0b', tag: 'Container' },
    ScreenGui:      { col: '#22d3ee', tag: 'Container' },
    TextLabel:      { col: '#4ade80', tag: 'Display'   },
    ImageLabel:     { col: '#34d399', tag: 'Display'   },
    TextButton:     { col: '#f472b6', tag: 'Interactive'},
    ImageButton:    { col: '#fb7185', tag: 'Interactive'},
    TextBox:        { col: '#38bdf8', tag: 'Interactive'},
    BillboardGui:   { col: '#fb923c', tag: '3D'        },
    SurfaceGui:     { col: '#a3e635', tag: '3D'        },
    SelectionBox:   { col: '#f43f5e', tag: '3D'        },
    Highlight:      { col: '#e879f9', tag: '3D'        },
    UICorner:                { col: '#c4b5fd', tag: 'Modifier' },
    UIGradient:              { col: '#c4b5fd', tag: 'Modifier' },
    UIStroke:                { col: '#c4b5fd', tag: 'Modifier' },
    UIPadding:               { col: '#c4b5fd', tag: 'Modifier' },
    UIScale:                 { col: '#c4b5fd', tag: 'Modifier' },
    UIAspectRatioConstraint: { col: '#c4b5fd', tag: 'Modifier' },
    UISizeConstraint:        { col: '#c4b5fd', tag: 'Modifier' },
    UITextSizeConstraint:    { col: '#c4b5fd', tag: 'Modifier' },
    UIFlexItem:              { col: '#c4b5fd', tag: 'Modifier' },
    UIListLayout:            { col: '#fbbf24', tag: 'Layout'   },
    UIGridLayout:            { col: '#fbbf24', tag: 'Layout'   },
    UITableLayout:           { col: '#fbbf24', tag: 'Layout'   },
    UIPageLayout:            { col: '#fbbf24', tag: 'Layout'   },
    UIBlurEffect:            { col: '#818cf8', tag: 'Effect'   },
    UIColorCorrectionEffect: { col: '#818cf8', tag: 'Effect'   },
    UIBloomEffect:           { col: '#818cf8', tag: 'Effect'   },
    UIDepthOfFieldEffect:    { col: '#818cf8', tag: 'Effect'   },
    UISunRaysEffect:         { col: '#818cf8', tag: 'Effect'   },
  };
  function nc(type) { return NCOLORS[type] || { col: '#888780', tag: 'Node' }; }

  // ── DOM SETUP ────────────────────────────────────────────────
  function buildDOM() {
    if (NE.domBuilt) return true;
    var ca = document.getElementById('ca');
    if (!ca) { console.warn('[NodeEditor] #ca not found'); return false; }

    var style = document.createElement('style');
    style.id = 'ne-style';
    style.textContent =
      // ★ QUAN TRỌNG: toàn bộ overlay pointer-events:none
      // Chỉ toolbar và .ne-nd mới có pointer-events:auto
      '#ne-overlay{position:absolute;inset:0;z-index:200;display:none;flex-direction:column;pointer-events:none}'
      +'#ne-overlay.open{display:flex}'
      +'#ne-toolbar{pointer-events:auto;display:flex;gap:5px;align-items:center;padding:5px 10px;'
        +'background:rgba(10,10,20,.94);border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0}'
      +'#ne-toolbar .ne-logo{font-size:10px;font-weight:700;color:#a78bfa;margin-right:4px}'
      +'.ne-tb{font-size:10px;padding:2px 8px;border:1px solid rgba(255,255,255,.13);border-radius:4px;'
        +'background:rgba(255,255,255,.04);color:#e2e2f0;cursor:pointer;transition:background .12s}'
      +'.ne-tb:hover{background:rgba(255,255,255,.1)}'
      +'.ne-tb.on{background:#7c6af7;border-color:#7c6af7;color:#fff}'
      // canvas wrap: pointer-events:none — KHÔNG chặn canvas gốc bên dưới
      +'#ne-canvas-wrap{position:relative;flex:1;overflow:hidden;pointer-events:none}'
      +'#ne-cv{position:absolute;inset:0;pointer-events:none;z-index:1}'
      // node card: pointer-events:auto — CHỈ node bắt event
      +'.ne-nd{position:absolute;border-radius:8px;border:1.5px solid;cursor:grab;user-select:none;'
        +'z-index:10;min-width:128px;max-width:192px;box-sizing:border-box;'
        +'transition:box-shadow .12s,opacity .18s;pointer-events:auto}'
      +'.ne-nd:active{cursor:grabbing}'
      +'.ne-nd.ne-sel{box-shadow:0 0 0 2px rgba(255,255,255,.1),0 0 0 4px var(--ne-col,#7c6af7)}'
      +'.ne-nd.ne-dim{opacity:0.08;pointer-events:none}'
      +'.ne-nh{font-size:10px;font-weight:600;padding:5px 8px 4px;'
        +'border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:5px;border-radius:6px 6px 0 0}'
      +'.ne-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}'
      +'.ne-lbl{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
      +'.ne-tag{font-size:8px;padding:1px 5px;border-radius:3px;font-weight:400;flex-shrink:0}'
      +'.ne-nb{padding:3px 8px 6px;font-size:9px;color:rgba(226,226,240,.5)}'
      +'.ne-pr{display:flex;justify-content:space-between;margin:1.5px 0;gap:6px;overflow:hidden}'
      +'.ne-pk{flex-shrink:0;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.55}'
      +'.ne-pv{font-family:monospace;font-size:8.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}'
      +'.ne-port{width:10px;height:10px;border-radius:50%;border:2px solid;position:absolute;'
        +'top:50%;transform:translateY(-50%);cursor:crosshair;z-index:11;transition:transform .1s}'
      +'.ne-port:hover{transform:translateY(-50%) scale(1.5)}'
      +'.ne-po{right:-5px}'
      +'.ne-pi{left:-5px}'
      +'#ne-legend{position:absolute;bottom:8px;right:10px;font-size:8.5px;'
        +'color:rgba(226,226,240,.2);pointer-events:none;line-height:1.8}';
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'ne-overlay';

    // Toolbar
    var tb = document.createElement('div');
    tb.id = 'ne-toolbar';
    var logo = document.createElement('span');
    logo.className = 'ne-logo';
    logo.textContent = '\u29C1 Node Editor';
    tb.appendChild(logo);
    var btnAll  = _mkBtn('Show all', 'on', function () { neSetMode('all'); });
    btnAll.id = 'ne-btn-all';
    var btnSel  = _mkBtn('Selected', '', function () { neSetMode('selected'); });
    btnSel.id = 'ne-btn-sel';
    var btnSync = _mkBtn('\u21BA Sync', '', function () { neSync(); });
    var btnClose= _mkBtn('\u2715 Close', '', function () { neClose(); });
    btnClose.style.marginLeft = 'auto';
    tb.appendChild(btnAll); tb.appendChild(btnSel);
    tb.appendChild(btnSync); tb.appendChild(btnClose);

    // Canvas wrap
    var wrap = document.createElement('div');
    wrap.id = 'ne-canvas-wrap';
    var cv = document.createElement('canvas');
    cv.id = 'ne-cv';
    wrap.appendChild(cv);
    var legend = document.createElement('div');
    legend.id = 'ne-legend';
    legend.innerHTML = '&#9473; parent&#8594;child &nbsp; &#x254C; modifier/effect';
    wrap.appendChild(legend);

    overlay.appendChild(tb);
    overlay.appendChild(wrap);
    ca.appendChild(overlay);

    NE.wrap = wrap;
    NE.cv   = cv;
    NE.ctx  = cv.getContext('2d');
    NE.domBuilt = true;

    // ★ Dùng capture phase để nhận trước app.js
    // Guard: chỉ xử lý khi NE.drag hoặc NE.conn active — không can thiệp còn lại
    document.addEventListener('mousemove', _onMouseMove, true);
    document.addEventListener('mouseup',   _onMouseUp,   true);

    return true;
  }

  function _mkBtn(label, cls, fn) {
    var b = document.createElement('button');
    b.className = 'ne-tb' + (cls ? ' ' + cls : '');
    b.textContent = label;
    b.onclick = fn;
    return b;
  }

  // ── AUTO LAYOUT ──────────────────────────────────────────────
  function _autoLayout(nodes) {
    var cols = { mod: [], main: [], child: [], fx: [] };
    nodes.forEach(function (n) {
      var t = nc(n.type).tag;
      if (n.isMod && t === 'Effect')             cols.fx.push(n);
      else if (n.isMod)                          cols.mod.push(n);
      else if (t === 'Container' || t === '3D')  cols.main.push(n);
      else                                       cols.child.push(n);
    });
    var W = NE.wrap ? NE.wrap.offsetWidth  : 800;
    var H = NE.wrap ? NE.wrap.offsetHeight : 500;
    var PAD = 24, GAP = 16, NH = 108, colW = 198;
    function layoutCol(arr, startX) {
      var total = arr.length * (NH + GAP) - GAP;
      var sy = Math.max(PAD, (H - total) / 2);
      arr.forEach(function (n, i) {
        n.x = startX;
        n.y = sy + i * (NH + GAP);
      });
    }
    layoutCol(cols.mod,   PAD);
    layoutCol(cols.main,  PAD + colW);
    layoutCol(cols.child, PAD + colW * 2);
    layoutCol(cols.fx,    PAD + colW * 3);
  }

  // ── NODE ELEMENT ─────────────────────────────────────────────
  function _makeNodeEl(n) {
    var old = document.getElementById('ne-nd-' + n.id);
    if (old) old.remove();
    var s = nc(n.type), col = s.col;
    var el = document.createElement('div');
    el.className = 'ne-nd';
    el.id = 'ne-nd-' + n.id;
    el.style.cssText = 'left:' + Math.round(n.x) + 'px;top:' + Math.round(n.y) + 'px;'
      + 'border-color:' + col + ';background:' + col + '12;';
    el.style.setProperty('--ne-col', col);

    var hdr = document.createElement('div');
    hdr.className = 'ne-nh'; hdr.style.color = col;
    var dot = document.createElement('span'); dot.className = 'ne-dot'; dot.style.background = col;
    var lbl = document.createElement('span'); lbl.className = 'ne-lbl';
    lbl.title = n.label; lbl.textContent = n.isMod ? n.modKey : n.label;
    var tag = document.createElement('span'); tag.className = 'ne-tag';
    tag.textContent = n.isMod ? n.type.replace('UI', '') : n.type;
    tag.style.cssText = 'background:' + col + '20;color:' + col;
    hdr.appendChild(dot); hdr.appendChild(lbl); hdr.appendChild(tag);

    var body = document.createElement('div');
    body.className = 'ne-nb';
    var props = n.props || {}, keys = Object.keys(props).slice(0, 5);
    if (!keys.length) {
      var emp = document.createElement('div');
      emp.style.cssText = 'font-size:8.5px;opacity:.22;padding:2px 0';
      emp.textContent = '(no props)'; body.appendChild(emp);
    } else {
      keys.forEach(function (k) {
        var row = document.createElement('div'); row.className = 'ne-pr';
        var pk = document.createElement('span'); pk.className = 'ne-pk'; pk.textContent = k;
        var pv = document.createElement('span'); pv.className = 'ne-pv';
        pv.style.color = col; pv.textContent = String(props[k]).slice(0, 22);
        row.appendChild(pk); row.appendChild(pv); body.appendChild(row);
      });
    }

    var portIn = document.createElement('div');
    portIn.className = 'ne-port ne-pi';
    portIn.style.cssText = 'background:' + col + ';border-color:' + col + '50';
    var portOut = document.createElement('div');
    portOut.className = 'ne-port ne-po';
    var oc = n.isMod ? col : '#f97316';
    portOut.style.cssText = 'background:' + oc + ';border-color:' + oc + '50';

    el.appendChild(portIn); el.appendChild(hdr);
    el.appendChild(body); el.appendChild(portOut);
    NE.wrap.appendChild(el);
    NE.nodeEls[n.id] = el;

    portOut.addEventListener('mousedown', function (e) {
      e.stopPropagation(); e.preventDefault();
      NE.conn = { fromId: n.id, mx: e.clientX, my: e.clientY };
    });
    portIn.addEventListener('mouseup', function (e) {
      if (NE.conn && NE.conn.fromId !== n.id) {
        _addEdge(NE.conn.fromId, n.id, false);
        NE.conn = null;
      }
      e.stopPropagation();
    });
    el.addEventListener('mousedown', function (e) {
      if (e.target === portOut || e.target === portIn) return;
      e.stopPropagation(); e.preventDefault();
      NE.selId = n.id; neUpdateVis();
      if (!n.isMod && typeof window._origSelEl === 'function') window._origSelEl(n.id, false);
      var wr = NE.wrap.getBoundingClientRect();
      NE.drag    = n;
      NE.dragOff = { x: e.clientX - wr.left - n.x, y: e.clientY - wr.top - n.y };
    });
  }

  // ── ROPE ─────────────────────────────────────────────────────
  var SEG = 14;
  function _portPos(n, side) {
    var el = NE.nodeEls[n.id];
    var w = el ? el.offsetWidth : 130, h = el ? el.offsetHeight : 80;
    return side === 'out' ? { x: n.x + w, y: n.y + h * .5 } : { x: n.x, y: n.y + h * .5 };
  }
  function _findNode(id) { return NE.nodes.find(function (n) { return n.id === id; }); }
  function _initRope(e) {
    var fn = _findNode(e.fromId), tn = _findNode(e.toId);
    if (!fn || !tn) return;
    var a = _portPos(fn, 'out'), b = _portPos(tn, 'in');
    e.rope = [];
    for (var i = 0; i <= SEG; i++) {
      var t = i / SEG;
      e.rope.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, vx: 0, vy: 0 });
    }
  }
  function _addEdge(fromId, toId, isMod) {
    if (NE.edges.find(function (e) { return e.fromId === fromId && e.toId === toId; })) return;
    var edge = { fromId: fromId, toId: toId, isMod: !!isMod, rope: [] };
    NE.edges.push(edge); _initRope(edge);
  }

  // ── PHYSICS ──────────────────────────────────────────────────
  function _simRopes() {
    NE.edges.forEach(function (e) {
      if (!e.rope || e.rope.length < 2) return;
      var fn = _findNode(e.fromId), tn = _findNode(e.toId);
      if (!fn || !tn) return;
      var a = _portPos(fn, 'out'), b = _portPos(tn, 'in');
      e.rope[0].x = a.x; e.rope[0].y = a.y;
      e.rope[SEG].x = b.x; e.rope[SEG].y = b.y;
      var sl = Math.hypot(b.x - a.x, b.y - a.y) / (SEG * .92 + .001) * .88;
      for (var i = 1; i < SEG; i++) {
        var p = e.rope[i];
        p.vy += .20; p.vx *= .80; p.vy *= .80; p.x += p.vx; p.y += p.vy;
      }
      for (var it = 0; it < 5; it++) {
        for (var i = 0; i < SEG; i++) {
          var p = e.rope[i], q = e.rope[i + 1];
          var dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || .001;
          var diff = (d - sl) / d * .55;
          if (i > 0)     { p.x += dx * diff * .5; p.y += dy * diff * .5; }
          if (i < SEG-1) { q.x -= dx * diff * .5; q.y -= dy * diff * .5; }
        }
        e.rope[0].x = a.x; e.rope[0].y = a.y;
        e.rope[SEG].x = b.x; e.rope[SEG].y = b.y;
      }
    });
  }

  // ── DRAW ─────────────────────────────────────────────────────
  function _resizeCv() {
    var w = NE.wrap.offsetWidth, h = NE.wrap.offsetHeight;
    if (NE.cv.width !== w) NE.cv.width = w;
    if (NE.cv.height !== h) NE.cv.height = h;
  }
  function _isRelated(id) {
    if (!NE.selId) return true;
    if (id === NE.selId) return true;
    return NE.edges.some(function (e) {
      return (e.fromId === NE.selId && e.toId === id) || (e.toId === NE.selId && e.fromId === id);
    });
  }
  function _drawEdges() {
    _resizeCv();
    var ctx = NE.ctx;
    ctx.clearRect(0, 0, NE.cv.width, NE.cv.height);
    NE.edges.forEach(function (e) {
      if (!e.rope || e.rope.length < 2) return;
      var fn = _findNode(e.fromId), tn = _findNode(e.toId);
      if (!fn || !tn) return;
      if (NE.mode === 'selected' && NE.selId && !_isRelated(fn.id) && !_isRelated(tn.id)) return;
      var isSel = NE.selId && (e.fromId === NE.selId || e.toId === NE.selId);
      var col = e.isMod ? nc(fn.type).col : '#f97316';
      ctx.save();
      ctx.globalAlpha = isSel ? .92 : .32;
      ctx.lineWidth = isSel ? 2 : 1;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = col;
      ctx.setLineDash(e.isMod ? [4, 4] : []);
      ctx.beginPath();
      ctx.moveTo(e.rope[0].x, e.rope[0].y);
      for (var i = 1; i < e.rope.length; i++) ctx.lineTo(e.rope[i].x, e.rope[i].y);
      ctx.stroke();
      if (isSel) {
        ctx.globalAlpha = .11; ctx.lineWidth = 8; ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(e.rope[0].x, e.rope[0].y);
        for (var i = 1; i < e.rope.length; i++) ctx.lineTo(e.rope[i].x, e.rope[i].y);
        ctx.stroke();
      }
      ctx.restore();
    });
    if (NE.conn) {
      var fn = _findNode(NE.conn.fromId);
      if (fn) {
        var a = _portPos(fn, 'out');
        var wr = NE.wrap.getBoundingClientRect();
        var mx = NE.conn.mx - wr.left, my = NE.conn.my - wr.top;
        ctx.save();
        ctx.setLineDash([5, 5]); ctx.globalAlpha = .6;
        ctx.lineWidth = 1.5; ctx.strokeStyle = '#f97316';
        ctx.beginPath(); ctx.moveTo(a.x, a.y);
        ctx.bezierCurveTo(a.x + 60, a.y, mx - 60, my, mx, my);
        ctx.stroke(); ctx.restore();
      }
    }
  }
  function _loop() {
    if (!NE.open) return;
    _simRopes(); _drawEdges();
    NE.animId = requestAnimationFrame(_loop);
  }

  // ── SYNC ─────────────────────────────────────────────────────
  function neSync() {
    if (!NE.open) return;
    Object.keys(NE.nodeEls).forEach(function (k) {
      var el = NE.nodeEls[k]; if (el && el.parentNode) el.remove();
    });
    NE.nodeEls = {}; NE.nodes = []; NE.edges = [];
    if (!window.els || !window.els.length) return;
    window.els.forEach(function (el) {
      NE.nodes.push({ id: el.id, type: el.type, label: el.name || el.type,
        x: 0, y: 0, vx: 0, vy: 0, props: _extractProps(el), isMod: false });
      var mods = el.mods || {};
      Object.keys(mods).forEach(function (mk) {
        NE.nodes.push({ id: el.id + '__mod__' + mk, type: mk, label: mk,
          x: 0, y: 0, vx: 0, vy: 0, props: _extractModProps(mk, mods[mk]),
          isMod: true, modKey: mk, parentElId: el.id });
      });
    });
    _autoLayout(NE.nodes);
    NE.nodes.forEach(function (n) { _makeNodeEl(n); });
    window.els.forEach(function (el) {
      if (el.parentId) _addEdge(el.parentId, el.id, false);
      var mods = el.mods || {};
      Object.keys(mods).forEach(function (mk) { _addEdge(el.id + '__mod__' + mk, el.id, true); });
    });
    neUpdateVis();
  }

  function _extractProps(el) {
    var p = {};
    if (el.psX !== undefined) p['PosScale'] = el.psX.toFixed(2) + ', ' + (el.psY||0).toFixed(2);
    if (el.poX !== undefined) p['PosOffset'] = Math.round(el.poX) + ', ' + Math.round(el.poY||0);
    if (el.soW !== undefined) p['Size'] = Math.round(el.soW) + ' x ' + Math.round(el.soH||0);
    if (el.bc)  p['BG']  = r2h(el.bc);
    if (el.rot) p['Rot'] = parseFloat(el.rot).toFixed(1) + 'deg';
    if (el.txt !== undefined) p['Text']  = String(el.txt).slice(0, 18);
    if (el.img !== undefined) p['Image'] = String(el.img).slice(0, 18);
    if (el.op !== undefined && el.op !== 1) p['Opacity'] = el.op;
    return p;
  }
  function _extractModProps(mk, md) {
    var p = {}; if (!md) return p;
    Object.keys(md).slice(0, 4).forEach(function (k) {
      var v = md[k];
      if (typeof v === 'object' && v !== null && 'r' in v) v = r2h(v);
      p[k] = String(v).slice(0, 18);
    });
    return p;
  }

  // ── VISIBILITY ───────────────────────────────────────────────
  function neUpdateVis() {
    NE.nodes.forEach(function (n) {
      var el = NE.nodeEls[n.id]; if (!el) return;
      var related = NE.mode === 'all' || _isRelated(n.id);
      el.classList.toggle('ne-dim', !related);
      el.classList.toggle('ne-sel', n.id === NE.selId);
    });
  }
  function neSetMode(m) {
    NE.mode = m;
    var ba = document.getElementById('ne-btn-all');
    var bs = document.getElementById('ne-btn-sel');
    if (ba) ba.classList.toggle('on', m === 'all');
    if (bs) bs.classList.toggle('on', m === 'selected');
    neUpdateVis();
  }

  // ── MOUSE EVENTS ─────────────────────────────────────────────
  // ★ KEY FIX: capture phase, guard NE.open + drag/conn
  // Nếu không drag/conn → return ngay, app.js không bị ảnh hưởng
  function _onMouseMove(e) {
    if (!NE.open || (!NE.drag && !NE.conn)) return;
    e.stopPropagation();
    if (NE.drag) {
      var wr = NE.wrap.getBoundingClientRect();
      NE.drag.x = e.clientX - wr.left - NE.dragOff.x;
      NE.drag.y = e.clientY - wr.top  - NE.dragOff.y;
      var nel = NE.nodeEls[NE.drag.id];
      if (nel) { nel.style.left = Math.round(NE.drag.x) + 'px'; nel.style.top = Math.round(NE.drag.y) + 'px'; }
    }
    if (NE.conn) { NE.conn.mx = e.clientX; NE.conn.my = e.clientY; }
  }
  function _onMouseUp(e) {
    if (!NE.open || (!NE.drag && !NE.conn)) return;
    e.stopPropagation();
    if (NE.drag) { NE.drag = null; return; }
    if (NE.conn) {
      var wr = NE.wrap.getBoundingClientRect();
      var mx = e.clientX - wr.left, my = e.clientY - wr.top;
      NE.nodes.forEach(function (n) {
        if (!NE.conn || n.id === NE.conn.fromId) return;
        var nel = NE.nodeEls[n.id]; if (!nel) return;
        if (mx >= n.x && mx <= n.x + nel.offsetWidth && my >= n.y && my <= n.y + nel.offsetHeight)
          _addEdge(NE.conn.fromId, n.id, false);
      });
      NE.conn = null;
    }
  }

  // ── PUBLIC API ───────────────────────────────────────────────
  function neOpen() {
    if (!buildDOM()) return;
    NE.open = true;
    var ov = document.getElementById('ne-overlay');
    if (ov) ov.classList.add('open');
    neSync();
    cancelAnimationFrame(NE.animId);
    _loop();
    if (typeof toast === 'function') toast('\u29C1 Node Editor opened');
  }
  function neClose() {
    NE.open = false; NE.drag = null; NE.conn = null;
    var ov = document.getElementById('ne-overlay');
    if (ov) ov.classList.remove('open');
    cancelAnimationFrame(NE.animId);
    if (typeof toast === 'function') toast('\u29C1 Node Editor closed');
  }

  window.neOpen  = neOpen;
  window.neClose = neClose;
  window.neSync  = neSync;

  // Patch selEl để sync highlight
  var _origSelEl = window.selEl;
  window._origSelEl = _origSelEl;
  window.selEl = function (id, shift) {
    if (_origSelEl) _origSelEl(id, shift);
    if (NE.open) { NE.selId = id; neUpdateVis(); }
  };

})();

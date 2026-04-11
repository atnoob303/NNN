// ═══════════════════════════════════════════════════════════════
// node_editor.js — Node Editor overlay (physics rope)
// Load SAU app.js
// ═══════════════════════════════════════════════════════════════
// §NE1  STATE
// §NE2  DOM SETUP
// §NE3  NODE LAYOUT
// §NE4  NODE ELEMENT
// §NE5  EDGE / ROPE
// §NE6  PHYSICS LOOP
// §NE7  DRAW EDGES
// §NE8  SYNC (els → nodes/edges)
// §NE9  VISIBILITY MODE
// §NE10 DRAG / CONNECT
// §NE11 PUBLIC API (neOpen, neClose, neSync)
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // §NE1 STATE
  var NE = {
    open: false,
    mode: 'all',       // 'all' | 'selected'
    selId: null,
    nodes: [],         // { id, type, label, x, y, vx, vy, props, isMod, modKey }
    edges: [],         // { fromId, toId, rope[], isMod }
    nodeEls: {},       // id → DOM div
    animId: null,
    conn: null,        // { fromId, mx, my }
    drag: null,        // node being dragged
    dragOff: { x: 0, y: 0 },
    wrap: null,
    cv: null,
    ctx: null,
  };

  // ── Màu theo category ────────────────────────────────────────
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
    // Modifiers
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

  function nc(type) {
    return NCOLORS[type] || { col: '#888780', tag: 'Node' };
  }

  // §NE2 DOM SETUP
  function buildDOM() {
    // Inject CSS
    var style = document.createElement('style');
    style.id = 'ne-style';
    style.textContent = [
      '#ne-overlay{position:absolute;inset:0;z-index:200;display:none;flex-direction:column;pointer-events:none}',
      '#ne-overlay.open{display:flex}',
      '#ne-toolbar{pointer-events:auto;display:flex;gap:5px;align-items:center;padding:6px 10px;background:var(--bg0,#13131f);border-bottom:1px solid var(--bd,rgba(255,255,255,.08));flex-shrink:0}',
      '#ne-toolbar span.ne-logo{font-size:10px;font-weight:700;color:#a78bfa;margin-right:4px}',
      '.ne-tb{font-size:10px;padding:2px 8px;border:1px solid rgba(255,255,255,.12);border-radius:4px;background:rgba(255,255,255,.04);color:var(--tx1,#e2e2f0);cursor:pointer;transition:background .12s}',
      '.ne-tb:hover{background:rgba(255,255,255,.1)}',
      '.ne-tb.on{background:#7c6af7;border-color:#7c6af7;color:#fff}',
      '#ne-canvas-wrap{position:relative;flex:1;overflow:hidden;pointer-events:auto}',
      '#ne-cv{position:absolute;inset:0;pointer-events:none;z-index:1}',
      // Node cards
      '.ne-nd{position:absolute;border-radius:8px;border:1.5px solid;cursor:grab;user-select:none;z-index:5;min-width:128px;max-width:190px;box-sizing:border-box;transition:box-shadow .12s,opacity .2s}',
      '.ne-nd:active{cursor:grabbing}',
      '.ne-nd.ne-sel{box-shadow:0 0 0 2.5px #fff4,0 0 0 4px var(--ne-col)}',
      '.ne-nd.ne-dim{opacity:0.12;pointer-events:none}',
      '.ne-nh{font-size:10px;font-weight:600;padding:5px 8px 4px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:5px;border-radius:6px 6px 0 0}',
      '.ne-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}',
      '.ne-lbl{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.ne-tag{font-size:8px;padding:1px 5px;border-radius:3px;font-weight:400;flex-shrink:0}',
      '.ne-nb{padding:3px 8px 6px;font-size:9px;color:rgba(226,226,240,.55)}',
      '.ne-pr{display:flex;justify-content:space-between;margin:1.5px 0;gap:6px;overflow:hidden}',
      '.ne-pk{flex-shrink:0;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.6}',
      '.ne-pv{font-family:monospace;font-size:8.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}',
      // Ports
      '.ne-port{width:10px;height:10px;border-radius:50%;border:2px solid;position:absolute;top:50%;transform:translateY(-50%);cursor:crosshair;z-index:6;transition:transform .1s}',
      '.ne-port:hover{transform:translateY(-50%) scale(1.5)}',
      '.ne-po{right:-5px}',
      '.ne-pi{left:-5px}',
      // Legend badge
      '#ne-legend{position:absolute;bottom:8px;right:10px;font-size:8.5px;color:rgba(226,226,240,.3);pointer-events:none;line-height:1.7}',
    ].join('');
    document.head.appendChild(style);

    // Overlay container — đặt bên trong #ca
    var ca = document.getElementById('ca');
    if (!ca) { console.warn('[NodeEditor] #ca not found'); return false; }

    var overlay = document.createElement('div');
    overlay.id = 'ne-overlay';

    // Toolbar
    var tb = document.createElement('div');
    tb.id = 'ne-toolbar';
    tb.innerHTML = '<span class="ne-logo">⬡ Node Editor</span>';

    var btnAll = _mkBtn('Show all', 'on', function () { neSetMode('all'); });
    btnAll.id = 'ne-btn-all';
    var btnSel = _mkBtn('Selected', '', function () { neSetMode('selected'); });
    btnSel.id = 'ne-btn-sel';
    var btnSync = _mkBtn('↺ Sync', '', function () { neSync(); });
    var btnClose = _mkBtn('✕ Close', '', function () { neClose(); });
    btnClose.style.marginLeft = 'auto';

    tb.appendChild(btnAll);
    tb.appendChild(btnSel);
    tb.appendChild(btnSync);
    tb.appendChild(btnClose);

    // Canvas wrap
    var wrap = document.createElement('div');
    wrap.id = 'ne-canvas-wrap';

    var cv = document.createElement('canvas');
    cv.id = 'ne-cv';
    wrap.appendChild(cv);

    var legend = document.createElement('div');
    legend.id = 'ne-legend';
    legend.innerHTML = '━ parent→child &nbsp;&nbsp; ╌ modifier/effect';
    wrap.appendChild(legend);

    overlay.appendChild(tb);
    overlay.appendChild(wrap);
    ca.appendChild(overlay);

    NE.wrap = wrap;
    NE.cv = cv;
    NE.ctx = cv.getContext('2d');

    // Mouse events on wrap
    wrap.addEventListener('mousedown', function (e) {
      if (e.target === wrap || e.target === cv) {
        NE.selId = null;
        neUpdateVis();
      }
    });
    document.addEventListener('mousemove', _onMouseMove);
    document.addEventListener('mouseup', _onMouseUp);

    return true;
  }

  function _mkBtn(label, cls, fn) {
    var b = document.createElement('button');
    b.className = 'ne-tb' + (cls ? ' ' + cls : '');
    b.textContent = label;
    b.onclick = fn;
    return b;
  }

  // §NE3 NODE LAYOUT — auto-arrange theo type category
  function _autoLayout(nodes) {
    // Cột: Modifiers | Frame/Containers | Children | Effects
    var cols = { mod: [], main: [], child: [], fx: [] };
    nodes.forEach(function (n) {
      var t = nc(n.type).tag;
      if (n.isMod && (t === 'Effect')) cols.fx.push(n);
      else if (n.isMod) cols.mod.push(n);
      else if (t === 'Container' || t === '3D') cols.main.push(n);
      else cols.child.push(n);
    });

    var wrap = NE.wrap;
    var W = wrap ? wrap.offsetWidth : 800;
    var H = wrap ? wrap.offsetHeight : 500;
    var PAD = 20, GAP_Y = 14, NODE_H = 100;

    function layoutCol(arr, cx) {
      var totalH = arr.length * (NODE_H + GAP_Y) - GAP_Y;
      var startY = Math.max(PAD, (H - totalH) / 2);
      arr.forEach(function (n, i) {
        n.x = cx - 64;
        n.y = startY + i * (NODE_H + GAP_Y);
      });
    }

    var colW = 190;
    layoutCol(cols.mod,   PAD + colW * 0);
    layoutCol(cols.main,  PAD + colW * 1);
    layoutCol(cols.child, PAD + colW * 2);
    layoutCol(cols.fx,    PAD + colW * 3);
  }

  // §NE4 NODE ELEMENT
  function _makeNodeEl(n) {
    var existing = document.getElementById('ne-nd-' + n.id);
    if (existing) existing.remove();

    var s = nc(n.type);
    var col = s.col;
    var bgAlpha = '14';

    var el = document.createElement('div');
    el.className = 'ne-nd';
    el.id = 'ne-nd-' + n.id;
    el.style.left = Math.round(n.x) + 'px';
    el.style.top  = Math.round(n.y) + 'px';
    el.style.borderColor = col;
    el.style.background  = col + bgAlpha;
    el.style.setProperty('--ne-col', col);

    // Header
    var hdr = document.createElement('div');
    hdr.className = 'ne-nh';
    hdr.style.color = col;

    var dot = document.createElement('span');
    dot.className = 'ne-dot';
    dot.style.background = col;

    var lbl = document.createElement('span');
    lbl.className = 'ne-lbl';
    lbl.title = n.label;
    lbl.textContent = n.isMod ? n.modKey : n.label;

    var tag = document.createElement('span');
    tag.className = 'ne-tag';
    tag.textContent = n.isMod ? n.type.replace('UI', '') : n.type;
    tag.style.background = col + '22';
    tag.style.color = col;

    hdr.appendChild(dot);
    hdr.appendChild(lbl);
    hdr.appendChild(tag);

    // Body — props
    var body = document.createElement('div');
    body.className = 'ne-nb';
    var props = n.props || {};
    var keys = Object.keys(props).slice(0, 5);
    keys.forEach(function (k) {
      var row = document.createElement('div');
      row.className = 'ne-pr';
      row.innerHTML = '<span class="ne-pk">' + k + '</span><span class="ne-pv ne-' + col.slice(1) + '">' + String(props[k]).slice(0, 22) + '</span>';
      body.appendChild(row);
    });
    if (Object.keys(props).length === 0) {
      var emp = document.createElement('div');
      emp.style.cssText = 'font-size:8.5px;opacity:.3;padding:1px 0';
      emp.textContent = '(no props)';
      body.appendChild(emp);
    }

    // Ports
    var portIn = document.createElement('div');
    portIn.className = 'ne-port ne-pi';
    portIn.style.background = col;
    portIn.style.borderColor = col + '60';

    var portOut = document.createElement('div');
    portOut.className = 'ne-port ne-po';
    portOut.style.background = n.isMod ? col : '#f97316';
    portOut.style.borderColor = n.isMod ? col + '60' : '#ea580c60';

    el.appendChild(portIn);
    el.appendChild(hdr);
    el.appendChild(body);
    el.appendChild(portOut);

    NE.wrap.appendChild(el);
    NE.nodeEls[n.id] = el;

    // Events
    portOut.addEventListener('mousedown', function (e) {
      NE.conn = { fromId: n.id, mx: e.clientX, my: e.clientY };
      e.stopPropagation();
      e.preventDefault();
    });

    portIn.addEventListener('mouseup', function (e) {
      if (NE.conn && NE.conn.fromId !== n.id) {
        _addEdge(NE.conn.fromId, n.id);
        NE.conn = null;
      }
      e.stopPropagation();
    });

    el.addEventListener('mousedown', function (e) {
      if (e.target === portOut || e.target === portIn) return;
      // Select
      NE.selId = n.id;
      neUpdateVis();
      // Sync select sang app.js
      if (!n.isMod && typeof selEl === 'function') selEl(n.id);
      // Drag
      var wr = NE.wrap.getBoundingClientRect();
      NE.drag = n;
      NE.dragOff = { x: e.clientX - wr.left - n.x, y: e.clientY - wr.top - n.y };
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // §NE5 EDGE / ROPE
  var ROPE_SEGS = 14;

  function _portPos(n, side) {
    var el = NE.nodeEls[n.id];
    var w = el ? el.offsetWidth  : 130;
    var h = el ? el.offsetHeight : 80;
    if (side === 'out') return { x: n.x + w, y: n.y + h * 0.5 };
    return { x: n.x, y: n.y + h * 0.5 };
  }

  function _initRope(e) {
    var fn = _findNode(e.fromId);
    var tn = _findNode(e.toId);
    if (!fn || !tn) return;
    var a = _portPos(fn, 'out');
    var b = _portPos(tn, 'in');
    e.rope = [];
    for (var i = 0; i <= ROPE_SEGS; i++) {
      var t = i / ROPE_SEGS;
      e.rope.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, vx: 0, vy: 0 });
    }
  }

  function _addEdge(fromId, toId, isMod) {
    if (NE.edges.find(function (e) { return e.fromId === fromId && e.toId === toId; })) return;
    var edge = { fromId: fromId, toId: toId, isMod: !!isMod, rope: [] };
    NE.edges.push(edge);
    _initRope(edge);
  }

  function _findNode(id) {
    return NE.nodes.find(function (n) { return n.id === id; });
  }

  // §NE6 PHYSICS LOOP
  var GRAVITY = 0.20, DAMPING = 0.80, STIFFNESS = 0.55;

  function _simRopes() {
    NE.edges.forEach(function (e) {
      if (!e.rope || e.rope.length < 2) return;
      var fn = _findNode(e.fromId);
      var tn = _findNode(e.toId);
      if (!fn || !tn) return;

      var a = _portPos(fn, 'out');
      var b = _portPos(tn, 'in');
      e.rope[0].x = a.x; e.rope[0].y = a.y;
      e.rope[ROPE_SEGS].x = b.x; e.rope[ROPE_SEGS].y = b.y;

      var dist = Math.hypot(b.x - a.x, b.y - a.y);
      var segLen = dist / (ROPE_SEGS * 0.92 + 0.001) * 0.88;

      for (var i = 1; i < ROPE_SEGS; i++) {
        var p = e.rope[i];
        p.vy += GRAVITY;
        p.vx *= DAMPING; p.vy *= DAMPING;
        p.x += p.vx; p.y += p.vy;
      }

      for (var iter = 0; iter < 5; iter++) {
        for (var i = 0; i < ROPE_SEGS; i++) {
          var p = e.rope[i], q = e.rope[i + 1];
          var dx = q.x - p.x, dy = q.y - p.y;
          var d = Math.hypot(dx, dy) || 0.001;
          var diff = (d - segLen) / d * STIFFNESS;
          if (i > 0)           { p.x += dx * diff * 0.5; p.y += dy * diff * 0.5; }
          if (i < ROPE_SEGS - 1) { q.x -= dx * diff * 0.5; q.y -= dy * diff * 0.5; }
        }
        e.rope[0].x = a.x; e.rope[0].y = a.y;
        e.rope[ROPE_SEGS].x = b.x; e.rope[ROPE_SEGS].y = b.y;
      }
    });
  }

  // §NE7 DRAW EDGES
  function _resizeCanvas() {
    var w = NE.wrap.offsetWidth, h = NE.wrap.offsetHeight;
    if (NE.cv.width !== w) NE.cv.width = w;
    if (NE.cv.height !== h) NE.cv.height = h;
  }

  function _isRelated(nodeId) {
    if (!NE.selId) return true;
    if (nodeId === NE.selId) return true;
    return NE.edges.some(function (e) {
      return (e.fromId === NE.selId && e.toId === nodeId) ||
             (e.toId   === NE.selId && e.fromId === nodeId);
    });
  }

  function _drawEdges() {
    _resizeCanvas();
    var ctx = NE.ctx;
    ctx.clearRect(0, 0, NE.cv.width, NE.cv.height);

    NE.edges.forEach(function (e) {
      if (!e.rope || e.rope.length < 2) return;
      var fn = _findNode(e.fromId), tn = _findNode(e.toId);
      if (!fn || !tn) return;

      var relFrom = NE.mode === 'all' || _isRelated(fn.id);
      var relTo   = NE.mode === 'all' || _isRelated(tn.id);
      if (!relFrom || !relTo) return;

      var isSel = NE.selId && (e.fromId === NE.selId || e.toId === NE.selId);
      var col = e.isMod ? nc(fn.type).col : '#f97316';

      ctx.save();
      ctx.globalAlpha = isSel ? 0.9 : 0.35;
      ctx.lineWidth   = isSel ? 2 : 1;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.strokeStyle = col;
      if (e.isMod) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(e.rope[0].x, e.rope[0].y);
      for (var i = 1; i < e.rope.length; i++) ctx.lineTo(e.rope[i].x, e.rope[i].y);
      ctx.stroke();

      // Glow khi selected
      if (isSel) {
        ctx.globalAlpha = 0.13;
        ctx.lineWidth = 8;
        ctx.setLineDash([]);
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.moveTo(e.rope[0].x, e.rope[0].y);
        for (var i = 1; i < e.rope.length; i++) ctx.lineTo(e.rope[i].x, e.rope[i].y);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Dây đang kéo
    if (NE.conn) {
      var fn = _findNode(NE.conn.fromId);
      if (fn) {
        var a = _portPos(fn, 'out');
        var wr = NE.wrap.getBoundingClientRect();
        var mx = NE.conn.mx - wr.left, my = NE.conn.my - wr.top;
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.globalAlpha = 0.65;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.bezierCurveTo(a.x + 60, a.y, mx - 60, my, mx, my);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function _loop() {
    if (!NE.open) return;
    _simRopes();
    _drawEdges();
    NE.animId = requestAnimationFrame(_loop);
  }

  // §NE8 SYNC (els → nodes/edges)
  function neSync() {
    if (!NE.open) return;

    // Xóa hết node/edge cũ
    Object.values(NE.nodeEls).forEach(function (el) { if (el.parentNode) el.remove(); });
    NE.nodeEls = {};
    NE.nodes = [];
    NE.edges = [];

    if (!window.els || !window.els.length) return;

    // Tạo node cho mỗi element
    window.els.forEach(function (el) {
      var props = _extractProps(el);
      var n = {
        id: el.id, type: el.type, label: el.name || el.type,
        x: 0, y: 0, vx: 0, vy: 0,
        props: props, isMod: false,
      };
      NE.nodes.push(n);

      // Tạo node cho mỗi modifier
      var mods = el.mods || {};
      Object.keys(mods).forEach(function (mk) {
        var modId = el.id + '__mod__' + mk;
        var modProps = _extractModProps(mk, mods[mk]);
        NE.nodes.push({
          id: modId, type: mk, label: mk,
          x: 0, y: 0, vx: 0, vy: 0,
          props: modProps, isMod: true, modKey: mk,
          parentElId: el.id,
        });
      });
    });

    // Auto layout
    _autoLayout(NE.nodes);

    // Tạo DOM cho từng node
    NE.nodes.forEach(function (n) { _makeNodeEl(n); });

    // Tạo edges — parent→child (cam) và modifier→element (dashed)
    window.els.forEach(function (el) {
      // Parent → child
      if (el.parentId) {
        _addEdge(el.parentId, el.id, false);
      }

      // Modifier node → element node
      var mods = el.mods || {};
      Object.keys(mods).forEach(function (mk) {
        var modId = el.id + '__mod__' + mk;
        _addEdge(modId, el.id, true);
      });
    });

    neUpdateVis();
  }

  function _extractProps(el) {
    var p = {};
    // Position / Size
    if (el.psX !== undefined) p['PosScale'] = el.psX.toFixed(2) + ', ' + (el.psY || 0).toFixed(2);
    if (el.poX !== undefined) p['PosOffset'] = Math.round(el.poX) + ', ' + Math.round(el.poY || 0);
    if (el.soW !== undefined) p['Size'] = Math.round(el.soW) + ' × ' + Math.round(el.soH || 0);
    if (el.bc)  p['BG'] = r2h(el.bc);
    if (el.rot) p['Rot'] = parseFloat(el.rot).toFixed(1) + '°';
    if (el.txt !== undefined) p['Text'] = String(el.txt).slice(0, 18);
    if (el.img !== undefined) p['Image'] = String(el.img).slice(0, 18);
    if (el.op  !== undefined && el.op !== 1) p['Opacity'] = el.op;
    return p;
  }

  function _extractModProps(mk, md) {
    var p = {};
    if (!md) return p;
    var keys = Object.keys(md).slice(0, 4);
    keys.forEach(function (k) {
      var v = md[k];
      if (typeof v === 'object' && v !== null && 'r' in v) v = r2h(v);
      p[k] = String(v).slice(0, 18);
    });
    return p;
  }

  // §NE9 VISIBILITY MODE
  function neUpdateVis() {
    NE.nodes.forEach(function (n) {
      var el = NE.nodeEls[n.id];
      if (!el) return;
      var related = NE.mode === 'all' || _isRelated(n.id);
      el.classList.toggle('ne-dim', !related);
      el.classList.toggle('ne-sel', n.id === NE.selId);
    });
  }

  function neSetMode(m) {
    NE.mode = m;
    document.getElementById('ne-btn-all').classList.toggle('on', m === 'all');
    document.getElementById('ne-btn-sel').classList.toggle('on', m === 'selected');
    neUpdateVis();
  }

  // §NE10 DRAG / CONNECT
  function _onMouseMove(e) {
    if (NE.drag) {
      var wr = NE.wrap.getBoundingClientRect();
      NE.drag.x = e.clientX - wr.left - NE.dragOff.x;
      NE.drag.y = e.clientY - wr.top  - NE.dragOff.y;
      var el = NE.nodeEls[NE.drag.id];
      if (el) { el.style.left = Math.round(NE.drag.x) + 'px'; el.style.top = Math.round(NE.drag.y) + 'px'; }
    }
    if (NE.conn) { NE.conn.mx = e.clientX; NE.conn.my = e.clientY; }
  }

  function _onMouseUp(e) {
    NE.drag = null;
    if (NE.conn) {
      var wr = NE.wrap.getBoundingClientRect();
      var mx = e.clientX - wr.left, my = e.clientY - wr.top;
      NE.nodes.forEach(function (n) {
        if (n.id === NE.conn.fromId) return;
        var nel = NE.nodeEls[n.id]; if (!nel) return;
        var r = nel.getBoundingClientRect();
        var wr2 = NE.wrap.getBoundingClientRect();
        if (mx >= n.x && mx <= n.x + nel.offsetWidth && my >= n.y && my <= n.y + nel.offsetHeight) {
          _addEdge(NE.conn.fromId, n.id, false);
        }
      });
      NE.conn = null;
    }
  }

  // §NE11 PUBLIC API
  function neOpen() {
    if (!document.getElementById('ne-overlay')) {
      if (!buildDOM()) return;
    }
    NE.open = true;
    document.getElementById('ne-overlay').classList.add('open');
    neSync();
    cancelAnimationFrame(NE.animId);
    _loop();
    if (typeof toast === 'function') toast('⬡ Node Editor opened');
  }

  function neClose() {
    NE.open = false;
    var ov = document.getElementById('ne-overlay');
    if (ov) ov.classList.remove('open');
    cancelAnimationFrame(NE.animId);
    if (typeof toast === 'function') toast('⬡ Node Editor closed');
  }

  // Expose global
  window.neOpen  = neOpen;
  window.neClose = neClose;
  window.neSync  = neSync;

  // Auto-sync khi sel thay đổi (patch selEl)
  var _origSelEl = window.selEl;
  window.selEl = function (id, shift) {
    if (_origSelEl) _origSelEl(id, shift);
    if (NE.open) {
      NE.selId = id;
      neUpdateVis();
    }
  };

})();

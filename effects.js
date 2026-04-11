// ═══════════════════════════════════════════════════════════════
// effects.js — Hiệu ứng visual cho Roblox UI Builder
// Load sau definitions.js, trước app.js
// ═══════════════════════════════════════════════════════════════
// Bổ sung sau: thêm hiệu ứng vào đây, app.js gọi tự động.
// ═══════════════════════════════════════════════════════════════

// ── CONFIG ──────────────────────────────────────────────────────
var FX = {
  fadeIn:       true,   // Fade in khi thêm element
  selectPulse:  true,   // Pulse khi select element
  hoverGlow:    true,   // Glow khi hover element trên canvas
  tweenPreview: false,  // Preview TweenService (bật sau)
};

// ── CSS KEYFRAMES (inject 1 lần lúc load) ───────────────────────
(function injectFxStyles() {
  var s = document.createElement('style');
  s.id = 'fx-styles';
  s.textContent = `
    /* Fade in khi element được thêm vào canvas */
    @keyframes fx-fadein {
      from { opacity: 0; transform: scale(0.92) rotate(var(--rot, 0deg)); }
      to   { opacity: 1; transform: scale(1)    rotate(var(--rot, 0deg)); }
    }
    .fx-fadein {
      animation: fx-fadein 0.18s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    /* Pulse khi select */
    @keyframes fx-select-pulse {
      0%   { outline-width: 2px; }
      50%  { outline-width: 5px; }
      100% { outline-width: 2px; }
    }
    .fx-select-pulse {
      animation: fx-select-pulse 0.25s ease-out;
    }

    /* Hover glow */
    .element:not(.sel):hover {
      box-shadow: 0 0 0 1px rgba(124,106,247,0.4),
                  0 0 12px rgba(124,106,247,0.15) !important;
      transition: box-shadow 0.12s ease;
    }

    /* Delete shake */
    @keyframes fx-shake {
      0%,100% { transform: translateX(0) rotate(var(--rot,0deg)); }
      20%      { transform: translateX(-4px) rotate(var(--rot,0deg)); }
      40%      { transform: translateX(4px) rotate(var(--rot,0deg)); }
      60%      { transform: translateX(-3px) rotate(var(--rot,0deg)); }
      80%      { transform: translateX(3px) rotate(var(--rot,0deg)); }
    }
    .fx-shake {
      animation: fx-shake 0.3s ease;
    }

    /* Dup bounce */
    @keyframes fx-dup {
      0%   { opacity:0; transform: translate(10px, 10px) scale(0.9) rotate(var(--rot,0deg)); }
      70%  { transform: translate(0,0) scale(1.04) rotate(var(--rot,0deg)); }
      100% { opacity:1; transform: translate(0,0) scale(1) rotate(var(--rot,0deg)); }
    }
    .fx-dup {
      animation: fx-dup 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    /* Drag ghost */
    .fx-drag-ghost {
      opacity: 0.45 !important;
      outline: 2px dashed rgba(124,106,247,0.6) !important;
      transition: opacity 0.1s;
    }

    /* Parent highlight khi drop */
    @keyframes fx-parent-highlight {
      0%,100% { box-shadow: none; }
      50%      { box-shadow: inset 0 0 0 3px rgba(34,211,238,0.7); }
    }
    .fx-parent-highlight {
      animation: fx-parent-highlight 0.4s ease;
    }

    /* Tween preview overlay */
    .fx-tween-target {
      outline: 2px solid #fbbf24 !important;
      outline-offset: 3px;
    }
  `;
  document.head.appendChild(s);
})();

// ════════════════════════════════════════════════════════════════
// §FX-1  FADE IN — gọi sau khi renderEl() tạo DOM element
// ════════════════════════════════════════════════════════════════
/**
 * Gọi sau khi element được thêm vào canvas lần đầu.
 * @param {string} id - element id
 */
function fxFadeIn(id) {
  if (!FX.fadeIn) return;
  var d = document.getElementById(id);
  if (!d) return;
  d.classList.remove('fx-fadein');
  // Force reflow để restart animation
  void d.offsetWidth;
  d.classList.add('fx-fadein');
  d.addEventListener('animationend', function handler() {
    d.classList.remove('fx-fadein');
    d.removeEventListener('animationend', handler);
  });
}

// ════════════════════════════════════════════════════════════════
// §FX-2  SELECT PULSE — gọi khi element được select
// ════════════════════════════════════════════════════════════════
/**
 * @param {string} id - element id
 */
function fxSelectPulse(id) {
  if (!FX.selectPulse) return;
  var d = document.getElementById(id);
  if (!d) return;
  d.classList.remove('fx-select-pulse');
  void d.offsetWidth;
  d.classList.add('fx-select-pulse');
  d.addEventListener('animationend', function handler() {
    d.classList.remove('fx-select-pulse');
    d.removeEventListener('animationend', handler);
  });
}

// ════════════════════════════════════════════════════════════════
// §FX-3  SHAKE BEFORE DELETE
// ════════════════════════════════════════════════════════════════
/**
 * Gọi TRƯỚC khi xóa element, trả về Promise resolve sau animation.
 * @param {string} id
 * @returns {Promise}
 */
function fxShake(id) {
  return new Promise(function(resolve) {
    var d = document.getElementById(id);
    if (!d) { resolve(); return; }
    d.classList.add('fx-shake');
    d.addEventListener('animationend', function handler() {
      d.classList.remove('fx-shake');
      d.removeEventListener('animationend', handler);
      resolve();
    });
  });
}

// ════════════════════════════════════════════════════════════════
// §FX-4  DUP BOUNCE
// ════════════════════════════════════════════════════════════════
function fxDup(id) {
  var d = document.getElementById(id);
  if (!d) return;
  d.classList.remove('fx-dup');
  void d.offsetWidth;
  d.classList.add('fx-dup');
  d.addEventListener('animationend', function handler() {
    d.classList.remove('fx-dup');
    d.removeEventListener('animationend', handler);
  });
}

// ════════════════════════════════════════════════════════════════
// §FX-5  PARENT HIGHLIGHT
// ════════════════════════════════════════════════════════════════
function fxParentHighlight(id) {
  var d = document.getElementById(id);
  if (!d) return;
  d.classList.remove('fx-parent-highlight');
  void d.offsetWidth;
  d.classList.add('fx-parent-highlight');
  d.addEventListener('animationend', function handler() {
    d.classList.remove('fx-parent-highlight');
    d.removeEventListener('animationend', handler);
  });
}

// ════════════════════════════════════════════════════════════════
// §FX-6  DRAG GHOST (set/clear class khi drag)
// ════════════════════════════════════════════════════════════════
function fxDragStart(id) {
  var d = document.getElementById(id);
  if (d) d.classList.add('fx-drag-ghost');
}
function fxDragEnd(id) {
  var d = document.getElementById(id);
  if (d) d.classList.remove('fx-drag-ghost');
}

// ════════════════════════════════════════════════════════════════
// §FX-7  TWEEN PREVIEW (placeholder — bổ sung sau)
// ════════════════════════════════════════════════════════════════
/**
 * Preview TweenService animation cho element trên canvas.
 * @param {string} id - element id
 * @param {object} tweenInfo - { time, easingStyle, easingDirection, repeatCount, reverses, delayTime }
 * @param {object} goals    - { x, y, w, h, opacity, rotation } (pixel values)
 */
function fxTweenPreview(id, tweenInfo, goals) {
  if (!FX.tweenPreview) {
    toast('⚠ Tween Preview chưa bật. Bật FX.tweenPreview = true trong effects.js');
    return;
  }
  // TODO: implement CSS transition dựa theo tweenInfo
  // Easings map: Roblox EasingStyle → CSS timing-function
  var easingMap = {
    Linear:   'linear',
    Quad:     'cubic-bezier(0.45,0,0.55,1)',
    Cubic:    'cubic-bezier(0.65,0,0.35,1)',
    Quart:    'cubic-bezier(0.76,0,0.24,1)',
    Quint:    'cubic-bezier(0.83,0,0.17,1)',
    Sine:     'cubic-bezier(0.37,0,0.63,1)',
    Expo:     'cubic-bezier(0.96,0,0.04,1)',
    Circ:     'cubic-bezier(0.85,0,0.15,1)',
    Bounce:   'cubic-bezier(0.34,1.56,0.64,1)', // approx
    Elastic:  'cubic-bezier(0.34,1.56,0.64,1)',
    Back:     'cubic-bezier(0.34,1.56,0.64,1)',
  };
  toast('⏳ Tween Preview — coming soon!');
}

// ════════════════════════════════════════════════════════════════
// §FX-8  TOGGLE SETTINGS
// ════════════════════════════════════════════════════════════════
function fxToggle(key) {
  if (FX.hasOwnProperty(key)) {
    FX[key] = !FX[key];
    toast('FX.' + key + ' = ' + FX[key]);
  }
}

// ════════════════════════════════════════════════════════════════
// §FX-9  CLICK EFFECTS cho Button (Bounce / Ripple / Gooey Particle)
// ════════════════════════════════════════════════════════════════

(function injectClickFxStyles() {
  var s = document.createElement('style');
  s.id = 'click-fx-styles';
  s.textContent = `
    /* Bounce */
    @keyframes fx-btn-bounce {
      0%   { transform: scale(1)    rotate(var(--rot,0deg)); }
      30%  { transform: scale(0.88) rotate(var(--rot,0deg)); }
      65%  { transform: scale(1.08) rotate(var(--rot,0deg)); }
      85%  { transform: scale(0.97) rotate(var(--rot,0deg)); }
      100% { transform: scale(1)    rotate(var(--rot,0deg)); }
    }
    .fx-btn-bounce {
      animation: fx-btn-bounce 0.38s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    /* Ripple */
    .fx-ripple-wrap {
      position: absolute; inset: 0;
      overflow: hidden; border-radius: inherit;
      pointer-events: none;
    }
    .fx-ripple-circle {
      position: absolute; border-radius: 50%;
      background: rgba(255,255,255,0.45);
      transform: scale(0);
      animation: fx-ripple-anim 0.55s ease-out forwards;
      pointer-events: none;
    }
    @keyframes fx-ripple-anim {
      to { transform: scale(4); opacity: 0; }
    }

    /* Gooey wrap */
    .fx-gooey-wrap {
      position: absolute; inset: 0;
      pointer-events: none; overflow: visible; z-index: 99;
      filter: blur(6px) contrast(18);
      mix-blend-mode: lighten;
    }
    .fx-gooey-wrap::before {
      content: ''; position: absolute; inset: -60px;
      background: black; z-index: -1;
    }

    /* Particle */
    .fx-gp {
      display: block; position: absolute;
      border-radius: 50%;
      top: 50%; left: 50%;
      animation: fx-gp-fly var(--pt,700ms) ease 1;
    }
    .fx-gp-pt {
      display: block; width: 100%; height: 100%;
      border-radius: 50%;
      background: var(--col, white);
      animation: fx-gp-scale var(--pt,700ms) ease 1;
    }

    @keyframes fx-gp-fly {
      0%   { transform: rotate(0deg)
                        translate(var(--sx,0px), var(--sy,0px));
             opacity: 1;
             animation-timing-function: cubic-bezier(0.55,0,1,0.45); }
      70%  { transform: rotate(calc(var(--rot,0deg)*0.5))
                        translate(calc(var(--ex,0px)*1.2), calc(var(--ey,0px)*1.2));
             opacity: 1; animation-timing-function: ease; }
      85%  { transform: rotate(calc(var(--rot,0deg)*0.66))
                        translate(var(--ex,0px), var(--ey,0px));
             opacity: 1; }
      100% { transform: rotate(calc(var(--rot,0deg)*1.2))
                        translate(calc(var(--ex,0px)*0.5), calc(var(--ey,0px)*0.5));
             opacity: 1; }
    }

    @keyframes fx-gp-scale {
      0%   { transform: scale(0); opacity: 0;
             background: var(--col, white);
             animation-timing-function: cubic-bezier(0.55,0,1,0.45); }
      25%  { transform: scale(calc(var(--sc,1)*0.25));
             background: var(--col, white); }
      38%  { opacity: 1; background: var(--col, white); }
      65%  { transform: scale(var(--sc,1)); opacity: 1;
             background: var(--col, white);
             animation-timing-function: ease; }
      80%  { transform: scale(var(--sc,1));
             background: var(--btn-col, white); opacity: 0.85; }
      100% { transform: scale(0);
             background: var(--btn-col, white); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
})();

// ── REGISTRY ─────────────────────────────────────────────────────
var BTN_EFFECTS = {
  none:     { label: 'None' },
  bounce:   { label: '🏀 Bounce' },
  ripple:   { label: '💧 Ripple' },
  particle: { label: '🫧 Gooey' },
};

// ── HELPERS ──────────────────────────────────────────────────────
var _GP_COLORS = ['#7c6af7','#f472b6','#22d3ee','#fbbf24','#4ade80','#fb7185'];

function _gpNoise(n) { return n / 2 - Math.random() * n; }

function _gpGetXY(dist, idx, total) {
  var angle = ((360 + _gpNoise(8)) / total) * idx * (Math.PI / 180);
  return [dist * Math.cos(angle), dist * Math.sin(angle)];
}

/**
 * Tính auto params dựa theo kích thước DOM element.
 * btnW, btnH: pixel size của button.
 * base: giá trị user chỉnh (nếu có), dùng làm multiplier.
 */
function _gpAutoParams(btnW, btnH, elData) {
  // Diện tích button → scale mọi thứ
  var area   = btnW * btnH;
  var ref    = 120 * 36;            // kích thước button mặc định
  var ratio  = Math.sqrt(area / ref);
  ratio      = Math.max(0.5, Math.min(ratio, 4)); // clamp 0.5x → 4x

  // Số hạt: base 15, scale theo diện tích, clamp 6-40
  var baseCount  = elData && elData.btnFxCount  ? elData.btnFxCount  : 15;
  var count      = Math.round(baseCount * ratio);
  count          = Math.max(6, Math.min(count, 40));

  // Tầm bay: base 90, scale theo cạnh dài hơn
  var baseDist   = elData && elData.btnFxDist   ? elData.btnFxDist   : 90;
  var maxSide    = Math.max(btnW, btnH);
  var dist       = Math.round(baseDist * (maxSide / 120));
  dist           = Math.max(30, Math.min(dist, 300));

  // Size hạt: base 18px, scale theo ratio
  var baseSize   = 18;
  var dotSize    = Math.round(baseSize * Math.sqrt(ratio));
  dotSize        = Math.max(8, Math.min(dotSize, 40));

  // Tốc độ: base 1200ms
  var baseSpeed  = elData && elData.btnFxSpeed  ? elData.btnFxSpeed  : 1200;

  return { count: count, dist: dist, dotSize: dotSize, speed: baseSpeed };
}

// ── MAIN ─────────────────────────────────────────────────────────
function fxBtnClick(id, effect, evt) {
  var d = document.getElementById(id);
  if (!d || !effect || effect === 'none') return;

  // ── BOUNCE ───────────────────────────────────────────────────
  if (effect === 'bounce') {
    d.classList.remove('fx-btn-bounce');
    void d.offsetWidth;
    d.classList.add('fx-btn-bounce');
    d.addEventListener('animationend', function h() {
      d.classList.remove('fx-btn-bounce');
      d.removeEventListener('animationend', h);
    });
  }

  // ── RIPPLE ───────────────────────────────────────────────────
  if (effect === 'ripple') {
    var oldWrap = d.querySelector('.fx-ripple-wrap');
    if (oldWrap) oldWrap.remove();
    var wrap   = document.createElement('div');
    wrap.className = 'fx-ripple-wrap';
    var rect   = d.getBoundingClientRect();
    var cx     = evt ? evt.clientX - rect.left : rect.width  / 2;
    var cy     = evt ? evt.clientY - rect.top  : rect.height / 2;
    var size   = Math.max(rect.width, rect.height) * 0.9;
    var circle = document.createElement('div');
    circle.className = 'fx-ripple-circle';
    circle.style.cssText = 'width:' + size + 'px;height:' + size + 'px;'
      + 'left:' + (cx - size/2) + 'px;top:' + (cy - size/2) + 'px;';
    wrap.appendChild(circle);
    d.appendChild(wrap);
    circle.addEventListener('animationend', function() { wrap.remove(); });
  }

  // ── GOOEY PARTICLE ───────────────────────────────────────────
  if (effect === 'particle') {
    var elData = (typeof getEl === 'function') ? getEl(id) : null;

    // Đọc kích thước thực của button từ DOM
    var rect   = d.getBoundingClientRect();
    var btnW   = rect.width  || 120;
    var btnH   = rect.height || 36;

    // Auto params dựa theo kích thước
    var auto   = _gpAutoParams(btnW, btnH, elData);
    var COUNT  = auto.count;
    var DIST0  = auto.dist;
    var DSIZE  = auto.dotSize;
    var T_BASE = auto.speed;
    var T_VAR  = 300;
    var DISTS  = [DIST0, 10];
    var R      = 100;

    // Lấy màu nền button
    var btnCol = window.getComputedStyle(d).backgroundColor || '#ffffff';

    var gWrap  = document.createElement('div');
    gWrap.className = 'fx-gooey-wrap';
    d.appendChild(gWrap);

    for (var i = 0; i < COUNT; i++) {
      (function(i) {
        var t      = T_BASE + _gpNoise(T_VAR * 2);
        var rot    = _gpNoise(R / 10);
        var rotDeg = rot > 0 ? (rot + R/20)*10 : (rot - R/20)*10;
        var start  = _gpGetXY(DISTS[0], COUNT - i, COUNT);
        var end    = _gpGetXY(DISTS[1] + _gpNoise(7), COUNT - i, COUNT);
        var sc     = 1 + _gpNoise(0.2);
        var col    = _GP_COLORS[Math.floor(Math.random() * _GP_COLORS.length)];

        setTimeout(function() {
          var p  = document.createElement('span');
          var pt = document.createElement('span');
          p.className  = 'fx-gp';
          pt.className = 'fx-gp-pt';

          // Size hạt auto theo button
          p.style.cssText = [
            'width:'  + DSIZE + 'px',
            'height:' + DSIZE + 'px',
            'margin-top:'  + (-DSIZE/2) + 'px',
            'margin-left:' + (-DSIZE/2) + 'px',
            '--sx:'     + start[0]  + 'px',
            '--sy:'     + start[1]  + 'px',
            '--ex:'     + end[0]    + 'px',
            '--ey:'     + end[1]    + 'px',
            '--rot:'    + rotDeg    + 'deg',
            '--sc:'     + sc,
            '--pt:'     + t         + 'ms',
            '--col:'    + col,
            '--btn-col:'+ btnCol,
          ].join(';');

          p.appendChild(pt);
          gWrap.appendChild(p);

          setTimeout(function() {
            if (p.parentNode) p.parentNode.removeChild(p);
          }, t);
        }, 30);
      })(i);
    }

    setTimeout(function() {
      if (gWrap.parentNode) gWrap.parentNode.removeChild(gWrap);
    }, T_BASE + T_VAR + 200);
  }
}

// ── PREVIEW TỪ PROPERTIES PANEL ──────────────────────────────────
function fxBtnPreview(id) {
  var el = (typeof getEl === 'function') ? getEl(id) : null;
  if (!el) return;
  var effect = el.btnFx || 'none';
  if (effect === 'none') { toast('⚠ Chưa chọn hiệu ứng!'); return; }
  fxBtnClick(id, effect);
  toast('▶ Preview: ' + BTN_EFFECTS[effect].label);
}

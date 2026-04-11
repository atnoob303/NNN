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
// §FX-9  CLICK EFFECTS cho Button (Bounce / Ripple / Particle)
// ════════════════════════════════════════════════════════════════

// ── CSS cho click effects (inject thêm vào fx-styles) ───────────
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

    /* Ripple container */
    .fx-ripple-wrap {
      position: absolute; inset: 0;
      overflow: hidden; border-radius: inherit;
      pointer-events: none;
    }
    .fx-ripple-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.45);
      transform: scale(0);
      animation: fx-ripple-anim 0.55s ease-out forwards;
      pointer-events: none;
    }
    @keyframes fx-ripple-anim {
      to { transform: scale(4); opacity: 0; }
    }

    /* Particle dot */
    .fx-particle-dot {
      position: absolute;
      width: 7px; height: 7px;
      border-radius: 50%;
      pointer-events: none;
      animation: fx-particle-fly var(--pt, 600ms) ease-out forwards;
      top: calc(50% - 3.5px);
      left: calc(50% - 3.5px);
    }
    @keyframes fx-particle-fly {
      0%   { transform: translate(0,0) scale(1); opacity: 1; }
      100% { transform: translate(var(--px,0px), var(--py,0px)) scale(0); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
})();

// ── CLICK EFFECT REGISTRY ────────────────────────────────────────
var BTN_EFFECTS = {
  none:     { label: 'None' },
  bounce:   { label: '🏀 Bounce' },
  ripple:   { label: '💧 Ripple' },
  particle: { label: '✨ Particle' },
};

/**
 * Chạy click effect trên DOM element của button.
 * @param {string} id       - element id
 * @param {string} effect   - 'bounce' | 'ripple' | 'particle'
 * @param {Event}  [evt]    - MouseEvent (dùng cho ripple offset)
 */
function fxBtnClick(id, effect, evt) {
  var d = document.getElementById(id);
  if (!d || !effect || effect === 'none') return;

  if (effect === 'bounce') {
    d.classList.remove('fx-btn-bounce');
    void d.offsetWidth;
    d.classList.add('fx-btn-bounce');
    d.addEventListener('animationend', function h() {
      d.classList.remove('fx-btn-bounce');
      d.removeEventListener('animationend', h);
    });
  }

  if (effect === 'ripple') {
    // Xóa wrap cũ nếu có
    var oldWrap = d.querySelector('.fx-ripple-wrap');
    if (oldWrap) oldWrap.remove();

    var wrap = document.createElement('div');
    wrap.className = 'fx-ripple-wrap';

    var rect = d.getBoundingClientRect();
    var cx = evt ? evt.clientX - rect.left : rect.width / 2;
    var cy = evt ? evt.clientY - rect.top  : rect.height / 2;
    var size = Math.max(rect.width, rect.height) * 0.9;

    var circle = document.createElement('div');
    circle.className = 'fx-ripple-circle';
    circle.style.cssText = 'width:' + size + 'px;height:' + size + 'px;'
      + 'left:' + (cx - size/2) + 'px;top:' + (cy - size/2) + 'px;';

    wrap.appendChild(circle);
    d.appendChild(wrap);

    circle.addEventListener('animationend', function() { wrap.remove(); });
  }

  if (effect === 'particle') {
    var COLORS = ['#7c6af7','#f472b6','#22d3ee','#fbbf24','#4ade80','#fb7185'];
    var COUNT  = 10;
    for (var i = 0; i < COUNT; i++) {
      (function(i) {
        var dot = document.createElement('div');
        dot.className = 'fx-particle-dot';
        var angle  = (360 / COUNT) * i + (Math.random() - 0.5) * 30;
        var dist   = 28 + Math.random() * 28;
        var rad    = angle * Math.PI / 180;
        var px     = Math.cos(rad) * dist;
        var py     = Math.sin(rad) * dist;
        var dur    = 480 + Math.random() * 200;
        var col    = COLORS[Math.floor(Math.random() * COLORS.length)];
        dot.style.cssText = '--px:' + px + 'px;--py:' + py + 'px;--pt:' + dur + 'ms;'
          + 'background:' + col + ';';
        d.appendChild(dot);
        setTimeout(function() { if (dot.parentNode) dot.parentNode.removeChild(dot); }, dur + 50);
      })(i);
    }
  }
}

/**
 * Gọi từ Properties panel — nút Preview effect.
 * @param {string} id
 */
function fxBtnPreview(id) {
  var el = (typeof getEl === 'function') ? getEl(id) : null;
  if (!el) return;
  var effect = el.btnFx || 'none';
  if (effect === 'none') { toast('⚠ Chưa chọn hiệu ứng!'); return; }
  fxBtnClick(id, effect);
  toast('▶ Preview: ' + BTN_EFFECTS[effect].label);
}
